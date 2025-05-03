
import { cn } from "@/lib/utils";

interface PurposifyLogoProps {
  className?: string;
  variant?: 'default' | 'white';
  showText?: boolean;
}

const PurposifyLogo = ({ 
  className, 
  variant = 'default',
  showText = true 
}: PurposifyLogoProps) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect 
            width="32" 
            height="32" 
            rx="8" 
            fill={variant === 'white' ? 'white' : '#3B82F6'} 
            fillOpacity={variant === 'white' ? '0.15' : '1'}
          />
          <path 
            d="M16 8L24 16L16 24L8 16L16 8Z" 
            fill={variant === 'white' ? 'white' : '#FFFFFF'} 
            fillOpacity="0.9"
          />
          <circle 
            cx="16" 
            cy="16" 
            r="4" 
            fill={variant === 'white' ? '#1D4ED8' : '#1D4ED8'} 
          />
        </svg>
      </div>
      
      {showText && (
        <h1 className={cn("font-bold text-xl tracking-tight", textColor)}>
          Purposify
        </h1>
      )}
    </div>
  );
};

export default PurposifyLogo;
