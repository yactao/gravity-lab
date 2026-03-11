// src/components/Guide/ChatTourOverlay.tsx
import React from 'react';

interface ChatTourOverlayProps {
  targetRect: DOMRect;
}

const ChatTourOverlay: React.FC<ChatTourOverlayProps> = ({ targetRect }) => {
  return (
    <>
      {/* Background with spotlight effect */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
              transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 40}px,
              rgba(0, 0, 0, 0.5) ${Math.max(targetRect.width, targetRect.height) / 2 + 120}px
            )
          `
        }} />
      {/* Spotlight border */}
      <div className="fixed z-50 pointer-events-none">
        <div className="absolute inset-0 rounded-xl border-2 border-indigo-500 shadow-2xl shadow-indigo-500/60" />
        <div className="absolute inset-0 rounded-xl bg-indigo-500/10 blur-lg" />
        
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br-lg" />

        <div className="absolute inset-0 rounded-xl border border-indigo-400" />
      </div>
      {/* Vignette effect */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at center,
              transparent 0%,
              transparent 30%,
              rgba(0, 0, 0, 0.3) 100%
            )
          `
        }} />
    </>
  );
};

export default ChatTourOverlay;