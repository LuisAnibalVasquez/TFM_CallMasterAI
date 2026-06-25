import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CallsPerHourPoint {
  hour: string;
  count: number;
}

interface CallsChartProps {
  className?: string;
  callsPerHour?: CallsPerHourPoint[];
}

export function CallsChart({ className, callsPerHour = [] }: CallsChartProps) {
  const data = callsPerHour.map((p) => ({
    ...p,
    date: new Date(p.hour).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div
      className={`rounded-xl border border-border bg-background p-4 ${
        className ?? ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">Calls / day</p>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3366FF" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3366FF"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
