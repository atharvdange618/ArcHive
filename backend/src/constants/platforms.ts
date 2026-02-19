export const PLATFORMS = {
  GITHUB: "github",
  YOUTUBE: "youtube",
  TWITTER: "twitter",
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  REDDIT: "reddit",
  MEDIUM: "medium",
  STACKOVERFLOW: "stackoverflow",
  FACEBOOK: "facebook",
  TIKTOK: "tiktok",
  TWITCH: "twitch",
  PINTEREST: "pinterest",
  VIMEO: "vimeo",
  DISCORD: "discord",
  TELEGRAM: "telegram",
  OTHER: "other",
} as const;

export type Platform = (typeof PLATFORMS)[keyof typeof PLATFORMS];

/**
 * Extracts platform identifier from URL
 * Returns platform constant for known platforms, or domain-based identifier for unknown ones
 */
export const extractPlatformFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const domain = hostname.replace(/^www\./, "");

    if (domain.includes("github.com")) return PLATFORMS.GITHUB;
    if (domain.includes("youtube.com") || domain.includes("youtu.be"))
      return PLATFORMS.YOUTUBE;
    if (domain.includes("twitter.com") || domain.includes("x.com"))
      return PLATFORMS.TWITTER;
    if (domain.includes("instagram.com")) return PLATFORMS.INSTAGRAM;
    if (domain.includes("linkedin.com")) return PLATFORMS.LINKEDIN;
    if (domain.includes("reddit.com")) return PLATFORMS.REDDIT;
    if (domain.includes("medium.com")) return PLATFORMS.MEDIUM;
    if (
      domain.includes("stackoverflow.com") ||
      domain.includes("stackexchange.com")
    )
      return PLATFORMS.STACKOVERFLOW;
    if (domain.includes("facebook.com") || domain.includes("fb.com"))
      return PLATFORMS.FACEBOOK;
    if (domain.includes("tiktok.com")) return PLATFORMS.TIKTOK;
    if (domain.includes("twitch.tv")) return PLATFORMS.TWITCH;
    if (domain.includes("pinterest.com")) return PLATFORMS.PINTEREST;
    if (domain.includes("vimeo.com")) return PLATFORMS.VIMEO;
    if (domain.includes("discord.com") || domain.includes("discord.gg"))
      return PLATFORMS.DISCORD;
    if (domain.includes("t.me") || domain.includes("telegram.org"))
      return PLATFORMS.TELEGRAM;

    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts.slice(-2).join(".");
    }

    return domain || PLATFORMS.OTHER;
  } catch (error) {
    return PLATFORMS.OTHER;
  }
};
