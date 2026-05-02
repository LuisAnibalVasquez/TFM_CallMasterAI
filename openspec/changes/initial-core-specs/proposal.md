# Proposal: initial-core-specs

## Intent
Bajar a tierra los requisitos crudos del documento de visión, definiendo las especificaciones técnicas y funcionales iniciales para los tres dominios core de Call Master AI.

## Scope

### In Scope
- Definición de especificaciones para: Seguridad (Auth/AuthZ), Gestión de Tenants, y Gestión de Campañas.
- Normalización del lenguaje técnico (Entidades y Actores).
- Definición de flujos de interacción entre dominios (ej: API Key usage).

### Out of Scope
- Implementación de código o infraestructura.
- Diseño de interfaces de usuario (UI/UX) detallado.
- Definición de proveedores específicos de IA (se tratará como interfaz).

## Capabilities

### New Capabilities
- `security-auth`: Autenticación, autorización, JWT y gestión de contraseñas.
- `tenant-management`: Gestión de Tenants por Platform Owner y múltiples usuarios.
- `campaign-core`: Ciclo de vida de campañas (Crear, Subir CSV/Guion, Iniciar, Cancelar).
- `analytics-foundations`: Requisitos base para métricas y KPIs.

### Modified Capabilities
None (Greenfield project).

## Approach
Se redactarán especificaciones funcionales usando el formato Gherkin (Given/When/Then) para los escenarios críticos, asegurando que los requisitos del cliente (como la imposibilidad de borrar campañas completadas) queden blindados desde el diseño.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/specs/` | New | Creación de archivos de spec base. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Ambigüedad en "Guion" | Med | Definir estructura mínima (prompt vs texto plano). |
| Falta de test runner | High | Definir specs claras para que cuando se elija el stack, el TDD sea inmediato. |

## Rollback Plan
Borrar el directorio `openspec/changes/initial-core-specs` y las specs creadas en `openspec/specs/`.

## Dependencies
- Documento de visión en `documents/Vision.txt`.

## Success Criteria
- [ ] Specs de los 3 dominios aprobadas.
- [ ] Glosario de términos unificado.
- [ ] Flujo de campaña vía API vs Web definido.
