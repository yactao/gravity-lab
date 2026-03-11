// src/service/vetFinanceService.ts
import { callApi } from "./apiService";

export type ChartType =
  | "bar"
  | "horizontal_bar"
  | "line"
  | "pie"
  | "bubble"
  | "none";

export interface ChartPoint {
  x: string;
  y: number;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
}

export interface FinanceChart {
  type: ChartType;
  title?: string;
  x_label?: string;
  y_label?: string;
  series: ChartSeries[];
}

export interface VetFinanceApiResponse {
  answer: string;
  chart?: FinanceChart;
  rows?: Record<string, any>[];
  conversation_id?: string;
}

export const askVetFinanceQuestion = async (
  question: string,
  _topN: number = 10,
  conversationId?: string
): Promise<VetFinanceApiResponse> => {
  const payload = {
    question,
    conversation_id: conversationId,
  };

  const res = await callApi<never>("/api/vet/finance", payload);
  return res as unknown as VetFinanceApiResponse;
};
