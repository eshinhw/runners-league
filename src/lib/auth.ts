import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
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

// The `database` session strategy rotates the session token on nearly every
// request. Prisma's delete/update throw "record not found" if a stale
// cookie's session row is already gone (expired cleanup, or a race between
// two concurrent requests rotating the same token) — treat that as a no-op
// instead of a hard 500.
function isRecordNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2025";
}

function withResilientSessions(base: Adapter): Adapter {
  return {
    ...base,
    deleteSession: async (sessionToken) => {
      try {
        await base.deleteSession!(sessionToken);
      } catch (err) {
        if (!isRecordNotFound(err)) throw err;
      }
    },
    updateSession: async (data) => {
      try {
        return await base.updateSession!(data);
      } catch (err) {
        if (isRecordNotFound(err)) return null;
        throw err;
      }
    },
  };
}

function withUsernameBackfill(base: Adapter): Adapter {
  return {
    ...base,
    createUser: async (data) => {
      const username = await uniqueUsernameFrom(data.email ?? data.name ?? "runner");
      const [firstName, ...rest] = (data.name ?? username).trim().split(/\s+/);
      const lastName = rest.length > 0 ? rest.join(" ") : null;
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
          username,
          displayId: username,
          firstName: firstName || username,
          lastName,
          avatarUrl: data.image,
        },
      });
      return { ...user, email: user.email! } as never;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: withResilientSessions(withUsernameBackfill(PrismaAdapter(prisma))),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Nodemailer({
      id: "email",
      // Falls back to an unreachable placeholder so builds don't fail before
      // EMAIL_SERVER is configured; sending simply errors at runtime until it is.
      server: process.env.EMAIL_SERVER || "smtp://user:pass@localhost:1025",
      from: process.env.EMAIL_FROM || "Runners League <noreply@runnersleague.org>",
    }),
  ],
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as { username?: string }).username;
        session.user.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null;
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return session;
    },
  },
});
