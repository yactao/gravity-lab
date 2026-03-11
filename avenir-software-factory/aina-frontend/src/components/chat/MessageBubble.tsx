import TypedText from "../TypedText/TypedText";
import type { Message } from "../../pages/Chat/Chat";
import {
  downloadExcel,
  exportVisionResultsToExcel,
} from "../../utils/exportUtils";
import { Download, FileSpreadsheet, X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import VisionAnnotationsView from "./VisionAnnotationsView";
import { ImageModal } from "./VisionImageModal";
import { Copy, Check, Pencil, Save, RotateCcw, Share2 } from "lucide-react";


type Props = {
  msg: Message;
  onPreview: (title: string) => void;
  onEdit?: (newText: string) => void;
  onRetry?: () => void;
  onShare?: () => void;
  onOpenVisionEdit?: () => void;
};


// Composant pour afficher les images d'Aïna DOC
const DocImages: React.FC<{
  images?: string[];
}> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
      <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="text-lg">🖼️</span>
            Galerie d'images ({images.length})
          </p>
          <button
            onClick={() => openModal(0)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
          >
            <ZoomIn className="w-3 h-3" />
            Ouvrir la visionneuse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
              onClick={() => openModal(index)}
            >
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                Image {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal améliorée */}
      <ImageModal
        isOpen={selectedImageIndex !== null}
        onClose={closeModal}
        images={images}
        currentIndex={selectedImageIndex || 0}
        onNavigate={navigateImage}
        title="Aïna DOC"
      />
    </>
  );
};

