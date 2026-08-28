/**
 * @file RevealedCategory.jsx
 * @description Displays a correctly matched category with its title and words.
 * Shows category-specific styling based on color theme.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object with title, words, and color
 * @param {string} props.category.title - Category title/theme
 * @param {Array<string>} props.category.words - Words in the category
 * @param {string} props.category.color - Color theme identifier
 * @returns {React.ReactElement} Styled category display with title and words
 */

import { COLOR_STYLES } from "../data/puzzles";

export default function RevealedCategory({ category }) {
  const styles = COLOR_STYLES[category.color];

  return (
    <div
      className="bounce-in rounded-2xl px-5 py-4 flex flex-col items-center justify-center gap-1 w-full"
      style={{
        background: styles.bg,
        minHeight: "5rem",
      }}
    >
      <p
        className="text-xs font-semibold tracking-[0.08em] uppercase"
        style={{ color: styles.titleColor }}
      >
        {category.title}
      </p>
      <p
        className="text-xs font-medium tracking-wide"
        style={{ color: styles.wordsColor }}
      >
        {category.words.join("  ·  ")}
      </p>
    </div>
  );
}
