import { BotMessageSquare, FileSpreadsheet, LineChart } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: FileSpreadsheet,
    title: "Upload your CSV",
    description:
      "Import contacts and dynamic variables. Automatic validation, deduplication, and number enrichment.",
  },
  {
    n: "02",
    icon: BotMessageSquare,
    title: "Connect your AI",
    description:
      "Link your Voiceflow agent in seconds. Define script, conditional logic, and human handoff when needed.",
  },
  {
    n: "03",
    icon: LineChart,
    title: "Monitor results",
    description:
      "Track every live call, listen to recordings, and analyze KPIs by campaign, agent, and customer segment.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-border bg-background py-20 sm:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            // How it works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From zero to production calls in{" "}
            <span className="text-muted-foreground">three steps</span>.
          </h2>
        </div>

        <ol className="relative mt-16 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {/* Línea conectora */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-border lg:block"
          />

          {STEPS.map((step) => (
            <li key={step.n} className="relative">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-soft">
                  <step.icon
                    className="h-6 w-6 text-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step {step.n}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
