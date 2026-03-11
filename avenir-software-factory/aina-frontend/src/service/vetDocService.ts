// src/service/vetDocService.ts
import { callApi } from "./apiService";

export const askVetDocQuestion = async (
  question: string,
  top_k: number = 3,
  conversationId?: string,
  filters?: Record<string, any>,
) => {
  return callApi("/api/vet-doc", {
    question,
    top_k,
    filters: filters || {},
    conversation_id: conversationId,
  });
};
