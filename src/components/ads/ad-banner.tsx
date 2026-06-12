"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

type AdBannerProps = {
  slotId: string;
};

export function AdBanner({ slotId }: AdBannerProps) {
  // Hide by default in development to keep layouts clean on localhost
  const [adBlocked, setAdBlocked] = useState(process.env.NODE_ENV !== "production");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch (err) {
      console.warn("AdSense failed to initialize (AdBlocker may be active): ", err);
      setTimeout(() => setAdBlocked(true), 0);
    }
  }, []);

  if (adBlocked) {
    return null;
  }

  return (
    <>
      {/* Load Google AdSense library asynchronously globally */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5491176214539864" // Replace with your publisher ID CA-pub-xxxx
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <div className="w-full flex items-center justify-center my-6 bg-background-secondary/10 border-y border-border/10">
        {/* 
          Responsive height reservation prevents Layout Shift (CLS):
          - Mobile (<640px): 100px min-height
          - Tablet (640px - 1024px): 90px min-height
          - Desktop (>=1024px): 250px min-height
        */}
        <div 
          className="w-full max-w-7xl flex items-center justify-center overflow-hidden min-h-[100px] sm:min-h-[90px] lg:min-h-[250px] transition-all duration-300"
        >
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client="ca-pub-5491176214539864"
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </>
  );
}
