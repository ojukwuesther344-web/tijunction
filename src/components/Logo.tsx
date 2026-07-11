import React from 'react';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function TijunctionIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none pointer-events-none`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main T Horizontal Gradient */}
        <linearGradient id="tGradient" x1="110" y1="187" x2="390" y2="187" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" /> {/* Vivid blue */}
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="55%" stopColor="#6d28d9" /> {/* Violet */}
          <stop offset="80%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
        </linearGradient>

        {/* Stem dark vertical gradient (bottom is near-indigo black) */}
        <linearGradient id="stemGradient" x1="250" y1="200" x2="250" y2="415" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
          <stop offset="45%" stopColor="#0f113a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#080721" />
        </linearGradient>

        {/* Avatar Gradients */}
        <linearGradient id="avatarBlue" x1="190" y1="100" x2="230" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        
        <linearGradient id="avatarPurple" x1="225" y1="80" x2="275" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>

        <linearGradient id="avatarMagenta" x1="270" y1="100" x2="310" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>

        {/* Shadow Drop Filter */}
        <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#090d16" floodOpacity="0.25" />
        </filter>

        {/* Clipping path for absolute precision shape */}
        <clipPath id="tClip">
          <path d="M 125,150 h 250 a 15,15 0 0 1 15,15 v 45 a 15,15 0 0 1 -15,15 H 320 a 30,30 0 0 0 -30,30 v 145 a 15,15 0 0 1 -15,15 h -50 a 15,15 0 0 1 -15,-15 v -145 a 30,30 0 0 0 -30,-30 H 125 a 15,15 0 0 1 -15,-15 v -45 a 15,15 0 0 1 15,-15 Z" />
        </clipPath>
      </defs>

      {/* --- PEOPLE AVATARS RISING BEHIND --- */}
      {/* 1. Left Avatar (Blue) */}
      <circle cx="210" cy="118" r="24" fill="url(#avatarBlue)" />
      <path d="M 175,155 C 175,128 245,128 245,155 Z" fill="url(#avatarBlue)" opacity="0.95" />

      {/* 2. Right Avatar (Pink/Magenta) */}
      <circle cx="290" cy="118" r="24" fill="url(#avatarMagenta)" />
      <path d="M 255,155 C 255,128 325,128 325,155 Z" fill="url(#avatarMagenta)" opacity="0.95" />

      {/* 3. Center Avatar (Purple) (Overlaps Left & Right) */}
      <circle cx="250" cy="95" r="32" fill="url(#avatarPurple)" filter="url(#dropShadow)" />
      <path d="M 195,150 C 195,110 305,110 305,150 Z" fill="url(#avatarPurple)" filter="url(#dropShadow)" />

      {/* --- MAIN "T" JUNCTION BODY --- */}
      {/* Background shape with gradient clipping */}
      <rect x="90" y="130" width="320" height="300" fill="url(#tGradient)" clipPath="url(#tClip)" filter="url(#dropShadow)" />
      
      {/* Stem dark color fade overlay inside body boundaries */}
      <rect x="200" y="215" width="105" height="210" fill="url(#stemGradient)" clipPath="url(#tClip)" />

      {/* --- ROADWAY NETWORK LINES --- */}
      {/* 1. Left Curved Lane Divider (Solid White Curve) */}
      <path 
        d="M 250,335 C 250,265 195,187.5 110,187.5" 
        stroke="white" 
        strokeWidth="11" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.95"
      />

      {/* 2. Right Curved Lane Divider (Solid White Curve) */}
      <path 
        d="M 250,335 C 250,265 305,187.5 390,187.5" 
        stroke="white" 
        strokeWidth="11" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.95"
      />

      {/* 3. Bottom Vertical Lane Separation Dash Marks */}
      <line 
        x1="250" 
        y1="345" 
        x2="250" 
        y2="415" 
        stroke="white" 
        strokeWidth="11" 
        strokeDasharray="18 18" 
        strokeLinecap="round" 
        opacity="0.95"
      />

      {/* 4. Left wing horizontal lane separation dashes */}
      <line 
        x1="185" 
        y1="187.5" 
        x2="135" 
        y2="187.5" 
        stroke="white" 
        strokeWidth="6" 
        strokeDasharray="16 16" 
        strokeLinecap="round" 
        opacity="0.75"
      />

      {/* 5. Right wing horizontal lane separation dashes */}
      <line 
        x1="315" 
        y1="187.5" 
        x2="365" 
        y2="187.5" 
        stroke="white" 
        strokeWidth="6" 
        strokeDasharray="16 16" 
        strokeLinecap="round" 
        opacity="0.75"
      />
    </svg>
  );
}

export default function Logo({ showText = true, size = 'sm', className = '' }: LogoProps) {
  // Define logo heights
  const dimensions = {
    sm: { icon: 'w-12 h-12', title: 'text-[22px]', subtitle: 'text-[7.5px]' },
    md: { icon: 'w-16 h-16', title: 'text-[28px]', subtitle: 'text-[10.5px]' },
    lg: { icon: 'w-24 h-24', title: 'text-4xl', subtitle: 'text-[12px]' },
    xl: { icon: 'w-36 h-36', title: 'text-5xl', subtitle: 'text-[14px]' }
  };

  const selected = dimensions[size];

  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 select-none ${className}`}>
      {/* Custom drawing of the Tijunction T icon */}
      <TijunctionIcon className={`${selected.icon} flex-shrink-0`} />
      
      {showText && (
        <div className="flex flex-col justify-center select-none font-logo whitespace-nowrap flex-shrink-0">
          <div className={`${selected.title} font-black tracking-tight leading-none mb-1 flex items-center whitespace-nowrap flex-shrink-0`}>
            {/* "Ti" is sky-blue gradient or solid color, "connect" is professional deep slate/navy */}
            <span className="text-[#1a56db] font-extrabold whitespace-nowrap flex-shrink-0">Ti</span>
            <span className="text-[#0a0f2d] font-extrabold flex items-center whitespace-nowrap flex-shrink-0">
              <span>connect</span>
            </span>
          </div>
          <div className={`${selected.subtitle} text-slate-500 font-extrabold tracking-[0.16em] uppercase leading-none flex items-center gap-1.5 whitespace-nowrap flex-shrink-0`}>
            <span>Connect</span>
            <span className="text-[#1a56db] font-black scale-110 select-none">•</span>
            <span>Share</span>
            <span className="text-[#9333ea] font-black scale-110 select-none">•</span>
            <span>Belong</span>
          </div>
        </div>
      )}
    </div>
  );
}
