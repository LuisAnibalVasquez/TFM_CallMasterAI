export function FeaturesGrid() {
  return (
    <>
      <section className="py-12 bg-surface-container-lowest/50 border-y border-white/5">
        <p className="text-center font-technical-sm text-slate-500 uppercase tracking-widest mb-8">
          Powered by Voiceflow &amp; Trusted Partners
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 px-6 opacity-40 grayscale">
          <span className="font-bold text-xl text-white">Voiceflow</span>
          <span className="font-technical-md text-white">ORBITAL</span>
          <span className="font-technical-md text-white">SYNTHETIC</span>
          <span className="font-technical-md text-white">NEXUS</span>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mb-12">
          <h2 className="font-h1 text-[32px] font-bold text-white mb-4">
            Potencia Cognitiva
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">
                layers
              </span>
            </div>
            <div>
              <h3 className="font-h3 text-[20px] font-semibold text-white mb-2">
                Orquestación masiva
              </h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Gestiona miles de llamadas simultáneas sin esfuerzo con nuestro
                motor de escalado elástico.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 ai-glow-border">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400">
                shield
              </span>
            </div>
            <div>
              <h3 className="font-h3 text-[20px] font-semibold text-white mb-2">
                Seguridad de grado bancario
              </h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Encriptación de extremo a extremo y protocolos de seguridad
                robustos para proteger tus datos sensibles.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">
                groups
              </span>
            </div>
            <div>
              <h3 className="font-h3 text-[20px] font-semibold text-white mb-2">
                Multi-tenant
              </h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Estructura de cuentas flexible y jerárquica diseñada para
                agencias y grandes empresas.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">
                analytics
              </span>
            </div>
            <div>
              <h3 className="font-h3 text-[20px] font-semibold text-white mb-2">
                Analítica en tiempo real
              </h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Dashboards de alto nivel con métricas precisas para decisiones
                estratégicas basadas en datos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
