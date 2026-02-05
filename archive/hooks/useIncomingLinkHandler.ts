import { useLinkingURL } from "expo-linking";
import { useEffect } from "react";
import { useShareIntent } from "expo-share-intent";
import useAuthStore from "../stores/authStore";

export function useIncomingLinkHandler() {
  const { pendingUrl, setPendingUrl } = useAuthStore();

  const deepLinkUrl = useLinkingURL();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (deepLinkUrl) {
      const decodedUrl = decodeURIComponent(
        deepLinkUrl.replace("archive://", ""),
      );
      setPendingUrl(decodedUrl);
    }
  }, [deepLinkUrl, setPendingUrl]);

  useEffect(() => {
    if (hasShareIntent) {
      if (shareIntent.webUrl) {
        setPendingUrl(shareIntent.webUrl);
      } else if (shareIntent.text) {
        setPendingUrl(shareIntent.text);
      }
    }
  }, [hasShareIntent, shareIntent, setPendingUrl]);

  const clearPendingUrl = () => {
    setPendingUrl(null);
    if (hasShareIntent) {
      resetShareIntent();
    }
  };

  return { pendingUrl, clearPendingUrl };
}
