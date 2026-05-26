export function KpiCard({
  icon,
  label,
  value,
  delta,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {value}
      </p>
      <p
        className={`font-mono text-[10px] ${
          highlight ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {delta}
      </p>
    </div>
  );
}
