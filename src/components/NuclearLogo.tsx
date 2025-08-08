import React from 'react';

interface NuclearLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const NuclearLogo: React.FC<NuclearLogoProps> = ({ 
  size = 132, 
  className = "", 
  animated = false 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer radiation circle */}
  
      
      {/* Nuclear symbol background */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="#1F2937"
        stroke="#F97316"
        strokeWidth="3"
      />
      
      {/* Nuclear trefoil symbol */}
      <g transform="translate(50,50)">
        {/* Center circle */}
        <circle cx="0" cy="0" r="8" fill="#F97316" />
        
        {/* Three radiation sectors */}
        <g>
          <path
            d="M 0,-25 A 25,25 0 0,1 21.65,-12.5 L 10.83,-6.25 A 12.5,12.5 0 0,0 0,-12.5 Z"
            fill="#F97316"
          />
          <path
            d="M 21.65,12.5 A 25,25 0 0,1 -21.65,12.5 L -10.83,6.25 A 12.5,12.5 0 0,0 10.83,6.25 Z"
            fill="#F97316"
          />
          <path
            d="M -21.65,-12.5 A 25,25 0 0,1 0,-25 L 0,-12.5 A 12.5,12.5 0 0,0 -10.83,-6.25 Z"
            fill="#F97316"
          />
        </g>
        
        {/* Inner glow effect */}
        <circle cx="0" cy="0" r="6" fill="#FED7AA" opacity="0.8" />
        <circle cx="0" cy="0" r="4" fill="#FDBA74" opacity="0.6" />
        <circle cx="0" cy="0" r="2" fill="#FB923C" />
      </g>
      
      {/* Outer glow rings */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#F97316"
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#F97316"
        strokeWidth="0.5"
        opacity="0.2"
      />
    </svg>
  );
};