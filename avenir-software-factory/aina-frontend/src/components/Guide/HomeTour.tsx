// src/components/Tour/HomeTour.tsx
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import TourPopup from './TourPopup';
import TourOverlay from './TourOverlay';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  section: 'hero' | 'agents';
}

interface HomeTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  heroRef?: React.RefObject<HTMLElement | null>; // Correction ici
  modulesRef?: React.RefObject<HTMLElement | null>; // Correction ici
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'discover-agents',
    title: 'Découvrez les agents Aïna',
    description: 'Cliquez ici pour explorer tous les agents IA spécialisés disponibles.',
    targetId: 'discover-agents-btn',
    position: 'bottom',
    section: 'hero'
  },
  {
    id: 'learn-more',
    title: 'En savoir plus',
    description: 'Découvrez toutes les fonctionnalités avancées de notre plateforme.',
    targetId: 'learn-more-btn',
    position: 'top',
    section: 'hero'
  },
  {
    id: 'agents-section',
    title: 'Vos agents IA',
    description: 'Chaque agent est spécialisé dans un domaine précis pour vous offrir une assistance optimale.',
    targetId: 'agents-section',
    position: 'top',
    section: 'agents'
  }
];

const HomeTour = forwardRef<any, HomeTourProps>(({ 
  isActive, 
  onComplete, 
  onSkip, 
  heroRef, 
  modulesRef 
}, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousIsActive = useRef(isActive);

  const currentStepData = TOUR_STEPS[currentStep];

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

  const scrollToSection = useCallback((section: 'hero' | 'agents') => {
    setIsScrolling(true);
    
    let targetElement: HTMLElement | null = null;
    
    if (section === 'hero' && heroRef?.current) {
      targetElement = heroRef.current;
    } else if (section === 'agents' && modulesRef?.current) {
      targetElement = modulesRef.current;
    }

    if (targetElement) {
      // Scroll vers la section
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });

      // Attendre la fin du scroll
      setTimeout(() => {
        setIsScrolling(false);
        // Mettre à jour la position après le scroll
        const targetTourElement = document.getElementById(currentStepData.targetId);
        if (targetTourElement) {
          const newRect = targetTourElement.getBoundingClientRect();
          setTargetRect(newRect);
        }
      }, 800);
    } else {
      // Fallback si la ref n'est pas disponible
      setIsScrolling(false);
    }
  }, [heroRef, modulesRef, currentStepData]);

  const updateTargetPosition = useCallback(() => {
    if (!isActive || !currentStepData || isScrolling) return;

    const targetElement = document.getElementById(currentStepData.targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const isElementVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isElementVisible) {
        // Si l'élément n'est pas visible, faire défiler vers la section appropriée
        scrollToSection(currentStepData.section);
      } else {
        // Si l'élément est visible, mettre à jour directement la position
        setTargetRect(rect);
      }
    }
  }, [isActive, currentStepData, isScrolling, scrollToSection]);

  // Gérer le changement d'étape et le scroll vers la bonne section
  useEffect(() => {
    if (isActive && currentStepData) {
      scrollToSection(currentStepData.section);
    }
  }, [currentStep, isActive, scrollToSection]);

  useEffect(() => {
    if (isActive) {
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
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isActive, updateTargetPosition]);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
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
    localStorage.setItem('home-tour-completed', 'true');
  };

  const handleSkip = () => {
    onSkip();
    localStorage.setItem('home-tour-completed', 'true');
  };

  // Exposer la méthode de réinitialisation via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }));

  if (!isActive || !targetRect) return null;

  return createPortal(
    <>
      <TourOverlay targetRect={targetRect} />
      <TourPopup
        step={currentStepData}
        currentStep={currentStep}
        totalSteps={TOUR_STEPS.length}
        targetRect={targetRect}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={handleSkip}
        isScrolling={isScrolling}
      />
    </>,
    document.body
  );
});

HomeTour.displayName = 'HomeTour';

export default HomeTour;