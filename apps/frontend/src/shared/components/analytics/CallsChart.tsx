import { ArrowUpRight } from "lucide-react";

interface CallsChartProps {
  className?: string;
}

export function CallsChart({ className }: CallsChartProps = {}) {
  return (
    <div
      className={`rounded-xl border border-border bg-background p-4 ${className ?? ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">Calls / hour</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            last 24 h
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
          <ArrowUpRight className="h-3 w-3" />
          +12.4%
        </span>
      </div>

      <svg
        viewBox="0 0 320 90"
        className="h-20 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Calls per hour chart"
      >
        <defs>
          <linearGradient id="cmai-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3366FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3366FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,70 L20,62 L40,66 L60,50 L80,55 L100,40 L120,46 L140,30 L160,38 L180,22 L200,28 L220,18 L240,26 L260,14 L280,20 L300,10 L320,16 L320,90 L0,90 Z"
          fill="url(#cmai-area)"
        />
        <path
          d="M0,70 L20,62 L40,66 L60,50 L80,55 L100,40 L120,46 L140,30 L160,38 L180,22 L200,28 L220,18 L240,26 L260,14 L280,20 L300,10 L320,16"
          fill="none"
          stroke="#3366FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
