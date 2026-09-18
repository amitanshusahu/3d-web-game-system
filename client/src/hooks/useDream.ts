import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createDreamApi, generateWorldApi, getDreamApi } from "../api/dream";
import { getApiErrorMessage } from "../lib/api";
import type { WorldConfig } from "../components/World/worldTypes";

export const DREAM_QUERY_KEY = ["dreams"] as const;

export function useCreateDream() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (prompt: string) => createDreamApi(prompt),
    onSuccess: (response) => {
      void navigate({ to: "/chat/$chatid", params: { chatid: response.data.id } });
    },
  });
}

export function useDream(id: string) {
  return useQuery({
    queryKey: [...DREAM_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getDreamApi(id);
      return response.data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useGenerateWorld(dreamId?: string, prompt?: string) {
  return useQuery<WorldConfig>({
    queryKey: ["world", dreamId ?? prompt ?? "default"],
    queryFn: async () => {
      const response = await generateWorldApi(dreamId, prompt);
      return response.data as WorldConfig;
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function getDreamErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "Failed to create dream");
}
