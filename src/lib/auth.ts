import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

async function uniqueUsernameFrom(seed: string): Promise<string> {
  const base = seed
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20) || "runner";

  let candidate = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

function withUsernameBackfill(base: Adapter): Adapter {
  return {
    ...base,
    createUser: async (data) => {
      const username = await uniqueUsernameFrom(data.email ?? data.name ?? "runner");
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
          username,
          displayName: data.name ?? username,
          avatarUrl: data.image,
        },
      });
      return { ...user, email: user.email! } as never;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: withUsernameBackfill(PrismaAdapter(prisma)),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "database" },
  trustHost: true,
  pages: {},
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as { username?: string }).username;
      }
      return session;
    },
  },
});
