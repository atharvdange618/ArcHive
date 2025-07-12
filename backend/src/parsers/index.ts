import { githubParser } from "./github.parser";
import { genericParser } from "./generic.parser";
import { instagramParser } from "./instagram.parser";
import { youtubeParser } from "./youtube.parser";

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

  return genericParser(url);
};
