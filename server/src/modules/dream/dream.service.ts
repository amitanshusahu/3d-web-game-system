import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n")[0]?.trim() ?? "";
  const cleaned = firstLine.replace(/^(i dream (of )?(a world )?|a world (where|with) )/i, "").trim();
  const source = cleaned.length > 0 ? cleaned : firstLine;
  return source.length > 60 ? `${source.slice(0, 57)}...` : source || "Untitled dream";
}

export async function createDream(userId: string, prompt: string) {
  const title = titleFromPrompt(prompt);

  return prisma.$transaction(async (tx) => {
    const dream = await tx.dream.create({
      data: { title, prompt },
    });

    await tx.userDream.create({
      data: { userId, dreamId: dream.id },
    });

    return dream;
  });
}

export async function getDreamForUser(userId: string, dreamId: string) {
  const link = await prisma.userDream.findFirst({
    where: { userId, dreamId },
    include: { dream: true },
  });

  if (!link) {
    throw new ApiError(404, "Dream not found");
  }

  return link.dream;
}

export async function listDreamsForUser(userId: string) {
  const links = await prisma.userDream.findMany({
    where: { userId },
    include: { dream: true },
    orderBy: { createdAt: "desc" },
  });

  return links.map((link) => link.dream);
}
