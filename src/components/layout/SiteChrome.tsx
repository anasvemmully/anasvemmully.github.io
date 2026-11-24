"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Footer from "./Footer";

/** Site header, footer and analytics around every page, except the blog editor. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The editor at /keystatic is a full-screen app of its own
  if (pathname.startsWith("/keystatic")) return <>{children}</>;

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        <Navigation />
        <main className="flex-grow flex flex-col">{children}</main>
      </div>
      <Footer />
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "zhjf9wyezc");`}
      </Script>
    </>
  );
}