export default function MessageBubble({
  msg,
  onPreview,
  onEdit,
  onRetry,
  onShare,
  onOpenVisionEdit,
}: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(msg.text);

  useEffect(() => {
    if (!isEditing) {
      setEditedText(msg.text);
    }
  }, [msg.text, isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text || "");
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Erreur copie:", error);
    }
  };

  const handleStartEdit = () => {
    setEditedText(msg.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedText(msg.text);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const trimmedText = editedText.trim();
    if (!trimmedText || trimmedText === msg.text) {
      setIsEditing(false);
      return;
    }
    onEdit?.(trimmedText);
    setIsEditing(false);
  };
  const isRecentMessage = () => {
    if (!msg.timestamp) return true; // Si pas de timestamp, traiter comme récent
    const messageTime = new Date(msg.timestamp).getTime();
    const now = new Date().getTime();
    // Si le message a moins de 5 secondes, le considérer comme "nouveau"
    return (now - messageTime) < 5000;
  };
  return (
    <div className="w-full flex justify-center px-1 opacity-100">
      {msg.isUser ? (
        <div className="flex flex-row-reverse items-start gap-2 w-full max-w-4xl">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-indigo-200 text-indigo-900 rounded-full flex items-center justify-center text-xs sm:text-sm">
            👤
          </div>
          <div className="flex flex-col items-end gap-1 flex-1 min-w-0 group">
            <div
              className={`relative group w-full ${
                isEditing
                  ? "max-w-xs sm:max-w-md md:max-w-3xl"
                  : "max-w-xs sm:max-w-sm md:max-w-2xl sm:w-auto"
              }`}
            >
              <div className="bg-indigo-700/80 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl break-words text-left text-sm sm:text-base">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full min-h-[96px] bg-transparent text-white outline-none resize-none"
                      value={editedText}
                      onChange={(event) => setEditedText(event.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="relative group/btn flex items-center gap-1.5 px-2 py-1 bg-white/90 text-indigo-700 rounded-md text-[11px] sm:text-xs hover:bg-white transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Enregistrer
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                          Enregistrer
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="relative group/btn flex items-center gap-1.5 px-2 py-1 bg-white/70 text-indigo-700 rounded-md text-[11px] sm:text-xs hover:bg-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Annuler
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                          Annuler
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
            {msg.file && (
              <div className="bg-indigo-100/50 dark:bg-indigo-800/50 px-2 py-1 sm:px-3 sm:py-1 rounded-md flex items-center gap-2 max-w-[200px] sm:max-w-sm text-xs">
                <span className="truncate">{msg.file.name}</span>
              </div>
            )}
            {msg.text && !isEditing && (
              <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="relative group/btn p-1.5 rounded-md bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title="Modifier le message"
                    aria-label="Modifier le message"
                  >
                    <Pencil className="w-3 h-3" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                      Modifier
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="relative group/btn p-1.5 rounded-md bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  title="Copier le message"
                  aria-label="Copier le message"
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                    Copier
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-start w-full max-w-4xl group">
          <div className="flex gap-2 items-start w-full">
            <img
              src="/logo-blue.png"
              alt="Aïna"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mt-1 sm:mt-2 flex-shrink-0"
            />
            <div className={`text-gray-900 dark:text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl break-words text-left flex-1 max-w-3xl overflow-x-auto ${msg.agent === "dev" ? "bg-white/40 dark:bg-gray-800/50 backdrop-blur-lg border border-white/50 dark:border-gray-600 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" : "bg-transparent"}`}>
              {msg.model && (
  <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-full 
                  bg-indigo-50 dark:bg-indigo-900/40 
                  text-[11px] font-medium 
                  text-indigo-700 dark:text-indigo-200 
                  border border-indigo-200/70 dark:border-indigo-700/60">
    <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    <span>{msg.model}</span>
  </div>
)}

              {msg.text && (
                <>
        {isRecentMessage() ? (
          <TypedText
            text={msg.text}
            speed={20}
            start={true}
            className="whitespace-pre-line mb-2 text-sm sm:text-base"
            asHTML={true}
          />
        ) : (
          <div 
            className="whitespace-pre-line mb-2 text-sm sm:text-base"
            dangerouslySetInnerHTML={{ 
              __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }}
          />
        )}
      </>
              )}
              
             {/* Images d'Aïna DOC */}
             {msg.images && msg.images.length > 0 && (
                <DocImages images={msg.images} />
              )}

              {/* Image annotée Vision */}
              {(msg.annotated_image_b64 || msg.vision_annotated_sas) && (
                <VisionAnnotationsView
                  imageB64={msg.annotated_image_b64}
                  sasUrl={msg.vision_annotated_sas}
                  annotations={msg.annotations || []}
                  onEdit={onOpenVisionEdit}
                />
              )}

              {/* Afficher les surfaces et périmètres */}
              {msg.surfaces && Object.keys(msg.surfaces).length > 0 && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/60 dark:border-blue-700/40 shadow-sm">
                  {/* En-tête avec bouton de téléchargement professionnel */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800/40 rounded-lg">
                        <span className="text-lg">📐</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          Analyse des surfaces
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {Object.keys(msg.surfaces).length} espaces détectés
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const excelBlob = exportVisionResultsToExcel(
                          msg.surfaces!,
                          msg.perimeters,
                          msg.detections
                        );
                        const filename = `Rapport_Aina_Vision_${
                          new Date().toISOString().split("T")[0]
                        }.xlsx`;
                        downloadExcel(excelBlob, filename);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group"
                    >
                      <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Générer le rapport</span>
                      <Download className="w-4 h-4 group-hover:animate-bounce" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(msg.surfaces).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium capitalize">
                          {key.replace("_", " ")}:
                        </span>
                        <span className="text-blue-700 dark:text-blue-300">
                          {value.toFixed(2)} m²
                          {msg.perimeters && msg.perimeters[key] && (
                            <span className="text-gray-600 dark:text-gray-400 text-xs ml-2">
                              ({msg.perimeters[key].toFixed(2)} m)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="mt-2 pt-2 border-t border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total surface:</span>
                      <span className="text-blue-700 dark:text-blue-300">
                        {Object.values(msg.surfaces)
                          .reduce((sum, val) => sum + val, 0)
                          .toFixed(2)}{" "}
                        m²
                      </span>
                    </div>
                    {msg.perimeters && (
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total périmètre:</span>
                        <span className="text-blue-700 dark:text-blue-300">
                          {Object.values(msg.perimeters)
                            .reduce((sum, val) => sum + val, 0)
                            .toFixed(2)}{" "}
                          m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Afficher les détections */}
              {msg.detections && msg.detections.length > 0 && (
                <div className="mt-3 p-3 bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    Éléments détectés :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.detections
                      .filter(
                        (detection, index, self) =>
                          index ===
                          self.findIndex(
                            (d) => d.tag_name === detection.tag_name
                          )
                      ) // Éviter les doublons
                      .map((detection, idx) => (
                        <div
                          key={idx}
                          className="bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-full text-xs border border-green-200/50 dark:border-green-700/50"
                        >
                          {detection.tag_name}
                          <span className="text-green-600 dark:text-green-400 ml-1">
                            ({(detection.probability * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {msg.text && (
                <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="relative group/btn p-1.5 rounded-md bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      title="Réessayer"
                      aria-label="Réessayer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                        Réessayer
                      </span>
                    </button>
                  )}
                  {onShare && (
                    <button
                      type="button"
                      onClick={onShare}
                      className="relative group/btn p-1.5 rounded-md bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      title="Partager"
                      aria-label="Partager"
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                        Partager
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="relative group/btn p-1.5 rounded-md bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title="Copier la réponse"
                    aria-label="Copier la réponse"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                      Copier
                    </span>
                  </button>
                </div>
              )}
              
            </div>
          </div>
            {/* Afficher les sources/citations seulement s'il n'y a PAS de tableau ET qu'il y a des sources */}
            
{!msg.rows && msg.sources && msg.sources.length > 0 && (
  <div className="mt-1 sm:mt-2 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-white/10 text-indigo-900 dark:text-indigo-200 px-3 py-2 sm:px-4 sm:py-3 rounded-xl w-full max-w-3xl text-left shadow-sm">
    <p className="text-xs sm:text-sm font-semibold mb-1">
      📂 Documents associés :
    </p>
    <div className="space-y-1">
      {msg.sources.map((s, idx) => {
        // Nettoyer l'URL des guillemets doubles
        const cleanUrl = s.path ? s.path.replace(/"/g, '') : s.path;
        
        return (
          <button
            key={idx}
            className="block text-left w-full text-xs sm:text-sm bg-white/80 dark:bg-gray-800/80 text-indigo-700 hover:text-black dark:text-indigo-100 dark:hover:text-white underline truncate hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
            title={s.title || cleanUrl}
            onClick={(e) => {
              e.preventDefault(); // ← EMPÊCHER LE COMPORTEMENT PAR DÉFAUT
              e.stopPropagation(); // ← EMPÊCHER LA PROPAGATION
              console.log("📄 [MessageBubble] Clic sur document, ouverture preview:", cleanUrl);
              onPreview(cleanUrl); // ← Passer l'URL nettoyée
            }}
          >
            {idx + 1}. 📄 {(s.title || cleanUrl).replace(/\.pdf$/i, "")}
          </button>
        );
      })}
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}