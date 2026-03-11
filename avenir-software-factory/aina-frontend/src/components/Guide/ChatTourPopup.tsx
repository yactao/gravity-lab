// src/components/Guide/ChatTourPopup.tsx
import React, { useEffect, useState } from 'react';
import { XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ChatTourStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ChatTourPopupProps {
  step: ChatTourStep;
  currentStep: number;
  totalSteps: number;
  targetRect: DOMRect;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isScrolling?: boolean;
}

const ChatTourPopup: React.FC<ChatTourPopupProps> = ({
  step,
  currentStep,
  totalSteps,
  targetRect,
  onNext,
  onPrevious,
  onSkip,
  isScrolling = false,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const verticalOffset = 40; // Décalage vers le haut

  useEffect(() => {
    const popupWidth = 320;
    const popupHeight = 200;
    const arrowSize = 12;
    const margin = 16;

    const calculatePosition = () => {
      let top = 0;
      let left = 0;
      let arrowPos: typeof arrowPosition = null;

      const preferredPosition = step.position || 'bottom';

      const positions = {
        top: {
          top: targetRect.top - popupHeight - arrowSize - margin - verticalOffset,
          left: targetRect.left + (targetRect.width / 2) - (popupWidth / 2),
          arrow: 'bottom' as const
        },
        bottom: {
          top: targetRect.bottom + arrowSize + margin - verticalOffset,
          left: targetRect.left + (targetRect.width / 2) - (popupWidth / 2),
          arrow: 'top' as const
        },
        left: {
          top: targetRect.top + (targetRect.height / 2) - (popupHeight / 2) - verticalOffset,
          left: targetRect.left - popupWidth - arrowSize - margin,
          arrow: 'right' as const
        },
        right: {
          top: targetRect.top + (targetRect.height / 2) - (popupHeight / 2) - verticalOffset,
          left: targetRect.right + arrowSize + margin,
          arrow: 'left' as const
        }
      };

      // Vérifier si la position préférée fit
      const preferred = positions[preferredPosition];
      const fitsPreferred = preferred.top >= margin && 
                           preferred.left >= margin && 
                           preferred.top + popupHeight <= window.innerHeight - margin && 
                           preferred.left + popupWidth <= window.innerWidth - margin;

      if (fitsPreferred) {
        top = preferred.top;
        left = preferred.left;
        arrowPos = preferred.arrow;
      } else {
        // Trouver la première position qui fit
        const allPositions = ['bottom', 'top', 'right', 'left'] as const;
        for (const pos of allPositions) {
          const posData = positions[pos];
          if (posData.top >= margin && 
              posData.left >= margin && 
              posData.top + popupHeight <= window.innerHeight - margin && 
              posData.left + popupWidth <= window.innerWidth - margin) {
            top = posData.top;
            left = posData.left;
            arrowPos = posData.arrow;
            break;
          }
        }
      }

      // Fallback avec ajustement
      if (top === 0 && left === 0) {
        top = Math.max(margin, Math.min(preferred.top, window.innerHeight - popupHeight - margin));
        left = Math.max(margin, Math.min(preferred.left, window.innerWidth - popupWidth - margin));
        arrowPos = preferredPosition === 'top' ? 'bottom' : 'top';
      }

      setPosition({ top, left });
      setArrowPosition(arrowPos);
    };

    calculatePosition();
  }, [targetRect, step.position, verticalOffset]);

  const Arrow = () => {
    if (!arrowPosition) return null;

    const arrowClasses = {
      top: 'absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6',
      bottom: 'absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6',
      left: 'absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6',
      right: 'absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6'
    };

    const triangleClasses = {
      top: 'border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800 border-l-8 border-r-8 border-b-8',
      bottom: 'border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800 border-l-8 border-r-8 border-t-8',
      left: 'border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800 border-t-8 border-b-8 border-r-8',
      right: 'border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800 border-t-8 border-b-8 border-l-8'
    };

    return (
      <div className={arrowClasses[arrowPosition]}>
        <div className={`w-0 h-0 ${triangleClasses[arrowPosition]}`} />
      </div>
    );
  };

  return (
    <>
      {!isScrolling && (
        <div
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
          className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
          <Arrow />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {currentStep + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Étape {currentStep + 1} sur {totalSteps}</span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Passer le guide
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={onPrevious}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              <button
                onClick={onNext}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
              >
                {currentStep === totalSteps - 1 ? 'J\'ai compris' : 'Suivant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatTourPopup;