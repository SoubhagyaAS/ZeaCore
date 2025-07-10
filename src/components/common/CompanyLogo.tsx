import React from 'react';
import { Building } from 'lucide-react';

interface CompanyLogoProps {
  src?: string | null;
  companyName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  src,
  companyName = '',
  size = 'md',
  className = ''
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

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompanyColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600'
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={`${companyName} logo`}
        className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${getCompanyColor(companyName)}
        rounded-lg flex items-center justify-center
        text-soft-white font-bold
        ${className}
      `}
    >
      {companyName ? (
        getCompanyInitials(companyName)
      ) : (
        <Building className={iconSizes[size]} />
      )}
    </div>
  );
};

export default CompanyLogo;