import { z } from "zod";

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: "Refresh token is required",
    })
    .nonempty("Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
