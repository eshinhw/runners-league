import Link from "next/link";
import { auth } from "@/lib/auth";
import { MajorArt } from "@/components/MajorArt";
import { SiteHeader } from "@/components/SiteHeader";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Track the Majors",
    body: "Log your finish at each of the World Marathon Majors — Tokyo, Boston, London, Sydney, Berlin, Chicago, and New York City.",
  },
  {
    title: "See what's coming",
    body: "Browse the full 2026 and 2027 Majors calendar in one place, so you always know what's next.",
  },
  {
    title: "Climb the rankings",
    body: "Compare your Majors count and race times against other runners chasing the World Marathon Majors.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Chase the World Major Marathons, together.
          </h1>
          <p className="max-w-xl text-balance text-zinc-500 dark:text-zinc-400">
            Runners League is a community for runners pursuing the World Major Marathons. Log your finishes, follow the
            race calendar, and see how you compare with fellow runners chasing the same start lines.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-500">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">World Major Marathons</h2>
            <p className="mt-1 text-sm text-zinc-500">
              The races currently recognized as World Major Marathons, as of 2026.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MAJORS_ORDER.map((m) => {
              const info = MAJOR_INFO[m];
              return (
                <article key={m} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <MajorArt major={m} className="h-20 w-full" />
                  <div className="p-3">
                    <h3 className="text-sm font-medium">{info.name}</h3>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      {info.city}, {info.country}
                    </p>
                    <p className="mt-1.5 text-xs text-zinc-500">{info.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
        Runners League
      </footer>
    </div>
  );
}
