export const SITE_NAME = "Ahbar & Co.";
export const SITE_TAGLINE = "Modern Furniture Made By Hand.";
export const SITE_DESCRIPTION =
  "Thoughtfully crafted minimalist modern furniture designed for calm and intentional spaces.";

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
