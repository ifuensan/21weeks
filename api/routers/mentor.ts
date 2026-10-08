import { z } from "zod";
import { generateObject, generateText, Output, stepCountIs } from "ai";
import { createRouter, publicQuery } from "../middleware";
import { PROJECTS, LEARNING_RESOURCES, type Locale, type Profile } from "@contracts/types";
import { kimiGw, defaultModelId } from "../ai/provider";
import { classifyAiError } from "../ai/ai-client";
import { mentorSystemPrompt, profileSummary } from "../ai/mentor";
import { knowledgeTools } from "../ai/knowledge";

const profileSchema = z.object({
  role: z.enum(["developer", "researcher"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  languages: z.array(z.string()),
  tracks: z.array(z.string()),
  hoursPerWeek: z.number().min(1).max(60),
});

const issueSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  url: z.string(),
  labels: z.array(z.string()),
  comments: z.number(),
  body: z.string(),
});

// caché de comentarios de issues (10 min) — señales de "ya hay PR", "está cogida", etc.
const commentsCache = new Map<string, { at: number; data: string[] }>();

async function fetchRecentComments(issueId: string): Promise<string[]> {
  // solo GitHub: id = github:owner/repo:number
  const parts = issueId.split(":");
  if (parts[0] !== "github" || parts.length !== 3) return [];
  const hit = commentsCache.get(issueId);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.data;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${parts[1]}/issues/${parts[2]}/comments?per_page=5&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "21weeks-bitcoin-oss",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ user?: { login?: string }; body?: string }>;
    const comments = data
      .slice(0, 3)
      .map((c) => `${c.user?.login ?? "?"}: ${(c.body ?? "").replace(/\s+/g, " ").slice(0, 220)}`);
    commentsCache.set(issueId, { at: Date.now(), data: comments });
    return comments;
  } catch {
    return [];
  }
}

// Si un comentario menciona una PR ("#9421", "/pull/9421"), resolvemos su
// estado real: open/merged/closed + última actividad. Así el ranking distingue
// "hay PR activa que lo arregla" de "hay PR abandonada: hueco para ti".
const prCache = new Map<string, { at: number; data: string }>();

