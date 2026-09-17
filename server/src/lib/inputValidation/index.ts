import type { ZodSchema } from "zod";
import z from "zod";

export async function validateInput<T extends ZodSchema>(schema: T): Promise<z.infer<T>> {
  const data = await schema.parseAsync(schema);
  if (!data) {
    throw new Error("Invalid input");
  }
  return data;
}