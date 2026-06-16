"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type HeaderWrapperProps = {
  children: React.ReactNode;
};

export function HeaderWrapper({ children }: HeaderWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      const timer = setTimeout(() => {
        setIsScrolled(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Run once on mount / route change
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${
        isHome
          ? isScrolled
            ? "border-b border-wood-dark/80 bg-wood-dark/95 text-background-primary backdrop-blur-md shadow-xs"
            : "border-b border-transparent bg-transparent text-background-primary"
          : "border-b border-wood-dark/80 bg-wood-dark text-background-primary backdrop-blur-sm"
      }`}
    >
      {children}
    </header>
  );
}
