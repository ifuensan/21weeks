import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PROJECTS, CULTURE, type Issue, type RankedIssue } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Layout";
import { ProjectLogo } from "@/components/ProjectLogo";

export default function Issues() {
  const { id: projectId } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { profile, setProjectId, setPickedIssue, pickedIssue } = useAppState();
  const [rankings, setRankings] = useState<RankedIssue[] | null>(null);
  const [aiError, setAiError] = useState(false);

  const project = PROJECTS.find((p) => p.id === projectId);
  const issuesQuery = trpc.issues.forProject.useQuery(
    { projectId: projectId ?? "" },
    { enabled: !!project, staleTime: 5 * 60 * 1000, retry: 1 },
  );
  const issues = useMemo(() => issuesQuery.data?.issues ?? [], [issuesQuery.data]);
  const usedFallback = issuesQuery.data?.usedFallback ?? false;

  const rankMutation = trpc.mentor.recommendIssues.useMutation({
    onSuccess: (data) => {
      setRankings(data.rankings);
      setAiError(false);
    },
    onError: () => setAiError(true),
  });

  const ordered = useMemo(() => {
    if (!rankings) return issues;
    const byId = new Map(issues.map((i) => [i.id, i]));
    const ranked = rankings
      .map((r) => ({ issue: byId.get(r.issueId), ranking: r }))
      .filter((x): x is { issue: Issue; ranking: RankedIssue } => !!x.issue);
    const rest = issues.filter((i) => !rankings.some((r) => r.issueId === i.id));
    return [...ranked.map((x) => x.issue), ...rest];
  }, [issues, rankings]);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="opacity-70">404 — {t("common.error")}</p>
        <Link to="/projects" className="btn-ghost-ember inline-block mt-6 no-underline">
          ← {t("issues.back")}
        </Link>
      </div>
    );
  }

  const rankIssue = (id: string) => rankings?.find((r) => r.issueId === id);

  const startPlan = (issue: Issue | null) => {
    setProjectId(project.id);
    setPickedIssue(issue);
    navigate("/plan");
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      <Reveal>
        <Link to="/projects" className="font-mono2 text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100 no-underline">
          ← {t("issues.back")}
        </Link>
        <p className="eyebrow mt-8 mb-3" style={{ color: "var(--ember)" }}>
          {t("issues.eyebrow")}
        </p>
        <div className="flex items-center gap-4">
          <ProjectLogo id={project.id} size={52} />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">
            {t("issues.title")} {project.name}
          </h1>
        </div>
        <p className="mt-3 opacity-70 max-w-2xl">{project.summary[locale]}</p>

        <div className="mt-6 p-5" style={{ border: "1px solid var(--hairline)", background: "var(--card-bg)" }}>
          <div className="flex items-center gap-3 mb-2">
            <p className="eyebrow" style={{ color: "var(--ember)" }}>{t("issues.culture")}</p>
            <span className="pill" style={{ borderColor: "var(--moss)", color: "var(--moss)" }}>
              ● {t("issues.mentorSkill")}
            </span>
          </div>
          <p className="text-sm leading-relaxed opacity-80">{CULTURE[project.id]?.[locale]}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href={project.urls.repo} target="_blank" rel="noreferrer" className="pill no-underline hover:opacity-100">
            {project.repo} ↗
          </a>
          {project.urls.contributing && (
            <a href={project.urls.contributing} target="_blank" rel="noreferrer" className="pill no-underline">
              contributing ↗
            </a>
          )}
          {project.urls.docs && (
            <a href={project.urls.docs} target="_blank" rel="noreferrer" className="pill no-underline">
              docs ↗
            </a>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            className="btn-ember"
            disabled={!profile || issues.length === 0 || rankMutation.isPending}
            onClick={() => {
              if (!profile) return;
              rankMutation.mutate({
                locale,
                profile,
                projectId: project.id,
                issues: issues.slice(0, 15),
              });
            }}
          >
            {rankMutation.isPending ? t("issues.aiRanking") : `✦ ${t("issues.aiRank")}`}
          </button>
          {!profile && (
            <Link to="/quiz" className="text-sm underline" style={{ color: "var(--ember)" }}>
              {t("projects.noProfile")}
            </Link>
          )}
          {aiError && <p className="text-sm" style={{ color: "var(--ember)" }}>{t("mentor.error.quota")}</p>}
        </div>
      </Reveal>

      <div className="mt-10">
        {usedFallback && (
          <div className="mb-6 p-5" style={{ border: "1px solid var(--gold)", background: "rgba(155,112,44,0.10)" }}>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: "var(--gold)" }}>
              ⚠ {t("issues.fallback.title")}
            </p>
            <p className="text-sm leading-relaxed opacity-85">{t("issues.fallback.body")}</p>
          </div>
        )}
        {issuesQuery.isLoading && (
          <p className="font-mono2 text-sm opacity-60 py-10">{t("issues.loading")}</p>
        )}
        {issuesQuery.isSuccess && issues.length === 0 && (
          <p className="opacity-70 py-10">{t("issues.empty")}</p>
        )}

        <div className="flex flex-col gap-px" style={{ background: "var(--hairline)" }}>
          {ordered.map((issue) => {
            const r = rankIssue(issue.id);
            const isPicked = pickedIssue?.id === issue.id;
            return (
              <article key={issue.id} className="p-6" style={{ background: "var(--ink)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold tracking-tight no-underline hover:underline"
                      style={{ color: "var(--paper)" }}
                    >
                      #{issue.number} {issue.title} ↗
                    </a>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {issue.labels.slice(0, 5).map((l) => (
                        <span key={l} className="pill">
                          {l}
                        </span>
                      ))}
                      <span className="pill">
                        {issue.comments} {t("issues.comments")}
                      </span>
                    </div>
                  </div>
                  {r && (
                    <div className="text-right shrink-0">
                      <p className="font-mono2 text-2xl font-bold" style={{ color: "var(--ember)" }}>
                        {r.score}
                      </p>
                      <p className="font-mono2 text-[9px] uppercase tracking-[0.15em] opacity-50">
                        {t("projects.match")}
                      </p>
                    </div>
                  )}
                </div>

                {r && (
                  <div className="mt-4 p-4" style={{ background: "var(--ember-soft)", borderLeft: "2px solid var(--ember)" }}>
                    <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: "var(--ember)" }}>
                      {t("issues.reason")}
                    </p>
                    <p className="text-sm leading-relaxed opacity-90">{r.reason}</p>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    className={isPicked ? "btn-ember" : "btn-ghost-ember"}
                    onClick={() => startPlan(issue)}
                  >
                    {isPicked ? `✓ ${t("issues.picked")}` : t("issues.pick")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {issues.length > 0 && (
          <div className="mt-8 text-center">
            <button className="btn-ghost-ember" onClick={() => startPlan(null)}>
              {t("issues.makePlanNoIssue")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
