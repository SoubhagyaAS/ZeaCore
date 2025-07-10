import React from 'react';

interface ZeaCoreIconProps {
  size?: number;
  className?: string;
}

const ZeaCoreIcon: React.FC<ZeaCoreIconProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow effect */}
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="url(#outerGlow)"
        opacity="0.3"
      />
      
      {/* Main circular background with strong contrast */}
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="url(#mainGradient)"
        stroke="url(#borderGradient)"
        strokeWidth="2"
      />
      
      {/* Inner accent ring */}
      <circle
        cx="20"
        cy="20"
        r="13"
        fill="none"
        stroke="url(#accentRing)"
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Central Z design with high contrast */}
      <g transform="translate(20, 20)">
        {/* Z background for better visibility */}
        <path
          d="M-5 -4h10l-7 8h7v2h-10l7-8h-7v-2z"
          fill="#FF6B35"
          stroke="#FFFFFF"
          strokeWidth="0.5"
        />
        {/* Z main design */}
        <path
          d="M-4.5 -3.5h9l-6.5 7h6.5v1.5h-9l6.5-7h-6.5v-1.5z"
          fill="#FFFFFF"
        />
      </g>
      
      {/* Core connection dots with vibrant colors */}
      <circle cx="20" cy="6" r="2" fill="#FF6B35" opacity="0.9" />
      <circle cx="34" cy="20" r="2" fill="#FF6B35" opacity="0.9" />
      <circle cx="20" cy="34" r="2" fill="#FF6B35" opacity="0.9" />
      <circle cx="6" cy="20" r="2" fill="#FF6B35" opacity="0.9" />
      
      {/* Inner dots for depth */}
      <circle cx="20" cy="6" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="34" cy="20" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="20" cy="34" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="6" cy="20" r="1" fill="#FFFFFF" opacity="0.8" />
      
      {/* Gradient definitions */}
      <defs>
        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
        </radialGradient>
        
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#014AAD" />
          <stop offset="50%" stopColor="#60B9F3" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
        
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
        
        <linearGradient id="accentRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ZeaCoreIcon;