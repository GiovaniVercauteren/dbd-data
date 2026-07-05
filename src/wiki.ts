import { request } from "undici";

export const DBD_WIKI_URL: string = "https://deadbydaylight.wiki.gg/wiki/";

export const WIKI_PAGE = {
  KILLERS: "Killers",
  SURVIVORS: "Survivors",
  PERKS: "Perks",
  ADDONS: "Add-ons",
} as const;

export type WIKI_PAGE = (typeof WIKI_PAGE)[keyof typeof WIKI_PAGE];

export async function getWikiPageContent(pageName: WIKI_PAGE): Promise<string> {
  const url = `${DBD_WIKI_URL}${pageName}`;

  const { body } = await request(url, {
    headers: {
      "User-Agent":
        "Dead by Daylight Wiki Scraper (https://github.com/dbd-data)",
    },
  });
  const html = await body.text();

  return html;
}
