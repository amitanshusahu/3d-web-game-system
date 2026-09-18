import z from "zod";

export const createDreamSchema = z.object({
  prompt: z.string().trim().min(1, "Dream prompt is required").max(2000),
});

export const dreamIdParamSchema = z.object({
  id: z.string().min(1),
});

export const generateWorldSchema = z.object({
  dreamId: z.string().min(1).optional(),
  prompt: z.string().trim().max(2000).optional(),
});

export const dreamSchema = z.object({
  id: z.string(),
  title: z.string(),
  prompt: z.string(),
  likes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type createDreamParams = z.infer<typeof createDreamSchema>;
export type dreamIdParams = z.infer<typeof dreamIdParamSchema>;
export type generateWorldParams = z.infer<typeof generateWorldSchema>;
export type dream = z.infer<typeof dreamSchema>;
