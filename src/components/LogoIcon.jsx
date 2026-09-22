export default function LogoIcon({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-icon ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="8" fill="#121212" />
      <rect x="1" y="1" width="46" height="46" rx="7" stroke="#e50914" strokeOpacity="0.5" strokeWidth="1.5" />
      
      {/* Clapper top bar */}
      <rect x="7" y="8" width="34" height="8" rx="2" fill="#1e1e1e" stroke="#333" strokeWidth="1" />
      <line x1="14" y1="8" x2="18" y2="16" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="23" y1="8" x2="27" y2="16" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="8" x2="36" y2="16" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />

      {/* Screen body */}
      <rect x="7" y="18" width="34" height="22" rx="3" fill="#161616" stroke="#2c2c2c" strokeWidth="1" />

      {/* Film holes */}
      <rect x="9" y="21" width="3" height="4" rx="0.8" fill="#2a2a2a" />
      <rect x="9" y="27" width="3" height="4" rx="0.8" fill="#2a2a2a" />
      <rect x="9" y="33" width="3" height="4" rx="0.8" fill="#2a2a2a" />
      <rect x="36" y="21" width="3" height="4" rx="0.8" fill="#2a2a2a" />
      <rect x="36" y="27" width="3" height="4" rx="0.8" fill="#2a2a2a" />
      <rect x="36" y="33" width="3" height="4" rx="0.8" fill="#2a2a2a" />

      {/* Center play icon */}
      <polygon points="20,23 31,29 20,35" fill="#e50914" />
      <polygon points="20,23 26,26.3 20,29.5" fill="#ff3843" />
    </svg>
  )
}
