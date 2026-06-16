import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const filePath = path.join(process.cwd(), "docs/journal_articles.md");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Journal articles file not found at ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const articleBlocks = fileContent.split(/## Article \d+/).slice(1);

  const articles = articleBlocks.map((block) => {
    const lines = block.split("\n");
    let title = "";
    let excerpt = "";
    const bodyLines: string[] = [];
    let isBody = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("* **Title**:")) {
        title = trimmed.replace("* **Title**:", "").trim();
      } else if (trimmed.startsWith("* **Excerpt**:")) {
        excerpt = trimmed.replace("* **Excerpt**:", "").trim();
      } else if (trimmed.startsWith("* **Body Content")) {
        isBody = true;
      } else if (isBody) {
        bodyLines.push(line);
      }
    }

    let bodyContent = bodyLines.join("\n").trim();
    if (bodyContent.endsWith("---")) {
      bodyContent = bodyContent.slice(0, -3).trim();
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      title,
      slug,
      excerpt,
      content: bodyContent,
      coverImageUrl: null,
      published: true,
      publishedAt: new Date(),
    };
  });

  // Reset only the JournalPost table to seed fresh articles
  await prisma.journalPost.deleteMany();

  let seededCount = 0;
  for (const article of articles) {
    if (!article.title) continue;
    await prisma.journalPost.create({
      data: article,
    });
    seededCount++;
  }

  console.log(`Successfully seeded ${seededCount} journal articles.`);
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
