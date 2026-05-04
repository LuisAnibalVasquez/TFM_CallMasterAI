import { BotMessageSquare, FileSpreadsheet, LineChart } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: FileSpreadsheet,
    title: "Sube tu CSV",
    description:
      "Importa contactos y variables dinámicas. Validación automática, deduplicación y enriquecimiento por número.",
  },
  {
    n: "02",
    icon: BotMessageSquare,
    title: "Conecta tu IA",
    description:
      "Vincula tu agente de Voiceflow en segundos. Define guion, lógica condicional y handoff a humano cuando lo necesites.",
  },
  {
    n: "03",
    icon: LineChart,
    title: "Monitorea resultados",
    description:
      "Sigue cada llamada en vivo, escucha grabaciones y analiza KPIs por campaña, agente y segmento de cliente.",
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
            // Cómo funciona
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            De cero a llamadas en producción en{" "}
            <span className="text-muted-foreground">tres pasos</span>.
          </h2>
        </div>

        <ol className="relative mt-16 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {/* Línea conectora (solo desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          {STEPS.map((step) => (
            <li key={step.n} className="relative">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                  <step.icon
                    className="h-6 w-6 text-foreground"
                    strokeWidth={2}
                  />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Paso {step.n}
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
