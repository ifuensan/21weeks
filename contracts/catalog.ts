/**
 * contracts/catalog.ts — Datos compartidos frontend ↔ backend.
 * Catálogo curado del ecosistema Bitcoin / Lightning (sin shitcoins),
 * tipos de perfil de usuario y tipos de issues / plan.
 */

export type Role = "developer" | "researcher";
export type Level = "beginner" | "intermediate" | "advanced";
export type Locale = "es" | "en";

export interface Profile {
  role: Role;
  level: Level;
  languages: string[];
  tracks: string[];
  hoursPerWeek: number;
}

export const TRACKS = [
  "consensus",
  "lightning",
  "wallets",
  "privacy",
  "p2p",
  "infra",
  "research",
  "docs",
] as const;

export type Track = (typeof TRACKS)[number];

export const LANGUAGES = [
  "C++",
  "C",
  "Rust",
  "Go",
  "Python",
  "TypeScript",
  "C#",
  "Kotlin",
  "Specs",
] as const;

export interface Project {
  id: string;
  name: string;
  tagline: { es: string; en: string };
  summary: { es: string; en: string };
  host: "github" | "gitlab";
  repo: string; // owner/repo o grupo/proyecto
  labels: string[]; // etiquetas de "good first issue" a consultar
  languages: string[];
  tracks: Track[];
  difficulty: 1 | 2 | 3; // 1 = amable para empezar, 3 = exigente
  roles: Role[];
  urls: {
    repo: string;
    contributing?: string;
    docs?: string;
    chat?: string;
  };
}

