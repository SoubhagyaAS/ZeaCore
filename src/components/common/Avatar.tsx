import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  shape = 'circle',
  className = '',
  fallbackIcon
}) => {
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

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientClass = (name: string) => {
    const gradients = [
      'from-royal-blue to-sky-blue',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600'
    ];
    
    const index = name.length % gradients.length;
    return gradients[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} ${shapeClasses[shape]}
        bg-gradient-to-br ${getGradientClass(name)}
        flex items-center justify-center
        text-soft-white font-medium
        ${className}
      `}
    >
      {name ? (
        getInitials(name)
      ) : fallbackIcon ? (
        fallbackIcon
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

export default Avatar;