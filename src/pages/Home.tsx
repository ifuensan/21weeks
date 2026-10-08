import { Link } from "react-router";
import { PROJECTS } from "@contracts/types";
import { useI18n, type TKey } from "@/i18n";
import { Reveal } from "@/components/Layout";
import { ProjectLogo } from "@/components/ProjectLogo";
import { Blueprint } from "@/components/Blueprint";

export default function Home() {
  const { t, locale } = useI18n();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "radial-gradient(120% 100% at 70% 30%, black 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 70% 30%, black 30%, transparent 78%)",
          }}
        >
          <Blueprint seed={21} />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pt-24 md:pt-36 pb-20">
        <Reveal>
          <p className="eyebrow mb-6" style={{ color: "var(--ember)" }}>
            {t("hero.eyebrow")}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h1
            className="font-extrabold leading-[0.98] tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.6rem, 7.5vw, 5.6rem)" }}
          >
            {t("hero.title.a")}{" "}
            <span style={{ color: "var(--ember)" }}>{t("hero.title.b")}</span>
            <br />
            {t("hero.title.c")}
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-8 max-w-2xl lead-serif opacity-85">
            {t("hero.sub")}
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/quiz" className="btn-ember no-underline">
              {t("hero.cta")} →
            </Link>
            <Link to="/projects" className="btn-ghost-ember no-underline">
              {t("hero.cta2")}
            </Link>
          </div>
          <p className="font-mono2 mt-8 text-[11px] uppercase tracking-[0.15em] opacity-50">
            {t("hero.noShitcoins")}
          </p>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 font-mono2 text-sm">
            <span><b style={{ color: "var(--ember)" }}>21</b> {locale === "es" ? "semanas" : "weeks"}</span>
            <span><b style={{ color: "var(--ember)" }}>4h</b>/{locale === "es" ? "día" : "day"}</span>
            <span><b style={{ color: "var(--ember)" }}>{PROJECTS.length}</b> {locale === "es" ? "proyectos" : "projects"}</span>
            <span><b style={{ color: "var(--ember)" }}>2</b> forges · github + gitlab</span>
          </div>
        </Reveal>
        </div>
      </section>

      {/* MARQUEE de proyectos: solo logos */}
      <section className="overflow-hidden py-7" style={{ borderBlock: "1px solid var(--hairline)" }}>
        <div className="marquee-track flex w-max items-center gap-12">
          {[...PROJECTS, ...PROJECTS].map((p, i) => (
            <span key={i} className="opacity-70 hover:opacity-100 transition-opacity" title={p.name}>
              <ProjectLogo id={p.id} size={38} />
            </span>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="eyebrow mb-4" style={{ color: "var(--ember)" }}>
            §1 · {t("how.eyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] mb-16">
            21 {locale === "es" ? "semanas, tres movimientos" : "weeks, three moves"}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "var(--hairline)" }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ background: "var(--ink)" }} className="p-8">
              <Reveal delay={n * 120}>
                <p className="font-mono2 text-sm mb-5" style={{ color: "var(--ember)" }}>
                  {t(`how.${n}.t` as TKey)}
                </p>
                <p className="leading-relaxed opacity-80">{t(`how.${n}.d` as TKey)}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO preview */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal>
          <p className="eyebrow mb-4" style={{ color: "var(--ember)" }}>
            §2 · {t("catalog.eyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] mb-4">
            {t("catalog.title")}
          </h2>
          <p className="max-w-xl opacity-75 mb-12">{t("catalog.sub")}</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--hairline)" }}>
          {PROJECTS.slice(0, 6).map((p, i) => (
            <Link
              key={p.id}
              to={`/issues/${p.id}`}
              className="no-underline group p-6 transition-colors"
              style={{ background: "var(--ink)" }}
            >
              <Reveal delay={i * 60}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProjectLogo id={p.id} size={30} />
                    <h3
                      className="text-lg font-bold tracking-tight truncate group-hover:text-[--ember] transition-colors"
                      style={{ color: "var(--paper)" }}
                    >
                      {p.name}
                    </h3>
                  </div>
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.1em] opacity-40 shrink-0">
                    {p.host}
                  </span>
                </div>
                <p className="mt-2 text-sm opacity-70 leading-relaxed">{p.tagline[locale]}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.languages.slice(0, 3).map((l) => (
                    <span key={l} className="pill">
                      {l}
                    </span>
                  ))}
                </div>
              </Reveal>
            </Link>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-10 text-center">
            <Link to="/projects" className="btn-ghost-ember no-underline">
              {t("hero.cta2")} →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
