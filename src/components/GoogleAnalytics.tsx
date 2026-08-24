import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Skipped outside production so local/dev/preview traffic never lands in
// the real GA4 property, regardless of whether NEXT_PUBLIC_GA_ID is set.
export function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
