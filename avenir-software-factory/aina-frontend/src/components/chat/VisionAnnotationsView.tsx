import { useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import { ImageModal } from "./VisionImageModal";
import type { VisionAnnotation, VisionBBox } from "../../service/visionService";

type Props = {
  imageB64?: string | null;
  sasUrl?: string;
  annotations?: VisionAnnotation[];
  onEdit?: () => void;
};

const bboxToStyle = (bbox: VisionBBox) => ({
  left: `${bbox.x * 100}%`,
  top: `${bbox.y * 100}%`,
  width: `${bbox.w * 100}%`,
  height: `${bbox.h * 100}%`,
});

export default function VisionAnnotationsView({
  imageB64,
  sasUrl,
  annotations = [],
  onEdit,
}: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageMetrics, setImageMetrics] = useState<{
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);
  const [renderRect, setRenderRect] = useState<{
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const imageUrl = useMemo(() => {
    if (imageB64) return `data:image/jpeg;base64,${imageB64}`;
    if (sasUrl) return sasUrl;
    return null;
  }, [imageB64, sasUrl]);

  const images = imageUrl ? [imageUrl] : [];

  const updateRenderRect = () => {
    if (!containerRef.current || !imageMetrics) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = Math.min(
      rect.width / imageMetrics.naturalWidth,
      rect.height / imageMetrics.naturalHeight
    );
    const width = imageMetrics.naturalWidth * scale;
    const height = imageMetrics.naturalHeight * scale;
    const offsetX = (rect.width - width) / 2;
    const offsetY = (rect.height - height) / 2;
    setRenderRect({ width, height, offsetX, offsetY });
  };

  useEffect(() => {
    updateRenderRect();
  }, [imageMetrics]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => updateRenderRect());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [imageMetrics]);

  if (!imageUrl) return null;

  return (
    <>
      <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="text-lg">📐</span>
            Plan annoté Aïna Vision
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700/60 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              Editer
            </button>
            <button
              onClick={() => setSelectedImageIndex(0)}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
            >
              <ZoomIn className="w-3 h-3" />
              Agrandir
            </button>
          </div>
        </div>

        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <div
            ref={containerRef}
            className="relative w-full h-auto max-h-80"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Plan annoté Aïna Vision"
              className="w-full h-auto max-h-80 object-contain rounded-lg shadow-sm"
              draggable={false}
              onLoad={(event) => {
                const img = event.currentTarget;
                setImageMetrics({
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                });
                updateRenderRect();
              }}
            />

            <div
              className="absolute pointer-events-none"
              style={{
                left: renderRect?.offsetX ?? 0,
                top: renderRect?.offsetY ?? 0,
                width: renderRect?.width ?? "100%",
                height: renderRect?.height ?? "100%",
              }}
            >
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute border-2 bg-transparent pointer-events-none border-red-400"
                  style={bboxToStyle(annotation.bbox)}
                >
                  <span className="absolute -top-3 left-0 text-[5px] px-1.5 py-0.5 rounded bg-gray-900/80 text-white">
                    {annotation.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        images={images}
        currentIndex={selectedImageIndex || 0}
        onNavigate={(index) => setSelectedImageIndex(index)}
        title="Aïna Vision - Plan annoté"
      />
    </>
  );
}
