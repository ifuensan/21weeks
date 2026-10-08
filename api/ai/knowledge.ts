import { tool } from "ai";
import { z } from "zod";

/**
 * Bitcoin Knowledge Base (https://bitcoinknowledge.dev/) como herramienta
 * del mentor. La API pública expone:
 *   GET /search?q=...&limit=N&source_type=...   → { results: [...] }
 *   GET /bip|bolt|blip|lud|nut/{n}              → { document: { body } }
 * Fuentes indexadas: mailing list bitcoin-dev, Delving Bitcoin, PRs/issues
 * de GitHub, BIPs, BOLTs, BLIPs, LUDs, NUTs…
 */

const BASE = "https://bitcoinknowledge.dev";

interface SearchHit {
  title: string | null;
  url: string | null;
  snippet: string | null;
  source_type: string;
  source_repo: string | null;
  author: string | null;
  created_at: string | null;
}

function cleanSnippet(s: string | null): string {
  if (!s) return "";
  return s.replace(/<\/?mark>/g, "").replace(/\s+/g, " ").trim().slice(0, 400);
}

const NOSTRBOOK = "https://nostrbook.dev";

async function fetchMarkdown(url: string): Promise<{ ok: boolean; body: string; status?: number }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return { ok: false, body: "", status: res.status };
    return { ok: true, body: await res.text() };
  } catch {
    return { ok: false, body: "" };
  }
}

/**
 * Nostrbook (https://nostrbook.dev) como herramienta del mentor.
 * No usamos su servidor MCP (stdio, pensado para clientes de escritorio);
 * el sitio expone la misma documentación en Markdown por HTTP:
 *   /kinds/{n}.md · /tags/{t}.md · /protocol/{event,filter,client,relay,index}.md
 * Los NIPs viven en el repo oficial (raw.githubusercontent.com).
 */
export const nostrbookTools = {
  readNostrDoc: tool({
    description:
      "Read Nostr protocol documentation from nostrbook.dev (structured registry of Nostr docs) or the official NIPs repository. Use it for anything Nostr: event kinds, tags, protocol message flow (client/relay), or a specific NIP. Prefer this over recalling Nostr details from memory.",
    inputSchema: z.object({
      type: z
        .enum(["kind", "tag", "protocol", "nip"])
        .describe(
          "kind = event kind doc (e.g. 0, 1, 30023); tag = tag doc (e.g. 'e', 'p'); protocol = one of event|filter|client|relay|index; nip = NIP number (e.g. '01', 'C7')",
        ),
      id: z.string().describe("kind number, tag name, protocol doc name, or NIP number"),
    }),
    execute: async ({ type, id }) => {
      const clean = id.trim().replace(/^NIP-?/i, "");
      let url: string;
      switch (type) {
        case "kind":
          url = `${NOSTRBOOK}/kinds/${encodeURIComponent(clean)}.md`;
          break;
        case "tag":
          url = `${NOSTRBOOK}/tags/${encodeURIComponent(clean)}.md`;
          break;
        case "protocol": {
          const doc = ["event", "filter", "client", "relay", "index"].includes(clean)
            ? clean
            : "index";
          url = `${NOSTRBOOK}/protocol/${doc}.md`;
          break;
        }
        case "nip":
          url = `https://raw.githubusercontent.com/nostr-protocol/nips/master/${encodeURIComponent(
            clean.toUpperCase().padStart(2, "0"),
          )}.md`;
          break;
      }
      const r = await fetchMarkdown(url);
      if (!r.ok) {
        return {
          error: r.status
            ? `document not found (HTTP ${r.status})`
            : "source unreachable — if it is a NIP, point the user to https://github.com/nostr-protocol/nips",
          url,
        };
      }
      const body = r.body.trim();
      return {
        url,
        body: body.slice(0, 5000),
        truncated: body.length > 5000,
      };
    },
  }),
};

export const bitcoinKnowledgeTools = {
  searchBitcoinKnowledge: tool({
    description:
      "Search the Bitcoin Knowledge Base (bitcoinknowledge.dev), which indexes the bitcoin-dev mailing list, Delving Bitcoin, GitHub PRs/issues/comments from Bitcoin & Lightning repos, BIPs, BOLTs, BLIPs, LUDs and NUTs. Use it whenever you need facts, precedents, historical context or primary sources to point the user to. Prefer citing these sources over recalling from memory.",
    inputSchema: z.object({
      query: z.string().describe("Search query, in English works best"),
      sourceType: z
        .string()
        .optional()
        .describe(
          "Optional filter, e.g. github_pr, github_issue, github_comment, bip, bolt, blip, mailing_list, delving",
        ),
    }),
    execute: async ({ query, sourceType }) => {
      try {
        let url = `${BASE}/search?q=${encodeURIComponent(query)}&limit=6`;
        if (sourceType) url += `&source_type=${encodeURIComponent(sourceType)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) return { error: `search failed (HTTP ${res.status})`, results: [] };
        const data = (await res.json()) as { results?: SearchHit[] };
        const results = (data.results ?? []).map((r) => ({
          title: r.title ?? r.source_type,
          url: r.url,
          snippet: cleanSnippet(r.snippet),
          source: r.source_repo ?? r.source_type,
          author: r.author,
          date: r.created_at?.slice(0, 10),
        }));
        return { results };
      } catch {
        return { error: "knowledge base unreachable", results: [] };
      }
    },
  }),

  lookupSpec: tool({
    description:
      "Fetch the full text of a protocol specification document: a BIP, BOLT, BLIP, LUD or NUT by its number.",
    inputSchema: z.object({
      kind: z.enum(["bip", "bolt", "blip", "lud", "nut"]),
      number: z.number().int().positive(),
    }),
    execute: async ({ kind, number }) => {
      try {
        const res = await fetch(`${BASE}/${kind}/${number}`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) return { error: `${kind.toUpperCase()}-${number} not found (HTTP ${res.status})` };
        const data = (await res.json()) as { document?: { body?: string } };
        const body = data.document?.body ?? "";
        return {
          ref: `${kind.toUpperCase()}-${number}`,
          url: `${BASE}/${kind}/${number}`,
          body: body.slice(0, 5000),
          truncated: body.length > 5000,
        };
      } catch {
        return { error: "knowledge base unreachable" };
      }
    },
  }),
};

/** Conjunto completo de herramientas de conocimiento del mentor. */
export const knowledgeTools = { ...bitcoinKnowledgeTools, ...nostrbookTools };
