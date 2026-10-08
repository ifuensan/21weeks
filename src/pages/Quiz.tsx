import { useState } from "react";
import { useNavigate } from "react-router";
import { LANGUAGES, TRACKS, type Level, type Profile, type Role } from "@contracts/types";
import { useI18n, type TKey } from "@/i18n";
import { useAppState } from "@/state";
import { Reveal } from "@/components/Layout";

function OptionCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 transition-all cursor-pointer w-full"
      style={{
        border: `1px solid ${selected ? "var(--ember)" : "var(--hairline)"}`,
        background: selected ? "var(--ember-soft)" : "transparent",
      }}
    >
      <p className="font-bold tracking-tight" style={{ color: selected ? "var(--ember)" : "var(--paper)" }}>
        {title}
      </p>
      {desc && <p className="text-sm mt-1 opacity-70">{desc}</p>}
    </button>
  );
}

function Chip({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="pill cursor-pointer transition-all !text-[13px] !px-4 !py-2"
      style={
        selected
          ? { borderColor: "var(--ember)", color: "var(--ember)", background: "var(--ember-soft)" }
          : undefined
      }
    >
      {label}
    </button>
  );
}

export default function Quiz() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { profile, setProfile } = useAppState();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(profile?.role ?? null);
  const [level, setLevel] = useState<Level | null>(profile?.level ?? null);
  const [langs, setLangs] = useState<string[]>(profile?.languages ?? []);
  const [tracks, setTracks] = useState<string[]>(profile?.tracks ?? []);
  const [hours, setHours] = useState<number>(profile?.hoursPerWeek ?? 28);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const canNext =
    step === 0 ? role !== null : step === 1 ? level !== null : step === 2 ? langs.length > 0 : step === 3 ? tracks.length > 0 : true;

  const finish = () => {
    if (!role || !level) return;
    const p: Profile = { role, level, languages: langs, tracks, hoursPerWeek: hours };
    setProfile(p);
    navigate("/projects");
  };

  const steps: React.ReactNode[] = [
    <div className="grid sm:grid-cols-2 gap-3">
      <OptionCard selected={role === "developer"} onClick={() => setRole("developer")} title={t("quiz.role.dev")} desc={t("quiz.role.dev.d")} />
      <OptionCard selected={role === "researcher"} onClick={() => setRole("researcher")} title={t("quiz.role.research")} desc={t("quiz.role.research.d")} />
    </div>,
    <div className="grid sm:grid-cols-3 gap-3">
      {(["beginner", "intermediate", "advanced"] as Level[]).map((l) => (
        <OptionCard
          key={l}
          selected={level === l}
          onClick={() => setLevel(l)}
          title={t(`quiz.level.${l}` as TKey)}
          desc={t(`quiz.level.${l}.d` as TKey)}
        />
      ))}
    </div>,
    <div className="flex flex-wrap gap-2.5">
      {LANGUAGES.map((l) => (
        <Chip key={l} label={l} selected={langs.includes(l)} onClick={() => toggle(langs, l, setLangs)} />
      ))}
    </div>,
    <div className="flex flex-wrap gap-2.5">
      {TRACKS.map((tr) => (
        <Chip key={tr} label={t(`track.${tr}` as TKey)} selected={tracks.includes(tr)} onClick={() => toggle(tracks, tr, setTracks)} />
      ))}
    </div>,
    <div>
      <div className="flex items-center gap-6">
        <input
          type="range"
          min={2}
          max={42}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full accent-[#de5126]"
        />
        <span className="font-mono2 text-2xl font-bold whitespace-nowrap" style={{ color: "var(--ember)" }}>
          {hours} {t("quiz.hours.unit")}
        </span>
      </div>
      <p className="mt-4 text-sm opacity-60">{t("quiz.hours.hint")}</p>
    </div>,
  ];

  const stepTitles: TKey[] = ["quiz.role", "quiz.level", "quiz.langs", "quiz.tracks", "quiz.hours"];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>
          {t("quiz.eyebrow")} — {t("quiz.step")} {step + 1}/5
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2">{t("quiz.title")}</h1>
        <h2 className="text-lg opacity-70 mb-10">{t(stepTitles[step])}</h2>

        {/* progreso */}
        <div className="flex gap-1.5 mb-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[3px] flex-1 transition-colors"
              style={{ background: i <= step ? "var(--ember)" : "var(--hairline)" }}
            />
          ))}
        </div>

        <div key={step} className="reveal is-visible">{steps[step]}</div>

        <div className="mt-12 flex justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost-ember">
            ← {t("quiz.back")}
          </button>
          {step < 4 ? (
            <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className="btn-ember">
              {t("quiz.next")} →
            </button>
          ) : (
            <button onClick={finish} className="btn-ember">
              {t("quiz.finish")} →
            </button>
          )}
        </div>
      </Reveal>
    </div>
  );
}
