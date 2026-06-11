import React from 'react'

interface Props {
  type: 'oil' | 'cream'
  colorFrom: string
  colorTo: string
  className?: string
}

export default function ProductImage({ type, colorFrom, colorTo, className = '' }: Props) {
  // Stable deterministic ID — avoids React hydration mismatch from Math.random()
  const uid = `${type}-${colorFrom.replace('#', '')}`

  if (type === 'oil') {
    return (
      <div className={`flex items-center justify-center w-full h-full ${className}`}>
        <svg
          viewBox="0 0 100 248"
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 6px 14px rgba(122,62,104,0.18))' }}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${uid}-body`} x1="0%" y1="0%" x2="100%" y2="110%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
            <linearGradient id={`${uid}-cap`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A1F32" />
              <stop offset="100%" stopColor="#251428" />
            </linearGradient>
            <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.22" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="50" cy="244" rx="32" ry="4" fill="rgba(0,0,0,0.09)" />

          {/* Bottle body */}
          <rect x="22" y="88" width="56" height="152" rx="22" fill={`url(#${uid}-body)`} />
          {/* Body shine (left strip) */}
          <rect x="22" y="88" width="22" height="152" rx="22" fill={`url(#${uid}-shine)`} />

          {/* Bottle neck */}
          <rect x="34" y="52" width="32" height="44" rx="9" fill={colorFrom} />
          {/* Neck shine */}
          <rect x="34" y="52" width="12" height="44" rx="9" fill="rgba(255,255,255,0.13)" />

          {/* Cap */}
          <rect x="27" y="22" width="46" height="36" rx="13" fill={`url(#${uid}-cap)`} />
          {/* Cap left highlight */}
          <rect x="27" y="22" width="18" height="36" rx="13" fill="rgba(255,255,255,0.06)" />
          {/* Cap bottom ridge line */}
          <rect x="27" y="53" width="46" height="5" rx="2" fill="rgba(0,0,0,0.15)" />

          {/* Dropper glass tube */}
          <rect x="46" y="2" width="8" height="24" rx="4" fill="#2A1826" />

          {/* Dropper rubber bulb */}
          <ellipse cx="50" cy="4" rx="7" ry="6" fill="#2A1826" />
          <ellipse cx="50" cy="3" rx="3.5" ry="3" fill="rgba(255,255,255,0.08)" />

          {/* Label background */}
          <rect x="28" y="106" width="44" height="86" rx="7" fill="rgba(255,255,255,0.93)" />

          {/* Label top accent line */}
          <rect x="28" y="106" width="44" height="4" rx="7" fill={colorFrom} opacity="0.45" />

          {/* "Veluna" brand name */}
          <text x="50" y="127" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="10" fill="#2F1F2E" fontStyle="italic" fontWeight="bold">
            Veluna
          </text>

          {/* Thin separator line */}
          <line x1="34" y1="132" x2="66" y2="132" stroke={colorTo} strokeWidth="0.7" opacity="0.55" />

          {/* Arabic product name – 2 lines */}
          <text x="50" y="144" textAnchor="middle" fontFamily="Cairo, sans-serif"
            fontSize="7.5" fill="#3D1F30" fontWeight="600">
            زيت إزالة
          </text>
          <text x="50" y="155" textAnchor="middle" fontFamily="Cairo, sans-serif"
            fontSize="7" fill={colorTo} fontWeight="500">
            الشعر
          </text>

          {/* Small decorative dot row */}
          <circle cx="44" cy="165" r="1.2" fill={colorTo} opacity="0.4" />
          <circle cx="50" cy="165" r="1.2" fill={colorTo} opacity="0.4" />
          <circle cx="56" cy="165" r="1.2" fill={colorTo} opacity="0.4" />

          {/* Volume */}
          <text x="50" y="179" textAnchor="middle" fontFamily="Cairo, sans-serif"
            fontSize="6" fill="#8B7A88">
            150 مل
          </text>
        </svg>
      </div>
    )
  }

  // ── Cream Jar ──────────────────────────────────────
  return (
    <div className={`flex items-center justify-center w-full h-full ${className}`}>
      <svg
        viewBox="0 0 172 192"
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 6px 14px rgba(196,115,138,0.20))' }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-jar`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
          <linearGradient id={`${uid}-lid`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ECBFD4" />
            <stop offset="100%" stopColor="#C87896" />
          </linearGradient>
          <linearGradient id={`${uid}-lidtop`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0CADA" />
            <stop offset="100%" stopColor="#D9A0B8" />
          </linearGradient>
          <linearGradient id={`${uid}-jshine`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="86" cy="186" rx="66" ry="6" fill="rgba(0,0,0,0.09)" />

        {/* Jar body */}
        <rect x="16" y="104" width="140" height="78" rx="16" fill={`url(#${uid}-jar)`} />
        {/* Jar body shine */}
        <rect x="16" y="104" width="58" height="78" rx="16" fill={`url(#${uid}-jshine)`} />

        {/* Jar bottom darker edge (depth) */}
        <ellipse cx="86" cy="181" rx="70" ry="9" fill={colorTo} opacity="0.35" />

        {/* Lid body */}
        <rect x="8" y="62" width="156" height="50" rx="25" fill={`url(#${uid}-lid)`} />
        {/* Lid shine */}
        <rect x="8" y="62" width="74" height="50" rx="25" fill="rgba(255,255,255,0.13)" />

        {/* Lid top surface (3D perspective) */}
        <ellipse cx="86" cy="62" rx="78" ry="16" fill={`url(#${uid}-lidtop)`} />

        {/* Lid top highlight */}
        <ellipse cx="86" cy="59" rx="44" ry="9" fill="rgba(255,255,255,0.25)" />

        {/* "Veluna" text on lid */}
        <text x="86" y="95" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="13" fill="white" fontStyle="italic" fontWeight="bold"
          style={{ letterSpacing: '0.5px' }}>
          Veluna
        </text>

        {/* Label background */}
        <rect x="38" y="116" width="96" height="58" rx="8" fill="rgba(255,255,255,0.92)" />

        {/* Label top accent */}
        <rect x="38" y="116" width="96" height="4" rx="8" fill={colorFrom} opacity="0.50" />

        {/* Arabic product name */}
        <text x="86" y="135" textAnchor="middle" fontFamily="Cairo, sans-serif"
          fontSize="8.5" fill="#3D1F30" fontWeight="700">
          كريم الشعر
        </text>

        {/* Separator */}
        <line x1="50" y1="140" x2="122" y2="140" stroke={colorTo} strokeWidth="0.7" opacity="0.5" />

        {/* Second line */}
        <text x="86" y="153" textAnchor="middle" fontFamily="Cairo, sans-serif"
          fontSize="7.5" fill={colorTo} fontWeight="500">
          تحت الجلد
        </text>

        {/* Dot row */}
        <circle cx="78" cy="161" r="1.3" fill={colorTo} opacity="0.4" />
        <circle cx="86" cy="161" r="1.3" fill={colorTo} opacity="0.4" />
        <circle cx="94" cy="161" r="1.3" fill={colorTo} opacity="0.4" />

        {/* Volume */}
        <text x="86" y="168" textAnchor="middle" fontFamily="Cairo, sans-serif"
          fontSize="6.5" fill="#8B7A88">
          200 مل
        </text>
      </svg>
    </div>
  )
}
