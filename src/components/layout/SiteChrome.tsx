"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import Navigation from "./Navigation";
import Footer from "./Footer";

/** The site header/footer wrap every page except the Window Timeline tool itself (editor and viewer), which is a full-screen app. Its guide keeps the chrome. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tool = pathname === "/timeline" || pathname.startsWith("/timeline/view");
  if (tool) return <main className="flex h-dvh flex-col overflow-hidden">{children}</main>;
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
