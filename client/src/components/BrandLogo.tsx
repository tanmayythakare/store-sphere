interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-dark via-brand-navy to-brand-primary p-2 shadow-xs transition-transform group-hover:scale-105 ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="brandGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1282a2" />
            <stop offset="1" stopColor="#7fc8f8" />
          </linearGradient>
          <linearGradient id="innerGrad" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1282a2" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Outer Geometric Frame */}
        <path
          d="M16 3L28 10V22L16 29L4 22V10L16 3Z"
          stroke="url(#brandGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Dynamic Nested Prism */}
        <path
          d="M16 8L23 12.5V20L16 24.5L9 20V12.5L16 8Z"
          fill="url(#innerGrad)"
          fillOpacity="0.2"
          stroke="url(#brandGrad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Center Focal Core */}
        <circle cx="16" cy="16" r="3" fill="url(#brandGrad)" />
      </svg>
    </div>
  );
}
