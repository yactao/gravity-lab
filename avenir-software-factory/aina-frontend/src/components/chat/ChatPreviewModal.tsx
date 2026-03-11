// ChatPreviewModal.tsx - Version avec Google Docs Viewer pour les PDF
import React from "react";
import { Download, ExternalLink, FileText, X as XIcon } from "lucide-react";

interface ChatPreviewModalProps {
  doc: { title: string; path: string } | null;
  onClose: () => void;
}

const ChatPreviewModal: React.FC<ChatPreviewModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  const isPdf =
    doc.path.toLowerCase().includes(".pdf") ||
    doc.title.toLowerCase().includes(".pdf");

  // URL brute SAS venant de ton backend
  const rawUrl = doc.path.replace(/"/g, "").trim();

  // Pour les PDF, on passe par Google Docs Viewer afin de contourner le "Content-Disposition: attachment"
  const viewerUrl = isPdf
    ? `https://docs.google.com/gview?url=${encodeURIComponent(
        rawUrl
      )}&embedded=true`
    : rawUrl;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = rawUrl;

    const fileName = doc.title.toLowerCase().includes(".pdf")
      ? doc.title
      : `${doc.title}.pdf`;

    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    // Pour un PDF, on ouvre aussi le viewer (pas l’URL brute qui force le download)
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-2 sm:p-4"
      onClick={onClose}>
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full h-full sm:h-4/5 sm:w-11/12 md:w-5/6 lg:w-2/3 flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPdf ? "Document PDF" : "Document"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-lg shadow-blue-500/25"
              title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 hover:scale-110"
              title="Fermer"
            >
              <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Contenu: iframe simple, sans sandbox, avec Google Viewer pour PDF */}
        <div className="flex-1 rounded-b-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <iframe
            src={viewerUrl}
            className="w-full h-full rounded-b-2xl"
            title={doc.title}
            style={{ border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPreviewModal;
