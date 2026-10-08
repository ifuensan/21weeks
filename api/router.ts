import { authRouter } from "./auth-router";
import { issuesRouter } from "./routers/issues";
import { mentorRouter } from "./routers/mentor";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  issues: issuesRouter,
  mentor: mentorRouter,
});

export type AppRouter = typeof appRouter;
