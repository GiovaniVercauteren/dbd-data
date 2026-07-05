import * as cheerio from "cheerio";
import { getWikiPageContent, WIKI_PAGE } from "../wiki.ts";
import { writeToFile } from "../writer.ts";

export interface Addon {
  name: string;
  description: string;
  imgUrl: string;
  role: string;
  itemOrPowerName: string;
  rarity: string;
}

function getRarityFromClasses(classes: string): string {
  const classArray = classes.split(' ');
  for (const c of classArray) {
    if (c === 'common-item-element') return 'Common';
    if (c === 'uncommon-item-element') return 'Uncommon';
    if (c === 'rare-item-element') return 'Rare';
    if (c === 'very-rare-item-element') return 'Very Rare';
    if (c === 'ultra-rare-item-element') return 'Ultra Rare';
    if (c === 'event-item-element') return 'Event';
    if (c === 'visceral-item-element') return 'Visceral';
    if (c === 'unused-item-element') return 'Unused';
  }
  return 'Unknown';
}

export async function scrapeAddons(): Promise<void> {
  const html = await getWikiPageContent(WIKI_PAGE.ADDONS);
  const $ = cheerio.load(html);

  const addons: Addon[] = [];

  const tabbers = $('.tabber');
  
  tabbers.each((tabberIndex, tabberEl) => {
    let role = "unknown";
    if (tabberIndex === 0) role = "killer";
    else if (tabberIndex === 1) role = "survivor";
    
    $(tabberEl).find('article').each((articleIndex, articleEl) => {
      const itemOrPowerName = $(articleEl).find('h3').text().trim();
      
      $(articleEl).find('table.wikitable.overflowScroll tbody tr').each((rowIndex, rowEl) => {
        const ths = $(rowEl).find('> th');
        const tds = $(rowEl).find('> td');
        
        if (ths.length >= 2 && tds.length === 1) {
          const bgDiv = $(ths[0]).find('.game-element-bg-settings');
          const rarity = getRarityFromClasses(bgDiv.attr('class') || '');

          const imgTag = $(ths[0]).find('img');
          let imgUrl = imgTag.attr('src') || '';
          imgUrl = imgUrl.split('?')[0]; // Remove query params
          
          const name = $(ths[1]).text().trim();
          const description = $(tds[0]).text().trim().replace(/\n+/g, '\n');
          
          if (name) {
            addons.push({
              name,
              description,
              imgUrl,
              role,
              itemOrPowerName,
              rarity
            });
          }
        }
      });
    });
  });

  const jsonContent = JSON.stringify(addons, null, 2);
  
  await writeToFile("addons.json", jsonContent);
}
