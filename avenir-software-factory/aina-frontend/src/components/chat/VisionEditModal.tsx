import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { X } from "lucide-react";
import type {
  VisionAnnotation,
  VisionBBox,
  VisionEditSavePayload,
} from "../../service/visionService";

type DragState = {
  id: string;
  startX: number;
  startY: number;
  startBBox: VisionBBox;
};

type ResizeState = DragState & {
  corner: "nw" | "ne" | "se" | "sw";
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const bboxToStyle = (bbox: VisionBBox) => ({
  left: `${bbox.x * 100}%`,
  top: `${bbox.y * 100}%`,
  width: `${bbox.w * 100}%`,
  height: `${bbox.h * 100}%`,
});

const createTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  annotations: VisionAnnotation[];
  /** Appelé au clic "Enregistrer" avec le JSON unique (image + dimensions + annotations) */
  onSave?: (payload: VisionEditSavePayload) => Promise<void>;
};

export default function VisionEditModal({
  isOpen,
  onClose,
  imageUrl,
  annotations,
  onSave,
}: Props) {
  const [localAnnotations, setLocalAnnotations] = useState<VisionAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (isOpen) {
      setLocalAnnotations(annotations);
      setSelectedId(null);
      setToast(null);
      setHintMessage(null);
    }
  }, [isOpen, annotations]);

  useEffect(() => {
    if (selectedId) labelInputRef.current?.focus();
  }, [selectedId]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!hintMessage) return;
    const id = window.setTimeout(() => setHintMessage(null), 3000);
    return () => window.clearTimeout(id);
  }, [hintMessage]);

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

  const getPoint = (event: MouseEvent<HTMLElement>) => {
    if (!containerRef.current || !renderRect) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - renderRect.offsetX;
    const y = event.clientY - rect.top - renderRect.offsetY;
    const nx = clamp01(x / renderRect.width);
    const ny = clamp01(y / renderRect.height);
    return { nx, ny };
  };

  const startDrawing = (event: MouseEvent<HTMLDivElement>) => {
    if (isSaving) return;
    // Ne pas démarrer si on a cliqué sur une box (elle a stopPropagation)
    if ((event.target as HTMLElement).closest?.("[data-annotation-box]")) return;
    const point = getPoint(event);
    if (!point) return;
    setDrawing({
      startX: point.nx,
      startY: point.ny,
      currentX: point.nx,
      currentY: point.ny,
    });
  };

  const endDrawing = () => {
    if (!drawing) return;
    const minX = Math.min(drawing.startX, drawing.currentX);
    const minY = Math.min(drawing.startY, drawing.currentY);
    const maxX = Math.max(drawing.startX, drawing.currentX);
    const maxY = Math.max(drawing.startY, drawing.currentY);
    const width = maxX - minX;
    const height = maxY - minY;
    setDrawing(null);
    if (width < 0.01 || height < 0.01) return;

    const annotation: VisionAnnotation = {
      id: createTempId(),
      label: "Nouvelle annotation",
      bbox: { x: minX, y: minY, w: width, h: height },
      confidence: 1,
      source: "user",
    };
    setSelectedId(annotation.id);
    setLocalAnnotations((prev) => [...prev, annotation]);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const target = localAnnotations.find((item) => item.id === selectedId);
    if (!target) return;
    setSelectedId(null);
    setLocalAnnotations((prev) => prev.filter((item) => item.id !== target.id));
  };

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const point = getPoint(event);
    if (!point) return;

    if (drawing) {
      setDrawing({ ...drawing, currentX: point.nx, currentY: point.ny });
      return;
    }

    if (!dragging && !resizing) return;

    if (dragging) {
      const dx = point.nx - dragging.startX;
      const dy = point.ny - dragging.startY;
      const next = {
        ...dragging.startBBox,
        x: clamp01(dragging.startBBox.x + dx),
        y: clamp01(dragging.startBBox.y + dy),
      };
      next.x = clamp01(Math.min(next.x, 1 - next.w));
      next.y = clamp01(Math.min(next.y, 1 - next.h));
      setLocalAnnotations((prev) =>
        prev.map((item) => (item.id === dragging.id ? { ...item, bbox: next } : item))
      );
    }

    if (resizing) {
      const minSize = 0.02;
      let { x, y, w, h } = resizing.startBBox;
      const dx = point.nx - resizing.startX;
      const dy = point.ny - resizing.startY;

      if (resizing.corner === "nw") {
        x = clamp01(x + dx);
        y = clamp01(y + dy);
        w = clamp01(resizing.startBBox.w - dx);
        h = clamp01(resizing.startBBox.h - dy);
      }
      if (resizing.corner === "ne") {
        y = clamp01(y + dy);
        w = clamp01(resizing.startBBox.w + dx);
        h = clamp01(resizing.startBBox.h - dy);
      }
      if (resizing.corner === "se") {
        w = clamp01(resizing.startBBox.w + dx);
        h = clamp01(resizing.startBBox.h + dy);
      }
      if (resizing.corner === "sw") {
        x = clamp01(x + dx);
        w = clamp01(resizing.startBBox.w - dx);
        h = clamp01(resizing.startBBox.h + dy);
      }

      if (w < minSize) w = minSize;
      if (h < minSize) h = minSize;
      if (x + w > 1) x = 1 - w;
      if (y + h > 1) y = 1 - h;

      setLocalAnnotations((prev) =>
        prev.map((item) =>
          item.id === resizing.id ? { ...item, bbox: { x, y, w, h } } : item
        )
      );
    }
  };

  const endDragResize = () => {
    if (!dragging && !resizing) return;
    setDragging(null);
    setResizing(null);
  };

  /** Construit le JSON unique : image + dimensions + toutes les annotations */
  const buildSavePayload = (): VisionEditSavePayload => ({
    image: imageUrl,
    image_width: imageMetrics?.naturalWidth ?? null,
    image_height: imageMetrics?.naturalHeight ?? null,
    annotations: localAnnotations.map((a) => ({
      id: a.id,
      label: a.label,
      bbox: { x: a.bbox.x, y: a.bbox.y, w: a.bbox.w, h: a.bbox.h },
      ...(imageMetrics && {
        bbox_px: {
          x: Math.round(a.bbox.x * imageMetrics.naturalWidth),
          y: Math.round(a.bbox.y * imageMetrics.naturalHeight),
          w: Math.round(a.bbox.w * imageMetrics.naturalWidth),
          h: Math.round(a.bbox.h * imageMetrics.naturalHeight),
        },
      }),
    })),
  });

  const handleSaveAnnotatedImage = async () => {
    const payload = buildSavePayload();
    console.group("[Vision Edit] Payload pour backend (JSON unique)");
    console.log("Données envoyées:", payload);
    console.log("Description des attributs:", {
      image:
        "URL (SAS ou base64) de l'image affichée dans l'éditeur, à utiliser pour générer l'image annotée",
      image_width:
        "Largeur native de l'image en pixels (dimensions réelles du fichier)",
      image_height:
        "Hauteur native de l'image en pixels (dimensions réelles du fichier)",
      annotations:
        "Liste des zones (boxes) annotées. Chaque élément contient les champs ci-dessous.",
      "annotations[].id":
        "Identifiant unique : préfixe 'ai-' = détection IA, 'temp-' = zone créée par l'utilisateur dans l'éditeur",
      "annotations[].label":
        "Nom / libellé de la zone (ex: Kitchen, WC, wasplaats, bureau, hall)",
      "annotations[].bbox":
        "Coordonnées normalisées (0 à 1) : x, y = coin supérieur gauche ; w, h = largeur et hauteur du rectangle",
      "annotations[].bbox_px":
        "Mêmes coordonnées en pixels (x, y, w, h) par rapport à image_width × image_height, pour dessin ou traitement pixel",
    });
    console.groupEnd();
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      setToast("Erreur lors de l’envoi au backend.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isBoxActive = Boolean(selectedId || dragging || resizing);

  return (
    <div
      className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm ${isBoxActive ? "cursor-crosshair" : ""}`}
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900/90 text-white border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">Edition des annotations</span>
            <span className="text-xs text-gray-300">
              Glissez pour déplacer, poignées pour redimensionner
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedId && (() => {
              const selected = localAnnotations.find((a) => a.id === selectedId);
              return selected ? (
                <div className="flex items-center gap-2 mr-2">
                  <label htmlFor="vision-annotation-label" className="text-xs text-gray-400 whitespace-nowrap">
                    Nom :
                  </label>
                  <input
                    id="vision-annotation-label"
                    ref={labelInputRef}
                    type="text"
                    value={selected.label}
                    onChange={(e) =>
                      setLocalAnnotations((prev) =>
                        prev.map((a) =>
                          a.id === selectedId ? { ...a, label: e.target.value } : a
                        )
                      )
                    }
                    className="px-2 py-1 text-sm rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 min-w-[120px] max-w-[200px]"
                    placeholder="Nom de l'annotation"
                  />
                </div>
              ) : null;
            })()}
            <span className="text-xs text-gray-400 mr-1">
              Cliquez-glissez sur l’image pour ajouter une zone.
            </span>
            <button
              type="button"
              onClick={() =>
                setHintMessage("Cliquez et glissez sur l’image pour dessiner une nouvelle zone.")
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-sky-400 text-sky-200 hover:bg-sky-500/20"
            >
              Ajouter une zone
            </button>
            <button
              type="button"
              onClick={handleSaveAnnotatedImage}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedId || isSaving}
              className="px-3 py-1.5 text-xs rounded-lg border border-red-400 text-red-200 hover:bg-red-500/20"
            >
              Supprimer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div
            ref={containerRef}
            className="relative mx-auto max-w-5xl bg-gray-900/20 rounded-xl p-4"
            onMouseDown={startDrawing}
            onMouseMove={onMouseMove}
            onMouseUp={() => {
              if (drawing) {
                endDrawing();
              } else {
                endDragResize();
              }
            }}
            onMouseLeave={() => {
              setDrawing(null);
              endDragResize();
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Plan annoté Aïna Vision"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-sm"
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
              className="absolute"
              style={{
                left: renderRect?.offsetX ?? 0,
                top: renderRect?.offsetY ?? 0,
                width: renderRect?.width ?? "100%",
                height: renderRect?.height ?? "100%",
              }}
            >
              {localAnnotations.map((annotation) => {
                const isSelected = annotation.id === selectedId;
                return (
                  <div
                    key={annotation.id}
                    data-annotation-box
                    className={`absolute border-2 bg-transparent ${
                      isSelected ? "border-red-800" : "border-red-400"
                    }`}
                    style={bboxToStyle(annotation.bbox)}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      const point = getPoint(event);
                      if (!point) return;
                      setSelectedId(annotation.id);
                      setDragging({
                        id: annotation.id,
                        startX: point.nx,
                        startY: point.ny,
                        startBBox: annotation.bbox,
                      });
                    }}
                  >
                    <span className="absolute -top-0 left-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-900/80 text-white">
                      {annotation.label}
                    </span>
                    {isSelected && (
                      <>
                        {(["nw", "ne", "se", "sw"] as const).map((corner) => (
                          <button
                          key={corner}
                          type="button"
                          onMouseDown={(event) => {
                            event.stopPropagation();
                            const point = getPoint(event);
                            if (!point) return;
                            setResizing({
                              id: annotation.id,
                              corner,
                              startX: point.nx,
                              startY: point.ny,
                              startBBox: annotation.bbox,
                            });
                          }}
                          className="absolute w-4 h-4 flex items-center justify-center text-[10px] font-bold text-red-500 bg-transparent border-0 p-0 cursor-pointer hover:scale-125 transition-transform"
                          style={{
                            left: corner.includes("w") ? -8 : undefined,
                            right: corner.includes("e") ? -8 : undefined,
                            top: corner.includes("n") ? -8 : undefined,
                            bottom: corner.includes("s") ? -8 : undefined,
                          }}
                        >
                          +
                        </button>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}

              {drawing && (
                <div
                  className="absolute border-2 border-red-400 bg-transparent"
                  style={{
                    left: `${Math.min(drawing.startX, drawing.currentX) * 100}%`,
                    top: `${Math.min(drawing.startY, drawing.currentY) * 100}%`,
                    width: `${Math.abs(drawing.currentX - drawing.startX) * 100}%`,
                    height: `${Math.abs(drawing.currentY - drawing.startY) * 100}%`,
                  }}
                />
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-200">
            Cliquez-glissez pour ajouter une zone. Cliquez une zone pour la
            déplacer ou la redimensionner.
          </div>

          {toast && (
            <div className="mt-2 text-xs text-red-300">{toast}</div>
          )}
          {hintMessage && (
            <div className="mt-2 text-xs text-sky-300">{hintMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
