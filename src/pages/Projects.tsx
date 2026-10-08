import { Link } from "react-router";
import { PROJECTS, matchScore } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Layout";
import { ProjectLogo } from "@/components/ProjectLogo";

export default function Projects() {
  const { t, locale } = useI18n();
  const { profile, setProjectId } = useAppState();
  const countsQuery = trpc.issues.all.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const counts = countsQuery.data?.counts ?? {};

  const sorted = [...PROJECTS].sort((a, b) =>
    profile ? matchScore(profile, b) - matchScore(profile, a) : 0,
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>
          {t("projects.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] mb-3">
          {profile ? t("projects.title") : t("catalog.title")}
        </h1>
        <p className="opacity-70 max-w-2xl mb-12">
          {profile ? t("projects.sub") : t("projects.noProfile")}{" "}
          {!profile && (
            <Link to="/quiz" className="underline" style={{ color: "var(--ember)" }}>
              {t("nav.quiz")} →
            </Link>
          )}
        </p>
      </Reveal>

      <div className="flex flex-col gap-px" style={{ background: "var(--hairline)" }}>
        {sorted.map((p, i) => {
          const score = profile ? matchScore(profile, p) : null;
          const n = counts[p.id];
          return (
            <Reveal key={p.id} delay={Math.min(i, 6) * 50}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6" style={{ background: "var(--ink)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <ProjectLogo id={p.id} size={44} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">{p.name}</h2>
                    <span className="pill">{t(`projects.host.${p.host}` as const)}</span>
                    <span className="pill">{t(`projects.difficulty.${p.difficulty}` as const)}</span>
                    {n !== undefined && (
                      <span className="pill" style={{ borderColor: "var(--ember)", color: "var(--ember)" }}>
                        {n} {t("projects.issues")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm opacity-75 leading-relaxed max-w-2xl">{p.summary[locale]}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.languages.map((l) => (
                      <span
                        key={l}
                        className="pill"
                        style={profile?.languages.includes(l) ? { borderColor: "var(--ember)", color: "var(--ember)" } : undefined}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-4 shrink-0">
                  {score !== null && (
                    <div className="text-right">
                      <p className="font-mono2 text-3xl font-bold" style={{ color: "var(--ember)" }}>
                        {score}%
                      </p>
                      <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] opacity-50">
                        {t("projects.match")}
                      </p>
                    </div>
                  )}
                  <Link
                    to={`/issues/${p.id}`}
                    onClick={() => setProjectId(p.id)}
                    className="btn-ghost-ember no-underline whitespace-nowrap"
                  >
                    {t("projects.view")} →
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
