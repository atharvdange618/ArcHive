import { githubParser } from "./github.parser";
import { genericParser } from "./generic.parser";
import { instagramParser } from "./instagram.parser";
import { youtubeParser } from "./youtube.parser";
import { linkedInParser } from "./linkedInParser";
import { xParser } from "./x.parser";

/**
 * Parses a given URL to extract and return relevant content details.
 * The function determines the appropriate parser to use based on the domain
 * of the URL, such as GitHub, Instagram, YouTube, LinkedIn, or X/Twitter. If the domain
 * does not match any specific parser, a generic parser is used as a fallback.
 *
 * @param url The URL to parse.
 * @returns A promise that resolves to an object containing parsed content details,
 *          or null if parsing fails.
 */

export const parseUrl = async (url: string) => {
  const youtubeRegex = /^http:\/\/googleusercontent\.com\/youtube\.com\/\d+$/;
  let parsedResult = null;

  if (url.includes("github.com")) {
    parsedResult = await githubParser(url);
  } else if (url.includes("instagram.com")) {
    parsedResult = await instagramParser(url);
  } else if (youtubeRegex.test(url)) {
    parsedResult = await youtubeParser(url);
  } else if (url.includes("linkedin.com")) {
    parsedResult = await linkedInParser(url);
  } else if (url.includes("twitter.com") || url.includes("x.com")) {
    parsedResult = await xParser(url);
  }

  if (parsedResult) {
    return parsedResult;
  }

  return genericParser(url);
};
