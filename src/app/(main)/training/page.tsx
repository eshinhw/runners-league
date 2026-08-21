import Link from "next/link";
import { CustomPlanForm } from "@/components/CustomPlanForm";
import { TrainingPlanTable } from "@/components/TrainingPlanTable";
import { BEGINNER_PLAN, SUB3_PLAN, SUB4_PLAN } from "@/lib/training";

type Tab = "beginner" | "sub4" | "sub3" | "custom";

const TABS: { key: Tab; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "sub4", label: "Sub-4" },
  { key: "sub3", label: "Sub-3" },
  { key: "custom", label: "Custom Plan" },
];

export default async function TrainingPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const tab: Tab = (["beginner", "sub4", "sub3", "custom"] as const).includes(sp.tab as Tab)
    ? (sp.tab as Tab)
    : "beginner";

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Training</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Marathon training routines, from your first finish to chasing sub-3.
        </p>
      </div>

      <nav className="flex gap-2 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/training?tab=${t.key}`}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-orange-500 text-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "beginner" && <TrainingPlanTable plan={BEGINNER_PLAN} />}
      {tab === "sub4" && <TrainingPlanTable plan={SUB4_PLAN} />}
      {tab === "sub3" && <TrainingPlanTable plan={SUB3_PLAN} />}
      {tab === "custom" && <CustomPlanForm />}
    </main>
  );
}
