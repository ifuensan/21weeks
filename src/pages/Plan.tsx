import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { PROJECTS } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import { Reveal } from "@/components/Layout";
import { ProjectLogo } from "@/components/ProjectLogo";
import { buildPlanMarkdown, downloadMarkdown, parseImportedPlan } from "@/lib/planExport";

export default function PlanPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { profile, projectId, pickedIssue, plan, setPlan, doneWeeks, toggleWeek, restoreAll } = useAppState();
  const [aiError, setAiError] = useState(false);
  const [importMsg, setImportMsg] = useState<"ok" | "err" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const genTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const project = PROJECTS.find((p) => p.id === projectId);

  const exportPlan = () => {
    if (!plan || !project) return;
    const md = buildPlanMarkdown(
      {
        profile,
        projectId,
        projectName: project.name,
        issue: pickedIssue,
        plan,
        doneWeeks,
        exportedAt: new Date().toISOString(),
      },
      locale,
    );
    downloadMarkdown(`21weeks-${project.id}.md`, md);
  };

  const importPlan = async (file: File) => {
    const text = await file.text();
    const state = parseImportedPlan(text);
    if (!state) {
      setImportMsg("err");
      return;
    }
    restoreAll({
      profile: state.profile,
      projectId: state.projectId,
      issue: state.issue,
      plan: state.plan,
      doneWeeks: state.doneWeeks ?? [],
    });
    setImportMsg("ok");
  };

  const importControls = (
    <span className="inline-flex items-center gap-3">
      <button className="btn-ghost-ember" onClick={() => fileRef.current?.click()}>
        ⇪ {t("plan.import")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importPlan(f);
          e.target.value = "";
        }}
      />
      {importMsg === "ok" && <span className="text-sm" style={{ color: "var(--moss)" }}>{t("plan.import.ok")}</span>}
      {importMsg === "err" && <span className="text-sm" style={{ color: "var(--ember)" }}>{t("plan.import.err")}</span>}
    </span>
  );

  const genMutation = trpc.mentor.generatePlan.useMutation({
    onSuccess: (data) => {
      if (genTimer.current) clearTimeout(genTimer.current);
      setPlan(data.plan);
      setAiError(false);
    },
    onError: () => {
      if (genTimer.current) clearTimeout(genTimer.current);
      setAiError(true);
    },
  });

  const generate = () => {
    if (!profile || !project) return;
    // red de seguridad: si en ~3 min no hay respuesta (proxy/saturation),
    // mostramos error con reintento en vez de un spinner eterno
    if (genTimer.current) clearTimeout(genTimer.current);
    genTimer.current = setTimeout(() => {
      if (genMutation.isPending) {
        genMutation.reset();
        setAiError(true);
      }
    }, 190_000);
    genMutation.mutate({
      locale,
      profile,
      projectId: project.id,
      issue: pickedIssue
        ? {
            id: pickedIssue.id,
            number: pickedIssue.number,
            title: pickedIssue.title,
            url: pickedIssue.url,
            labels: pickedIssue.labels,
            comments: pickedIssue.comments,
            body: pickedIssue.body,
          }
        : null,
    });
  };

  // autogenerar al llegar desde Issues con proyecto elegido y sin plan
  useEffect(() => {
    if (!plan && profile && project && !genMutation.isPending && !genMutation.isSuccess && !aiError) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const askMentor = (weekTitle: string, n: number) => {
    const q =
      locale === "es"
        ? `Estoy en la semana ${n} de mi plan («${weekTitle}»). ¿Cómo la abordo?`
        : `I'm on week ${n} of my plan ("${weekTitle}"). How should I approach it?`;
    localStorage.setItem("oss21.mentorDraft", q);
    navigate("/mentor");
  };

  if (!project || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-lg opacity-75">{t("plan.empty")}</p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link to="/projects" className="btn-ember no-underline">
            {t("plan.empty.cta")} →
          </Link>
          {importControls}
        </div>
      </div>
    );
  }

  if (genMutation.isPending || (!plan && !aiError)) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <div className="font-mono2 text-sm chat-caret opacity-80">{t("plan.generating")}</div>
      </div>
    );
  }

  if (aiError && !plan) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="opacity-80">{t("mentor.error.quota")}</p>
        <button className="btn-ember mt-8" onClick={generate}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (!plan) return null;

  const done = doneWeeks.length;
  const pct = Math.round((done / plan.weeks.length) * 100);
  const phases = [...new Set(plan.weeks.map((w) => w.phase))];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow mb-3 flex items-center gap-2" style={{ color: "var(--ember)" }}>
          <ProjectLogo id={plan.projectId} size={18} /> {t("plan.eyebrow")} — {plan.projectName}
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em]">{t("plan.title")}</h1>
        <p className="mt-4 max-w-2xl opacity-80 leading-relaxed">{plan.intro}</p>
        {pickedIssue && (
          <a href={pickedIssue.url} target="_blank" rel="noreferrer" className="pill inline-block mt-4 no-underline" style={{ borderColor: "var(--ember)", color: "var(--ember)" }}>
            #{pickedIssue.number} {pickedIssue.title.slice(0, 60)} ↗
          </a>
        )}

        {/* progreso */}
        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono2 text-[11px] uppercase tracking-[0.15em] opacity-60">
              {done}/21 {t("plan.progress")}
            </span>
            <span className="font-mono2 text-2xl font-bold" style={{ color: "var(--ember)" }}>
              {pct}%
            </span>
          </div>
          <div className="h-[3px]" style={{ background: "var(--hairline)" }}>
            <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--ember)" }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {phases.map((ph) => (
              <span key={ph} className="pill">{ph}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="btn-ghost-ember" onClick={generate} disabled={genMutation.isPending}>
            ↻ {t("plan.regenerate")}
          </button>
          <button className="btn-ember" onClick={exportPlan}>
            ⇩ {t("plan.export")}
          </button>
          {importControls}
        </div>
        <p className="mt-3 font-mono2 text-[11px] opacity-50">{t("plan.export.hint")}</p>
      </Reveal>

      {/* timeline */}
      <div className="mt-14 relative">
        <div className="absolute left-[13px] top-2 bottom-2 w-px" style={{ background: "var(--hairline)" }} />
        {plan.weeks.map((w, i) => {
          const isDone = doneWeeks.includes(w.week);
          return (
            <Reveal key={w.week} delay={Math.min(i, 8) * 40}>
              <div className="relative pl-12 pb-10">
                <button
                  onClick={() => toggleWeek(w.week)}
                  className="absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    border: `1.5px solid ${isDone ? "var(--moss)" : "var(--ember)"}`,
                    background: isDone ? "var(--moss)" : "transparent",
                    color: isDone ? "var(--ink)" : "var(--ember)",
                  }}
                  aria-label={`week ${w.week}`}
                >
                  <span className="font-mono2 text-[10px] font-bold">{isDone ? "✓" : w.week}</span>
                </button>

                <p className="font-mono2 text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--ember)" }}>
                  {t("plan.week")} {w.week} · {w.phase}
                </p>
                <h3 className={`text-xl font-bold tracking-tight mt-1 ${isDone ? "opacity-50 line-through" : ""}`}>
                  {w.title}
                </h3>

                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="eyebrow opacity-50 mb-2">{t("plan.objectives")}</p>
                    <ul className="text-sm space-y-1.5 opacity-85">
                      {w.objectives.map((o, j) => (
                        <li key={j} className="flex gap-2"><span style={{ color: "var(--ember)" }}>›</span>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow opacity-50 mb-2">{t("plan.tasks")}</p>
                    <ul className="text-sm space-y-1.5 opacity-85">
                      {w.tasks.map((task, j) => (
                        <li key={j} className="flex gap-2"><span className="font-mono2" style={{ color: "var(--gold)" }}>□</span>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {w.resources.length > 0 && (
                  <div className="mt-4">
                    <p className="eyebrow opacity-50 mb-2">{t("plan.resources")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {w.resources.map((r, j) => (
                        <a key={j} href={r.url} target="_blank" rel="noreferrer" className="pill no-underline hover:border-[--ember]">
                          {r.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3" style={{ background: "var(--ember-soft)" }}>
                  <p className="text-sm">
                    <span className="eyebrow mr-2" style={{ color: "var(--ember)" }}>{t("plan.outcome")}</span>
                    <span className="opacity-90">{w.outcome}</span>
                  </p>
                  <button
                    onClick={() => askMentor(w.title, w.week)}
                    className="font-mono2 text-[10px] uppercase tracking-[0.1em] underline underline-offset-4 cursor-pointer opacity-70 hover:opacity-100"
                    style={{ color: "var(--paper)", background: "none", border: "none" }}
                  >
                    {t("plan.askMentor")} →
                  </button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* graduación */}
      <Reveal>
        <div className="p-8 mt-4" style={{ border: "1px solid var(--ember)", background: "var(--ember-soft)" }}>
          <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>{t("plan.graduation")}</p>
          <p className="leading-relaxed opacity-90">{plan.graduation}</p>
          <div className="mt-5 pt-4 flex flex-wrap items-center gap-3" style={{ borderTop: "1px solid var(--hairline)" }}>
            <span className="font-mono2 text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--gold)" }}>
              {t("plan.funding")}
            </span>
            <a href="https://bitcoindevs.xyz/get-funded" target="_blank" rel="noreferrer" className="pill no-underline" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
              bitcoindevs.xyz/get-funded ↗
            </a>
            <a href="https://opensats.org/apply" target="_blank" rel="noreferrer" className="pill no-underline" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
              opensats.org ↗
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
