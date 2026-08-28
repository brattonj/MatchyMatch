/**
 * @file Tile.jsx
 * @description Individual tile component for the Matchy Match game board.
 * Displays a word and handles selection state with visual feedback.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.word - The word to display on the tile
 * @param {boolean} props.isSelected - Whether the tile is currently selected
 * @param {boolean} props.isRevealed - Whether the tile has been matched and revealed
 * @param {Function} props.onClick - Callback when tile is clicked
 * @returns {React.ReactElement} Interactive tile button with word
 */

import { clsx } from "clsx";

export default function Tile({ word, isSelected, isRevealed, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isRevealed}
      className={clsx(
        "tile-transition relative flex items-center justify-center rounded-2xl",
        "text-xs font-semibold tracking-widest uppercase cursor-pointer select-none",
        "h-16 w-full focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-blue-500/50",
        {
          "opacity-0 pointer-events-none": isRevealed,
        }
      )}
      style={
        isSelected
          ? {
              background: "var(--accent-light)",
              border: "1.5px solid var(--accent)",
              color: "var(--accent)",
              boxShadow: "0 0 0 3px rgba(0,122,255,0.12)",
              transform: "scale(0.96)",
            }
          : {
              background: "var(--bg-surface)",
              border: "0.5px solid rgba(0,0,0,0.08)",
              color: "var(--label-secondary)",
              boxShadow: "var(--shadow-sm)",
            }
      }
      onMouseEnter={(e) => {
        if (!isSelected && !isRevealed) {
          e.currentTarget.style.background = "#f9f9fb";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
          e.currentTarget.style.color = "var(--label-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isRevealed) {
          e.currentTarget.style.background = "var(--bg-surface)";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          e.currentTarget.style.transform = "";
          e.currentTarget.style.color = "var(--label-secondary)";
        }
      }}
    >
      {word}
    </button>
  );
}
