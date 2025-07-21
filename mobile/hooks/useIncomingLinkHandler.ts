import { useLinkingURL } from "expo-linking";
import { useEffect, useState } from "react";
import ReceiveSharingIntent from "react-native-receive-sharing-intent";

export function useIncomingLinkHandler() {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const deepLinkUrl = useLinkingURL();

  useEffect(() => {
    if (deepLinkUrl) {
      console.log("Deep link received:", deepLinkUrl);
      const decodedUrl = decodeURIComponent(
        deepLinkUrl.replace("archive://", "")
      );
      setPendingUrl(decodedUrl);
    }
  }, [deepLinkUrl]);

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      (files: { text?: string }[]) => {
        if (files && files.length > 0 && files[0].text) {
          console.log("Share intent received:", files[0].text);
          setPendingUrl(files[0].text);
        }
      },
      (error: any) => {
        console.error("Share intent error:", error);
      },
      "ArcHiveShare"
    );

    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
    };
  }, []);

  const clearPendingUrl = () => {
    setPendingUrl(null);
  };

  return { pendingUrl, clearPendingUrl };
}
