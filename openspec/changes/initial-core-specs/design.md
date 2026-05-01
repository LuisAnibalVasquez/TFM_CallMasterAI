# Design: Initial Core Architecture

## Technical Approach
Implementación de un sistema multi-tenant SaaS utilizando una arquitectura serverless híbrida. El frontend y backend se alojarán en Vercel como proyectos independientes en un monorepo, delegando la persistencia a Supabase (PostgreSQL + Auth + Storage) y la orquestación y lógica de colas de llamadas asíncronas a Inngest.

## Architecture Decisions

### Decision: Backend Serverless con NestJS
**Choice**: NestJS desplegado en Vercel (Serverless Functions).
**Alternatives considered**: NestJS en Railway/Render (descartados por costo/latencia).
**Rationale**: Permite CI/CD nativo con GitHub, costo cero en el tier inicial y una estructura modular profesional. Se usa un adapter para adaptar NestJS al ciclo de vida de AWS Lambda/Vercel.

### Decision: Orquestación con Inngest
**Choice**: Inngest como motor de colas y eventos.
**Alternatives considered**: Supabase Webhooks directos (riesgo de falta de secuencialidad).
**Rationale**: Inngest permite manejar concurrencia, reintentos y orquestación de pasos (invocar Voiceflow -> Guardar en DB) sin necesidad de un worker persistente.

### Decision: Cifrado en Base de Datos (pgcrypto)
**Choice**: AES-256 utilizando la extensión `pgcrypto` de PostgreSQL.
**Alternatives considered**: Cifrado en la capa de aplicación (NestJS).
**Rationale**: Mayor seguridad al no exponer la clave de cifrado en el código. La base de datos se encarga de cifrar/descifrar mediante Store Procedures protegidos por RLS.

## Data Flow

```ascii
[React App] ────> [NestJS API (Vercel)] ────> [Supabase DB]
     ^                  │                         │
     │                  └────> [Inngest] <────────┘
     │                            │
     │             ┌──────────────┴──────────────┐
     │             ▼                             ▼
     └───── [Voiceflow API] ──────────> [NestJS Callback]
```

1. **Creación**: NestJS recibe CSV -> Guarda en `clients` -> Emite evento a Inngest.
2. **Ejecución**: Inngest recibe evento -> Invoca Voiceflow API -> Invoca NestJS Callback para actualizar `calls`.
3. **Analítica**: Dashboard Web/Mobile consulta directamente la API de NestJS que resume datos de `calls`.

## Database Schema (Supabase)

### Table: `profiles` (Auth Extension)
- `id` (uuid, PK, references auth.users)
- `email` (text)
- `role_id` (uuid, FK)
- `tenant_id` (uuid, FK, nullable) - Null for PlatformOwner

### Table: `roles`
- `id` (uuid, PK)
- `name` (text) - 'PlatformOwner', 'TenantAdmin'

### Table: `tenants`
- `id` (uuid, PK)
- `name` (text), `phone` (text), `contact_email` (text)
- `logo_url` (text)
- `status` (enum: 'active', 'suspended')
- `sandbox_config` (jsonb: {api_url, encrypted_key})
- `production_config` (jsonb: {api_url, encrypted_key})

### Table: `campaigns`
- `id` (uuid, PK)
- `tenant_id` (uuid, FK)
- `name` (text), `status` (enum), `environment` (enum)
- `csv_url` (text) - Path to the file in Supabase Storage
- `created_at` (timestamp)

### Table: `calls`
- `id` (uuid, PK)
- `campaign_id` (uuid, FK)
- `customer_name` (text), `phone` (text), `language` (text)
- `duration` (int), `status` (text), `cost` (numeric)
- `voiceflow_transcript_id` (text)

## File Structure (Monorepo)

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend/` | Create | React + Vite + Tailwind App. |
| `apps/backend/` | Create | NestJS API (Serverless). |
| `apps/backend/src/inngest/` | Create | Definición de funciones de orquestación. |
| `supabase/migrations/` | Create | Esquema de base de datos y funciones pgcrypto. |
| `vercel.json` | Create | Configuración de despliegue para el monorepo. |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Validadores de CSV y lógica de cifrado. | Jest en NestJS. |
| Integration | Flujo Inngest -> NestJS -> Supabase. | Inngest Dev Server + Supabase Local. |
| E2E | Ciclo completo: Login -> Crear Campaña -> Monitorear. | Playwright. |

## Open Questions
- [ ] ¿Cómo manejaremos el "callback" de Voiceflow si la llamada es muy larga? (Inngest lo resuelve con timeouts).
- [ ] ¿Qué algoritmo de cifrado específico de pgcrypto usaremos? (Recomendado: `aes-cbc`).
