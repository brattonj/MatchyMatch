/**
 * @file LivesDisplay.jsx
 * @description Displays remaining lives as text and visual indicators (dots).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.lives - Current number of lives remaining
 * @param {number} [props.maxLives=5] - Maximum number of lives
 * @returns {React.ReactElement} Lives display with text and dot indicators
 */

export default function LivesDisplay({ lives, maxLives = 5 }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="text-xs font-medium tracking-wide"
        style={{ color: "var(--label-tertiary)", letterSpacing: "0.04em" }}
      >
        {lives === 1 ? "1 life remaining" : `${lives} lives remaining`}
      </span>
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: maxLives }).map((_, i) => {
          const alive = i < lives;
          return (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: alive ? "var(--accent)" : "var(--fill-secondary)",
                transform: alive ? "scale(1)" : "scale(0.7)",
                opacity: alive ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
