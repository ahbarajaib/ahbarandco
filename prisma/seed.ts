import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const shelfImages = [
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
];

const chairImages = [
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
];

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

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();

  const floatingShelves = await prisma.collection.create({
    data: {
      name: "Floating Shelves",
      slug: "floating-shelves",
      description: "Handcrafted wall-mounted shelves in solid walnut.",
      imageUrl: shelfImages[0],
      published: true,
      sortOrder: 1,
    },
  });

  const loungeChairs = await prisma.collection.create({
    data: {
      name: "Lounge Chairs",
      slug: "lounge-chairs",
      description: "Comfortable lounge chairs with solid wood frames.",
      imageUrl: chairImages[0],
      published: true,
      sortOrder: 2,
    },
  });

  const products = [
    {
      name: "Walnut Floating Shelf — 36\"",
      slug: "walnut-floating-shelf-36",
      shortDesc:
        "A 36-inch floating shelf in solid walnut with invisible mounting hardware.",
      description:
        "Handcrafted from a single piece of American walnut, this floating shelf brings warmth and utility to any wall. Finished with a natural oil that highlights the wood grain.",
      price: 849900,
      compareAtPrice: 999900,
      material: "Solid American Walnut",
      dimensions: '36" W × 8" D × 2" H',
      careGuide:
        "Dust with a soft cloth. Avoid direct sunlight and excessive moisture. Re-oil annually if desired.",
      stock: 12,
      featured: true,
      published: true,
      collectionId: floatingShelves.id,
      images: shelfImages,
    },
    {
      name: "Walnut Floating Shelf — 48\"",
      slug: "walnut-floating-shelf-48",
      shortDesc:
        "A 48-inch floating shelf for books, objects, and curated displays.",
      description:
        "Our largest floating shelf offers generous display space while maintaining a minimal profile. Each shelf is sanded by hand and finished in our workshop.",
      price: 1099900,
      material: "Solid American Walnut",
      dimensions: '48" W × 8" D × 2" H',
      careGuide: "Dust with a soft cloth. Avoid direct sunlight and excessive moisture.",
      stock: 8,
      featured: true,
      published: true,
      collectionId: floatingShelves.id,
      images: shelfImages,
    },
    {
      name: "Oak Lounge Chair",
      slug: "oak-lounge-chair",
      shortDesc:
        "A low-profile lounge chair with a solid oak frame and linen upholstery.",
      description:
        "Designed for reading and relaxation, this lounge chair pairs a sculpted oak frame with breathable natural linen. Built with traditional joinery for lasting durability.",
      price: 2499900,
      compareAtPrice: 2999900,
      material: "Solid Oak, Natural Linen",
      dimensions: '28" W × 32" D × 30" H',
      careGuide: "Vacuum upholstery regularly. Wipe wood with a dry cloth.",
      stock: 5,
      featured: true,
      published: true,
      collectionId: loungeChairs.id,
      images: chairImages,
    },
    {
      name: "Walnut Lounge Chair",
      slug: "walnut-lounge-chair",
      shortDesc:
        "A sculptural lounge chair in walnut with leather seat cushioning.",
      description:
        "This lounge chair showcases the rich tones of walnut with a comfortable leather seat. Each chair is assembled and finished by hand in our workshop.",
      price: 2899900,
      material: "Solid Walnut, Vegetable-tanned Leather",
      dimensions: '30" W × 33" D × 31" H',
      careGuide: "Condition leather twice yearly. Dust wood with a soft cloth.",
      stock: 4,
      featured: false,
      published: true,
      collectionId: loungeChairs.id,
      images: chairImages,
    },
  ];

  for (const product of products) {
    const { images, ...data } = product;
    await prisma.product.create({
      data: {
        ...data,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: `${product.name} — view ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
    });
  }

  // Seed default PageAsset values for CMS
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
