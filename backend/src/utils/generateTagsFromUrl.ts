import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Page } from "puppeteer";
import { parseUrl } from "src/parsers";
import { ServiceUnavailableError, AppError } from "./errors";
import { browserManager } from "./browserManager";
import { extractRelevantTags } from "./extractRelevantTags";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

/**
 * Fetches and parses the content of a URL with retry logic.
 * @param {Page} page The Puppeteer page instance.
 * @param {string} url The URL to fetch.
 * @returns {Promise<string>} The HTML content of the page.
 * @throws {ServiceUnavailableError} If fetching fails after all retries.
 */

async function fetchWithRetry(page: Page, url: string): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000, // 30-seconds timeout
      });
      return await page.content();
    } catch (error) {
      if (i === MAX_RETRIES - 1) {
        throw new ServiceUnavailableError(
          `Failed to fetch ${url} after ${MAX_RETRIES} attempts.`,
          { error }
        );
      }
      const backoff = INITIAL_BACKOFF * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw new ServiceUnavailableError(`Failed to fetch ${url}.`);
}

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
      genericParsed.description !== ""
    ) {
      return extractRelevantTags(genericParsed.description);
    }

    // --- Puppeteer fallback ---
    const browser = await browserManager.getBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    try {
      const html = await fetchWithRetry(page, url);
      const $ = cheerio.load(html);

      // Priority to OpenGraph and meta tags
      const metaKeywords = $('meta[name="keywords"]').attr("content");
      if (metaKeywords) {
        return extractRelevantTags(metaKeywords);
      }

      const ogDescription = $('meta[property="og:description"]').attr(
        "content"
      );
      if (ogDescription) {
        return extractRelevantTags(ogDescription);
      }

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
    } finally {
      await page.close();
    }
  } catch (error) {
    console.error(`Failed to generate tags from ${url}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      500,
      `An unexpected error occurred while generating tags for ${url}.`
    );
  }
}
