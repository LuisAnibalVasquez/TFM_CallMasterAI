import { Quote } from "lucide-react";

const LOGOS = [
  "NovaCall",
  "TeleMatrix",
  "AltoLab",
  "Helix BPO",
  "Linea Uno",
  "Voxora",
];

export function SocialProof() {
  return (
    <section
      id="trust"
      className="relative border-t border-border bg-card py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            // Confianza
          </span>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Operadores y agencias en LATAM ya escalan sus campañas con
            <span className="text-foreground font-medium"> Call Master AI</span>
            .
          </p>
        </div>

        {/* Logos */}
        <ul
          aria-label="Empresas que confían en Call Master AI"
          className="mt-10 grid grid-cols-2 items-center gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {LOGOS.map((name) => (
            <li
              key={name}
              className="flex items-center justify-center rounded-xl bg-background px-4 py-5 shadow-soft transition-all hover:shadow-soft-lg"
            >
              <span className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
                {name}
              </span>
            </li>
          ))}
        </ul>

        {/* Powered by + testimonio */}
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-5">
          <div className="flex items-center gap-4 rounded-2xl bg-background p-6 shadow-soft lg:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <span className="font-mono text-xs font-semibold tracking-widest text-foreground">
                VF
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Powered by
              </p>
              <p className="text-base font-semibold tracking-tight text-foreground">
                Voiceflow Agents
              </p>
            </div>
          </div>

          <figure className="rounded-2xl bg-background p-6 shadow-soft lg:col-span-3">
            <Quote className="h-5 w-5 text-muted-foreground/50" />
            <blockquote className="mt-3 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
              &ldquo;Pasamos de 200 a 14.000 llamadas diarias sin contratar más
              agentes. La orquestación y la analítica de Call Master AI son
              decisivas para nuestra operación.&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <div className="h-9 w-9 rounded-full bg-secondary" />
              <div className="text-xs">
                <p className="font-medium text-foreground">Mariana Téllez</p>
                <p className="text-muted-foreground">
                  Head of Operations, NovaCall
                </p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
