// src/components/tools/EmailDisplay.tsx
import { 
  PaperClipIcon, 
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface EmailAttachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
}

interface Email {
  message_id: string;
  sender: string;
  recipients: string[];
  cc: string[];
  bcc: string[];
  date_received: string;
  date_sent: string;
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  importance: string;
}

interface EmailDisplayProps {
  emails: Email[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Aujourd'hui à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return "Hier à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

export default function EmailDisplay({ emails }: EmailDisplayProps) {
  const [showFullBody, setShowFullBody] = useState<string | null>(null);

  if (!emails || emails.length === 0) return null;

  return (
    <div className="space-y-3">
      {emails.map((email: Email) => (
        <div
          key={email.message_id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          {/* En-tête email - Ligne horizontale */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Partie gauche - Info principales */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Sujet */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate mb-1">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Sujet:</span> {email.subject}
                  </h3>
                  
                  {/* Expéditeur */}
                  <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-semibold">De:</span> {email.sender}
                  </div>

                  {/* Destinataires */}
                  <div className="text-[11px] text-gray-500 dark:text-gray-500">
                    <span className="font-semibold">À:</span> {email.recipients.join(', ')}
                    {email.cc.length > 0 && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="font-semibold">CC:</span> {email.cc.join(', ')}
                      </>
                    )}
                  </div>
                </div>

                {/* Date et importance */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {formatDate(email.date_received)}
                  </span>
                  {email.importance === "high" && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-[9px] font-bold">
                      IMPORTANT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Corps de l'email - Ligne horizontale compacte */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                Message:
              </span>
              <button
                onClick={() => setShowFullBody(showFullBody === email.message_id ? null : email.message_id)}
                className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showFullBody === email.message_id ? (
                  <>
                    <EyeSlashIcon className="w-3 h-3" />
                    Masquer
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3 h-3" />
                    Voir
                  </>
                )}
              </button>
            </div>

            {/* Aperçu du corps - Texte plus petit */}
            <div className={`text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed ${
              showFullBody !== email.message_id ? 'line-clamp-2' : ''
            }`}>
              {email.body.split('\n').slice(0, showFullBody === email.message_id ? undefined : 2).map((line, idx) => (
                <p key={idx} className="mb-1">
                  {line}
                </p>
              ))}
              {showFullBody !== email.message_id && email.body.split('\n').length > 2 && (
                <span className="text-gray-500 dark:text-gray-500 text-[10px]">...</span>
              )}
            </div>
          </div>

          {/* Pièces jointes - Ligne horizontale */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <PaperClipIcon className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  {email.attachments.length} PJ
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {email.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    title={attachment.name}
                  >
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PaperClipIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-900 dark:text-white truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}