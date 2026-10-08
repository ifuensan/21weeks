import { createContext, useContext, useState, type ReactNode } from "react";
import type { Issue, Plan, Profile } from "@contracts/types";

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface AppState {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  pickedIssue: Issue | null;
  setPickedIssue: (i: Issue | null) => void;
  plan: Plan | null;
  setPlan: (p: Plan | null) => void;
  doneWeeks: number[];
  toggleWeek: (w: number) => void;
  chat: ChatMsg[];
  setChat: (m: ChatMsg[]) => void;
  restoreAll: (s: {
    profile: Profile | null;
    projectId: string | null;
    issue: Issue | null;
    plan: Plan | null;
    doneWeeks: number[];
  }) => void;
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage lleno o no disponible: ignoramos
  }
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(() => load("oss21.profile"));
  const [projectId, setProjectIdState] = useState<string | null>(() => load("oss21.projectId"));
  const [pickedIssue, setPickedIssueState] = useState<Issue | null>(() => load("oss21.issue"));
  const [plan, setPlanState] = useState<Plan | null>(() => load("oss21.plan"));
  const [doneWeeks, setDoneWeeks] = useState<number[]>(() => load("oss21.doneWeeks") ?? []);
  const [chat, setChatState] = useState<ChatMsg[]>(() => load("oss21.chat") ?? []);

  const value: AppState = {
    profile,
    setProfile: (p) => {
      setProfileState(p);
      save("oss21.profile", p);
    },
    projectId,
    setProjectId: (id) => {
      setProjectIdState(id);
      save("oss21.projectId", id);
      // cambiar de proyecto invalida issue/plan anteriores
      setPickedIssueState(null);
      save("oss21.issue", null);
      setPlanState(null);
      save("oss21.plan", null);
      setDoneWeeks([]);
      save("oss21.doneWeeks", []);
    },
    pickedIssue,
    setPickedIssue: (i) => {
      setPickedIssueState(i);
      save("oss21.issue", i);
    },
    plan,
    setPlan: (p) => {
      setPlanState(p);
      save("oss21.plan", p);
      setDoneWeeks([]);
      save("oss21.doneWeeks", []);
    },
    doneWeeks,
    toggleWeek: (w) => {
      setDoneWeeks((prev) => {
        const next = prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w];
        save("oss21.doneWeeks", next);
        return next;
      });
    },
    chat,
    setChat: (m) => {
      setChatState(m.slice(-40));
      save("oss21.chat", m.slice(-40));
    },
    restoreAll: (s) => {
      setProfileState(s.profile);
      save("oss21.profile", s.profile);
      setProjectIdState(s.projectId);
      save("oss21.projectId", s.projectId);
      setPickedIssueState(s.issue);
      save("oss21.issue", s.issue);
      setPlanState(s.plan);
      save("oss21.plan", s.plan);
      setDoneWeeks(s.doneWeeks);
      save("oss21.doneWeeks", s.doneWeeks);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AppStateProvider missing");
  return ctx;
}
