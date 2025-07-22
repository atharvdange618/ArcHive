import { useLinkingURL } from "expo-linking";
import { useEffect, useState } from "react";
import { useShareIntent } from "expo-share-intent";

export function useIncomingLinkHandler() {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const deepLinkUrl = useLinkingURL();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (deepLinkUrl) {
      const decodedUrl = decodeURIComponent(
        deepLinkUrl.replace("archive://", "")
      );
      setPendingUrl(decodedUrl);
    }
  }, [deepLinkUrl]);

  useEffect(() => {
    if (hasShareIntent) {
      if (shareIntent.webUrl) {
        setPendingUrl(shareIntent.webUrl);
      } else if (shareIntent.text) {
        setPendingUrl(shareIntent.text);
      }
      resetShareIntent();
    }
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  const clearPendingUrl = () => {
    setPendingUrl(null);
  };

  return { pendingUrl, clearPendingUrl };
}
