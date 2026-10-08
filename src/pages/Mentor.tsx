import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { Reveal } from "@/components/Layout";
import { ProjectLogo } from "@/components/ProjectLogo";

export default function Mentor() {
  const { t, locale } = useI18n();
  const { profile, projectId, plan, chat, setChat } = useAppState();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const project = PROJECTS.find((p) => p.id === projectId) ?? null;

  // prefill desde "preguntar al mentor" en el plan
  useEffect(() => {
    const draft = localStorage.getItem("oss21.mentorDraft");
    if (draft) {
      setInput(draft);
      localStorage.removeItem("oss21.mentorDraft");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, streaming]);

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    setError(false);
    setInput("");
    const next = [...chat, { role: "user" as const, content }];
    setChat(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          profile,
          projectId: project?.id ?? null,
          messages: next.slice(-20),
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setChat([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setChat([...next, { role: "assistant", content: snapshot }]);
      }
      if (!acc.trim()) throw new Error("empty stream");
    } catch {
      setError(true);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24 flex flex-col" style={{ minHeight: "calc(100vh - 57px)" }}>
      <Reveal>
        <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>{t("mentor.eyebrow")}</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">{t("mentor.title")}</h1>
        <p className="mt-3 opacity-70">{t("mentor.sub")}</p>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="font-mono2 text-[10px] uppercase tracking-[0.15em] opacity-50">{t("mentor.context")}:</span>
          {profile && <span className="pill">{profile.role} · {profile.level} · {profile.hoursPerWeek}h/w</span>}
          {project && (
            <span className="pill inline-flex items-center gap-2" style={{ borderColor: "var(--ember)", color: "var(--ember)" }}>
              <ProjectLogo id={project.id} size={16} /> {project.name}
            </span>
          )}
          {plan && <span className="pill">{plan.weeks.length}w plan</span>}
          <a href="https://bitcoinknowledge.dev/" target="_blank" rel="noreferrer" className="pill no-underline" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
            ↗ {t("mentor.sources")}
          </a>
        </div>
      </Reveal>

      {/* mensajes */}
      <div className="flex-1 mt-8 flex flex-col gap-4">
        {chat.length === 0 && (
          <p className="opacity-50 text-sm py-16 text-center font-mono2">{t("mentor.empty")}</p>
        )}
        {chat.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] p-4 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user" ? "self-end" : "self-start"
            }`}
            style={
              m.role === "user"
                ? { background: "var(--ember)", color: "var(--paper)", borderRadius: "14px 14px 2px 14px" }
                : { background: "var(--card-bg)", border: "1px solid var(--hairline)", borderRadius: "14px 14px 14px 2px" }
            }
          >
            {m.content}
            {m.role === "assistant" && streaming && i === chat.length - 1 && (
              <span className="chat-caret" />
            )}
          </div>
        ))}
        {streaming && chat[chat.length - 1]?.role === "user" && (
          <p className="font-mono2 text-xs opacity-50 self-start">{t("mentor.thinking")}</p>
        )}
        {error && (
          <div className="self-start p-4 text-sm" style={{ border: "1px solid var(--ember)", background: "var(--ember-soft)" }}>
            {t("mentor.error.quota")}{" "}
            <button onClick={send} className="underline cursor-pointer" style={{ color: "var(--ember)", background: "none", border: "none" }}>
              {t("common.retry")}
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="sticky bottom-16 md:bottom-4 mt-6 flex gap-2 p-2" style={{ background: "var(--card-bg)", border: "1px solid var(--hairline)", borderRadius: "999px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("mentor.placeholder")}
          className="flex-1 bg-transparent outline-none px-4 text-sm"
          style={{ color: "var(--paper)" }}
        />
        <button onClick={send} disabled={streaming || !input.trim()} className="btn-ember !py-2.5">
          {t("mentor.send")} →
        </button>
      </div>
    </div>
  );
}
