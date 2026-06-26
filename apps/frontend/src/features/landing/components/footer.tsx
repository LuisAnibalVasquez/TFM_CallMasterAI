import { Link } from "react-router-dom";
import { PhoneCall, Code, MessageCircle, Share2 } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
];

const COMPANY_LINKS: { href: string; label: string }[] = [];

const LEGAL_LINKS: { href: string; label: string }[] = [];

const SOCIAL = [
  { href: "https://twitter.com", label: "Twitter", icon: MessageCircle },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Share2 },
  { href: "https://github.com", label: "GitHub", icon: Code },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
                <PhoneCall
                  className="h-4 w-4 text-background"
                  strokeWidth={2.25}
                />
              </span>
              <div className="leading-none">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Call Master <span className="text-primary">AI</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Voice Orchestration Platform
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The multi-tenant SaaS platform to orchestrate massive call
              campaigns with AI Agents.
            </p>

            <ul className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  {href.startsWith("http") ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to={href}
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Call Master AI · All rights reserved
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              All systems operational
            </span>
          </div>
        </div>

        {/* Sello AxionAI */}
        <div className="mt-8 flex items-center justify-center border-t border-border pt-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Call Master AI <span className="mx-2 text-border">/</span> an{" "}
            <span className="font-semibold text-foreground">AxionAI</span>{" "}
            product
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="lg:col-span-2 lg:col-start-auto">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
