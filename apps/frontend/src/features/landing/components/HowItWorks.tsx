export function HowItWorks() {
  return (
    <section className="px-6 py-20 bg-surface-container-low/30 relative">
      <h2 className="font-h1 text-[32px] font-bold text-white text-center mb-16">
        ¿Cómo funciona?
      </h2>
      <div className="relative flex flex-col gap-12 max-w-xs mx-auto">
        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 via-violet-500/50 to-blue-500/50"></div>

        <div className="flex gap-6 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold">
            1
          </div>
          <div>
            <h4 className="font-h3 text-[20px] font-semibold text-white mb-1">
              Sube tu CSV
            </h4>
            <p className="font-body-sm text-[14px] text-on-surface-variant">
              Importa tus contactos en segundos con nuestra herramienta
              inteligente de mapeo de campos.
            </p>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 border border-violet-500/50 flex items-center justify-center text-violet-400 font-bold">
            2
          </div>
          <div>
            <h4 className="font-h3 text-[20px] font-semibold text-white mb-1">
              Conecta tu IA
            </h4>
            <p className="font-body-sm text-[14px] text-on-surface-variant">
              Integra tus agentes de Voiceflow mediante API con un solo clic
              para una ejecución inmediata.
            </p>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold pulse">
            3
          </div>
          <div>
            <h4 className="font-h3 text-[20px] font-semibold text-white mb-1">
              Monitorea
            </h4>
            <p className="font-body-sm text-[14px] text-on-surface-variant">
              Observa los resultados en tiempo real con IA analizando
              sentimientos y KPIs clave.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="glass-panel p-8 rounded-3xl ai-glow-border glow-bloom text-center">
          <h2 className="font-h2 text-[24px] font-semibold text-white mb-4">
            ¿Listo para transformar tus llamadas?
          </h2>
          <p className="font-body-md text-[16px] text-on-surface-variant mb-8">
            Únete a las empresas que ya están automatizando con precisión
            cognitiva.
          </p>
          <button className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl active:scale-95 transition-all">
            Empieza tu prueba gratis
          </button>
        </div>
      </div>
    </section>
  );
}