export const PROJECTS: Project[] = [
  {
    id: "bitcoin-core",
    name: "Bitcoin Core",
    tagline: { es: "La implementación de referencia", en: "The reference implementation" },
    summary: {
      es: "El cliente Bitcoin original y más usado. C++ con tests funcionales en Python. Revisión rigurosa, cultura de 'review antes que código'.",
      en: "The original and most widely used Bitcoin client. C++ with Python functional tests. Rigorous review culture — review before code.",
    },
    host: "github",
    repo: "bitcoin/bitcoin",
    labels: ["good first issue"],
    languages: ["C++", "Python"],
    tracks: ["consensus", "p2p", "wallets", "infra"],
    difficulty: 3,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/bitcoin/bitcoin",
      contributing: "https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md",
      docs: "https://bitcoincore.reviews/",
      chat: "https://bitcoincore.reviews/",
    },
  },
  {
    id: "core-lightning",
    name: "Core Lightning",
    tagline: { es: "Implementación Lightning de Blockstream", en: "Blockstream's Lightning implementation" },
    summary: {
      es: "Nodo Lightning en C con plugins en Python. Modular, orientado a especificación y con una comunidad muy activa.",
      en: "Lightning node in C with Python plugins. Modular, spec-driven, with a very active community.",
    },
    host: "github",
    repo: "ElementsProject/lightning",
    labels: ["good first issue"],
    languages: ["C", "Python"],
    tracks: ["lightning", "infra"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/ElementsProject/lightning",
      contributing: "https://github.com/ElementsProject/lightning/blob/master/CONTRIBUTING.md",
      docs: "https://docs.corelightning.org/",
    },
  },
  {
    id: "lnd",
    name: "LND",
    tagline: { es: "Lightning Network Daemon en Go", en: "Lightning Network Daemon in Go" },
    summary: {
      es: "La implementación Lightning más desplegada, escrita en Go por Lightning Labs. Gran ecosistema de herramientas alrededor.",
      en: "The most deployed Lightning implementation, written in Go by Lightning Labs. Huge tooling ecosystem around it.",
    },
    host: "github",
    repo: "lightningnetwork/lnd",
    labels: ["good first issue"],
    languages: ["Go"],
    tracks: ["lightning", "p2p"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/lightningnetwork/lnd",
      contributing: "https://github.com/lightningnetwork/lnd/blob/master/docs/code_contribution_guidelines.md",
      docs: "https://docs.lightning.engineering/",
    },
  },
  {
    id: "ldk",
    name: "LDK (rust-lightning)",
    tagline: { es: "Lightning como librería en Rust", en: "Lightning as a Rust library" },
    summary: {
      es: "Lightning Dev Kit: una librería flexible en Rust para construir nodos y apps Lightning a medida.",
      en: "Lightning Dev Kit: a flexible Rust library to build custom Lightning nodes and apps.",
    },
    host: "github",
    repo: "lightningdevkit/rust-lightning",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["lightning"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/lightningdevkit/rust-lightning",
      contributing: "https://github.com/lightningdevkit/rust-lightning/blob/main/CONTRIBUTING.md",
      docs: "https://lightningdevkit.org/",
    },
  },
  {
    id: "bdk",
    name: "BDK (Bitcoin Dev Kit)",
    tagline: { es: "Carteras Bitcoin en Rust, sin dolor", en: "Bitcoin wallets in Rust, painless" },
    summary: {
      es: "Librerías en Rust para construir carteras Bitcoin. Comunidad muy acogedora con nuevas personas y buen onboarding.",
      en: "Rust libraries to build Bitcoin wallets. A very welcoming community for newcomers with great onboarding.",
    },
    host: "github",
    repo: "bitcoindevkit/bdk",
    labels: ["good first issue"],
    languages: ["Rust", "Kotlin"],
    tracks: ["wallets"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/bitcoindevkit/bdk",
      contributing: "https://github.com/bitcoindevkit/bdk/blob/master/CONTRIBUTING.md",
      docs: "https://bitcoindevkit.org/",
    },
  },
  {
    id: "rust-bitcoin",
    name: "rust-bitcoin",
    tagline: { es: "Primitivas Bitcoin en Rust", en: "Bitcoin primitives in Rust" },
    summary: {
      es: "Librería base con tipos y primitivas de Bitcoin (transacciones, scripts, direcciones) escrita en Rust idiomático.",
      en: "Core library with Bitcoin types and primitives (transactions, scripts, addresses) in idiomatic Rust.",
    },
    host: "github",
    repo: "rust-bitcoin/rust-bitcoin",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["consensus", "wallets"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/rust-bitcoin/rust-bitcoin",
      contributing: "https://github.com/rust-bitcoin/rust-bitcoin/blob/master/CONTRIBUTING.md",
      docs: "https://docs.rs/bitcoin/",
    },
  },
  {
    id: "electrum",
    name: "Electrum",
    tagline: { es: "La cartera clásica en Python", en: "The classic Python wallet" },
    summary: {
      es: "Cartera Bitcoin ligera y veterana, en Python. Ideal si vienes de scripting y quieres tocar protocolo, Lightning y UX.",
      en: "Veteran lightweight Bitcoin wallet in Python. Great if you come from scripting and want to touch protocol, Lightning and UX.",
    },
    host: "github",
    repo: "spesmilo/electrum",
    labels: ["good first issue"],
    languages: ["Python"],
    tracks: ["wallets", "lightning"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/spesmilo/electrum",
      contributing: "https://github.com/spesmilo/electrum/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "btcpay",
    name: "BTCPay Server",
    tagline: { es: "Pagos Bitcoin autoalojados", en: "Self-hosted Bitcoin payments" },
    summary: {
      es: "Procesador de pagos Bitcoin/Lightning open source en C#. Perfecto si vienes del mundo web y .NET.",
      en: "Open source Bitcoin/Lightning payment processor in C#. Perfect if you come from web and .NET.",
    },
    host: "github",
    repo: "btcpayserver/btcpayserver",
    labels: ["good first issue"],
    languages: ["C#", "TypeScript"],
    tracks: ["wallets", "infra"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/btcpayserver/btcpayserver",
      contributing: "https://github.com/btcpayserver/btcpayserver/blob/master/CONTRIBUTING.md",
      docs: "https://docs.btcpayserver.org/",
    },
  },
  {
    id: "mempool",
    name: "mempool.space",
    tagline: { es: "Explorador y visualización del mempool", en: "Mempool explorer & visualization" },
    summary: {
      es: "El explorador de mempool más popular. Frontend Angular/TypeScript y backend Node. Visualización de datos en tiempo real.",
      en: "The most popular mempool explorer. Angular/TypeScript frontend and Node backend. Real-time data visualization.",
    },
    host: "github",
    repo: "mempool/mempool",
    labels: ["good first issue"],
    languages: ["TypeScript"],
    tracks: ["infra", "p2p"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/mempool/mempool",
      contributing: "https://github.com/mempool/mempool/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "joinmarket",
    name: "JoinMarket",
    tagline: { es: "CoinJoin para la privacidad", en: "CoinJoin for privacy" },
    summary: {
      es: "Implementación de CoinJoin en Python para mejorar la privacidad on-chain. Criptografía aplicada y economía de mercado.",
      en: "CoinJoin implementation in Python to improve on-chain privacy. Applied cryptography and market economics.",
    },
    host: "github",
    repo: "JoinMarket-Org/joinmarket-clientserver",
    labels: ["good first issue"],
    languages: ["Python"],
    tracks: ["privacy", "wallets"],
    difficulty: 2,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/JoinMarket-Org/joinmarket-clientserver",
      contributing: "https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/CONTRIBUTING.md",
      docs: "https://joinmarket-org.github.io/joinmarket-clientserver/",
    },
  },
  {
    id: "btcd",
    name: "btcd",
    tagline: { es: "Nodo completo Bitcoin en Go", en: "Full Bitcoin node in Go" },
    summary: {
      es: "Implementación alternativa de un nodo Bitcoin completo en Go, con una suite de librerías (btcutil, neutrino…).",
      en: "Alternative full Bitcoin node implementation in Go, with a suite of libraries (btcutil, neutrino…).",
    },
    host: "github",
    repo: "btcsuite/btcd",
    labels: ["good first issue"],
    languages: ["Go"],
    tracks: ["consensus", "p2p"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/btcsuite/btcd",
      contributing: "https://github.com/btcsuite/btcd/blob/master/docs/code_contribution_guidelines.md",
    },
  },
  {
    id: "fedimint",
    name: "Fedimint",
    tagline: { es: "Custodia federada y ecash", en: "Federated custody & ecash" },
    summary: {
      es: "Sistema federado de custodia comunitaria basado en ecash (Chaumian mints) escrito en Rust. Frontera de investigación aplicada.",
      en: "Federated community custody system based on ecash (Chaumian mints) written in Rust. Applied research frontier.",
    },
    host: "github",
    repo: "fedimint/fedimint",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["privacy", "wallets", "research"],
    difficulty: 3,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/fedimint/fedimint",
      contributing: "https://github.com/fedimint/fedimint/blob/master/CONTRIBUTING.md",
      docs: "https://fedimint.org/",
    },
  },
  {
    id: "bolts",
    name: "BOLTs (Lightning Spec)",
    tagline: { es: "La especificación de Lightning", en: "The Lightning specification" },
    summary: {
      es: "Basis of Lightning Technology: el estándar que implementan todos los nodos Lightning. Trabajo de especificación, no de código.",
      en: "Basis of Lightning Technology: the standard every Lightning node implements. Specification work, not code.",
    },
    host: "github",
    repo: "lightning/bolts",
    labels: ["good first issue", "documentation"],
    languages: ["Specs"],
    tracks: ["lightning", "research", "docs"],
    difficulty: 2,
    roles: ["researcher"],
    urls: {
      repo: "https://github.com/lightning/bolts",
      contributing: "https://github.com/lightning/bolts/blob/master/CONTRIBUTING.md",
      docs: "https://github.com/lightning/bolts/blob/master/00-introduction.md",
    },
  },
  {
    id: "nips",
    name: "Nostr NIPs",
    tagline: { es: "Estándares del protocolo Nostr", en: "Nostr protocol standards" },
    summary: {
      es: "Nostr Implementation Possibilities: el repositorio de estándares del protocolo Nostr. Diseño de protocolo y debate técnico.",
      en: "Nostr Implementation Possibilities: the standards repo of the Nostr protocol. Protocol design and technical debate.",
    },
    host: "github",
    repo: "nostr-protocol/nips",
    labels: ["good first issue", "documentation"],
    languages: ["Specs", "TypeScript"],
    tracks: ["research", "docs", "infra"],
    difficulty: 1,
    roles: ["researcher", "developer"],
    urls: {
      repo: "https://github.com/nostr-protocol/nips",
      contributing: "https://github.com/nostr-protocol/nips/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "vls",
    name: "Validating Lightning Signer",
    tagline: { es: "Firmado Lightning seguro", en: "Secure Lightning signing" },
    summary: {
      es: "VLS separa las claves del nodo Lightning en un dispositivo de firma validador. Rust, seguridad y hardware (proyecto en GitLab).",
      en: "VLS moves Lightning node keys into a validating signing device. Rust, security and hardware (GitLab project).",
    },
    host: "gitlab",
    repo: "lightning-signer/validating-lightning-signer",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["lightning", "privacy"],
    difficulty: 3,
    roles: ["developer"],
    urls: {
      repo: "https://gitlab.com/lightning-signer/validating-lightning-signer",
      docs: "https://vls.tech/",
    },
  },
];

