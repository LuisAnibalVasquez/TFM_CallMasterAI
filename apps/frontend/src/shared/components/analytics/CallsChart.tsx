interface CallsPerHourPoint {
  hour: string;
  count: number;
}

interface CallsChartProps {
  className?: string;
  callsPerHour?: CallsPerHourPoint[];
}

function buildPath(
  points: CallsPerHourPoint[],
  width: number,
  height: number,
  paddingY: number,
): string {
  const maxCount = Math.max(...points.map((p) => p.count), 1);
  const slotWidth = width / (points.length - 1 || 1);
  const yRange = height - paddingY * 2;

  return points
    .map((p, i) => {
      const x = Math.round(i * slotWidth);
      const ratio = p.count / maxCount;
      const y = Math.round(height - paddingY - ratio * yRange);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function CallsChart({ className, callsPerHour = [] }: CallsChartProps) {
  const hasData = callsPerHour.length > 0;
  const width = 320;
  const height = 90;
  const paddingY = 12;
  const linePath = hasData
    ? buildPath(callsPerHour, width, height, paddingY)
    : "M0,70 L320,70";
  const areaPath = hasData
    ? `${linePath} L${width},90 L0,90 Z`
    : `${linePath} L320,90 L0,90 Z`;

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
        {!hasData && (
          <span className="font-mono text-[10px] text-muted-foreground">
            no data
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
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
        <path d={areaPath} fill="url(#cmai-area)" />
        <path
          d={linePath}
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
