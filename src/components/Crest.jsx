export default function Crest({ size = 44, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Chattogram Titans FC crest"
    >
      <path
        d="M32 2 L58 12 V30 C58 46 47 57 32 62 C17 57 6 46 6 30 V12 Z"
        fill="var(--color-pitch)"
        stroke="var(--color-gold)"
        strokeWidth="2"
      />
      <path d="M32 2 L58 12 V30 C58 46 47 57 32 62 Z" fill="var(--color-pitch-light)" opacity="0.5" />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontFamily="Anton, sans-serif"
        fontSize="22"
        fill="var(--color-line)"
      >
        CT
      </text>
    </svg>
  );
}
