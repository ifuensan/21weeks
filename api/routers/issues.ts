import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { PROJECTS, type Issue } from "@contracts/types";

// ---------- caché en memoria (10 min) ----------
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; data: Issue[] }>();

function cached(key: string): Issue[] | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.data;
  return null;
}

function trimBody(body: string | null | undefined): string {
  if (!body) return "";
  const clean = body.replace(/\r/g, "").slice(0, 900);
  return clean;
}

async function fetchGitHubIssues(repo: string, labels: string[]): Promise<Issue[]> {
  const project = PROJECTS.find((p) => p.host === "github" && p.repo === repo);
  const results = new Map<number, Issue>();

  for (const label of labels.slice(0, 2)) {
    const key = `gh:${repo}:${label}`;
    const fromCache = cached(key);
    if (fromCache) {
      fromCache.forEach((i) => results.set(i.number, i));
      continue;
    }
    const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=${encodeURIComponent(label)}&per_page=25&sort=updated&direction=desc`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "21weeks-bitcoin-oss",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) continue; // rate limit u otro: devolvemos lo que haya
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const issues: Issue[] = [];
    for (const raw of data) {
      if (raw.pull_request) continue;
      const number = raw.number as number;
      const issue: Issue = {
        id: `github:${repo}:${number}`,
        projectId: project?.id ?? repo,
        number,
        title: String(raw.title ?? ""),
        url: String(raw.html_url ?? ""),
        labels: Array.isArray(raw.labels)
          ? (raw.labels as Array<{ name?: string } | string>).map((l) =>
              typeof l === "string" ? l : (l.name ?? ""),
            )
          : [],
        createdAt: String(raw.created_at ?? ""),
        updatedAt: String(raw.updated_at ?? ""),
        comments: Number(raw.comments ?? 0),
        body: trimBody(raw.body as string | null),
        author: (raw.user as { login?: string } | undefined)?.login,
      };
      issues.push(issue);
      results.set(number, issue);
    }
    cache.set(key, { at: Date.now(), data: issues });
  }

  // Fallback: el repo no usa la etiqueta — mostramos issues abiertas recientes
  if (results.size === 0) {
    const key = `gh:${repo}:__recent__`;
    const fromCache = cached(key);
    if (fromCache) {
      fromCache.forEach((i) => results.set(i.number, i));
    } else {
      // pedimos 60 porque la API mezcla PRs y luego filtramos (bitcoin/bitcoin
      // es casi todo PRs: con 15 solo quedaba 1 issue real)
      const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=60&sort=created&direction=desc`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "21weeks-bitcoin-oss",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) {
        const data = (await res.json()) as Array<Record<string, unknown>>;
        const issues: Issue[] = [];
        for (const raw of data) {
          if (raw.pull_request) continue;
          if (issues.length >= 15) break;
          const number = raw.number as number;
          const issue: Issue = {
            id: `github:${repo}:${number}`,
            projectId: project?.id ?? repo,
            number,
            title: String(raw.title ?? ""),
            url: String(raw.html_url ?? ""),
            labels: Array.isArray(raw.labels)
              ? (raw.labels as Array<{ name?: string } | string>).map((l) =>
                  typeof l === "string" ? l : (l.name ?? ""),
                )
              : [],
            createdAt: String(raw.created_at ?? ""),
            updatedAt: String(raw.updated_at ?? ""),
            comments: Number(raw.comments ?? 0),
            body: trimBody(raw.body as string | null),
            author: (raw.user as { login?: string } | undefined)?.login,
          };
          issues.push(issue);
          results.set(number, issue);
        }
        cache.set(key, { at: Date.now(), data: issues });
      }
    }
  }
  return [...results.values()];
}

