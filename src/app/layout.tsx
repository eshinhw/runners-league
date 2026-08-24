import type { Metadata } from "next";
import { JetBrains_Mono, Oswald, Work_Sans } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/Toast";
import { UnitSystemProvider } from "@/components/units/UnitSystemProvider";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const DESCRIPTION =
  "Track your World Marathon Majors finishes, follow the race calendar, and see how you stack up against runners chasing the same start lines.";

export const metadata: Metadata = {
  metadataBase: new URL("https://runnersleague.org"),
  title: {
    default: "Runners League — Track Your World Marathon Majors Journey",
    template: "%s | Runners League",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Runners League",
    title: "Runners League — Track Your World Marathon Majors Journey",
    description: DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runners League — Track Your World Marathon Majors Journey",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${oswald.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <UnitSystemProvider>
          <ToastProvider>{children}</ToastProvider>
        </UnitSystemProvider>
      </body>
    </html>
  );
}
