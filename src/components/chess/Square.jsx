/**
 * @file Square.jsx
 * @description Individual chess board square component.
 * Displays a single square with piece (if present), selection state, and valid move indicator.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object|null} props.piece - Piece object {type, color} or null if empty
 * @param {boolean} props.isLight - Whether square is a light square
 * @param {boolean} props.isSelected - Whether square is currently selected
 * @param {boolean} props.isValidMove - Whether square is a valid move destination
 * @param {Function} props.onClick - Callback when square is clicked
 * @param {number} props.row - Row index (0-7)
 * @param {number} props.col - Column index (0-7)
 * @returns {JSX.Element} Chess square button with piece and indicators
 */

const PIECE_SYMBOLS = {
  pawn: { white: '♙', black: '♟' },
  rook: { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' },
}

export default function Square({
  piece,
  isLight,
  isSelected,
  isValidMove,
  onClick,
  row,
  col,
}) {
  const squareClass = [
    'chess-square',
    isLight ? 'light' : 'dark',
    isSelected && 'selected',
    isValidMove && 'valid-move',
  ]
    .filter(Boolean)
    .join(' ')

  const symbol = piece ? PIECE_SYMBOLS[piece.type][piece.color] : ''

  return (
    <button
      className={squareClass}
      onClick={onClick}
      aria-label={`Square ${String.fromCharCode(97 + col)}${8 - row}`}
    >
      {isValidMove && <div className="move-indicator" />}
      {piece && (
        <span className={`piece piece-${piece.color}`}>{symbol}</span>
      )}
    </button>
  )
}
