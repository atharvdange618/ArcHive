import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { parseUrl } from "src/parsers";
import { extractRelevantTags } from "./extractRelevantTags";

/**
 * Generates an array of tags for a given URL, prioritizing existing hashtags.
 * @param {string} url The URL to generate tags from.
 * @returns {Promise<string[]>} A promise that resolves to an array of tags.
 */
export async function generateTagsFromUrl(url: string): Promise<string[]> {
  let browser;
  try {
    // --- Generic parse block ---
    const genericParsed = await parseUrl(url);
    if (
      genericParsed &&
      genericParsed.description &&
      genericParsed.description !== "No description found."
    ) {
      return extractRelevantTags(genericParsed.description);
    }
    // --- Puppeteer fallback ---

    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.content();
    const $ = cheerio.load(html);

    const articleText =
      $("article.content div.text").text() ||
      $("article").text() ||
      $(".article-content").text() ||
      $(".entry-content").text() ||
      $(".post-content").text();
    if (articleText) {
      return extractRelevantTags(articleText);
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article && article.textContent) {
      return extractRelevantTags(article.textContent);
    }

    const bodyText = $("body").text();
    if (bodyText) {
      return extractRelevantTags(bodyText);
    }

    return [];
  } catch (error) {
    console.error(`Failed to generate tags from ${url}:`, error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
