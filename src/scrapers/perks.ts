import * as cheerio from "cheerio";
import { getWikiPageContent, WIKI_PAGE } from "../wiki.ts";
import { writeToFile } from "../writer.ts";

export interface Perk {
  name: string;
  description: string;
  imgUrl: string;
  role: string;
  origin: string;
}

export async function scrapePerks(): Promise<void> {
  const html = await getWikiPageContent(WIKI_PAGE.PERKS);
  const $ = cheerio.load(html);

  const perks: Perk[] = [];

  $('table.wikitable.overflowScroll.sortable').each((tableIndex, tableEl) => {
    const role = tableIndex === 0 ? "survivor" : "killer";
    
    $(tableEl).find('tbody tr').each((rowIndex, rowEl) => {
      const ths = $(rowEl).find('> th');
      const tds = $(rowEl).find('> td');
      
      if (ths.length >= 3 && tds.length === 1) {
        const imgTag = $(ths[0]).find('img');
        let imgUrl = imgTag.attr('src') || '';
        imgUrl = imgUrl.split('?')[0]; // Remove query params
        
        const name = $(ths[1]).text().trim();
        const description = $(tds[0]).text().trim().replace(/\n+/g, '\n');
        let origin = $(ths[2]).text().trim().replace(/^\./, '').trim();
        
        perks.push({
          name,
          description,
          imgUrl,
          role,
          origin
        });
      }
    });
  });

  const jsonContent = JSON.stringify(perks, null, 2);
  
  await writeToFile("perks.json", jsonContent);
}
