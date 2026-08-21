import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to edit your profile.</p>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your personal information.</p>
      </div>

      <ProfileEditor user={user} />
    </main>
  );
}
