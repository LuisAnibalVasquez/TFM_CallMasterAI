# Call Master AI 📞🤖

Call Master AI es una plataforma SaaS de alto rendimiento, diseñada para la automatización inteligente de campañas de llamadas salientes (Outbound) en entornos de call center. La plataforma permite a los usuarios gestionar flujos de comunicación masivos mediante la orquestación asíncrona, asegurando una ejecución secuencial, segura y escalable a través de agentes de IA.

## a. Descripción general del proyecto
El corazón de Call Master AI reside en su capacidad para procesar grandes volúmenes de llamadas manteniendo la integridad de los datos y el cumplimiento normativo. Sus funcionalidades clave incluyen:
- **Orquestación inteligente**: Uso de colas distribuidas para el disparo de llamadas evitando bloqueos.
- **Seguridad multicapa**: Aislamiento de datos mediante Row-Level Security (RLS) y cifrado avanzado (AES-256) para credenciales de terceros.
- **Analíticas en tiempo real**: Dashboards estratificados para Tenants y administradores globales (PlatformOwner).
- **Privacidad por diseño**: Purga automática de datos personales (PII) una vez finalizada la ejecución de las campañas.

## b. Stack tecnológico utilizado
- **Frontend**: React, Vite, TypeScript, Recharts (visualización de datos), TailwindCSS + Lucide (UI).
- **Backend**: NestJS (arquitectura hexagonal/limpia), Inngest (orquestación basada en eventos).
- **Base de Datos/Auth**: Supabase (PostgreSQL, RLS, Storage).
- **IA/Voz**: API de Voiceflow Dialog Manager.
- **Calidad de Código**: Estandarizada con Husky, Lint-staged, Commitlint, **SonarQube** (análisis estático de calidad) y **CodeRabbit** (revisión asistida por IA).

## c. Información sobre su instalación y ejecución
Para iniciar el entorno de desarrollo, asegúrate de tener las variables de entorno configuradas (`.env` en backend y frontend). Luego ejecuta:

```bash
npm install
npm run runTFM
```

Este comando levanta de forma concurrente:
1. El backend (NestJS) en el puerto 3000.
2. El frontend (Vite) en el puerto 5173.
3. El servidor local de Inngest (Inngest Dev Server) en el puerto 8288.

## d. Estructura del proyecto
- `apps/frontend`: Dashboard administrativo, flujos de creación de campañas y analíticas.
- `apps/backend`: Lógica central, módulos de Tenants, Campaigns, Analytics y funciones Inngest.
- `packages/shared`: Tipos, interfaces y esquemas de validación compartidos.
- `supabase/`: Migraciones SQL y scripts de seguridad RLS.
- `sdd/`: Artefactos de Spec-Driven Development (Propuestas, Diseños, Especificaciones).

## e. Funcionalidades principales
- **Orquestación de Campañas**: Ejecución en segundo plano mediante colas secuenciales para evitar saturar las APIs.
- **Seguridad Dinámica**: Integración multi-tenant con cifrado en reposo para credenciales de IA.
- **Analíticas Avanzadas**: Dashboard interactivo con KPIs (llamadas, campañas, minutos, costo) y tendencias históricas (gráficos dinámicos).
- **Privacidad**: Purga automática de datos sensibles (PII) post-campaña.
- **RBAC**: Aislamiento de datos mediante Row Level Security (RLS) en Supabase y guardas de acceso a nivel de aplicación.

---
*Trabajo final de master Big School*