async function resolveReferencedPRs(issueId: string, comments: string[]): Promise<string[]> {
  const parts = issueId.split(":");
  if (parts[0] !== "github" || parts.length !== 3) return [];
  const repo = parts[1];
  const refs = new Set<number>();
  for (const c of comments) {
    for (const m of c.matchAll(/(?:\/pull\/|#)(\d{2,6})/g)) refs.add(Number(m[1]));
  }
  const out: string[] = [];
  for (const num of [...refs].slice(0, 3)) {
    const key = `${repo}#${num}`;
    const hit = prCache.get(key);
    if (hit && Date.now() - hit.at < 10 * 60 * 1000) {
      out.push(hit.data);
      continue;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${num}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "21weeks-bitcoin-oss",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const pr = (await res.json()) as {
        title?: string;
        state?: string;
        merged?: boolean;
        updated_at?: string;
        comments?: number;
        review_comments?: number;
      };
      const summary = `PR #${num} "${(pr.title ?? "").slice(0, 80)}" — state: ${pr.merged ? "MERGED" : (pr.state ?? "?").toUpperCase()}, last activity: ${(pr.updated_at ?? "").slice(0, 10)}, ${pr.comments ?? 0} comments + ${pr.review_comments ?? 0} review comments`;
      prCache.set(key, { at: Date.now(), data: summary });
      out.push(summary);
    } catch {
      // sin dato: el comentario sigue estando
    }
  }
  return out;
}

export const mentorRouter = createRouter({
  recommendIssues: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issues: z.array(issueSchema).max(25),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project || input.issues.length === 0) return { rankings: [] };
      const locale = input.locale as Locale;
      const langName = locale === "es" ? "Spanish" : "English";

      // Enriquecer con comentarios recientes: ahí se ve si una issue ya tiene
      // PR abierta ("would this be solved by #N?"), si alguien la ha reclamado
      // o si el hilo es un pantano — señales clave antes de recomendarla.
      const enriched = await Promise.all(
        input.issues.slice(0, 10).map(async (i) => {
          const comments = i.comments > 0 ? await fetchRecentComments(i.id) : [];
          const referencedPRs = comments.length ? await resolveReferencedPRs(i.id, comments) : [];
          return { issue: i, recentComments: comments, referencedPRs };
        }),
      );

      const issuesDigest = enriched
        .map(
          ({ issue: i, recentComments, referencedPRs }) =>
            `ID=${i.id}\n#${i.number} ${i.title}\nlabels: ${i.labels.join(", ")}\ncomments: ${i.comments}\nbody: ${i.body.slice(0, 350)}${
              recentComments.length
                ? `\nrecent comments:\n${recentComments.map((c) => `  - ${c}`).join("\n")}`
                : ""
            }${
              referencedPRs.length
                ? `\nreferenced PRs (verified status):\n${referencedPRs.map((p) => `  - ${p}`).join("\n")}`
                : ""
            }`,
        )
        .join("\n---\n");

      try {
        const { object } = await generateObject({
          model: kimiGw()(await defaultModelId()),
          schema: z.object({
            rankings: z.array(
              z.object({
                issueId: z.string(),
                score: z.number().min(0).max(100),
                reason: z.string(),
              }),
            ),
          }),
          prompt: `${mentorSystemPrompt(locale, input.profile as Profile, project)}

Task: rank the following open issues from ${project.name} for THIS user, best first. Pick the top 5 maximum. For each, give a fit score (0-100) and a 2-3 sentence reason in ${langName}: why it fits their profile, what they will learn, and one thing to check before starting. Only use issue IDs from the list.

CRITICAL vetting rules — read the recent comments and the verified PR statuses carefully:
- If a comment suggests an existing PR might already solve it, check the verified status: MERGED or OPEN-with-recent-activity → penalize hard (score ≤ 30) and say so explicitly in the reason. OPEN-but-stale (no activity for ~4+ weeks) is a gray zone: a real opportunity only if the user is willing to first ask politely in the issue whether they can pick it up — reflect that in the score (40-60) and make the reason name the PR and its last activity date.
- If someone has claimed the issue or is actively working it (and no answer from maintainers about it being free), penalize and warn.
- If the thread shows maintainer disagreement or scope creep, warn that it's a swamp, not a first issue.

User profile:
${profileSummary(input.profile as Profile, locale)}

Issues:
${issuesDigest}`,
          providerOptions: { "kimi-gw": { max_completion_tokens: 2500 } },
        });
        return { rankings: object.rankings };
      } catch (err) {
        throw classifyAiError(err);
      }
    }),

  generatePlan: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issue: issueSchema.nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("unknown project");
      const locale = input.locale as Locale;
      const langName = locale === "es" ? "Spanish" : "English";

      const issueBlock = input.issue
        ? `\nThe user has chosen this first issue to anchor the plan:\n#${input.issue.number} ${input.issue.title}\n${input.issue.url}\nlabels: ${input.issue.labels.join(", ")}\n${input.issue.body.slice(0, 400)}`
        : "";

      try {
        // ---- Fase 1: investigar fuentes reales en bitcoinknowledge.dev ----
        const canonicalLinks = [
          project.urls.repo,
          project.urls.contributing,
          project.urls.docs,
        ].filter(Boolean) as string[];

        let researched: { label: string; url: string }[] = [];
        try {
          const research = await generateText({
            model: kimiGw()(await defaultModelId()),
            tools: knowledgeTools,
            stopWhen: stepCountIs(5),
            prompt: `You are researching resources for a 21-week contributor onboarding plan for the open-source project ${project.name} (${project.urls.repo}).

Do 2-4 searches with searchBitcoinKnowledge / lookupSpec to find concrete, primary sources a new contributor should read: contributing guides, architecture docs, canonical PRs and precedents, relevant BIPs/BOLTs sections, mailing-list or Delving Bitcoin threads about this project's area.${input.issue ? ` The user's first issue is: ${input.issue.title} — find sources specifically about that topic.` : ""}

Then output ONLY a JSON array (no markdown fences) of up to 14 items:
[{"label": "short human title", "url": "exact URL from a tool result"}, ...]
Every URL must come verbatim from a tool result. No invented URLs.`,
            providerOptions: { "kimi-gw": { max_completion_tokens: 3000 } },
          });
          // 1) cosecha determinista: URLs directamente de los tool results
          //    (inmune a que el modelo se quede sin tokens para el JSON)
          const seen = new Set<string>();
          for (const step of (research as { steps?: unknown[] }).steps ?? []) {
            const toolResults = (step as { toolResults?: unknown[] }).toolResults ?? [];
            for (const tr of toolResults) {
              const out = (tr as { result?: unknown; output?: unknown }).result ??
                (tr as { output?: unknown }).output;
              const hits = (out as { results?: { title?: string; url?: string }[] })?.results;
              if (!Array.isArray(hits)) continue;
              for (const h of hits) {
                const url = h?.url ?? "";
                if (!/^https?:\/\//.test(url) || seen.has(url)) continue;
                seen.add(url);
                researched.push({ label: (h.title ?? url).slice(0, 90), url });
              }
            }
          }
          // 2) fallback: parsear el JSON del modelo
          if (researched.length === 0) {
            const match = research.text.match(/\[[\s\S]*\]/);
            if (match) {
              const parsed = JSON.parse(match[0]) as { label: string; url: string }[];
              researched = parsed.filter(
                (r) => typeof r?.label === "string" && /^https?:\/\//.test(r?.url ?? ""),
              );
            }
          }
          researched = researched.slice(0, 14);
        } catch (e) {
          // si la investigación falla, seguimos solo con los enlaces canónicos
          console.warn("[plan] research phase failed:", (e as Error)?.message ?? e);
        }
        console.log(`[plan] researched resources: ${researched.length}`);

        // Cursos curados (Librería de Satoshi / Bitcoin Dev Project) que
        // solapan con las tracks del proyecto y el nivel del usuario.
        const curated = LEARNING_RESOURCES.filter(
          (r) =>
            r.tracks.some((t) => project.tracks.includes(t)) &&
            r.levels.includes(input.profile.level),
        );

        const resourcePool = [
          ...canonicalLinks.map((u) => ({ label: u.replace(/^https?:\/\//, "").slice(0, 60), url: u })),
          ...researched,
          ...curated.map((c) => ({ label: `[course] ${c.title.en}`, url: c.url })),
        ];
        const poolBlock = resourcePool.map((r) => `- ${r.label} :: ${r.url}`).join("\n");

        // ---- Fase 2: generar el plan usando solo URLs verificadas ----
        const planSchema = z.object({
          intro: z.string(),
          graduation: z.string(),
          weeks: z
            .array(
              z.object({
                week: z.number(),
                phase: z.string(),
                title: z.string(),
                objectives: z.array(z.string()).max(4),
                tasks: z.array(z.string()).max(5),
                resources: z
                  .array(z.object({ label: z.string(), url: z.string() }))
                  .max(3),
                outcome: z.string(),
              }),
            )
            .length(21),
        });

        const result = await generateText({
          model: kimiGw()(await defaultModelId()),
          output: Output.object({ schema: planSchema }),
          prompt: `${mentorSystemPrompt(locale, input.profile as Profile, project)}

Task: design a realistic 21-week roadmap that takes this user from zero to recognized contributor of ${project.name} (${project.urls.repo}). Write EVERYTHING in ${langName}.

VERIFIED RESOURCE POOL — the ONLY URLs you may use in weekly "resources" (pick 1-3 per week, copy the URL verbatim; you may reuse them across weeks):
${poolBlock}

Structure the 21 weeks in phases, roughly:
- Weeks 1-3: environment setup, build from source, run tests, read contributing guide, lurk in community channels, understand review culture.
- Weeks 4-6: deep dive into the codebase area of their first issue; reproduce the issue; study related PRs; first trivial contributions (docs, tests, review comments on others' PRs).
- Weeks 7-10: work their first real issue end to end: discussion, implementation BY THEM, tests, PR, iterate on review feedback.
- Weeks 11-15: broaden: review others' PRs, pick a second (harder) issue, participate in community calls/IRC.
- Weeks 16-21: own a meaningful contribution area, mentor newer newcomers, establish reputation: the "you are now a contributor" graduation.

Rules:
- The plan must respect their availability of ${input.profile.hoursPerWeek} hours/week. Tasks must be concrete actions the USER does (read X file, run Y test, ask Z in the dev channel), never "the mentor will do".
- Resource labels should be short and specific (what the user will read there), never "Bitcoin Knowledge Base: …" — that site is the search tool, not a reading resource.
- Items prefixed [course] in the pool are curated courses (Librería de Satoshi, Spanish; Bitcoin Dev Project, English): place them in the EARLY weeks (1-6) where they fit the week's topic, at most one course per week, and label them in ${langName}.
- Each week: phase (2-4 words), title (short), 2-4 objectives, 3-5 concrete tasks, 1-3 resources, one tangible outcome. Keep every objective/task/outcome under 14 words — concise beats verbose.
- intro: 2-3 sentences framing the journey. graduation: what "being a contributor" looks like at week 21 (3-4 sentences max).

User profile:
${profileSummary(input.profile as Profile, locale)}
${issueBlock}`,
          providerOptions: { "kimi-gw": { max_completion_tokens: 11000 } },
        });

        const object = await result.output;
        return {
          plan: {
            projectId: project.id,
            projectName: project.name,
            generatedAt: new Date().toISOString(),
            issueId: input.issue?.id,
            intro: object.intro,
            graduation: object.graduation,
            weeks: object.weeks,
          },
        };
      } catch (err) {
        throw classifyAiError(err);
      }
    }),
});
