import fs from "node:fs";
import path from "node:path";

export async function writeToFile(
  filePath: string,
  content: string,
): Promise<void> {
  const fullPath = path.join("data", filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    await fs.promises.writeFile(fullPath, content);
    console.log(`Successfully wrote to file ${fullPath}`);
  } catch (err) {
    console.error(`Error writing to file ${fullPath}:`, err);
  }
}
