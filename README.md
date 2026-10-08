# 21 Weeks

**Del interés a la primera contribución open source en Bitcoin — en 21 semanas.**

21 Weeks es una app web que ayuda a developers y researchers a empezar a contribuir a proyectos open source de Bitcoin y Lightning. 
Sin shitcoins: solo Bitcoin, Lightning, Nostr y su ecosistema de software libre.

## Qué hace

1. **Quiz de perfil** — experiencia, intereses, tiempo disponible.
2. **Catálogo de 15 proyectos** — Bitcoin Core, Core Lightning, LND, LDK, BDK, rust-bitcoin, Electrum, BTCPay Server, mempool.space, JoinMarket, btcd, Fedimint, BOLTs, NIPs y VLS.
3. **Good-first-issues en vivo** — issues reales traídas de GitHub y GitLab, ordenadas por encaje con tu perfil (con filtro de issues ya reclamadas o con PRs en curso).
4. **Plan de 21 semanas** — una IA genera un plan semana a semana (4 h/día) con objetivos, tareas y recursos reales verificados, exportable a Markdown para continuarlo desde cualquier otro agente (Claude Code, OpenCode…).
5. **Mentor senior author-first** — un chat de mentoría que guía y pregunta pero **nunca hace el trabajo por ti**, inspirado en `doc/AI_POLICY.md` de Bitcoin Core. Fundamenta sus respuestas en fuentes primarias: [bitcoinknowledge.dev](https://bitcoinknowledge.dev) y [nostrbook.dev](https://nostrbook.dev).

## Stack

React 19 + TypeScript + Vite · Tailwind CSS 3 + shadcn/ui · Hono + tRPC 11 + superjson · Drizzle ORM (MySQL) · Vercel AI SDK (`ai` + `@ai-sdk/openai-compatible`, versiones fijadas a propósito)

## Despliegue

### Requisitos

- Node.js 20+
- Una base de datos MySQL accesible
- Acceso a un gateway compatible con la API de OpenAI para el mentor y los planes

### 1. Clona e instala

```bash
git clone https://github.com/ifuensan/21weeks.git
cd 21weeks
npm install
```

### 2. Crea tu `.env`

El repo no incluye secretos. Copia la plantilla y rellénala:

```bash
cp .env.example .env
```

| Variable | Para qué |
|---|---|
| `APP_ID` / `APP_SECRET` | ID de la app y secreto para firmar JWT (genera uno aleatorio: `openssl rand -hex 32`) |
| `DATABASE_URL` | Cadena de conexión MySQL: `mysql://user:pass@host:3306/21weeks` |
| `KIMI_AUTH_URL` / `VITE_KIMI_AUTH_URL` | URL del servidor OAuth de Kimi (si usas login con Kimi) |
| `KIMI_OPEN_URL` | URL de la plataforma abierta de Kimi |
| `VITE_APP_ID` | ID de aplicación OAuth (expuesto al navegador) |
| `OWNER_UNION_ID` | Union ID del creador; ese usuario recibe rol admin en su primer login |

Además, el backend de IA necesita estas dos variables **en el entorno del servidor** (no van en el frontend):

| Variable | Para qué |
|---|---|
| `KIMI_AGENTGW_BASE_URL` | URL base del gateway de modelos (compatible con API OpenAI) |
| `KIMI_AGENTGW_API_KEY` | API key de ese gateway |

Sin el gateway configurado, la app carga pero el mentor, la recomendación de issues y la generación de planes no funcionarán.

### 3. Base de datos

```bash
npm run db:push      # crea las tablas con Drizzle
```

### 4. Desarrollo

```bash
npm run dev          # Vite + API con hot-reload
```

### 5. Producción

```bash
npm run build        # build del frontend + bundle del backend (dist/boot.js)
npm start            # sirve todo en NODE_ENV=production (puerto PORT, por defecto 3000)
```

## Estructura

```
api/          Backend Hono + tRPC (mentor IA, issues, auth)
contracts/  Catálogo de proyectos y tipos compartidos front/back
db/         Esquema Drizzle y migraciones
src/        Frontend React (pages, components, i18n ES/EN)
public/     Logos oficiales de los 15 proyectos
```

## Licencia y contribuciones

Proyecto open source nacido de [Librería de Satoshi](https://libreriadesatoshi.com) / [HackNodes Lab](https://hacknodes.com). Issues y PRs bienvenidas, precisamente de eso va esto. ₿
