import React, { useRef, useState } from 'react';



interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  imageSrc?: string;
  size?: 'small' | 'medium' | 'large';
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  imageSrc,
  size = 'medium'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);

  // Tailles responsives basées sur la prop size
  const sizeClasses = {
    small: 'min-h-[4rem] sm:min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem]',
    medium: 'min-h-[6rem] sm:min-h-[16rem] md:min-h-[18rem] lg:min-h-[20rem]',
    large: 'min-h-[8rem] sm:min-h-[18rem] md:min-h-[20rem] lg:min-h-[24rem]'
  };

  // Tailles d'images adaptées au mobile
  const imageSizes = {
    small: 'h-[100px] sm:h-[200px]',
    medium: 'h-[120px] sm:h-[280px]',
    large: 'h-[140px] sm:h-[360px]'
  };

  // Position d'image adaptée au mobile
  const imagePositions = {
    small: hovered ? 'translate-x-8 translate-y-[-20px] scale-105' : 'translate-x-28 translate-y-0 scale-100',
    medium: hovered ? 'translate-x-8 translate-y-[-20px] scale-105' : 'translate-x-28 translate-y-0 scale-100',
    large: hovered ? 'translate-x-8 translate-y-[-20px] scale-105' : 'translate-x-28 translate-y-0 scale-100'
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
    setOpacity(0.6);
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setOpacity(0);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-neutral-800 
        bg-neutral-900/30 backdrop-blur-md overflow-hidden 
        p-4 sm:p-6
        ${sizeClasses[size]}
        flex flex-col justify-between
        w-full
        ${className}`}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
        }}
      />
      {/* Card content */}
      <div className="flex flex-col justify-end h-full text-left z-10 relative">
        {children}
      </div>
      {/* Hover image - TOUJOURS visible maintenant */}
      {imageSrc && (
        // <img
        //   src={imageSrc}
        //   alt="Card visual"
        //   className={`absolute right-0 bottom-0 w-auto transform transition-transform duration-500 ease-in-out 
        //     ${imageSizes[size]}
        //     ${imagePositions[size]}
        //     pointer-events-none
        //     opacity-80 sm:opacity-100`} // Légère transparence sur mobile pour mieux voir le texte
        // />
        (<video
          ref={videoRef}
          src={imageSrc} // Replace imageSrc with your video source
          muted
          loop
          playsInline
          className={`absolute right-0 bottom-0 w-auto transform transition-transform duration-500 ease-in-out 
            ${imageSizes[size]}
            ${imagePositions[size]}
            pointer-events-none
            opacity-80 sm:opacity-100
            object-cover`} // Added object-cover for better video fit
        />)
      )}
    </div>
  );
};

export default SpotlightCard;