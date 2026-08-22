import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">{children}</div>
      <Footer />
    </div>
  );
}
