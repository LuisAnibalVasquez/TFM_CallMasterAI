# Call Master AI 📞🤖

Plataforma SaaS potenciada con Inteligencia Artificial diseñada para automatizar campañas de llamadas salientes (Outbound) mediante agentes de voz inteligentes.

## a. Descripción general del proyecto
Call Master AI permite a los administradores gestionar campañas de llamadas masivas mediante la carga de archivos CSV. El sistema orquesta llamadas automatizadas a través de agentes de voz (Voiceflow), gestiona el ciclo de vida de las campañas en segundo plano y ofrece analíticas detalladas tanto para Tenants (clientes) como para el PlatformOwner (administrador global). La plataforma prioriza la privacidad mediante el cifrado de datos sensibles y la purga automática de información personal tras finalizar las campañas.

## b. Stack tecnológico utilizado
- **Frontend**: React, Vite, TypeScript, Recharts (analíticas), React Hook Form + Zod (validación).
- **Backend**: NestJS (Serverless ready), Inngest (orquestación asíncrona de eventos).
- **Base de Datos/Auth**: Supabase (PostgreSQL + RLS + Storage).
- **IA/Voz**: Integración nativa con Voiceflow Dialog Manager API.
- **Calidad de Código**: Estandarizada con Husky, Lint-staged, Commitlint y convenciones de SDD (Spec-Driven Development).

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
