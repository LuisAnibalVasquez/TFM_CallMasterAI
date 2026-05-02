# Call Master AI 📞🤖

Plataforma SaaS potenciada con Inteligencia Artificial diseñada para automatizar la gestión de analistas en call centers mediante agentes de voz inteligentes.

## 🚀 Visión del Proyecto
Call Master AI permite a las empresas (Tenants) crear campañas de llamadas automatizadas utilizando agentes de IA (Voiceflow) que siguen guiones predefinidos, gestionan clientes a través de archivos CSV y proporcionan analíticas detalladas de cada interacción.

## 🏗️ Arquitectura
El proyecto sigue una arquitectura **Monorepo** y principios de **Clean Architecture** para asegurar la escalabilidad y el desacoplamiento de infraestructura.

### Estructura de Carpetas
- `apps/frontend`: React + Vite + TypeScript (Feature-First pattern).
- `apps/backend`: NestJS Serverless (Clean Architecture).
- `apps/mobile`: Espacio reservado para la App de monitoreo gerencial.
- `packages/shared`: Interfaces, tipos y constantes compartidas entre todos los servicios.
- `openspec/`: Documentación viva, especificaciones (Specs), diseños técnicos y seguimiento de tareas.
- `supabase/`: Migraciones y configuración de la base de datos PostgreSQL.

## 🛠️ Stack Tecnológico
- **Frontend**: React, Vite, TypeScript.
- **Backend**: NestJS (Serverless ready para Vercel).
- **Base de Datos**: Supabase (PostgreSQL + Auth + Storage).
- **Orquestación Asíncrona**: Inngest (Manejo de colas y eventos).
- **Proveedor de IA**: Voiceflow (Agentes de voz).
- **Calidad de Código**: ESLint v10 (Flat Config), Prettier, Husky, Lint-staged y Commitlint (Conventional Commits).

## 🔐 Seguridad
- **Autenticación**: JWT con rotación de Refresh Tokens vía Supabase Auth.
- **Autorización**: RBAC (PlatformOwner y TenantAdmin).
- **Protección de Datos**: Cifrado AES-256 (pgcrypto) para llaves de proveedores en la DB.
- **Entornos**: Aislamiento total entre Sandbox (testing) y Production.

## 🛠️ Desarrollo
Para instalar las dependencias de todo el monorepo:
```bash
npm install
```

Para correr en modo desarrollo:
```bash
npm run dev:frontend  # Inicia React
npm run dev:backend   # Inicia NestJS
```

---
*Trabajo final de master Big School*
