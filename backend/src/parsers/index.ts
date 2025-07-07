import { githubParser } from "./github.parser";
import { genericParser } from "./generic.parser";

export const parseUrl = async (url: string) => {
  if (url.includes("github.com")) {
    return githubParser(url);
  }

  return genericParser(url);
};
