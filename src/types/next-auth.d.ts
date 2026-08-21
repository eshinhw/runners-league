import type { DefaultSession } from "next-auth";
import type { UnitSystem } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      unitSystem: UnitSystem;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }
}
