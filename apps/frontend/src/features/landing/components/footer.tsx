import { Link } from "react-router-dom";
import { PhoneCall, Code, MessageCircle, Share2 } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
  { href: "/changelog", label: "Changelog" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "Sobre nosotros" },
  { href: "/contact", label: "Contacto" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Trabaja con nosotros" },
];

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Términos" },
  { href: "/legal/privacy", label: "Privacidad" },
  { href: "/legal/security", label: "Seguridad" },
  { href: "/legal/dpa", label: "DPA" },
];

const SOCIAL = [
  { href: "https://twitter.com", label: "Twitter", icon: MessageCircle },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Share2 },
  { href: "https://github.com", label: "GitHub", icon: Code },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/20">
                <PhoneCall
                  className="h-4.5 w-4.5 text-primary"
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
              La plataforma SaaS multi-tenant para orquestar campañas masivas de
              llamadas con Agentes de IA.
            </p>

            <ul className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Producto" links={PRODUCT_LINKS} />
          <FooterColumn title="Empresa" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Call Master AI · Todos los derechos
            reservados
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-pulse-soft" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              All systems operational
            </span>
          </div>
        </div>

        {/* Sello AxionAI */}
        <div className="mt-8 flex items-center justify-center border-t border-border pt-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Call Master AI <span className="mx-1.5 text-border">/</span> an{" "}
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
