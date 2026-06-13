export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          <span className="text-gradient">{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
