interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "current" | "accent";
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const COLOR_CLASSES = {
  current: "text-current",
  accent: "text-accent",
};

export default function Spinner({
  className = "",
  size = "sm",
  color = "current",
}: SpinnerProps) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.current;

  return (
    <svg
      className={`animate-spin ${sizeClass} ${colorClass} ${className}`.trim()}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
