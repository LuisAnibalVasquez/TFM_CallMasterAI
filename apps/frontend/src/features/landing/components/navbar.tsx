import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo funciona" },
  { href: "#trust", label: "Confianza" },
  { href: "#pricing", label: "Precios" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Call Master AI — Inicio"
        >
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ring-1 ring-border"
            aria-hidden="true"
          >
            <PhoneCall
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={2.25}
            />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse-soft" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Call Master <span className="text-primary">AI</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Voice Orchestration
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Link to="/login">Log In</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Link to="/signup">Empezar ahora</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
