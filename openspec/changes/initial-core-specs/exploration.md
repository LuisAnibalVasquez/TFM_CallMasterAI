## Exploration: initial-core-specs

### Current State
El proyecto se encuentra en una fase inicial (greenfield). Tenemos un documento de visión (`documents/Vision.txt`) que define tres dominios funcionales claros: Seguridad, Gestión de Tenants y Gestión de Campañas. No existe código previo, por lo que el objetivo es definir los cimientos técnicos y funcionales (specs).

### Affected Areas
- `openspec/specs/` — Aquí nacerán las especificaciones de los tres dominios.
- `documents/Vision.txt` — Fuente de verdad para los requisitos crudos.

### Approaches
1. **Dominio por Dominio (Secuencial)** — Definir primero todo sobre Seguridad, luego Tenants, luego Campañas.
   - Pros: Enfoque profundo en cada área.
   - Cons: Retrasa la visión global del sistema y sus interacciones.
   - Effort: Medium

2. **Core Specs Cross-Domain (Horizontal)** — Definir los requisitos mínimos (MVP) de los tres dominios simultáneamente para asegurar que las integraciones (como las API Keys de Tenants usadas en Campañas) funcionen desde el diseño.
   - Pros: Detecta inconsistencias de diseño temprano; permite una visión de arquitectura más sólida.
   - Cons: Puede ser abrumador si no se acota bien.
   - Effort: High

### Recommendation
Recomiendo el **Approach 2 (Horizontal)**. Dado que el documento de visión menciona integraciones críticas (ej: el Tenant crea API Keys para que Campañas se use vía API), es fundamental que las specs de ambos dominios se hablen desde el día uno.

### Risks
- **Scope Creep**: Intentar definir todo el sistema de una. Debemos enfocarnos en los requisitos "bajar a tierra" del documento.
- **Inconsistencia de Términos**: El documento usa "tenant" y "client" de formas que pueden confundirse. Hay que normalizar el lenguaje (Tenant = Empresa cliente de Call Master AI, Client = El usuario final al que la IA llama).

### Ready for Proposal
Yes — Estamos listos para redactar las especificaciones iniciales que traduzcan el "guion" y el "archivo CSV" en entidades y procesos técnicos.
