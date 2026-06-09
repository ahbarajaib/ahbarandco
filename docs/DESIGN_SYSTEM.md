# Ahbar & Co. — Design System

## Brand Vision

Ahbar & Co. creates handcrafted minimalist modern furniture that blends timeless craftsmanship with contemporary living.

### Brand Should Feel

- Warm
- Minimal
- Modern
- Architectural
- Handcrafted
- Intentional
- Premium
- Timeless

### Brand Should NOT Feel

- Cold Scandinavian
- Ultra-tech startup
- Traditional luxury
- Rustic farmhouse
- Industrial warehouse
- Overly decorative

### Brand Keywords

Minimalist Modern · Handcrafted · Quiet Luxury · Warm Contemporary · Natural Materials · Architectural Simplicity · Timeless Design

---

## Design Philosophy

> This furniture is carefully made by skilled craftsmen and designed for modern homes.

- **Products are the hero** — the website disappears into the background
- **Bright and usable** — inspired by warm luxury photography, but never dark or low-contrast
- **Generous whitespace** — every section should breathe
- **Large photography** — products experienced before they are read about
- **Minimal interface** — no badges, flash sales, popups, or loud banners

---

## Color System

All tokens are defined as CSS custom properties in `src/app/globals.css`.

| Token | Value | Usage |
|-------|-------|-------|
| `--background-primary` | `#F8F5F0` | Main page background — warm ivory |
| `--background-secondary` | `#EFE8DE` | Alternating sections — soft cream |
| `--surface` | `#FFFFFF` | Cards, forms, elevated surfaces |
| `--wood-dark` | `#2D221C` | Navigation, footer, buttons, hero overlays |
| `--wood-medium` | `#6F4F39` | Accent color — walnut |
| `--text-primary` | `#1F1F1F` | Headlines, body text |
| `--text-secondary` | `#6B6B6B` | Supporting text, captions |
| `--border` | `#E5DED4` | Dividers, input borders |

### Tailwind Usage

```html
<div class="bg-background-primary text-text-primary">
<div class="bg-background-secondary">
<div class="bg-surface">
<div class="bg-wood-dark text-background-primary">
<span class="text-wood-medium">
```

---

## Typography

### Logo

- **Font:** Cormorant Garamond
- **Weight:** 500–600
- **Letter spacing:** `0.15em`
- **Case:** Uppercase
- **Example:** `AHBAR & CO.`

### Headings

- **Font:** Cormorant Garamond (`font-heading`)
- **Weight:** 500–600
- **Usage:** Hero headlines, collection titles, editorial content

### Body

- **Font:** Inter (`font-sans`)
- **Weight:** 400–500
- **Usage:** Navigation, product descriptions, UI elements

---

## Layout Principles

1. **Generous whitespace** — avoid cramped layouts
2. **Large photography** — images occupy significant screen space
3. **Minimal interface** — no promotional clutter
4. **Architectural grids** — clean alignment, intentional spacing

### Section Spacing

Use the `Section` component (`src/components/layout/section.tsx`):

- Vertical padding: `py-20 lg:py-28`
- Max width: `max-w-7xl`
- Horizontal padding: `px-6 lg:px-8`
- Variants: `primary`, `secondary`, `surface`

---

## Components

### Navigation

Dark wood (`bg-wood-dark`) header with ivory text. Links: Home, Shop, Collections, Journal, About, Search, Cart.

### Footer

Dark wood background with navigation, social links, newsletter, and copyright.

### Product Card

```
Product Image
Product Name
Price
Quick View
```

- No shadows
- Subtle hover effect only (gentle scale or opacity)

### Buttons

- Primary: `bg-wood-dark` with ivory text
- Outline: transparent with wood-dark border
- Minimal border radius (`--radius: 0.25rem`)

---

## Homepage Sections

| Section | Purpose |
|---------|---------|
| Hero | Large lifestyle image, headline, CTAs |
| Featured Collections | Floating Shelves, Lounge Chairs |
| Craftsmanship | Workshop/process photography |
| Featured Products | Best products grid |
| Design Journal | Blog for SEO + storytelling |
| Newsletter | Simple, elegant signup |
| Footer | Dark wood, navigation + links |

### Hero Copy

- **Headline:** Modern Furniture / Made By Hand.
- **Subheadline:** Thoughtfully crafted furniture designed for calm and intentional spaces.
- **Primary CTA:** Shop Collection
- **Secondary CTA:** Our Craft

---

## Product Page Layout

### Left Column
Large image gallery — lifestyle, detail, and material close-ups.

### Right Column
Product name, price, short description, dimensions, material, quantity, Add to Cart.

### Below Fold
Full description, materials, dimensions, care guide, shipping, related products.

---

## Motion Design

### Use
- Fade in
- Soft reveal
- Gentle image zoom
- Smooth scrolling

### Avoid
- Bounce animations
- Parallax overload
- Fancy page transitions

---

## Ecommerce UX Priorities

1. Product Discovery
2. Product Photography
3. Product Details
4. Trust
5. Checkout

Users should reach a product in one click from the homepage.

---

## Responsive Design

All pages must work across mobile, tablet, and desktop.

### Breakpoints

| Token | Min Width | Target Devices |
|-------|-----------|----------------|
| Default | — | Mobile phones |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Layout Rules

- **Navigation:** Hamburger menu + sheet drawer below `md`. Full nav at `lg:`.
- **Typography:** Scale headings from `text-3xl` mobile to `text-5xl`/`text-7xl` desktop.
- **Grids:** 1 column mobile → 2 columns tablet → 3–4 columns desktop.
- **Product gallery:** Full-width stacked on mobile; side-by-side with info on `lg:`.
- **Buttons:** Full-width on mobile (`w-full`), auto-width on `sm:`.
- **Spacing:** `px-4` mobile, `px-6` tablet, `px-8` desktop. Section `py-12` → `py-28`.
- **Touch targets:** Minimum 44px height for interactive elements on mobile.

### Product Card (Responsive)

- Image aspect ratio `4/5` maintained at all sizes
- Name scales `text-lg` → `text-xl`
- Grid: 1 → 2 (`sm`) → 3 (`lg`) → 4 (`xl`) columns
