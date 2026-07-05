import fs from "node:fs";
import path from "node:path";
import { request } from "undici";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 \-_.]/g, "").trim();
}

export async function scrapeImages(): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  const files = [
    { file: "addons.json", category: "addon" },
    { file: "killers.json", category: "killer" },
    { file: "perks.json", category: "perk" },
    { file: "survivors.json", category: "survivor" },
  ];
  const baseUrl = "https://deadbydaylight.wiki.gg";

  interface ImageTask {
    url: string;
    targetPath: string;
  }

  const tasks: ImageTask[] = [];

  for (const { file, category } of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      try {
        const data = JSON.parse(content);
        for (const item of data) {
          if (item.imgUrl && item.name) {
            // Extract the extension from the original url
            const extMatch = item.imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
            const ext = extMatch ? `.${extMatch[1]}` : ".png";
            
            const cleanName = sanitizeFilename(item.name);
            const targetPath = path.join(dataDir, "images", category, `${cleanName}${ext}`);
            
            tasks.push({ url: item.imgUrl, targetPath });
          }
        }
      } catch (err) {
        console.error(`Error parsing ${file}:`, err);
      }
    }
  }

  console.log(`Found ${tasks.length} images to download.`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of tasks) {
    const targetDir = path.dirname(task.targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(task.targetPath)) {
      skipped++;
      continue;
    }

    const fullUrl = `${baseUrl}${task.url}`;

    try {
      const { body, statusCode } = await request(fullUrl, {
        headers: {
          "User-Agent": "Dead by Daylight Wiki Scraper (https://github.com/dbd-data)",
        },
      });

      if (statusCode === 200) {
        const arrayBuffer = await body.arrayBuffer();
        fs.writeFileSync(task.targetPath, Buffer.from(arrayBuffer));
        downloaded++;
      } else {
        console.error(`Failed to download ${fullUrl}: Status ${statusCode}`);
        failed++;
        // Consume body to avoid memory leak
        await body.text();
      }
    } catch (err) {
      console.error(`Error downloading ${fullUrl}:`, err);
      failed++;
    }
  }

  console.log(`Finished images. Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
}