async function fetchGitLabIssues(repo: string, labels: string[]): Promise<Issue[]> {
  const project = PROJECTS.find((p) => p.host === "gitlab" && p.repo === repo);
  const results = new Map<number, Issue>();

  for (const label of labels.slice(0, 2)) {
    const key = `gl:${repo}:${label}`;
    const fromCache = cached(key);
    if (fromCache) {
      fromCache.forEach((i) => results.set(i.number, i));
      continue;
    }
    const path = encodeURIComponent(repo);
    const url = `https://gitlab.com/api/v4/projects/${path}/issues?state=opened&labels=${encodeURIComponent(label)}&per_page=25&order_by=updated_at&sort=desc`;
    const res = await fetch(url, {
      headers: { "User-Agent": "21weeks-bitcoin-oss" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const issues: Issue[] = [];
    for (const raw of data) {
      const number = raw.iid as number;
      const issue: Issue = {
        id: `gitlab:${repo}:${number}`,
        projectId: project?.id ?? repo,
        number,
        title: String(raw.title ?? ""),
        url: String(raw.web_url ?? ""),
        labels: Array.isArray(raw.labels) ? (raw.labels as string[]) : [],
        createdAt: String(raw.created_at ?? ""),
        updatedAt: String(raw.updated_at ?? ""),
        comments: Number(raw.user_notes_count ?? 0),
        body: trimBody(raw.description as string | null),
        author: (raw.author as { username?: string } | undefined)?.username,
      };
      issues.push(issue);
      results.set(number, issue);
    }
    cache.set(key, { at: Date.now(), data: issues });
  }

  // Fallback: sin etiqueta "good first issue" — issues abiertas recientes
  if (results.size === 0) {
    const key = `gl:${repo}:__recent__`;
    const fromCache = cached(key);
    if (fromCache) {
      fromCache.forEach((i) => results.set(i.number, i));
    } else {
      const path = encodeURIComponent(repo);
      const url = `https://gitlab.com/api/v4/projects/${path}/issues?state=opened&per_page=15&order_by=created_at&sort=desc`;
      const res = await fetch(url, {
        headers: { "User-Agent": "21weeks-bitcoin-oss" },
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) {
        const data = (await res.json()) as Array<Record<string, unknown>>;
        const issues: Issue[] = [];
        for (const raw of data) {
          const number = raw.iid as number;
          const issue: Issue = {
            id: `gitlab:${repo}:${number}`,
            projectId: project?.id ?? repo,
            number,
            title: String(raw.title ?? ""),
            url: String(raw.web_url ?? ""),
            labels: Array.isArray(raw.labels) ? (raw.labels as string[]) : [],
            createdAt: String(raw.created_at ?? ""),
            updatedAt: String(raw.updated_at ?? ""),
            comments: Number(raw.user_notes_count ?? 0),
            body: trimBody(raw.description as string | null),
            author: (raw.author as { username?: string } | undefined)?.username,
          };
          issues.push(issue);
          results.set(number, issue);
        }
        cache.set(key, { at: Date.now(), data: issues });
      }
    }
  }
  return [...results.values()];
}

export const issuesRouter = createRouter({
  forProject: publicQuery
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) return { issues: [] as Issue[], project: null, usedFallback: false };
      try {
        const issues =
          project.host === "github"
            ? await fetchGitHubIssues(project.repo, project.labels)
            : await fetchGitLabIssues(project.repo, project.labels);
        // fallback = el repo no usa/no tiene "good first issue": lo que mostramos
        // son issues recientes sin etiquetar, NO curadas para empezar
        const hasLabeled = issues.some((i) =>
          i.labels.some((l) => project.labels.some((pl) => pl.toLowerCase() === l.toLowerCase())),
        );
        return { issues, project, usedFallback: issues.length > 0 && !hasLabeled };
      } catch {
        return { issues: [] as Issue[], project, usedFallback: false };
      }
    }),

  all: publicQuery.query(async () => {
    const settled = await Promise.allSettled(
      PROJECTS.map((p) =>
        p.host === "github"
          ? fetchGitHubIssues(p.repo, p.labels)
          : fetchGitLabIssues(p.repo, p.labels),
      ),
    );
    const byProject: Record<string, number> = {};
    settled.forEach((r, i) => {
      byProject[PROJECTS[i].id] = r.status === "fulfilled" ? r.value.length : 0;
    });
    return { counts: byProject };
  }),
});
