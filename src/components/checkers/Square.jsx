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
    'checkers-square',
    isLight ? 'light' : 'dark',
    isSelected && 'selected',
    isValidMove && 'valid-move',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={squareClass}
      onClick={onClick}
      aria-label={`Square ${String.fromCharCode(97 + col)}${8 - row}`}
    >
      {isValidMove && <div className="move-indicator" />}
      {piece && (
        <div className={`checkers-piece piece-${piece.color}`}>
          {piece.isKing && <span className="king-crown">♔</span>}
        </div>
      )}
    </button>
  )
}
