import { SiteHeader } from "@/components/SiteHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
    </div>
  );
}
