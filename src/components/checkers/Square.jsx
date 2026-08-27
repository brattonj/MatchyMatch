export default function Square({
  row,
  col,
  piece,
  isSelected,
  isValidMove,
  onSquareClick,
}) {
  const isLight = (row + col) % 2 === 0
  const isHighlighted = isSelected || isValidMove

  return (
    <button
      onClick={() => onSquareClick(row, col)}
      className={`checkers-square ${isLight ? 'checkers-square--light' : 'checkers-square--dark'} ${
        isSelected ? 'checkers-square--selected' : ''
      } ${isValidMove ? 'checkers-square--valid-move' : ''}`}
      aria-label={`Square ${String.fromCharCode(97 + col)}${8 - row}`}
    >
      {piece && (
        <div
          className={`checkers-piece checkers-piece--${piece.includes('red') ? 'red' : 'black'} ${
            piece.includes('king') ? 'checkers-piece--king' : ''
          }`}
        >
          {piece.includes('king') && <span className="checkers-piece__crown">♔</span>}
        </div>
      )}
      {isValidMove && <div className="checkers-square__indicator" />}
    </button>
  )
}
