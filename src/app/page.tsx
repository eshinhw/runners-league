import { auth } from "@/lib/auth";
import { Footer } from "@/components/Footer";
import { MajorArt } from "@/components/MajorArt";
import { SiteHeader } from "@/components/SiteHeader";
import { MAJOR_INFO, MAJORS_CALENDAR, MAJORS_ORDER } from "@/lib/majors";

export const dynamic = "force-dynamic";

// Oxford-comma join, e.g. [2026, 2027] -> "2026 and 2027",
// ["Tokyo", "Boston", "London"] -> "Tokyo, Boston, and London".
function joinWithAnd(items: (string | number)[]): string {
  const strs = items.map(String);
  if (strs.length <= 1) return strs.join("");
  if (strs.length === 2) return `${strs[0]} and ${strs[1]}`;
  return `${strs.slice(0, -1).join(", ")}, and ${strs[strs.length - 1]}`;
}

// Derived from the actual majors/calendar data so this list — and the years
// mentioned below — grow on their own as majors or calendar editions are
// added, instead of needing a manual copy edit each time.
const MAJOR_NAMES = MAJORS_ORDER.map((m) => MAJOR_INFO[m].name.replace(" Marathon", ""));
const CALENDAR_YEARS = [...new Set(MAJORS_CALENDAR.map((e) => e.year))].sort((a, b) => a - b);

const FEATURES = [
  {
    title: "Track the Majors",
    body: `Log your finish at each of the World Marathon Majors — ${joinWithAnd(MAJOR_NAMES)}.`,
  },
  {
    title: "See what's coming",
    body: `Browse the full ${joinWithAnd(CALENDAR_YEARS)} Majors calendar in one place, so you always know what's next.`,
  },
  {
    title: "Climb the rankings",
    body: "Compare your Majors count and race times against other runners chasing the World Marathon Majors.",
  },
];

export default async function HomePage() {
  const session = await auth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
              The races currently recognized as World Major Marathons, as of {currentYear}.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MAJORS_ORDER.map((m) => {
              const info = MAJOR_INFO[m];
              return (
                <article key={m} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <MajorArt major={m} className="aspect-[3/2] w-full" />
                  <div className="flex flex-col gap-2 p-4">
                    <div>
                      <h3 className="font-medium">{info.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>{info.flag}</span>
                        <span>
                          {info.city}, {info.country}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm text-zinc-500">{info.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
