import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed admin user
  const adminEmail = "admin@ahbarandco.com";
  const adminPasswordHash = bcrypt.hashSync("adminpassword", 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "admin",
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  // Check if database already has catalog data to ensure we only seed once and protect existing data
  const existingProductsCount = await prisma.product.count();
  const existingCollectionsCount = await prisma.collection.count();

  if (existingProductsCount > 0 || existingCollectionsCount > 0) {
    console.log("Database already has catalog data. Skipping seed to prevent accidental data loss.");
    return;
  }

  // 1. Seed Collections
  const collectionsData = [
    {
      name: "The Workspace Collection",
      slug: "workspace",
      description: "A curated collection of structural office goods designed to elevate your desk environment. Engineered with geometric precision and routed details, these desktop instruments clean up wire clutter and focus the mind.",
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&q=80",
      sortOrder: 1,
      published: true,
    },
    {
      name: "The Living Room Accents",
      slug: "living-room",
      description: "Functional living room furniture and accents that blend architectural simplicity with daily utility, featuring knockdown joints for flat-pack shipping.",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
      sortOrder: 2,
      published: true,
    },
    {
      name: "The Entryway Organizer",
      slug: "entryway",
      description: "Wall-mounted organizers and mirrors designed to turn entryways into functional, clean visual portals.",
      imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
      sortOrder: 3,
      published: true,
    },
    {
      name: "The Entertaining & Tabletop Goods",
      slug: "tabletop",
      description: "Low-profile serving accents and tabletop products designed to enhance dining rituals and highlight raw wood grains.",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
      sortOrder: 4,
      published: true,
    },
    {
      name: "The Keepsakes & Storage",
      slug: "keepsakes",
      description: "Small storage boxes and wall bars featuring fine woodworking details like miters and embedded magnets.",
      imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80",
      sortOrder: 5,
      published: true,
    },
    {
      name: "The Lighting & Ambient Accents",
      slug: "ambient",
      description: "Ambient candle pillars, acoustic docks, and stands designed to bring warmth and quiet structure to modern rooms.",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
      sortOrder: 6,
      published: true,
    },
  ];

  const collectionsMap: Record<string, string> = {};

  for (const col of collectionsData) {
    const created = await prisma.collection.create({
      data: col,
    });
    collectionsMap[col.slug] = created.id;
  }

  // 2. Seed Products
  const productsData = [
    // ─── Workspace Collection ───────────────────────────────────────────────
    {
      name: "Teakwood Desk Shelf",
      slug: "teakwood-desk-shelf",
      shortDesc: "A premium monitor stand crafted from solid golden C.P. Teakwood, designed to raise screens to eye level and create storage space below.",
      description: "Meticulously cut and edge-finished, this desk shelf is the anchor of a focused workspace. Ripped to exact proportions, it features screw-in teakwood legs mounted via threaded brass inserts, allowing it to pack flat. The clearance underneath hides a full-sized keyboard and cords, maintaining desktop order. Finished with natural matte oils to bring out the deep golden hues of the premium hardwood.",
      price: 899900,
      material: "Solid C.P. Teakwood (Sagwan), Solid Brass hardware",
      dimensions: "23\" W × 9\" D × 4\" H (58 cm × 23 cm × 10 cm)",
      careGuide: "Wipe clean with a soft dry cloth. Avoid exposure to water or damp cleaning solutions. Reapply clear wood wax once a year to maintain the matte lustre.",
      deliveryCost: 45000,
      featured: true,
      published: true,
      stock: 12,
      collectionSlug: "workspace",
      imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
    },
    {
      name: "Routed Sheesham Valet Tray",
      slug: "routed-sheesham-valet-tray",
      shortDesc: "A multi-compartment Indian Rosewood (Sheesham) organizer tray with a slanted slot to dock smartphones and a merino wool felt-lined pocket.",
      description: "A premium desk tray carved from a single block of Sheesham. It features a precision-slanted slot to hold a phone upright for viewing notifications, a routed dish for keys and coins, and a groove for writing instruments. The largest pocket is lined with premium merino wool felt to protect glasses and accessories from scratching. Lying flat or sitting on the desk shelf, it keeps essential gear grouped elegantly.",
      price: 389900,
      material: "Solid Indian Rosewood (Sheesham), Merino Wool Felt lining",
      dimensions: "11.5\" W × 7.5\" D × 1.2\" H (29 cm × 19 cm × 3 cm)",
      careGuide: "Clean with a dry microfiber cloth or soft brush. Use a lint roller to dust the felt.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 15,
      collectionSlug: "workspace",
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    },
    {
      name: "Vertical Teak Laptop Stand",
      slug: "vertical-teak-laptop-stand",
      shortDesc: "A heavy, space-saving vertical stand designed to store laptops upright when closed.",
      description: "Cut from a heavy block of solid golden Teakwood, this stand features a precise 0.75-inch slot lined with premium adhesive merino wool felt. It keeps your laptop upright and secure, freeing up desk space for analog tasks. The bottom features non-slip silicone feet for stability.",
      price: 389900,
      material: "Solid C.P. Teakwood (Sagwan), Merino Wool Felt",
      dimensions: "7.5\" W × 4\" D × 3\" H (19 cm × 10 cm × 7.5 cm)",
      careGuide: "Wipe with a dry cloth. Use a lint roller to clean dust out of the felt lining.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 10,
      collectionSlug: "workspace",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    },
    {
      name: "Sheesham Pen & Card Caddy",
      slug: "sheesham-pen-card-caddy",
      shortDesc: "A heavy Sheesham block featuring angled drilling for pens and a clean slot for business cards, anchored by a solid brass base.",
      description: "A structural desktop organizer combining timber and metal. Angled drilling holds writing instruments, while a clean table saw kerf acts as a business card slot. Weighted with a solid, brushed brass baseplate for premium gravity and touch feel.",
      price: 299900,
      material: "Solid Indian Rosewood (Sheesham), Brushed Solid Brass",
      dimensions: "6\" W × 3.5\" D × 2.5\" H (15 cm × 9 cm × 6.3 cm)",
      careGuide: "Polish the wood with dry cloth. The brass base is raw and will develop a beautiful dark patina over time; polish with metal cleaner if you prefer a bright shine.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 20,
      collectionSlug: "workspace",
      imageUrl: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80",
    },

    // ─── Living Room Accents ────────────────────────────────────────────────
    {
      name: "Interlocking Teak Side Table",
      slug: "interlocking-teak-side-table",
      shortDesc: "A knockdown sofa-arm side table designed to pack flat and slide over seat cushions.",
      description: "A masterclass in flat-pack joinery. This table features a top shelf, single support column, and stable base connected via robust knockdown connectors (Zipbolts). Crafted from golden C.P. Teakwood, it can be assembled or disassembled in under two minutes with a single hex key, allowing it to ship in a compact flat container.",
      price: 1699900,
      material: "Solid C.P. Teakwood (Sagwan), Steel knockdown hardware",
      dimensions: "18\" W × 12\" D × 22\" H (46 cm × 30 cm × 56 cm)",
      careGuide: "Dust regularly. Wipe spills immediately. Avoid placing sweating glasses directly on the wood without a coaster.",
      deliveryCost: 95000,
      featured: true,
      published: true,
      stock: 5,
      collectionSlug: "living-room",
      imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
    },
    {
      name: "Floating Sheesham Picture Ledges",
      slug: "floating-sheesham-picture-ledges",
      shortDesc: "A clean, U-shaped floating ledge for displaying book covers, photos, or prints invisibly.",
      description: "Designed to keep walls clean and artwork rotating. This ledge is glued up from three strips of premium Sheesham wood, creating a front lip that prevents items from slipping. Dual keyhole slots routed into the back offer a flush, heavy-duty mount.",
      price: 399900,
      material: "Solid Indian Rosewood (Sheesham)",
      dimensions: "24\" W × 3.5\" D × 2\" H (61 cm × 9 cm × 5 cm)",
      careGuide: "Dust with a feather duster. Ensure anchors are firmly set into wall studs before overloading.",
      deliveryCost: 35000,
      featured: false,
      published: true,
      stock: 15,
      collectionSlug: "living-room",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
    },
    {
      name: "Half-Lap Sheesham Magazine Rack",
      slug: "half-lap-sheesham-magazine-rack",
      shortDesc: "A slide-together geometric stand to organize vinyl records or magazines.",
      description: "Built using half-lap joints cut precisely with a dado stack, this architectural stand slides together without glue or fasteners. Designed to store up to 30 records or magazines, and slips apart into two flat panels of solid Sheesham wood for shipping.",
      price: 589900,
      material: "Solid Indian Rosewood (Sheesham)",
      dimensions: "14\" W × 10\" D × 12\" H (35 cm × 25 cm × 30 cm)",
      careGuide: "Wipe with a clean, slightly damp cloth and dry immediately.",
      deliveryCost: 35000,
      featured: false,
      published: true,
      stock: 8,
      collectionSlug: "living-room",
      imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=80",
    },
    {
      name: "Dual-Tone Hexagonal Coaster Set",
      slug: "dual-tone-hexagonal-coaster-set",
      shortDesc: "A set of 6 geometric coasters in a magnetic Sheesham storage cradle.",
      description: "Clean geometric lines for your tabletop. This set includes 6 hexagonal coasters cut on a precise table saw sled, alternating between golden Teakwood and dark Sheesham wood. The matching Sheesham storage cradle holds them in place with small rare-earth magnets embedded invisibly under the wood grain.",
      price: 249900,
      material: "Solid Indian Rosewood (Sheesham) and C.P. Teakwood, Rare-earth magnets",
      dimensions: "4\" W × 4\" D × 0.4\" H (10 cm × 10 cm × 1 cm) each",
      careGuide: "If coasters get wet, dry them off. Clean with a damp cloth and apply a drop of mineral oil if the wood looks dry.",
      deliveryCost: 15000,
      featured: false,
      published: true,
      stock: 25,
      collectionSlug: "living-room",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    },

    // ─── Entryway Organizer ─────────────────────────────────────────────────
    {
      name: "Acacia Peg-and-Rail Coat Rack",
      slug: "acacia-peg-and-rail-coat-rack",
      shortDesc: "A clean, natural Acacia backboard with cylindrical hanging pegs angled slightly upward.",
      description: "Inspired by classic Shaker rails but refined for modern spaces. Features 5 Acacia cylinder pegs glued into a thick solid rail. Standard keyhole mounts on the back ensure heavy coats won't pull the rack from the wall.",
      price: 349900,
      material: "Solid Indian Acacia Wood (Babool)",
      dimensions: "24\" W × 3\" D × 4\" H (61 cm × 7.6 cm × 10 cm)",
      careGuide: "Wipe down with a dry cloth. Max load 10kg per peg.",
      deliveryCost: 25000,
      featured: true,
      published: true,
      stock: 12,
      collectionSlug: "entryway",
      imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
    },
    {
      name: "Entryway Teak Console Shelf",
      slug: "entryway-teak-console-shelf",
      shortDesc: "A wall-mounted entryway ledge for keys, mail, and phones, using a secure French cleat.",
      description: "Flush, invisible mounting is achieved through a heavy-duty 45-degree French cleat system ripped on a table saw. The C.P. Teakwood shelf features a shallow recess at the top to prevent keys from falling off and keeping letters organized.",
      price: 699900,
      material: "Solid C.P. Teakwood (Sagwan)",
      dimensions: "20\" W × 6\" D × 5\" H (50 cm × 15 cm × 12.7 cm)",
      careGuide: "Polish with a dry cloth. Avoid placing wet keys on the console.",
      deliveryCost: 35000,
      featured: false,
      published: true,
      stock: 8,
      collectionSlug: "entryway",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    },
    {
      name: "Interlocking Acacia Plant Stand",
      slug: "interlocking-acacia-plant-stand",
      shortDesc: "A low plant or sculpture stand featuring two interlocking leg frames.",
      description: "Designed to elevate houseplants or ceramics. This stand uses a center half-lap joint that allows the two cross frames of solid Acacia to lock together. Folds flat instantly for packing and shipping.",
      price: 269900,
      material: "Solid Indian Acacia Wood",
      dimensions: "10\" W × 10\" D × 12\" H (25 cm × 25 cm × 30 cm)",
      careGuide: "Wipe water splashes immediately. Ensure the pot fits within the stand's dimensions.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 18,
      collectionSlug: "entryway",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&q=80",
    },
    {
      name: "Floating Sheesham Mirror",
      slug: "floating-sheesham-mirror",
      shortDesc: "A round mirror recessed into a solid Sheesham frame with an integrated key ledge.",
      description: "A highly functional entryway mirror. We route a circular pocket into solid Sheesham wood to recess the glass, leaving a structural ledge at the bottom. Perfect for last-minute checks and keeping keys accessible.",
      price: 1149900,
      material: "Solid Indian Rosewood (Sheesham), Glass Mirror",
      dimensions: "20\" Diameter × 1.5\" Depth (50 cm × 3.8 cm)",
      careGuide: "Clean the mirror with glass cleaner. Wipe the wood frame with a dry cloth.",
      deliveryCost: 65000,
      featured: false,
      published: true,
      stock: 6,
      collectionSlug: "entryway",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    },

    // ─── Entertaining & Tabletop Goods ──────────────────────────────────────
    {
      name: "Teakwood Rotating Lazy Susan",
      slug: "teakwood-rotating-lazy-susan",
      shortDesc: "A circular serving plate rotating on an invisibly recessed steel bearing.",
      description: "A rotating serving tray that sits flat on your dining table. Using a router circle jig, we cut a clean solid C.P. Teakwood disk and route a circular pocket underneath to hide the bearing plate, keeping it just 5mm off the table.",
      price: 729900,
      material: "Solid C.P. Teakwood (Sagwan), Steel ball-bearing swivel plate",
      dimensions: "16\" Diameter × 1.2\" Height (40 cm × 3 cm)",
      careGuide: "Wipe clean. Never submerge in water or place in the dishwasher.",
      deliveryCost: 35000,
      featured: true,
      published: true,
      stock: 10,
      collectionSlug: "tabletop",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    },
    {
      name: "Balanced Acacia Wine Holder",
      slug: "balanced-acacia-wine-holder",
      shortDesc: "A single angled block of wood that balances a full bottle of wine horizontally in mid-air through gravity.",
      description: "A unique dining conversation piece. Cut at a precise 45-degree angle from solid Acacia wood with a 1.25\" hole drilled near the top. Using tension and balance, it floats a standard bottle of wine horizontally in mid-air.",
      price: 199900,
      material: "Solid Indian Acacia Wood",
      dimensions: "11\" W × 3.5\" D × 1\" H (28 cm × 9 cm × 2.5 cm)",
      careGuide: "Wipe clean with a soft dry cloth.",
      deliveryCost: 15000,
      featured: false,
      published: true,
      stock: 30,
      collectionSlug: "tabletop",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80",
    },
    {
      name: "Brick-Pattern Teak & Sheesham Board",
      slug: "brick-pattern-teak-sheesham-board",
      shortDesc: "A heavy, end-grain serving board assembled like a classic brick wall.",
      description: "End-grain boards are self-healing and protect premium chef knives. Constructed by gluing up golden Teakwood and dark Sheesham strips, cross-cutting them, rotating them 90 degrees, and gluing them back together in a brick pattern. Finished with food-safe mineral oil and beeswax.",
      price: 689900,
      material: "Solid C.P. Teakwood and Indian Rosewood (Sheesham)",
      dimensions: "16\" W × 10\" D × 1.5\" H (40 cm × 25 cm × 3.8 cm)",
      careGuide: "Hand wash with warm soapy water, dry immediately. Re-oil with food-safe mineral oil once a month.",
      deliveryCost: 35000,
      featured: false,
      published: true,
      stock: 8,
      collectionSlug: "tabletop",
      imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
    },
    {
      name: "Interlocking Sheesham Trivet Set",
      slug: "interlocking-sheesham-trivet-set",
      shortDesc: "A set of three geometric wooden rings that protect tables from hot pots and fold together.",
      description: "Geometric protection for dining tables. These trivets are routed from solid Sheesham wood and fit together like a puzzle, allowing them to nest compactly in drawers or hang on kitchen rails when not in use.",
      price: 269900,
      material: "Solid Indian Rosewood (Sheesham)",
      dimensions: "7\" W × 7\" D × 0.8\" H (17.8 cm × 17.8 cm × 2 cm) nested",
      careGuide: "Wipe off grease with a damp soapy cloth. Do not soak.",
      deliveryCost: 15000,
      featured: false,
      published: true,
      stock: 22,
      collectionSlug: "tabletop",
      imageUrl: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1200&q=80",
    },

    // ─── Keepsakes & Storage ────────────────────────────────────────────────
    {
      name: "Splined-Miter Sheesham Keepsake Box",
      slug: "splined-miter-sheesham-keepsake-box",
      shortDesc: "A small storage box with mitered corners reinforced with contrasting wood splines.",
      description: "A classic box to store letters, jewelry, or tea. Miters are cut at 45 degrees into solid Sheesham wood, and a custom spline jig is used to cut slots for golden Teakwood splines, which provide both structural integrity and a beautiful contrasting visual detail.",
      price: 499900,
      material: "Solid Indian Rosewood (Sheesham) with C.P. Teakwood Splines",
      dimensions: "9\" W × 6\" D × 4\" H (23 cm × 15 cm × 10 cm)",
      careGuide: "Wipe clean with a dry cloth. Keep away from highly humid environments.",
      deliveryCost: 25000,
      featured: true,
      published: true,
      stock: 14,
      collectionSlug: "keepsakes",
      imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80",
    },
    {
      name: "Teakwood Watch Display Box",
      slug: "teakwood-watch-display-box",
      shortDesc: "A felt-lined tray with watch slots covered by a slide-in acrylic lid.",
      description: "A premium watch and glasses display. The slots are routed smoothly into solid C.P. Teakwood and lined with adhesive grey merino wool felt. A precision slot accepts a slide-in clear acrylic lid to protect accessories from dust.",
      price: 699900,
      material: "Solid C.P. Teakwood (Sagwan), Grey Merino Wool Felt, Clear Acrylic",
      dimensions: "12\" W × 8\" D × 3.5\" H (30 cm × 20 cm × 9 cm)",
      careGuide: "Dust with microfiber. Clean acrylic only with a soft cloth to avoid scratches.",
      deliveryCost: 35000,
      featured: false,
      published: true,
      stock: 6,
      collectionSlug: "keepsakes",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    },
    {
      name: "Magnetic Acacia Knife Block",
      slug: "magnetic-acacia-knife-block",
      shortDesc: "A wall-mounted Acacia bar that holds kitchen knives invisibly.",
      description: "Keep countertops clean. This wall bar has deep slots drilled from the backside of a solid Acacia wood block, leaving only 1.5mm of wood thickness. Powerful neodymium magnets are glued inside to hold kitchen knives invisibly. Includes hidden mounting hardware.",
      price: 429900,
      material: "Solid Indian Acacia Wood, Neodymium magnets",
      dimensions: "18\" W × 2.2\" D × 1\" H (46 cm × 5.6 cm × 2.5 cm)",
      careGuide: "Wipe clean with a damp cloth. Dry immediately.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 12,
      collectionSlug: "keepsakes",
      imageUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1200&q=80",
    },
    {
      name: "Acacia Desk Drawer Organizer Tray",
      slug: "acacia-desk-drawer-organizer-tray",
      shortDesc: "A modular set of wooden trays to organize drawer items.",
      description: "Designed to bring order to drawers. These modular trays are glued from 1/4\" thin Acacia stock, creating 3x3, 3x6, and 3x9 inch boxes that nest together to hold pens, clips, and keys.",
      price: 369900,
      material: "Solid Indian Acacia Wood (Babool)",
      dimensions: "12\" W × 9\" D × 2\" H (30 cm × 23 cm × 5 cm) total nested size",
      careGuide: "Dust with a soft brush or dry cloth.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 20,
      collectionSlug: "keepsakes",
      imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&q=80",
    },

    // ─── Lighting & Ambient Accents ─────────────────────────────────────────
    {
      name: "Sheesham Acoustic Phone Dock",
      slug: "sheesham-acoustic-phone-dock",
      shortDesc: "A passive sound-amplifying smartphone dock carved from solid Sheesham wood, requiring no power or cords.",
      description: "A structural desktop sculpture that functions as a passive amplifier. By routing a precise channel that guides sound from a phone's bottom speaker into a curved, horn-like acoustic chamber, it naturally increases volume and enhances tone by up to 15 decibels. Fully mechanical and cordless, it serves as a beautiful dock and natural sound amplifier for desks, kitchens, or bedside tables.",
      price: 299900,
      material: "Solid Indian Rosewood (Sheesham)",
      dimensions: "5\" W × 3.5\" D × 3\" H (12.7 cm × 9 cm × 7.6 cm)",
      careGuide: "Wipe clean with a soft dry cloth. Do not allow water to gather in the sound channels.",
      deliveryCost: 25000,
      featured: true,
      published: true,
      stock: 15,
      collectionSlug: "ambient",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    },
    {
      name: "Modular Teak Tea Light Holders",
      slug: "modular-teak-tea-light-holders",
      shortDesc: "A set of 3 wooden pillars of different heights holding tea light candles.",
      description: "Modular warmth for dining tables or mantels. These three columns (2\", 4\", and 6\" tall) cut from solid C.P. Teakwood have shallow recesses drilled at the top to fit standard metal tea light cups.",
      price: 299900,
      material: "Solid C.P. Teakwood (Sagwan)",
      dimensions: "2.2\" W × 2.2\" D × 2\" / 4\" / 6\" H (5.6 cm × 5.6 cm × 5 / 10 / 15 cm)",
      careGuide: "Never leave burning candles unattended. Wipe wax spills immediately.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 18,
      collectionSlug: "ambient",
      imageUrl: "https://images.unsplash.com/photo-1507504038482-7621437eea5c?w=1200&q=80",
    },
    {
      name: "Teak Wall-Sconce Candle Holder",
      slug: "teak-wall-sconce-candle-holder",
      shortDesc: "A wall-mounted wooden sconce for taper candles, featuring a polished brass backplate.",
      description: "Classic wall lighting. This sconce mounts flush to walls using a keyhole slot. Features a polished raw brass backplate behind the taper candle pocket of the C.P. Teakwood body to reflect a warm glow back into the room.",
      price: 429900,
      material: "Solid C.P. Teakwood (Sagwan), Raw Brass plate",
      dimensions: "4\" W × 3.5\" D × 12\" H (10 cm × 9 cm × 30 cm)",
      careGuide: "Clean brass with metal polish if you prefer it bright; otherwise, let it patina.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 8,
      collectionSlug: "ambient",
      imageUrl: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=1200&q=80",
    },
    {
      name: "Sheesham Headphone Stand",
      slug: "sheesham-headphone-stand",
      shortDesc: "An architectural wooden stand to display over-ear headphones.",
      description: "A dedicated resting place for premium headphones. Features a curved wooden resting cradle crafted from Sheesham wood supported by a solid brass rod and a heavy Sheesham base block.",
      price: 489900,
      material: "Solid Indian Rosewood (Sheesham), Solid Brass rod",
      dimensions: "6\" W × 5\" D × 11.5\" H (15 cm × 12.7 cm × 29 cm)",
      careGuide: "Wipe down with a dry cloth.",
      deliveryCost: 25000,
      featured: false,
      published: true,
      stock: 10,
      collectionSlug: "ambient",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
    },
  ];

  for (const prod of productsData) {
    const { collectionSlug, imageUrl, ...data } = prod;
    const collectionId = collectionsMap[collectionSlug];

    await prisma.product.create({
      data: {
        ...data,
        collectionId,
        images: {
          create: [
            {
              url: imageUrl,
              alt: `${prod.name} — conceptual view`,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  // 3. Seed default PageAsset values for CMS
  const defaultPageAssets = [
    {
      page: "home",
      slot: "hero_bg",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2400&q=80",
    },
    {
      page: "home",
      slot: "craft_image",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    },
    {
      page: "about",
      slot: "about_hero",
      imageUrl: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80",
    },
    {
      page: "about",
      slot: "about_craft",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    },
  ];

  await prisma.pageAsset.deleteMany();
  for (const asset of defaultPageAssets) {
    await prisma.pageAsset.create({
      data: asset,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
