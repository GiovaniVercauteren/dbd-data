import * as cheerio from "cheerio";
import { getWikiPageContent, WIKI_PAGE } from "../wiki.ts";
import { writeToFile } from "../writer.ts";

export interface Survivor {
  name: string;
  imgUrl: string;
}

export async function scrapeSurvivors(): Promise<void> {
  const html = await getWikiPageContent(WIKI_PAGE.SURVIVORS);
  const $ = cheerio.load(html);

  const survivors: Survivor[] = [];

  $('div[style*="display: inline-flex; flex-direction: column; text-align:center; margin-bottom: 35px;"]').each((i, el) => {
    const aTag = $(el).children('a').first();
    const name = aTag.text().trim();
    
    const imgTag = $(el).find('.charPortraitImage img');
    let imgUrl = imgTag.attr('src') || '';
    imgUrl = imgUrl.split('?')[0]; // Remove query params
    
    survivors.push({
      name,
      imgUrl
    });
  });

  const jsonContent = JSON.stringify(survivors, null, 2);
  
  await writeToFile("survivors.json", jsonContent);
}
