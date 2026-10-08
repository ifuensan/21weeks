import { LEARNING_RESOURCES } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { Reveal } from "@/components/Layout";

const PROVIDER_META = {
  lds: {
    name: "Librería de Satoshi",
    url: "https://moodle.libreriadesatoshi.com/",
    tag: { es: "Cursos en español — la academia bitcoiner de habla hispana", en: "Courses in Spanish — the Spanish-speaking bitcoiner academy" },
  },
  bdev: {
    name: "The Bitcoin Dev Project",
    url: "https://bitcoindevs.xyz/",
    tag: { es: "Biblioteca curada, proyectos BOSS y guía de financiación", en: "Curated library, BOSS projects and funding guide" },
  },
  nostrbook: {
    name: "Nostrbook",
    url: "https://nostrbook.dev/",
    tag: { es: "Registro estructurado de documentación Nostr — kinds, tags y protocolo", en: "Structured registry of Nostr docs — kinds, tags and protocol" },
  },
} as const;

export default function Resources() {
  const { t, locale } = useI18n();
  const { profile } = useAppState();

  const relevant = (tracks: string[]) =>
    profile ? tracks.filter((tr) => profile.tracks.includes(tr)).length : 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>{t("resources.eyebrow")}</p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] mb-3">{t("resources.title")}</h1>
        <p className="opacity-70 max-w-2xl mb-4">{t("resources.sub")}</p>
        {profile && (
          <p className="font-mono2 text-[11px] uppercase tracking-[0.12em] mb-12" style={{ color: "var(--moss)" }}>
            ● {t("resources.personalized")}
          </p>
        )}
      </Reveal>

      {(["lds", "bdev", "nostrbook"] as const).map((prov) => {
        const items = LEARNING_RESOURCES.filter((r) => r.provider === prov).sort(
          (a, b) => relevant(b.tracks) - relevant(a.tracks),
        );
        return (
          <section key={prov} className="mb-14">
            <Reveal>
              <div className="flex flex-wrap items-baseline gap-4 mb-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">{PROVIDER_META[prov].name}</h2>
                <a href={PROVIDER_META[prov].url} target="_blank" rel="noreferrer" className="font-mono2 text-[11px] no-underline opacity-60 hover:opacity-100">
                  {PROVIDER_META[prov].url.replace("https://", "")} ↗
                </a>
              </div>
              <p className="text-sm opacity-60 mb-6">{PROVIDER_META[prov].tag[locale]}</p>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--hairline)" }}>
              {items.map((r, i) => {
                const hits = relevant(r.tracks);
                return (
                  <Reveal key={r.url} delay={Math.min(i, 6) * 50}>
                    <a href={r.url} target="_blank" rel="noreferrer" className="block p-5 no-underline group h-full" style={{ background: "var(--ink)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold tracking-tight group-hover:text-[--ember] transition-colors" style={{ color: "var(--paper)" }}>
                          {r.title[locale]}
                        </h3>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="pill">{r.lang.toUpperCase()}</span>
                          <span className="pill" style={r.kind === "funding" ? { borderColor: "var(--gold)", color: "var(--gold)" } : undefined}>
                            {t(`resources.kind.${r.kind}` as const)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm opacity-70 leading-relaxed">{r.note[locale]}</p>
                      {hits > 0 && (
                        <p className="mt-3 font-mono2 text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--moss)" }}>
                          ● {hits} {t("resources.matchTracks")}
                        </p>
                      )}
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
