import { PreferencesForm } from "@/components/PreferencesForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to change your settings.</p>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Units, language, and other site-wide preferences.</p>
      </div>

      <PreferencesForm unitSystem={user.unitSystem} language={user.language} />
    </main>
  );
}
