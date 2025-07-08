import { githubParser } from "./github.parser";
import { genericParser } from "./generic.parser";
import { instagramParser } from "./instagram.parser";

export const parseUrl = async (url: string) => {
  if (url.includes("github.com")) {
    return githubParser(url);
  }

  if (url.includes("instagram.com")) {
    return instagramParser(url);
  }

  return genericParser(url);
};
