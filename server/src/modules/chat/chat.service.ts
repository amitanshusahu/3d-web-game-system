import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import dummyWorld from "./dummyWorld";

export function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n")[0]?.trim() ?? "";
  const cleaned = firstLine.replace(/^(i dream (of )?(a world )?|a world (where|with) )/i, "").trim();
  const source = cleaned.length > 0 ? cleaned : firstLine;
  return source.length > 60 ? `${source.slice(0, 57)}...` : source || "Untitled dream";
}

export async function createChat(userId: string, message: string) {
  const title = titleFromPrompt(message);

  const chat = await prisma.userChat.create({
    data: {
      title,
      userId,
      userChatHistories: {
        create: [{ message, response: dummyWorld }],
      },
    },
    include: { userChatHistories: { orderBy: { createdAt: "asc" } } },
  });

  return chat;
}

export async function appendMessage(userId: string, chatId: string, message: string) {
  const chat = await prisma.userChat.findFirst({
    where: { id: chatId, userId },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  return prisma.userChatHistory.create({
    data: { userChatId: chatId, message, response: dummyWorld },
  });
}

export async function getChatForUser(userId: string, chatId: string) {
  const chat = await prisma.userChat.findFirst({
    where: { id: chatId, userId },
    include: {
      userChatHistories: { orderBy: { createdAt: "asc" } },
      dream: true,
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  return chat;
}

export async function listChatsForUser(userId: string) {
  return prisma.userChat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
