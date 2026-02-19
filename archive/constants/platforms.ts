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
 * Maps platform identifiers to Ionicons icon names
 */
export const getPlatformIcon = (platform: string): string => {
  const platformLower = platform.toLowerCase();

  const iconMap: Record<string, string> = {
    github: "logo-github",
    youtube: "logo-youtube",
    twitter: "logo-twitter",
    instagram: "logo-instagram",
    linkedin: "logo-linkedin",
    reddit: "logo-reddit",
    medium: "logo-medium",
    stackoverflow: "logo-stackoverflow",
    facebook: "logo-facebook",
    tiktok: "logo-tiktok",
    twitch: "logo-twitch",
    pinterest: "logo-pinterest",
    vimeo: "logo-vimeo",
    discord: "logo-discord",
    telegram: "paper-plane-outline",
  };

  return iconMap[platformLower] || "globe-outline";
};

/**
 * Maps platform identifiers to brand colors
 */
export const getPlatformColor = (platform: string): string => {
  const platformLower = platform.toLowerCase();

  const colorMap: Record<string, string> = {
    github: "#181717",
    youtube: "#FF0000",
    twitter: "#1DA1F2",
    instagram: "#E4405F",
    linkedin: "#0A66C2",
    reddit: "#FF4500",
    medium: "#000000",
    stackoverflow: "#F58025",
    facebook: "#1877F2",
    tiktok: "#000000",
    twitch: "#9146FF",
    pinterest: "#E60023",
    vimeo: "#1AB7EA",
    discord: "#5865F2",
    telegram: "#26A5E4",
  };

  return colorMap[platformLower] || "#666666";
};

/**
 * Gets display name for platform
 */
export const getPlatformDisplayName = (platform: string): string => {
  const platformLower = platform.toLowerCase();

  const nameMap: Record<string, string> = {
    github: "GitHub",
    youtube: "YouTube",
    twitter: "Twitter/X",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    reddit: "Reddit",
    medium: "Medium",
    stackoverflow: "Stack Overflow",
    facebook: "Facebook",
    tiktok: "TikTok",
    twitch: "Twitch",
    pinterest: "Pinterest",
    vimeo: "Vimeo",
    discord: "Discord",
    telegram: "Telegram",
  };

  return nameMap[platformLower] || formatDomain(platform);
};

/**
 * Formats a domain name for display
 */
const formatDomain = (domain: string): string => {
  const cleaned = domain.replace(/\.(com|org|net|io)$/, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};
