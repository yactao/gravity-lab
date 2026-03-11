// src/components/tools/EmailTool.tsx
import { useState } from "react";
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../service/authConfig";
import { askEmailQuestion, downloadEmailAttachment } from "../../service/emailService";
import type { EmailResponse, EmailItem } from "../../service/emailService";

interface EmailToolProps {
  isOpen: boolean;
  onToggle: () => void;
}

/* ========================= Helpers ========================= */

const fmtPeople = (list?: { address: string; name?: string }[]) => {
  if (!list || list.length === 0) return "-";
  return list
    .map((p) => (p.name ? `${p.name} <${p.address}>` : p.address))
    .join(", ");
};

const fmtFrom = (p?: { address: string; name?: string }) => {
  if (!p?.address) return "-";
  return p.name ? `${p.name} <${p.address}>` : p.address;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "-";

  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ========================= Component ========================= */

export default function EmailTool({ isOpen, onToggle }: EmailToolProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<EmailResponse | null>(null);
  const { instance, accounts } = useMsal();

  const handleEmailQuery = async (preset?: string) => {
    const query = (preset ?? question).trim();
    if (!query) return;
    setQuestion(query);
    setLoading(true);
    setResponse(null);
    try {
      setResponse(await askEmailQuestion(query));
    } catch {
      setResponse({ answer: "Erreur lors de l'accès aux emails." });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Afficher mes emails non lus",
    "Résumer mes emails d'aujourd'hui",
    "Emails de la semaine dernière",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className="fixed left-4 bottom-24 z-[38] p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg shadow-purple-500/30">
        <EnvelopeIcon className="w-5 h-5" />
      </button>
      <>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              onClick={onToggle}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45]" />

            {/* Panel */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed left-0 top-0 h-full w-96 z-[46] flex flex-col
                         bg-white/95 dark:bg-gray-900/95
                         border-r border-gray-200 dark:border-gray-700
                         shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700
                              bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50
                              dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600
                                    flex items-center justify-center shadow-md">
                      <EnvelopeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Aïna Email
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Assistant d'emails intelligent
                      </p>
                    </div>
                  </div>
                  <button onClick={onToggle}>
                    <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/60 dark:bg-gray-800/50">
                {/* Quick actions */}
                {!response && !loading && (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Suggestions rapides
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            handleEmailQuery(a);
                          }}
                          className="px-3 py-2 text-xs rounded-full
                                     bg-white dark:bg-gray-800
                                     border border-gray-200 dark:border-gray-700
                                     hover:shadow-sm transition"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 shadow-md p-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Posez une question sur vos emails..."
                      className="flex-1 rounded-xl px-4 py-3 text-sm
                                 bg-transparent
                                 border border-transparent
                                 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                      onKeyDown={(e) => e.key === "Enter" && handleEmailQuery()}
                    />
                    <button
                      onClick={() => handleEmailQuery()}
                      disabled={loading}
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600
                                 text-white shadow-md hover:scale-105 transition"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* AI Answer */}
                {response?.answer && (
                  <div
                    className="bg-white dark:bg-gray-800
                              border border-purple-100/70 dark:border-purple-900/40
                              rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-300">
                        Réponse Aïna
                      </div>
                      {response.emails?.length ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full
                                         bg-purple-100 text-purple-700
                                         dark:bg-purple-900/40 dark:text-purple-200">
                          {response.emails.length} email(s)
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-left">
                      {response.answer}
                    </p>
                  </div>
                )}

                {/* Emails */}
                {response?.emails?.length ? (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Emails
                    </p>
                    {response.emails.map((email: EmailItem) => (
                      <div
                        key={email.message_id}
                        className="bg-white dark:bg-gray-800
                                  rounded-2xl p-4 space-y-3 shadow-lg text-left">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {email.subject || "Sans objet"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                              <span>{fmtDate(email.receivedDateTime)}</span>
                              {"isRead" in email && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px]
                                                 bg-gray-100 text-gray-600
                                                 dark:bg-gray-700 dark:text-gray-300">
                                  {email.isRead ? "Lu" : "Non lu"}
                                </span>
                              )}
                            </div>
                          </div>

                          {email.hasAttachments && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full
                                        bg-purple-100 text-purple-700
                                        dark:bg-purple-900/30 dark:text-purple-300
                                        shrink-0"
                              title="Contient des pièces jointes"
                            >
                              📎 PJ
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-gray-500 dark:text-gray-400">From</span>
                          <span className="truncate">{fmtFrom(email.from)}</span>
                          <span className="font-semibold text-gray-500 dark:text-gray-400">To</span>
                          <span className="truncate">{fmtPeople(email.to)}</span>
                          {email.cc?.length ? (
                            <>
                              <span className="font-semibold text-gray-500 dark:text-gray-400">CC</span>
                              <span className="truncate">{fmtPeople(email.cc)}</span>
                            </>
                          ) : null}
                          {email.bcc?.length ? (
                            <>
                              <span className="font-semibold text-gray-500 dark:text-gray-400">BCC</span>
                              <span className="truncate">{fmtPeople(email.bcc)}</span>
                            </>
                          ) : null}
                        </div>

                        {email.summary && (
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-gray-900 dark:text-white">Résumé:</span>{" "}
                            {email.summary}
                          </div>
                        )}

                        {email.body && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-4">
                            {email.body}
                          </p>
                        )}

                        {email.attachments?.length ? (
                          <div className="pt-2 space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              📎 {email.attachments.length} pièce(s) jointe(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {email.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  onClick={async () => {
                                    const token = await instance.acquireTokenSilent({
                                      ...loginRequest,
                                      account: accounts[0],
                                    });

                                    await downloadEmailAttachment(
                                      email.message_id,
                                      att.id,
                                      att.name,
                                      token.accessToken
                                    );
                                  }}
                                  className="inline-flex items-center gap-2 rounded-full
                                             bg-purple-50 text-purple-700
                                             dark:bg-purple-900/30 dark:text-purple-200
                                             px-3 py-1 text-xs hover:shadow-sm transition"
                                >
                                  📎 {att.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {loading && (
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                )}

                {!loading && response && (!response.emails || response.emails.length === 0) && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Aucun email trouvé pour cette requête.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </>
    </>
  );
}
