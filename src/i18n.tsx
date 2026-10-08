import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@contracts/types";

const dict = {
  es: {
    "nav.home": "Inicio",
    "nav.quiz": "Tu perfil",
    "nav.projects": "Proyectos",
    "nav.plan": "Plan 21 semanas",
    "nav.mentor": "Mentor",
    "nav.resources": "Recursos",

    "resources.eyebrow": "Aprender antes de contribuir",
    "resources.title": "Cursos y bibliotecas del ecosistema",
    "resources.sub":
      "Dos fuentes aliadas: Librería de Satoshi (cursos en español, de GitHub para Open Source a privacidad y ecash) y The Bitcoin Dev Project (biblioteca curada, proyectos BOSS y la guía de grants para cuando ya contribuyas).",
    "resources.personalized": "ordenados por tus áreas de interés",
    "resources.matchTracks": "de tus áreas de interés",
    "resources.kind.course": "curso",
    "resources.kind.library": "biblioteca",
    "resources.kind.contribute": "proyectos",
    "resources.kind.funding": "grants",
    "resources.kind.reference": "referencia",

    "hero.eyebrow": "Bitcoin · Lightning · Open Source",
    "hero.title.a": "De cero a",
    "hero.title.b": "contributor",
    "hero.title.c": "en 21 semanas.",
    "hero.sub":
      "Elige el proyecto del ecosistema Bitcoin y Lightning que encaja con tu perfil, encuentra tu primera issue real y sigue un plan de 21 semanas a 4 horas al día, con un mentor IA senior que te guía — pero nunca hace el trabajo por ti.",
    "hero.cta": "Empezar por mi perfil",
    "hero.cta2": "Ver proyectos",
    "hero.noShitcoins": "Sin shitcoins. Solo Bitcoin, Lightning y libertad tecnológica.",

    "how.eyebrow": "Cómo funciona",
    "how.1.t": "01 / Perfil",
    "how.1.d": "Cuéntanos si eres developer o researcher, qué lenguajes dominas y cuántas horas tienes por semana.",
    "how.2.t": "02 / Proyecto",
    "how.2.d": "Te mostramos los proyectos del ecosistema ordenados por encaje con tu perfil, con sus good first issues en vivo desde GitHub y GitLab.",
    "how.3.t": "03 / Plan + Mentor",
    "how.3.d": "La IA ordena las issues que mejor te vienen y genera un plan de 21 semanas. Un mentor senior te acompaña: te orienta, te pregunta, te revisa — pero el código lo escribes tú.",

    "catalog.eyebrow": "El ecosistema",
    "catalog.title": "15 proyectos reales, cero ruido",
    "catalog.sub": "De la implementación de referencia a la especificación de Lightning. Todos aceptan contribuciones y tienen comunidad activa.",

    "quiz.eyebrow": "Tu perfil",
    "quiz.title": "¿Quién eres como contributor?",
    "quiz.role": "¿Cómo quieres contribuir?",
    "quiz.role.dev": "Developer",
    "quiz.role.dev.d": "Escribes código, tests, tooling. Quieres PRs mergeados.",
    "quiz.role.research": "Researcher",
    "quiz.role.research.d": "Especificaciones, análisis, diseño de protocolo, documentación.",
    "quiz.level": "Tu experiencia en open source",
    "quiz.level.beginner": "Principiante",
    "quiz.level.beginner.d": "Nunca he contribuido o casi nunca.",
    "quiz.level.intermediate": "Intermedio",
    "quiz.level.intermediate.d": "Algún PR pequeño o forks personales.",
    "quiz.level.advanced": "Avanzado",
    "quiz.level.advanced.d": "Contribuyo con regularidad a proyectos.",
    "quiz.langs": "¿Qué lenguajes dominas?",
    "quiz.tracks": "¿Qué áreas te atraen?",
    "quiz.hours": "Horas por semana que puedes dedicar",
    "quiz.hours.hint": "El método nació como 21 semanas × 4 horas al día (~28 h/semana). Ajústalo a tu vida real si necesitas menos.",
    "quiz.hours.unit": "h/semana",
    "quiz.back": "Atrás",
    "quiz.next": "Siguiente",
    "quiz.finish": "Ver mis proyectos",
    "quiz.step": "Paso",

    "track.consensus": "Consenso y protocolo base",
    "track.lightning": "Lightning Network",
    "track.wallets": "Carteras y UX",
    "track.privacy": "Privacidad",
    "track.p2p": "Red P2P",
    "track.infra": "Infraestructura y tooling",
    "track.research": "Investigación y specs",
    "track.docs": "Documentación",

    "projects.eyebrow": "Proyectos",
    "projects.title": "Tu ranking personal",
    "projects.sub": "Ordenados por encaje con tu perfil. El número de issues es en vivo, etiquetadas como good first issue.",
    "projects.noProfile": "Aún sin perfil — haz el quiz para ordenar por encaje.",
    "projects.match": "encaje",
    "projects.issues": "issues abiertas",
    "projects.view": "Ver issues",
    "projects.difficulty.1": "Amable",
    "projects.difficulty.2": "Medio",
    "projects.difficulty.3": "Exigente",
    "projects.host.github": "GitHub",
    "projects.host.gitlab": "GitLab",

    "issues.eyebrow": "Good first issues",
    "issues.title": "Issues en vivo de",
    "issues.loading": "Consultando la API del repo…",
    "issues.empty": "No hay issues abiertas con esa etiqueta ahora mismo. Mira el repo entero o vuelve más tarde.",
    "issues.aiRank": "Ordenar para mí con IA",
    "issues.aiRanking": "El mentor está leyendo las issues…",
    "issues.pick": "Elegir esta issue",
    "issues.picked": "Issue elegida",
    "issues.makePlan": "Generar mi plan de 21 semanas",
    "issues.makePlanNoIssue": "Generar plan sin issue concreta",
    "issues.reason": "Por qué te encaja",
    "issues.comments": "comentarios",
    "issues.back": "Volver a proyectos",
    "issues.culture": "Cómo se contribuye aquí · tolerancia a la IA",
    "issues.mentorSkill": "Mentor específico de proyecto activo",
    "issues.fallback.title": "Sin good first issues abiertas ahora mismo",
    "issues.fallback.body":
      "Este proyecto no tiene issues abiertas con etiqueta de principiante. Lo que ves abajo son issues recientes SIN etiquetar: no están curadas para empezar y pueden tener PRs en curso o debates enredados. El ranking IA ahora lee los comentarios y te avisará de esos líos — y preguntar al mentor es buena idea aquí.",

    "plan.eyebrow": "El camino",
    "plan.title": "Tu plan de 21 semanas",
    "plan.generating": "El mentor investiga fuentes en bitcoinknowledge.dev y diseña tu plan… (1-3 min, vale la pena)",
    "plan.regenerate": "Regenerar plan",
    "plan.week": "Semana",
    "plan.objectives": "Objetivos",
    "plan.tasks": "Tareas",
    "plan.resources": "Recursos",
    "plan.outcome": "Entregable",
    "plan.graduation": "Semana 21: eres contributor",
    "plan.funding": "¿Y después? Financiación para contributors:",
    "plan.progress": "completado",
    "plan.empty": "Aún no tienes plan. Elige un proyecto y genera tu ruta.",
    "plan.empty.cta": "Elegir proyecto",
    "plan.askMentor": "Preguntar al mentor sobre esta semana",
    "plan.export": "Descargar .md",
    "plan.export.hint": "Markdown legible por humanos y LLMs (Claude Code, OpenCode…). Incluye bloque de estado para reimportar.",
    "plan.import": "Importar plan",
    "plan.import.ok": "Plan importado. Bienvenido de nuevo.",
    "plan.import.err": "Ese archivo no contiene un plan 21weeks válido.",

    "mentor.eyebrow": "Mentor IA",
    "mentor.title": "Un senior a tu lado",
    "mentor.sub":
      "Guía, no ejecuta: te orienta, te hace preguntas y te señala qué leer. El código, los tests y los PRs los escribes tú.",
    "mentor.placeholder": "Pregunta sobre tu issue, tu plan, la cultura del proyecto…",
    "mentor.send": "Enviar",
    "mentor.thinking": "pensando…",
    "mentor.empty":
      "Empieza la conversación. Por ejemplo: «¿Por dónde empiezo a leer el código de mi proyecto?»",
    "mentor.error.quota": "El mentor no está disponible ahora (cuota de IA agotada o servicio saturado). Inténtalo de nuevo en un rato.",
    "mentor.context": "Contexto activo",
    "mentor.sources": "Consulta bitcoinknowledge.dev",

    "common.loading": "Cargando…",
    "common.error": "Algo falló. Reintenta.",
    "common.retry": "Reintentar",
    "footer": "Hecho para la comunidad Bitcoin open source. Tu progreso se guarda solo en tu navegador.",
  },
  en: {
    "nav.home": "Home",
    "nav.quiz": "Your profile",
    "nav.projects": "Projects",
    "nav.plan": "21-week plan",
    "nav.mentor": "Mentor",
    "nav.resources": "Resources",

    "resources.eyebrow": "Learn before contributing",
    "resources.title": "Courses and libraries from the ecosystem",
    "resources.sub":
      "Two allied sources: Librería de Satoshi (courses in Spanish, from GitHub for Open Source to privacy and ecash) and The Bitcoin Dev Project (curated library, BOSS projects and the grants guide for when you're already contributing).",
    "resources.personalized": "sorted by your areas of interest",
    "resources.matchTracks": "of your interest areas",
    "resources.kind.course": "course",
    "resources.kind.library": "library",
    "resources.kind.contribute": "projects",
    "resources.kind.funding": "grants",
    "resources.kind.reference": "reference",

    "hero.eyebrow": "Bitcoin · Lightning · Open Source",
    "hero.title.a": "From zero to",
    "hero.title.b": "contributor",
    "hero.title.c": "in 21 weeks.",
    "hero.sub":
      "Pick the Bitcoin & Lightning ecosystem project that fits your profile, find your first real issue, and follow a 21-week plan at 4 hours a day, with a senior AI mentor who guides you — but never does the work for you.",
    "hero.cta": "Start with my profile",
    "hero.cta2": "Browse projects",
    "hero.noShitcoins": "No shitcoins. Only Bitcoin, Lightning and freedom tech.",

    "how.eyebrow": "How it works",
    "how.1.t": "01 / Profile",
    "how.1.d": "Tell us whether you're a developer or researcher, which languages you know and how many hours a week you have.",
    "how.2.t": "02 / Project",
    "how.2.d": "We rank ecosystem projects by fit with your profile, with live good first issues from GitHub and GitLab.",
    "how.3.t": "03 / Plan + Mentor",
    "how.3.d": "AI ranks the issues that fit you best and generates a 21-week plan. A senior mentor walks with you: guides, asks, reviews — but you write the code.",

    "catalog.eyebrow": "The ecosystem",
    "catalog.title": "15 real projects, zero noise",
    "catalog.sub": "From the reference implementation to the Lightning spec. All accept contributions and have active communities.",

    "quiz.eyebrow": "Your profile",
    "quiz.title": "Who are you as a contributor?",
    "quiz.role": "How do you want to contribute?",
    "quiz.role.dev": "Developer",
    "quiz.role.dev.d": "You write code, tests, tooling. You want merged PRs.",
    "quiz.role.research": "Researcher",
    "quiz.role.research.d": "Specs, analysis, protocol design, documentation.",
    "quiz.level": "Your open-source experience",
    "quiz.level.beginner": "Beginner",
    "quiz.level.beginner.d": "Never contributed, or almost never.",
    "quiz.level.intermediate": "Intermediate",
    "quiz.level.intermediate.d": "A few small PRs or personal forks.",
    "quiz.level.advanced": "Advanced",
    "quiz.level.advanced.d": "I contribute to projects regularly.",
    "quiz.langs": "Which languages do you know?",
    "quiz.tracks": "Which areas attract you?",
    "quiz.hours": "Hours per week you can dedicate",
    "quiz.hours.hint": "The method was born as 21 weeks × 4 hours a day (~28 h/week). Adjust it to your real life if you need less.",
    "quiz.hours.unit": "h/week",
    "quiz.back": "Back",
    "quiz.next": "Next",
    "quiz.finish": "See my projects",
    "quiz.step": "Step",

    "track.consensus": "Consensus & base protocol",
    "track.lightning": "Lightning Network",
    "track.wallets": "Wallets & UX",
    "track.privacy": "Privacy",
    "track.p2p": "P2P network",
    "track.infra": "Infra & tooling",
    "track.research": "Research & specs",
    "track.docs": "Documentation",

    "projects.eyebrow": "Projects",
    "projects.title": "Your personal ranking",
    "projects.sub": "Sorted by fit with your profile. Issue counts are live, labeled good first issue.",
    "projects.noProfile": "No profile yet — take the quiz to sort by fit.",
    "projects.match": "match",
    "projects.issues": "open issues",
    "projects.view": "View issues",
    "projects.difficulty.1": "Friendly",
    "projects.difficulty.2": "Medium",
    "projects.difficulty.3": "Demanding",
    "projects.host.github": "GitHub",
    "projects.host.gitlab": "GitLab",

    "issues.eyebrow": "Good first issues",
    "issues.title": "Live issues from",
    "issues.loading": "Querying the repo API…",
    "issues.empty": "No open issues with that label right now. Browse the whole repo or come back later.",
    "issues.aiRank": "Rank for me with AI",
    "issues.aiRanking": "The mentor is reading the issues…",
    "issues.pick": "Pick this issue",
    "issues.picked": "Picked issue",
    "issues.makePlan": "Generate my 21-week plan",
    "issues.makePlanNoIssue": "Generate plan without a specific issue",
    "issues.reason": "Why it fits you",
    "issues.comments": "comments",
    "issues.back": "Back to projects",
    "issues.culture": "How to contribute here · AI tolerance",
    "issues.mentorSkill": "Project-specific mentor active",
    "issues.fallback.title": "No open good first issues right now",
    "issues.fallback.body":
      "This project has no open issues with a beginner label. What you see below are recent UNLABELED issues: they are not curated for starting out and may have in-flight PRs or tangled discussions. The AI ranking now reads the comments and will warn you about those messes — and asking the mentor is a good idea here.",

    "plan.eyebrow": "The path",
    "plan.title": "Your 21-week plan",
    "plan.generating": "The mentor is researching sources on bitcoinknowledge.dev and designing your plan… (1-3 min, worth it)",
    "plan.regenerate": "Regenerate plan",
    "plan.week": "Week",
    "plan.objectives": "Objectives",
    "plan.tasks": "Tasks",
    "plan.resources": "Resources",
    "plan.outcome": "Deliverable",
    "plan.graduation": "Week 21: you are a contributor",
    "plan.funding": "What's next? Funding for contributors:",
    "plan.progress": "completed",
    "plan.empty": "No plan yet. Pick a project and generate your route.",
    "plan.empty.cta": "Pick a project",
    "plan.askMentor": "Ask the mentor about this week",
    "plan.export": "Download .md",
    "plan.export.hint": "Markdown readable by humans and LLMs (Claude Code, OpenCode…). Includes a state block for reimporting.",
    "plan.import": "Import plan",
    "plan.import.ok": "Plan imported. Welcome back.",
    "plan.import.err": "That file does not contain a valid 21weeks plan.",

    "mentor.eyebrow": "AI Mentor",
    "mentor.title": "A senior by your side",
    "mentor.sub":
      "Guides, never executes: it orients you, asks you questions and points at what to read. You write the code, the tests and the PRs.",
    "mentor.placeholder": "Ask about your issue, your plan, the project's culture…",
    "mentor.send": "Send",
    "mentor.thinking": "thinking…",
    "mentor.empty": "Start the conversation. E.g.: «Where should I start reading my project's code?»",
    "mentor.error.quota": "The mentor is unavailable right now (AI quota exhausted or service busy). Try again later.",
    "mentor.context": "Active context",
    "mentor.sources": "Searches bitcoinknowledge.dev",

    "common.loading": "Loading…",
    "common.error": "Something failed. Retry.",
    "common.retry": "Retry",
    "footer": "Built for the Bitcoin open-source community. Your progress is stored only in your browser.",
  },
} as const;

export type TKey = keyof (typeof dict)["es"];

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: TKey) => string;
}

const I18nContext = createContext<I18n>({
  locale: "es",
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("oss21.locale");
    return saved === "en" ? "en" : "es";
  });
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("oss21.locale", l);
    document.documentElement.lang = l;
  };
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const t = (k: TKey) => dict[locale][k] ?? k;
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
