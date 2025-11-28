import axios from "axios";
import * as cheerio from "cheerio";

export const genericParser = async (url: string, headers?: any) => {
  const response = await axios.get(url, { headers });
  const html = response.data;
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") || $("title").text();
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content");
  const previewImageUrl = $('meta[property="og:image"]').attr("content");

  return {
    type: "link",
    title: title.trim(),
    description: description ? description.trim() : "",
    url: url,
    previewImageUrl: previewImageUrl || "",
  };
};
