// @ts-nocheck
// src/components/chat/ChatMsg.tsx
import MessageBubble from "./MessageBubble";
import type { Message } from "../../pages/Chat/Chat";

import FinanceChartView from "../finance/FinanceChart";
import FinanceTable from "../../utils/FinanceTable";

import AinaScore from "../AinaScore/AinaScore";
type Props = {
  messages: Message[];
  loading: boolean;
  moduleName?: string;
  onPreview: (title: string) => void;
  onEditMessage: (messageIndex: number, newText: string) => void;
  onRetryMessage: (messageIndex: number) => void;
  onShareMessage: () => void;
  onOpenVisionEdit: (messageIndex: number) => void;
};

export default function ChatMsg({
  messages,
  loading,
  moduleName,
  onPreview,
  onEditMessage,
  onRetryMessage,
  onShareMessage,
  onOpenVisionEdit,
}: Props) {
  return (
    <div
      key="messages"
      className="flex-1 mx-auto flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl px-3 sm:px-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 shadow-lg border border-gray-200/30 dark:border-gray-700/30 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 dark:scrollbar-thumb-indigo-600 dark:hover:scrollbar-thumb-indigo-500">
      {messages.map((msg, i) => (
        <div key={i} className="w-full flex flex-col">
          <MessageBubble
            msg={msg}
            onPreview={onPreview}
            onEdit={(newText) => onEditMessage(i, newText)}
            onRetry={!msg.isUser ? () => onRetryMessage(i) : undefined}
            onShare={!msg.isUser ? onShareMessage : undefined}
            onOpenVisionEdit={() => onOpenVisionEdit(i)}
          />
           {!msg.isUser &&
            msg.rows &&
            msg.rows.length > 0 &&
            msg.agent === "finance" && (
              <FinanceTable data={msg.rows} />
            )}
          
{msg.agent === "dev" && <AinaScore content={msg.text} />}
          {/* Graphique Aïna Finance */}
          {!msg.isUser && msg.chart && msg.chart.type !== "none" && (
            <FinanceChartView chart={msg.chart} />
          )}

         
        </div>
      ))}
      {loading && (
        <div className="flex justify-start items-center gap-2 mt-2 ml-8 sm:ml-12 w-full max-w-4xl">
          <img
            src="/logo-blue.png"
            alt="Aïna"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
          />
          <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 max-w-[280px] sm:max-w-[300px] animate-pulse border border-gray-200/50 dark:border-gray-700/50">
{moduleName === "Aïna Coder" ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                <span className="text-sm sm:text-base">Analyse en cours par l\'agent...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Génération...</span>
            )}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
