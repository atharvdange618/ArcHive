import natural from "natural";

const customJunkWords = new Set([
  "http",
  "https",
  "www",
  "com",
  "net",
  "org",
  "html",
  "php",
  "www2",
  "www3",
  "click",
  "link",
  "page",
  "read",
  "follow",
  "subscribe",
  "login",
  "share",
  "view",
  "youtube",
  "video",
  "watch",
  "channel",
  "site",
  "cookie",
  "policy",
  "accept",
  "decline",
  "terms",
  "privacy",
]);

const tokenizer = new natural.WordTokenizer();
const stopWords = new Set(natural.stopwords);

export function extractRelevantTags(text: string, maxTags = 10): string[] {
  const hashtags =
    text.match(/#\w+/g)?.map((tag) => tag.substring(1).toLowerCase()) || [];

  const tokens = tokenizer.tokenize(text.toLowerCase());
  const keywordCounts = new Map<string, number>();

  for (const token of tokens) {
    const clean = token.replace(/[^a-z0-9]/gi, "");

    if (
      clean.length > 2 &&
      !stopWords.has(clean) &&
      !customJunkWords.has(clean) &&
      !hashtags.includes(clean) &&
      !/^\d+$/.test(clean)
    ) {
      keywordCounts.set(clean, (keywordCounts.get(clean) || 0) + 1);
    }
  }

  const sortedKeywords = [...keywordCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const keywords = sortedKeywords
    .slice(0, maxTags - hashtags.length)
    .map((entry) => entry[0]);

  return [...new Set([...hashtags, ...keywords])];
}
