// src/components/Tour/TourOverlay.tsx
import React from 'react';

interface TourOverlayProps {
  targetRect: DOMRect;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ targetRect }) => {
  return (
    <>
      {/* Background with spotlight effect using radial gradient */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
              transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 40}px,
              rgba(0, 0, 0, 0.3) ${Math.max(targetRect.width, targetRect.height) / 2 + 120}px
            )
          `
        }} />
      {/* Spotlight border with smooth animation */}
      <div className="fixed z-50 pointer-events-none">
        {/* Animated border with glow */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-400 shadow-2xl shadow-blue-500/60" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg" />
        
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />

        {/* Pulsing animation */}
        <div className="absolute inset-0 rounded-xl border border-blue-300" />
      </div>
      {/* Additional vignette effect for better focus */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at center,
              transparent 0%,
              transparent 60%,
              rgba(0, 0, 0, 0.4) 100%
            )
          `
        }} />
    </>
  );
};

export default TourOverlay;