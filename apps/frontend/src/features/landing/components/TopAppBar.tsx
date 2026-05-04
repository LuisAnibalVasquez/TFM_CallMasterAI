export function TopAppBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(59,130,246,0.15)]">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-blue-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            hub
          </span>
          <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500 font-display tracking-tight">
            Call Master AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-all duration-300 active:scale-95">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
