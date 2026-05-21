import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust", label: "Trust" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Call Master AI — Home"
        >
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"
            aria-hidden="true"
          >
            <PhoneCall className="h-4 w-4 text-background" strokeWidth={2.25} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card animate-pulse-soft" />
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
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
