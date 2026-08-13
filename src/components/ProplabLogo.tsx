import React from 'react';

interface ProplabLogoProps {
  className?: string;
  size?: number;
}

export const ProplabLogo: React.FC<ProplabLogoProps> = ({ className = "w-8 h-8", size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Top Deep Blue Shape (Proplab upper mark) */}
      <path
        d="M32 14 H116 C157 14 190 47 190 88 C190 129 157 142 116 142 H92 C58 142 32 115 32 82 V14 Z"
        fill="#0E32BE"
      />
      {/* Bottom Light Cyan/Blue Shape (Proplab lower mark) */}
      <path
        d="M19 114 C19 98 33 86 51 86 H110 V185 H51 C33 185 19 171 19 153 V114 Z"
        fill="#3AC5FE"
      />
    </svg>
  );
};
