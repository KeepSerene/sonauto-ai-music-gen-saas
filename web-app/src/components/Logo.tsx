// ─────────────────────────────────────────────────────────────────────────────
// ICON — LOGO MARK
// ─────────────────────────────────────────────────────────────────────────────
export const SonautoIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-label="Sonauto logo mark"
  >
    <line
      x1="2"
      y1="32"
      x2="62"
      y2="32"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.25"
    />

    <path
      d="M 5,32 C 11,4 27,4 32,32 C 37,60 53,60 59,32"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
    />

    {/* Start */}
    <circle cx="5" cy="32" r="3" fill="currentColor" />

    {/* Peak */}
    <circle cx="19" cy="11" r="3" fill="currentColor" />

    {/* Center crossing */}
    <circle cx="32" cy="32" r="3" fill="currentColor" />

    {/* Trough */}
    <circle cx="45" cy="53" r="3" fill="currentColor" />

    {/* End */}
    <circle cx="59" cy="32" r="3" fill="currentColor" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOGO — ICON + WORDMARK
// ─────────────────────────────────────────────────────────────────────────────
interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 32, showText = true, className = "" }: LogoProps) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      gap: `${Math.round(size * 0.28)}px`,
    }}
  >
    <SonautoIcon size={size} />

    {showText && (
      <span
        style={{
          fontFamily:
            "var(--font-sans), 'Libre Franklin', ui-sans-serif, system-ui, sans-serif",
          fontSize: `${size * 0.72}px`,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        Sonauto
      </span>
    )}
  </div>
);

export default Logo;
