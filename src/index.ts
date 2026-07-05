import { scrapeKillers } from "./scrapers/killers.ts";
import { scrapeSurvivors } from "./scrapers/survivors.ts";
import { scrapePerks } from "./scrapers/perks.ts";
import { scrapeAddons } from "./scrapers/addons.ts";
import { scrapeImages } from "./scrapers/images.ts";
import { scrapeVersion } from "./scrapers/version.ts";

async function main() {
  await scrapeVersion();

  console.log("Starting to scrape killers...");
  await scrapeKillers();
  console.log("Finished scraping killers.");

  console.log("Starting to scrape survivors...");
  await scrapeSurvivors();
  console.log("Finished scraping survivors.");

  console.log("Starting to scrape perks...");
  await scrapePerks();
  console.log("Finished scraping perks.");

  console.log("Starting to scrape addons...");
  await scrapeAddons();
  console.log("Finished scraping addons.");

  console.log("Starting to scrape images...");
  await scrapeImages();
  console.log("Finished scraping images.");
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
