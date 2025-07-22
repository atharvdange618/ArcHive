import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContent } from "../apis/deleteContent";

export const useDeleteContent = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => deleteContent(contentId),
    onSuccess: () => {
      // Invalidate and refetch the content list query
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
};
