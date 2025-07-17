import { githubParser } from "./github.parser";
import { genericParser } from "./generic.parser";
import { instagramParser } from "./instagram.parser";
import { youtubeParser } from "./youtube.parser";
import { linkedInParser } from "./linkedInParser";

/**
 * Parses a given URL to extract and return relevant content details.
 * The function determines the appropriate parser to use based on the domain
 * of the URL, such as GitHub, Instagram, YouTube, or LinkedIn. If the domain
 * does not match any specific parser, a generic parser is used as a fallback.
 *
 * @param url The URL to parse.
 * @returns A promise that resolves to an object containing parsed content details,
 *          or null if parsing fails.
 */

export const parseUrl = async (url: string) => {
  if (url.includes("github.com")) {
    return githubParser(url);
  }

  if (url.includes("instagram.com")) {
    return instagramParser(url);
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return youtubeParser(url);
  }

  if (url.includes("linkedin.com")) {
    return linkedInParser(url);
  }

  return genericParser(url);
};
