import React from 'react';
import { Package } from 'lucide-react';

interface AppLogoProps {
  src?: string | null;
  appName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  logoUrl?: string | null; // Alternative prop name for compatibility
}

const AppLogo: React.FC<AppLogoProps> = ({
  src,
  logoUrl,
  appName = '',
  size = 'md',
  className = ''
}) => {
  // Use either src or logoUrl prop
  const imageUrl = src || logoUrl;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const getAppInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAppGradient = (name: string) => {
    const gradients = [
      'from-royal-blue to-sky-blue',
      'from-purple-500 to-purple-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-500',
      'from-teal-500 to-cyan-600'
    ];
    
    const index = name.length % gradients.length;
    return gradients[index];
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${appName} logo`}
        className={`${sizeClasses[size]} rounded-xl object-cover ${className}`}
        onError={(e) => {
          // Hide the image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${getAppGradient(appName)}
        rounded-xl flex items-center justify-center
        text-soft-white font-bold
        shadow-lg
        ${className}
      `}
    >
      {appName ? (
        getAppInitials(appName)
      ) : (
        <Package className={iconSizes[size]} />
      )}
    </div>
  );
};

export default AppLogo;