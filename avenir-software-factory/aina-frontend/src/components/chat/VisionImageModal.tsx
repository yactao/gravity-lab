import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  title?: string;
};

export const ImageModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  title,
}: ImageModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
      }
      if (e.key === "ArrowRight") {
        onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setIsLoading(true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen) return null;

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `aina-${title || "image"}-${currentIndex + 1}-${new Date()
      .toISOString()
      .split("T")[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error("Erreur de chargement de l'image");
  };

  return (
    <div className="bg-black/10 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-900/90 text-white border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:block">Fermer</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">
              {title || "Visionneuse d'images"}
            </span>
            <span className="text-gray-300">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() =>
                  onNavigate(
                    currentIndex > 0 ? currentIndex - 1 : images.length - 1
                  )
                }
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={images.length <= 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  onNavigate(
                    currentIndex < images.length - 1 ? currentIndex + 1 : 0
                  )
                }
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={images.length <= 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            onClick={() => handleDownload(images[currentIndex])}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:block">Télécharger</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4">
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                onNavigate(
                  currentIndex > 0 ? currentIndex - 1 : images.length - 1
                )
              }
              className="absolute left-8 z-10 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors hidden lg:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                onNavigate(
                  currentIndex < images.length - 1 ? currentIndex + 1 : 0
                )
              }
              className="absolute right-8 z-10 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors hidden lg:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative max-w-4xl max-h-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className={`max-w-full max-h-[80vh] object-contain rounded-lg transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="p-4 bg-gray-900/80 border-t border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-transparent hover:border-gray-400"
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
  );
};
