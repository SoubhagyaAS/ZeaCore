import React from 'react';
import ZeaCoreIcon from './ZeaCoreIcon';

interface ZeaCoreLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical';
  className?: string;
  showTagline?: boolean;
}

const ZeaCoreLogo: React.FC<ZeaCoreLogoProps> = ({ 
  size = 'md', 
  variant = 'horizontal',
  className = '',
  showTagline = false 
}) => {
  const sizeConfig = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 36, text: 'text-xl', tagline: 'text-sm' },
    lg: { icon: 44, text: 'text-2xl', tagline: 'text-base' },
    xl: { icon: 52, text: 'text-3xl', tagline: 'text-lg' }
  };

  const config = sizeConfig[size];

  // Determine text color based on className or default
  const getTextColorClass = () => {
    if (className.includes('text-soft-white')) {
      return 'text-soft-white';
    }
    if (className.includes('text-charcoal')) {
      return 'text-charcoal';
    }
    // Default to soft-white for dark backgrounds
    return 'text-soft-white';
  };

  const textColorClass = getTextColorClass();
  const taglineColorClass = textColorClass === 'text-soft-white' ? 'text-sky-blue' : 'text-sky-blue';
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <ZeaCoreIcon size={config.icon} />
        <div className="mt-3 text-center">
          <h1 className={`font-bold ${textColorClass} ${config.text} tracking-wide`}>
            <span className="bg-gradient-to-r from-bright-cyan to-sky-blue bg-clip-text text-transparent">
              Zea
            </span>
            <span className={textColorClass}>Core</span>
          </h1>
          {showTagline && (
            <p className={`${taglineColorClass} font-medium ${config.tagline} mt-1`}>
              Enterprise SaaS Platform
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <ZeaCoreIcon size={config.icon} />
      <div className="ml-4">
        <h1 className={`font-bold ${textColorClass} ${config.text} tracking-wide`}>
          <span className="bg-gradient-to-r from-bright-cyan to-sky-blue bg-clip-text text-transparent">
            Zea
          </span>
          <span className={textColorClass}>Core</span>
        </h1>
        {showTagline && (
          <p className={`${taglineColorClass} font-medium ${config.tagline}`}>
            Enterprise SaaS Platform
          </p>
        )}
      </div>
    </div>
  );
};

export default ZeaCoreLogo;