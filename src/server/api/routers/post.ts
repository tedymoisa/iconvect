import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { MOCK_SVG } from "@/lib/constants";
import { sleep } from "@trpc/server/unstable-core-do-not-import";

export const postRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`
    };
  }),

  generate: publicProcedure.mutation(async () => {
    await sleep(5000);

    return {
      svg: MOCK_SVG
    };
  })

  // getLatest: protectedProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } }
  //   });

  //   return post ?? null;
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // })
});
