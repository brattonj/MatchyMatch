/**
 * @file WordleTile.jsx
 * @description Individual tile component for Wordle game.
 * Displays a single letter with state-based styling and animations (flip, bounce).
 * States: empty, active, filled, correct, present, absent.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.letter=""] - Letter to display
 * @param {string} [props.state="empty"] - Tile state: 'empty', 'active', 'filled', 'correct', 'present', or 'absent'
 * @param {number} [props.flipDelay=0] - Delay in milliseconds for flip animation
 * @param {boolean} [props.bounce=false] - Whether to apply bounce animation
 * @returns {JSX.Element} Styled tile with letter and animations
 */

import { clsx } from "clsx";

// state: "empty" | "active" | "filled" | "correct" | "present" | "absent"
export default function WordleTile({ letter = "", state = "empty", flipDelay = 0, bounce = false }) {
  const isRevealed = state === "correct" || state === "present" || state === "absent";

  const stateStyles = {
    empty: {
      background: "var(--bg-surface)",
      border: "1.5px solid var(--separator-opaque)",
      color: "transparent",
    },
    active: {
      background: "var(--bg-surface)",
      border: "1.5px solid var(--separator-opaque)",
      color: "var(--label-primary)",
    },
    filled: {
      background: "var(--bg-surface)",
      border: "1.5px solid var(--accent)",
      color: "var(--label-primary)",
    },
    correct: {
      background: "#34c759",
      border: "1.5px solid #34c759",
      color: "#ffffff",
    },
    present: {
      background: "#ff9f0a",
      border: "1.5px solid #ff9f0a",
      color: "#ffffff",
    },
    absent: {
      background: "var(--fill-secondary)",
      border: "1.5px solid transparent",
      color: "var(--label-tertiary)",
    },
  };

  return (
    <div
      className={clsx(
        "wordle-tile relative flex items-center justify-center",
        "w-14 h-14 rounded-xl select-none",
        "text-xl font-bold uppercase tracking-wider",
        isRevealed && "wordle-flip",
        bounce && "wordle-bounce",
      )}
      style={{
        ...stateStyles[state],
        animationDelay: isRevealed ? `${flipDelay}ms` : "0ms",
        perspective: "250px",
        boxShadow: state === "empty" || state === "active" ? "var(--shadow-xs)" : "none",
      }}
    >
      {letter}
    </div>
  );
}
