# Agents - Call Master AI 📞🤖

Este archivo documenta los agentes (subagents) y las reglas de Inteligencia Artificial (AI) para el proyecto **Call Master AI** (SaaS de automatización de analistas en call centers con agentes de voz).

## 🏢 Contexto del Proyecto (Project Context)
Al asistir en este proyecto, los agentes deben tener en cuenta el siguiente stack y arquitectura:
- **Monorepo**: Estructurado en `apps/frontend`, `apps/backend` y `packages/shared`.
- **Frontend**: React, Vite, TypeScript siguiendo el patrón Feature-First.
- **Backend**: NestJS orientado a Serverless (Clean Architecture).
- **Servicios e Infraestructura**: Supabase (PostgreSQL, Auth, Storage), Inngest (Manejo de colas y eventos), Voiceflow (Voice AI providers).
- **Control de Calidad**: ESLint v10 (Flat Config), Prettier, Commitlint (Conventional Commits).

## 🚨 Reglas Estrictas para la IA (Strict AI Rules)
Al interactuar con el usuario o generar código para este proyecto, debes seguir **ESTRICTAMENTE** estas directrices:

1. **Language Specification**: **All messages to the user must be in English.**
2. **Naming Conventions**: **All function and class names must be in CamelCase.**

## 🤖 Agentes disponibles

- **Explore**: Agente de exploración rápida del código. Uso típico: pedirle que busque funciones, rutas, o explique la estructura de carpetas. Parámetros recomendados:
  - `what`: descripción de lo que buscas (ej. "buscar controladores auth").
  - `thoroughness`: `quick` | `medium` | `thorough`.

## ⚙️ Cómo invocar un agente

Usa la API `runSubagent` con el nombre del agente y un prompt claro. Ejemplo (conceptual):

```javascript
runSubagent({
	agentName: "Explore",
	prompt: "Buscar archivos que exporten la entidad Tenant",
	description: "Exploración rápida"
})
```

## 📝 Buenas prácticas
- Proporciona siempre contexto breve y un objetivo claro al agente.
- Para búsquedas amplias usa `thoroughness: "thorough"`.
- Si vas a ejecutar cambios automáticos en el código, primero solicita un resumen de los archivos que serán tocados.

## ➕ Añadir nuevos agentes
- Agrega su definición en `.agents/` y documenta el propósito, entradas esperadas y ejemplos de uso en este archivo.

## 🔍 Dónde buscar más información
- Revisa las skills en el repositorio (`.agents/` y `openspec/`) para ver comportamientos y ejemplos concretos.


## Comportamiento general del agente
- Debe ser asquerosamenete honesto al dar opiniones al humano debes poder informar si el humano esta equivocado o si hay mejores alternativas para completar alguna tarea

## Commits y push al repositorio
- Tienes poder y autorizacion para crear commits al repositorio de forma auntomatica, debe hacer commit luego de que se completen tareas confirmadas por el humano y sobre las cuales ya hayan pasado las pruebas unitarias, el push debe ser responsabilidad de humano tu ayuda para los push es solo informar al humano, antes de escribir algun archivo asegurate que estes en alguna rama tipo feature, fix, chore si estas en algunas de las ramas dev, test, main informa al humano y espera por instrucciones.