// ---------- Issues ----------

export interface Issue {
  id: string; // host:repo:number
  projectId: string;
  number: number;
  title: string;
  url: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  body: string; // recortado
  author?: string;
}

export interface RankedIssue {
  issueId: string;
  score: number; // 0-100
  reason: string;
}

// ---------- Plan 21 semanas ----------

export interface PlanWeek {
  week: number; // 1..21
  phase: string; // nombre corto de la fase
  title: string;
  objectives: string[];
  tasks: string[];
  resources: { label: string; url: string }[];
  outcome: string; // entregable de la semana
}

export interface Plan {
  projectId: string;
  projectName: string;
  generatedAt: string;
  issueId?: string;
  weeks: PlanWeek[];
  intro: string;
  graduation: string; // cómo se ve "ser contributor" al final
}

// ---------- Recursos de aprendizaje curados (LdS + The Bitcoin Dev Project) ----------

export interface LearningResource {
  title: { es: string; en: string };
  url: string;
  provider: "lds" | "bdev" | "nostrbook";
  kind: "course" | "library" | "contribute" | "funding" | "reference";
  tracks: Track[];
  levels: Level[]; // para quién encaja mejor
  lang: "es" | "en" | "pt";
  note: { es: string; en: string };
}

export const LEARNING_RESOURCES: LearningResource[] = [
  // — Librería de Satoshi (cursos, español/portugués) —
  {
    title: { es: "Aprende GitHub para Open Source", en: "Learn GitHub for Open Source" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=27",
    provider: "lds",
    kind: "course",
    tracks: ["infra", "docs"],
    levels: ["beginner"],
    lang: "es",
    note: {
      es: "El prerrequisito real: forks, ramas, PRs y reviews antes de tocar código Bitcoin.",
      en: "The real prerequisite: forks, branches, PRs and reviews before touching Bitcoin code.",
    },
  },
  {
    title: { es: "Bitcoin Core, LND y LNbits: de cero a infraestructura real", en: "Bitcoin Core, LND & LNbits: zero to real infrastructure" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=24",
    provider: "lds",
    kind: "course",
    tracks: ["lightning", "infra"],
    levels: ["beginner", "intermediate"],
    lang: "es",
    note: {
      es: "Montar tu propio stack Core+LND es la mejor semana 1 posible para cualquier proyecto Lightning.",
      en: "Running your own Core+LND stack is the best possible week 1 for any Lightning project.",
    },
  },
  {
    title: { es: "Programando la red P2P de Bitcoin: construye tu propio nodo", en: "Programming the Bitcoin P2P network: build your own node" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=38",
    provider: "lds",
    kind: "course",
    tracks: ["p2p", "consensus"],
    levels: ["intermediate"],
    lang: "es",
    note: {
      es: "Entender el protocolo P2P construyendo uno: ideal antes de tocar net_processing en Core.",
      en: "Understand the P2P protocol by building one: ideal before touching net_processing in Core.",
    },
  },
  {
    title: { es: "Expertos del Protocolo", en: "Protocol Experts" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=9",
    provider: "lds",
    kind: "course",
    tracks: ["consensus", "research"],
    levels: ["intermediate", "advanced"],
    lang: "es",
    note: {
      es: "Lectura y discusión del funcionamiento interno de Bitcoin. Nivel serio.",
      en: "Reading and discussing Bitcoin internals. Serious level.",
    },
  },
  {
    title: { es: "Diplomatura de Privacidad en Bitcoin", en: "Bitcoin Privacy Diploma" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=45",
    provider: "lds",
    kind: "course",
    tracks: ["privacy"],
    levels: ["beginner", "intermediate"],
    lang: "es",
    note: {
      es: "Base teórica de privacidad on-chain antes de contribuir a JoinMarket o Fedimint.",
      en: "On-chain privacy theory before contributing to JoinMarket or Fedimint.",
    },
  },
  {
    title: { es: "Learn Cashu for Beginners", en: "Learn Cashu for Beginners" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=14",
    provider: "lds",
    kind: "course",
    tracks: ["privacy", "wallets", "research"],
    levels: ["beginner"],
    lang: "es",
    note: {
      es: "Ecash chaumiano desde cero: el primo protocolar de Fedimint.",
      en: "Chaumian ecash from scratch: Fedimint's protocol cousin.",
    },
  },
  {
    title: { es: "Nostr: construye tu primer cliente", en: "Nostr: build your first client" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=26",
    provider: "lds",
    kind: "course",
    tracks: ["research", "infra"],
    levels: ["beginner"],
    lang: "es",
    note: {
      es: "La forma más rápida de entender Nostr antes de opinar en los NIPs.",
      en: "The fastest way to understand Nostr before opining on NIPs.",
    },
  },
  {
    title: { es: "LN+AI: Lightning Network & Artificial Intelligence", en: "LN+AI: Lightning Network & Artificial Intelligence" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=46",
    provider: "lds",
    kind: "course",
    tracks: ["lightning"],
    levels: ["intermediate"],
    lang: "es",
    note: {
      es: "La intersección LN + agentes: pagos machine-to-machine y L402.",
      en: "The LN + agents intersection: machine-to-machine payments and L402.",
    },
  },
  {
    title: { es: "Docker + IA para infraestructura Bitcoin open source", en: "Docker + AI for Bitcoin open-source infrastructure" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=40",
    provider: "lds",
    kind: "course",
    tracks: ["infra"],
    levels: ["beginner"],
    lang: "es",
    note: {
      es: "Entornos reproducibles: útil para correr nodos de prueba y CI local.",
      en: "Reproducible environments: handy for test nodes and local CI.",
    },
  },
  {
    title: { es: "De tu nodo a un observatorio: datos y observabilidad P2P", en: "From your node to an observatory: P2P data & observability" },
    url: "https://moodle.libreriadesatoshi.com/course/view.php?id=47",
    provider: "lds",
    kind: "course",
    tracks: ["p2p", "infra", "research"],
    levels: ["intermediate"],
    lang: "es",
    note: {
      es: "Monitorizar la red P2P: perfil researcher aplicado a datos de la red.",
      en: "Monitoring the P2P network: researcher profile applied to network data.",
    },
  },
  // — The Bitcoin Dev Project —
  {
    title: { es: "Biblioteca de aprendizaje (The Bitcoin Dev Project)", en: "Learn library (The Bitcoin Dev Project)" },
    url: "https://bitcoindevs.xyz/learn",
    provider: "bdev",
    kind: "library",
    tracks: ["consensus", "lightning", "wallets", "privacy", "p2p", "infra", "research", "docs"],
    levels: ["beginner", "intermediate", "advanced"],
    lang: "en",
    note: {
      es: "Guías, talleres y seminarios curados por nivel: de Chaincode, Optech, Base58…",
      en: "Guides, workshops and seminars curated by level: Chaincode, Optech, Base58…",
    },
  },
  {
    title: { es: "Explorar proyectos BOSS del ecosistema", en: "Explore ecosystem BOSS projects" },
    url: "https://bitcoindevs.xyz/contribute",
    provider: "bdev",
    kind: "contribute",
    tracks: ["consensus", "lightning", "wallets", "privacy", "p2p", "infra", "research", "docs"],
    levels: ["beginner", "intermediate", "advanced"],
    lang: "en",
    note: {
      es: "Más proyectos Bitcoin open source por si nuestro catálogo se te queda corto.",
      en: "More Bitcoin open-source projects if our catalog runs short for you.",
    },
  },
  {
    title: { es: "Get Funded: guía de grants para contributors", en: "Get Funded: grants guide for contributors" },
    url: "https://bitcoindevs.xyz/get-funded",
    provider: "bdev",
    kind: "funding",
    tracks: ["consensus", "lightning", "wallets", "privacy", "p2p", "infra", "research", "docs"],
    levels: ["intermediate", "advanced"],
    lang: "en",
    note: {
      es: "OpenSats, Spiral, HRF, Brink…: para cuando tus PRs ya hablen por ti (semana 21+).",
      en: "OpenSats, Spiral, HRF, Brink…: for when your PRs already speak for you (week 21+).",
    },
  },
  // — Nostrbook —
  {
    title: { es: "Nostrbook: registro de documentación Nostr", en: "Nostrbook: Nostr documentation registry" },
    url: "https://nostrbook.dev/",
    provider: "nostrbook",
    kind: "reference",
    tracks: ["research", "infra"],
    levels: ["beginner", "intermediate", "advanced"],
    lang: "en",
    note: {
      es: "Todos los event kinds, tags y flujos del protocolo explicados y cruzados. Nuestro mentor la consulta en vivo.",
      en: "Every event kind, tag and protocol flow explained and cross-referenced. Our mentor queries it live.",
    },
  },
];

// ---------- Cultura de contribución y tolerancia a IA por proyecto ----------

export const CULTURE: Record<string, { es: string; en: string }> = {
  "bitcoin-core": {
    es: "Cultura autor-primero regulada por doc/AI_POLICY.md: tú escribes cada línea, cada test y cada mensaje de commit, y debes poder defenderlas en review. PRs pequeños, merge por ACKs de reviewers — la review es el cuello de botella, así que revisar PRs ajenos da más reputación que abrir los tuyos. Puerta de entrada concreta: los hallazgos LOW-2/LOW-3 de la auditoría Quarkslab 2025. La IA te explica y te hace preguntas; jamás te da un diff listo para pegar.",
    en: "Author-first culture regulated by doc/AI_POLICY.md: you write every line, test and commit message, and you must defend them in review. Small PRs, merged by reviewer ACKs — review is the bottleneck, so reviewing others' PRs earns more reputation than opening your own. Concrete entry point: the LOW-2/LOW-3 findings of the 2025 Quarkslab audit. AI explains and questions you; it never hands you a ready-to-paste diff.",
  },
  "core-lightning": {
    es: "Proyecto guiado por la especificación (BOLTs), con arquitectura de plugins en Python sobre el núcleo en C. Se discute antes de cambios grandes en los canales de la comunidad. IA: bienvenida para aprender, pero cada línea debe ser entendida y testada por ti.",
    en: "Spec-driven project (BOLTs) with a Python plugin architecture over a C core. Discuss big changes on community channels first. AI: welcome for learning, but every line must be understood and tested by you.",
  },
  lnd: {
    es: "Lightning Labs mantiene guías de contribución estrictas: commits pequeños y bien estructurados, cobertura de tests exhaustiva y etiqueta de review formal. IA: debes entender y respaldar todo el código que envíes.",
    en: "Lightning Labs keeps strict contribution guidelines: small well-structured commits, extensive test coverage and formal review etiquette. AI: you must understand and own all the code you submit.",
  },
  ldk: {
    es: "Librería ante todo: hay que pensar en superficie de API, compatibilidad no-std y MSRV. Buena cultura de review en GitHub y documentación de arquitectura propia. IA: principio autor-primero, código entendido y defendido.",
    en: "Library first: think about API surface, no-std compatibility and MSRV. Good GitHub review culture and its own architecture docs. AI: author-first principle — understood and defended code.",
  },
  bdk: {
    es: "Una de las comunidades más acogedoras para primeras contribuciones: Discord activo, etiquetas good first issue bien cuidadas y review amable. Workspace de crates (bdk_wallet, bdk_chain…). IA: pragmática, pero entiende y respalda cada línea.",
    en: "One of the most welcoming communities for first-time contributors: active Discord, well-curated good first issue labels and kind review. Workspace of crates (bdk_wallet, bdk_chain…). AI: pragmatic, but understand and own every line.",
  },
  "rust-bitcoin": {
    es: "Librería fundacional con un listón altísimo de corrección: cambios mínimos, tests fuertes y docs. Adyacente al consenso — la comprensión no es opcional. IA: autor-primero estricto.",
    en: "Foundational library with a very high correctness bar: minimal changes, strong tests and docs. Consensus-adjacent — understanding is not optional. AI: strict author-first.",
  },
  electrum: {
    es: "Equipo mantenedor pequeño con review concisa: contribuciones enfocadas y bien testadas. Su implementación propia de Lightning en Python es una gran escuela. IA: no regulada explícitamente; se espera comprensión.",
    en: "Small maintainer team with terse review: focused, well-tested contributions. Its own Python Lightning implementation is a great school. AI: not explicitly regulated; understanding expected.",
  },
  btcpay: {
    es: "Orientado a producto y amable con web devs (C#/ASP.NET). Comunidad activa en su chat. Buen camino: fixes de UI, docs, y luego lógica de pagos. IA: pragmática, el autor responde del código.",
    en: "Product-oriented and web-dev friendly (C#/ASP.NET). Active community chat. Good path: UI fixes, docs, then payment logic. AI: pragmatic, the author owns the code.",
  },
  mempool: {
    es: "TypeScript/Angular + Node. Contribuciones visuales y de producto bienvenidas; fácil de autoalojar en signet/regtest para trastear. IA: pragmática, con tests y comprensión.",
    en: "TypeScript/Angular + Node. Visual and product contributions welcome; easy to self-host on signet/regtest for hacking. AI: pragmatic, with tests and understanding.",
  },
  joinmarket: {
    es: "Comunidad de privacidad con review cuidadosa alrededor de criptografía y economía coinjoin. Comunidad pequeña: paciencia con la latencia de review. IA: no regulada; se requiere comprensión profunda de las implicaciones de privacidad.",
    en: "Privacy community with careful review around cryptography and coinjoin economics. Small community: be patient with review latency. AI: unregulated; deep understanding of privacy implications required.",
  },
  btcd: {
    es: "Implementación alternativa en Go: la compatibilidad de consenso con Bitcoin Core lo domina todo; se testea contra la implementación de referencia. IA: autor-primero.",
    en: "Alternative Go implementation: consensus compatibility with Bitcoin Core dominates everything; test against the reference implementation. AI: author-first.",
  },
  fedimint: {
    es: "Adyacente a investigación (ecash chaumiano, federaciones). Rust + entorno Nix — el setup es el primer obstáculo real. Llamadas de comunidad activas. IA: pragmática, pero el autor responde del código.",
    en: "Research-adjacent (Chaumian ecash, federations). Rust + Nix environment — the setup is the first real hurdle. Active community calls. AI: pragmatic, but the author owns the code.",
  },
  bolts: {
    es: "Esto es la ESPECIFICACIÓN de Lightning, no código: contribuir es escribir texto de spec, racional y coordinar entre implementaciones. Sin implementaciones que lo adopten, un cambio no avanza. IA: el lenguaje de spec debe ser preciso y totalmente entendido por ti.",
    en: "This is the Lightning SPECIFICATION, not code: contributing means writing spec text, rationale and coordinating across implementations. Without adopting implementations, a change doesn't advance. AI: spec language must be precise and fully understood by you.",
  },
  nips: {
    es: "Repositorio de estándares de Nostr: consenso aproximado y guiado por implementaciones — un NIP sin clientes que lo usen raramente avanza. IA: pragmática; tú defiendes el diseño.",
    en: "Nostr standards repo: rough consensus, implementation-driven — a NIP without clients using it rarely advances. AI: pragmatic; you defend the design.",
  },
  vls: {
    es: "Rust crítico para seguridad: las políticas de firma deben ser correctas contra los BOLTs. Equipo pequeño, foco en review de seguridad, y flujo GitLab (merge requests, no PRs). IA: el código crítico de seguridad exige comprensión total del autor.",
    en: "Security-critical Rust: signing policies must be correct against the BOLTs. Small team, security review focus, and GitLab workflow (merge requests, not PRs). AI: security-critical code demands full author understanding.",
  },
};

// ---------- Matching determinista ----------

export function matchScore(profile: Profile, project: Project): number {
  let score = 0;
  // rol
  if (project.roles.includes(profile.role)) score += 25;
  // lenguajes
  const langHits = project.languages.filter((l) => profile.languages.includes(l)).length;
  score += Math.min(35, langHits * 18);
  if (profile.languages.length > 0 && langHits === 0 && !project.languages.includes("Specs")) score -= 10;
  // tracks
  const trackHits = project.tracks.filter((t) => profile.tracks.includes(t as string)).length;
  score += Math.min(30, trackHits * 12);
  // dificultad vs nivel
  const levelNum = profile.level === "beginner" ? 1 : profile.level === "intermediate" ? 2 : 3;
  const gap = project.difficulty - levelNum;
  score += gap <= 0 ? 10 : gap === 1 ? 4 : -6;
  return Math.max(0, Math.min(100, score));
}
