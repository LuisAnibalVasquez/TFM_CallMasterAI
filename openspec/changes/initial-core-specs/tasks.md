# Tasks: initial-core-specs

## Phase 1: Foundation & Backend Core (Clean Architecture)

- [x] 1.1 Configurar `apps/backend/tsconfig.json` y `nest-cli.json` con soporte para alias y decoradores.
- [x] 1.2 Implementar `packages/shared` con interfaces base de `Tenant`, `Campaign`, `Call` y `Role`.
- [x] 1.3 Crear Entidades de Dominio en `apps/backend/src/modules/campaigns/domain/entities` (Campaign, Client).
- [x] 1.4 Definir Port `IAgentProvider` en `apps/backend/src/modules/campaigns/domain/ports/agent-provider.port.ts`.
- [x] 1.5 Implementar `VoiceflowProvider` en `apps/backend/src/modules/campaigns/infrastructure/providers`.

## Phase 2: Supabase Infrastructure & Security

- [x] 2.1 Crear migraciones iniciales en `supabase/migrations` (Tabas: roles, profiles, tenants, campaigns, calls).
- [x] 2.2 Configurar extensión `pgcrypto` y funciones de cifrado AES-256 en PostgreSQL.
- [ ] 2.3 Implementar `SupabaseAuthService` en `apps/backend/src/modules/auth/infrastructure/providers`.
- [ ] 2.4 Configurar Swagger en `apps/backend/src/main.ts` para documentar la API.

## Phase 3: Frontend Foundation (Feature-First)

- [ ] 3.1 Configurar Tailwind CSS y PostCSS en `apps/frontend`.
- [ ] 3.2 Crear Layout base y sistema de routing (PlatformOwner vs TenantAdmin) en `apps/frontend/src/core`.
- [ ] 3.3 Implementar `useAuth` hook y servicio de autenticación en `apps/frontend/src/features/auth`.

## Phase 4: Inngest & Workflow Implementation

- [ ] 4.1 Configurar `apps/backend/src/inngest/client.ts` y servidor de desarrollo.
- [ ] 4.2 Crear función `processCampaign` en Inngest que orqueste llamadas vía `IAgentProvider`.
- [ ] 4.3 Implementar endpoint de callback en NestJS para registrar resultados de llamadas en `calls`.

## Phase 5: Verification & Testing

- [ ] 5.1 Escribir tests unitarios para `processCampaign` (Inngest) y validación de CSV.
- [ ] 5.2 Verificar flujo completo: Login -> Creación Tenant -> Simulación de Campaña en Sandbox.
