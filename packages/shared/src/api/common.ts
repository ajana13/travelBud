import { z } from "zod";

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export function ApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.union([
    z.object({ data: dataSchema, error: z.null() }),
    z.object({ data: z.null(), error: ApiErrorSchema }),
  ]);
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };
