export function Footer() {
  return (
    <footer className="bg-slate-950 w-full border-t border-white/10 mt-auto">
      <div className="w-full py-16 px-8 max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
            <span className="text-lg font-semibold text-white font-display">
              Call Master AI
            </span>
          </div>
          <p className="text-slate-500 text-sm font-display max-w-xs">
            Built for Cognitive Precision. Orchestrate massive call campaigns
            with human-like AI agents.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <p className="font-label-caps text-on-primary-fixed-variant">
              PRODUCTO
            </p>
            <nav className="flex flex-col gap-2">
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Massive Orchestration
              </a>
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Security
              </a>
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Multi-tenant
              </a>
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-label-caps text-on-primary-fixed-variant">
              LEGAL
            </p>
            <nav className="flex flex-col gap-2">
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Privacy
              </a>
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Terms
              </a>
              <a
                className="font-display text-sm uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                href="#"
              >
                Cookies
              </a>
            </nav>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-white/5">
          <p className="font-display text-sm uppercase tracking-widest text-slate-500">
            © 2024 Call Master AI.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-slate-500 hover:text-blue-400 transition-colors cursor-pointer">
              share
            </span>
            <span className="material-symbols-outlined text-slate-500 hover:text-blue-400 transition-colors cursor-pointer">
              alternate_email
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
