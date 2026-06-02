export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="명리사주 로고"
    >
      <defs>
        <linearGradient id="logoGradA" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="logoGradB" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 외곽 팔각형 */}
      <path
        d="M16 1.5L22.5 5.5V12L27.5 16L22.5 20V26.5L16 30.5L9.5 26.5V20L4.5 16L9.5 12V5.5L16 1.5Z"
        fill="url(#logoGradA)"
        opacity="0.15"
      />
      <path
        d="M16 1.5L22.5 5.5V12L27.5 16L22.5 20V26.5L16 30.5L9.5 26.5V20L4.5 16L9.5 12V5.5L16 1.5Z"
        stroke="url(#logoGradA)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* 내부 사각형 (사주 四柱 상징) */}
      <rect x="11" y="11" width="10" height="10" rx="1.5"
        fill="url(#logoGradA)" opacity="0.12" />

      {/* 사주 4기둥 */}
      <rect x="12" y="13" width="2" height="6" rx="0.8" fill="url(#logoGradB)" />
      <rect x="15" y="12" width="2" height="8" rx="0.8" fill="url(#logoGradA)" />
      <rect x="18" y="13.5" width="2" height="5" rx="0.8" fill="url(#logoGradB)" opacity="0.85" />

      {/* 상단 점 — 북두칠성 느낌 */}
      <circle cx="16" cy="7" r="1.2" fill="url(#logoGradB)" />
      <circle cx="11" cy="9" r="0.8" fill="#a78bfa" opacity="0.5" />
      <circle cx="21" cy="9" r="0.8" fill="#a78bfa" opacity="0.5" />
    </svg>
  );
}
