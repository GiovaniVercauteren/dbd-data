import * as cheerio from "cheerio";
import { getWikiPageContent, WIKI_PAGE } from "../wiki.ts";
import { writeToFile } from "../writer.ts";

export interface Killer {
  name: string;
  realName: string;
  imgUrl: string;
  power: string;
}

export async function scrapeKillers(): Promise<void> {
  const html = await getWikiPageContent(WIKI_PAGE.KILLERS);
  const $ = cheerio.load(html);

  const killersMap = new Map<string, Killer>();

  // Extract killers (real name, name, image url)
  $('div[style*="display: inline-flex; flex-direction: column; text-align:center; margin-bottom: 35px;"]').each((i, el) => {
    const aTag = $(el).children('a').first();
    const realName = aTag.text().trim();

    // The name is a text node right after the aTag
    const textNodes = $(el).contents().filter(function () {
      return this.type === 'text' && $(this).text().trim() !== '';
    });
    const name = textNodes.first().text().trim();

    const imgTag = $(el).find('.charPortraitImage img');
    let imgUrl = imgTag.attr('src') || '';
    imgUrl = imgUrl.split('?')[0]; // Remove query params

    killersMap.set(name, {
      name: name,
      realName,
      imgUrl,
      power: ''
    });
  });

  // Extract powers
  // In the <th> cells, there is the power link, image, and the killer name link.
  $('th > div[style*="flex:1; max-width:200px; text-align:center;"]').each((i, el) => {
    const aTags = $(el).find('> a');
    const killerName = aTags.last().text().trim();

    const powerName = $(el).find('div > a').first().text().trim();

    if (killersMap.has(killerName)) {
      killersMap.get(killerName)!.power = powerName;
    }
  });

  const killersArray = Array.from(killersMap.values());
  const jsonContent = JSON.stringify(killersArray, null, 2);

  await writeToFile("killers.json", jsonContent);
}