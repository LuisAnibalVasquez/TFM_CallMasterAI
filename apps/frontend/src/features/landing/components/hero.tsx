import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Sutil gradiente decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-[500px] w-[700px] rounded-full bg-primary/[0.04] blur-[100px]"
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Powered by AI
              </span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Scale your calls.{" "}
              <span className="text-muted-foreground">Automate with</span>{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Orchestrate, execute, and monitor massive call campaigns with AI
              Agents. The all-in-one platform for Call Centers and agencies that
              need scale, security, and real-time analytics.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 bg-foreground text-background shadow-soft hover:bg-foreground/90"
              >
                <Link to="/signup" className="inline-flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-border bg-background text-foreground hover:bg-secondary hover:text-foreground"
              >
                <Link to="/login">Log In</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <Stat value="10M+" label="Calls / month" />
              <Stat value="99.9%" label="Uptime SLA" />
              <Stat value="AES-256" label="Encryption" mono />
            </dl>
          </div>

          {/* Visual */}
          <div className="relative lg:col-span-6">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  mono = false,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-xl font-semibold tracking-tight text-foreground ${
          mono ? "font-mono text-base" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
