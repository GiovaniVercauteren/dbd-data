import { writeToFile } from "../writer.ts";

// Replace with the actual URL to the wiki's api.php
const API_URL = "https://deadbydaylight.wiki.gg/api.php";
const MODULE_NAME = "API"; // Replace with your module's name

interface ExpandTemplatesResponse {
    expandtemplates?: {
        wikitext?: string;
    };
}

export async function scrapeVersion(): Promise<void> {
    // We use URLSearchParams to safely encode the curly braces in the wikitext
    const params = new URLSearchParams({
        action: "expandtemplates",
        text: `{{#invoke:${MODULE_NAME}|latestPatchVersion}}`,
        prop: "wikitext",
        format: "json",
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as ExpandTemplatesResponse;

        // Extract the parsed wikitext string from the JSON response
        const versionString = data.expandtemplates?.wikitext;

        if (versionString) {
            await writeToFile("version.json", JSON.stringify({ version: versionString, date: new Date() }, null, 2));
        }
    } catch (error) {
        console.error("Failed to fetch the patch version:", error);
    }
}
