import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
  type?: "doc" | "vision";
}

export default function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  title = "Galerie d'images",
  type = "doc" 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsLoading(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = images[currentIndex];
    link.download = `aina-${type}-image-${currentIndex + 1}-${new Date().toISOString().split('T')[0]}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(images[currentIndex], '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <div
          className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          {/* En-tête */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                type === "doc" 
                  ? "bg-blue-100 dark:bg-blue-900/40" 
                  : "bg-green-100 dark:bg-green-900/40"
              }`}>
                <span className="text-lg">
                  {type === "doc" ? "📄" : "🖼️"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Image {currentIndex + 1} sur {images.length}
                  {type === "doc" ? " - Aïna DOC" : " - Aïna Vision"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Boutons d'action */}
              <button
                onClick={downloadImage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Télécharger l'image"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={openInNewTab}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu de l'image */}
          <div className="relative flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 min-h-[400px]">
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image principale */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)} />
            </div>
          </div>

          {/* Miniatures */}
          {images.length > 1 && (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsLoading(true);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}