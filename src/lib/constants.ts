export const SITE_NAME = "Ahbar & Co.";
export const SITE_TAGLINE = "Precision Wood Art. Designed to Last.";
export const SITE_DESCRIPTION =
  "Premium, meticulously engineered wood items and furniture. In an age of temporary things, we build objects of permanence.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
] as const;

export const COLLECTIONS = [
  {
    name: "Floating Shelves",
    slug: "floating-shelves",
    href: "/floating-shelves",
  },
  {
    name: "Lounge Chairs",
    slug: "lounge-chairs",
    href: "/lounge-chairs",
  },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Floating Shelves", href: "/floating-shelves" },
    { label: "Lounge Chairs", href: "/lounge-chairs" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Our Craft", href: "/about#craft" },
  ],
} as const;
