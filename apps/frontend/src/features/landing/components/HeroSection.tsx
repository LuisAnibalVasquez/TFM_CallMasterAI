import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="px-6 py-12 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full"></div>

      <h1 className="font-display text-[48px] font-bold leading-[1.1] tracking-[-0.02em] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
        Escala tus llamadas. Automatiza con Inteligencia Artificial.
      </h1>

      <p className="font-display text-[18px] leading-[1.6] text-on-surface-variant mb-10 max-w-md mx-auto">
        La plataforma SaaS definitiva para orquestar campañas masivas con
        agentes de IA de Voiceflow.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform duration-200">
          Empezar ahora
        </button>
        <Link
          to="/login"
          className="border border-outline-variant text-on-surface font-semibold py-4 rounded-xl hover:bg-white/5 transition-all duration-300 block"
        >
          Log In
        </Link>
      </div>

      <div className="mt-16 w-full max-w-md mx-auto">
        <div className="glass-panel rounded-2xl p-4 ai-glow-border glow-bloom">
          <img
            alt="Call Master AI Dashboard Mockup"
            className="rounded-lg w-full h-auto opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTe2tKJaPuhTFqT2fTkZ5UwsuDMfohXjQw5Guc7Ml-e5kXvpRbkknirX9j97wVTtSHZz2dMEasOsCRSYhv3FWQT5lbE99rA1mF44Vk2robdnQlRFB5OOMfuEyz-jEo9jewl5wkHvKjVkk5CzdCtCIvp2u2aijSS_mghgt2DpQKzMWDfIm5BwAVr6brYXMTLLzK9DYMnJj16bPF_lKOfx_6lKV7xL76DLhKQbbj5t-rDQszxI22dSB-QiH_snOjOnE5XCGK6ELyCe8"
          />
        </div>
      </div>
    </section>
  );
}
