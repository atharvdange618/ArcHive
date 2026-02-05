import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContent } from "../apis/deleteContent";

export const useDeleteContent = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => deleteContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
};
