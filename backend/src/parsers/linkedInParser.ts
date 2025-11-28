import { genericParser } from "./generic.parser";

export const linkedInParser = async (url: string) => {
  return genericParser(url, {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });
};
