import api from "../lib/api";
import type { dream } from "../sharedTypes/dream/dream.model";
import type { WorldConfig } from "../components/World/worldTypes";

interface apiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createDreamApi(prompt: string): Promise<apiEnvelope<dream>> {
  const response = await api.post<apiEnvelope<dream>>("/dreams", { prompt });
  return response.data;
}

export async function getDreamApi(id: string): Promise<apiEnvelope<dream>> {
  const response = await api.get<apiEnvelope<dream>>(`/dreams/${id}`);
  return response.data;
}

export async function listDreamsApi(): Promise<apiEnvelope<dream[]>> {
  const response = await api.get<apiEnvelope<dream[]>>("/dreams");
  return response.data;
}

export async function generateWorldApi(dreamId?: string, prompt?: string): Promise<apiEnvelope<WorldConfig>> {
  const response = await api.post<apiEnvelope<WorldConfig>>("/generate/world", { dreamId, prompt });
  return response.data;
}
