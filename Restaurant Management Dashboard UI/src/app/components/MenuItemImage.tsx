import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface MenuItemImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function MenuItemImage({ src, alt, className }: MenuItemImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-[#F5F0E8] to-[#E8DED0] flex flex-col items-center justify-center`}>
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-20 h-20 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-10 h-10 text-[#8B5A2B]/40" strokeWidth={1.5} />
          </div>
          <p className="text-[#8B5A2B]/60 text-sm font-medium tracking-wide text-center">
            Image Not Available
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-[#F5F0E8] to-[#E8DED0] flex items-center justify-center absolute inset-0`}>
          <div className="w-12 h-12 rounded-full border-4 border-[#8B5A2B]/20 border-t-[#8B5A2B] animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
}
