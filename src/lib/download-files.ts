import { renderMarkdown, type ProjectFile, type ProjectOutput } from "@/lib/project-output";
import type { Run } from "@/lib/runs-store";

const encoder = new TextEncoder();

export function safeFileName(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "generated-project"
  );
}

export function downloadBlob(name: string, content: BlobPart, type: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(value: string, max = 88) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function toPdf(run: Run, output: ProjectOutput) {
  const markdown = renderMarkdown(run.title, output, run.id, run.status)
    .replace(/```[\s\S]*?```/g, "[starter code included in Markdown and ZIP exports]")
    .replace(/^#+\s*/gm, "");

  const lines = markdown
    .split("\n")
    .flatMap((line) => (line.trim() ? wrapLine(line) : [""]))
    .slice(0, 58);

  const text = lines
    .map((line, index) => `BT /F1 10 Tf 48 ${760 - index * 12} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${text.length} >> stream\n${text}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU16(value: number, out: number[]) {
  out.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeU32(value: number, out: number[]) {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function makeZip(files: ProjectFile[]) {
  const out: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.path);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const localOffset = offset;

    writeU32(0x04034b50, out);
    writeU16(20, out);
    writeU16(0, out);
    writeU16(0, out);
    writeU16(0, out);
    writeU16(0, out);
    writeU32(crc, out);
    writeU32(data.length, out);
    writeU32(data.length, out);
    writeU16(name.length, out);
    writeU16(0, out);
    out.push(...name, ...data);
    offset = out.length;

    writeU32(0x02014b50, central);
    writeU16(20, central);
    writeU16(20, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU32(crc, central);
    writeU32(data.length, central);
    writeU32(data.length, central);
    writeU16(name.length, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU16(0, central);
    writeU32(0, central);
    writeU32(localOffset, central);
    central.push(...name);
  }

  const centralOffset = out.length;
  out.push(...central);
  writeU32(0x06054b50, out);
  writeU16(0, out);
  writeU16(0, out);
  writeU16(files.length, out);
  writeU16(files.length, out);
  writeU32(central.length, out);
  writeU32(centralOffset, out);
  writeU16(0, out);

  return new Blob([new Uint8Array(out)], { type: "application/zip" });
}

export function downloadProject(
  format: "pdf" | "md" | "json" | "zip",
  run: Run,
  output: ProjectOutput,
) {
  const base = safeFileName(run.title);
  if (format === "pdf") {
    downloadBlob(`${base}.pdf`, toPdf(run, output), "application/pdf");
    return;
  }
  if (format === "md") {
    downloadBlob(
      `${base}.md`,
      renderMarkdown(run.title, output, run.id, run.status),
      "text/markdown",
    );
    return;
  }
  if (format === "json") {
    downloadBlob(`${base}.json`, JSON.stringify({ ...run, output }, null, 2), "application/json");
    return;
  }
  downloadBlob(`${base}-starter.zip`, makeZip(output.files), "application/zip");
}
