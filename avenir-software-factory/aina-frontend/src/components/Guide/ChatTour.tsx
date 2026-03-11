// src/components/Guide/ChatTour.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import ChatTourOverlay from './ChatTourOverlay';
import { CHAT_TOUR_STEPS } from './ChatTourConfig';
import ChatTourPopup from './ChatTourPopup';

interface ChatTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const ChatTour: React.FC<ChatTourProps> = ({ isActive, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const previousIsActive = useRef(isActive);

  const currentStepData = CHAT_TOUR_STEPS[currentStep];

  // Réinitialiser à la première étape lors de la fermeture
  useEffect(() => {
    if (previousIsActive.current && !isActive) {
      setTimeout(() => {
        setCurrentStep(0);
        setTargetRect(null);
      }, 300);
    }
    previousIsActive.current = isActive;
  }, [isActive]);

  const scrollToElement = useCallback((element: HTMLElement) => {
    setIsScrolling(true);
    
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;
    const elementCenter = elementTop - (window.innerHeight / 2) + (elementRect.height / 2);
    
    window.scrollTo({
      top: elementCenter,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setIsScrolling(false);
      const newRect = element.getBoundingClientRect();
      setTargetRect(newRect);
    }, 600);
  }, []);

  const updateTargetPosition = useCallback(() => {
    if (!isActive || !currentStepData || isScrolling) return;

    const targetElement = document.getElementById(currentStepData.targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const isElementVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isElementVisible) {
        scrollToElement(targetElement);
      } else {
        setTargetRect(rect);
      }
    }
  }, [isActive, currentStepData, isScrolling, scrollToElement]);

  useEffect(() => {
    if (isActive) {
      updateTargetPosition();
      
      const observer = new MutationObserver(updateTargetPosition);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    }
  }, [isActive, currentStep, updateTargetPosition]);

  const nextStep = () => {
    if (currentStep < CHAT_TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleTourEnd();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTourEnd = () => {
    onComplete();
    localStorage.setItem('chat-tour-completed', 'true');
  };

  const handleSkip = () => {
    onSkip();
    localStorage.setItem('chat-tour-completed', 'true');
  };

  if (!isActive || !targetRect) return null;

  return createPortal(
    <>
      <ChatTourOverlay targetRect={targetRect} />
      <ChatTourPopup
        step={currentStepData}
        currentStep={currentStep}
        totalSteps={CHAT_TOUR_STEPS.length}
        targetRect={targetRect}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={handleSkip}
        isScrolling={isScrolling}
      />
    </>,
    document.body
  );
};

export default ChatTour;