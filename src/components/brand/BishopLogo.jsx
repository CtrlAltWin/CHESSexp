import React from 'react';

/**
 * CHESSexp Brand Logo: Distinctive Bishop tilted at 16 degrees.
 * Clean, minimal vector silhouette that works on light and dark backgrounds.
 */
export default function BishopLogo({
  size = 32,
  tiltAngle = 16,
  className = '',
  accentColor = '#48c774',
  primaryColor = 'currentColor',
  withGlow = false
}) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="CHESSexp Bishop Logo"
    >
      {withGlow && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          <linearGradient id="chessexpBishopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color={accentColor} />
            <stop offset="100%" stop-color="#22c55e" />
          </linearGradient>
        </defs>

        {/* Tilted Bishop Group */}
        <g transform={`rotate(${tiltAngle}, 50, 52) translate(0, -2)`}>
          {/* Top finial sphere */}
          <circle cx="50" cy="18" r="4" fill="url(#chessexpBishopGrad)" />

          {/* Bishop Head / Mitre */}
          <path
            d="M 44 26 
               C 41 33, 40 43, 43 51
               C 45 54, 55 54, 57 51
               C 60 43, 59 33, 56 26
               C 54 22, 46 22, 44 26 Z"
            fill="url(#chessexpBishopGrad)"
          />

          {/* Mitre cut / slash notch */}
          <path
            d="M 46 32 L 53 40"
            stroke="#0c1017"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Collar / Neck ring */}
          <rect
            x="41.5"
            y="52"
            width="17"
            height="4"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.9"
          />

          {/* Body waist */}
          <path
            d="M 44 56 C 44 65, 38 72, 34 76 L 66 76 C 62 72, 56 65, 56 56 Z"
            fill="url(#chessexpBishopGrad)"
          />

          {/* Upper base pedestal rim */}
          <path
            d="M 31 77 C 31 76, 69 76, 69 77 L 72 82 C 72 83, 28 83, 28 82 Z"
            fill={primaryColor}
            fillOpacity="0.95"
          />

          {/* Bottom base pedestal */}
          <rect
            x="24"
            y="83"
            width="52"
            height="5"
            rx="2.5"
            fill="url(#chessexpBishopGrad)"
          />
        </g>
      </svg>
    </div>
  );
}
