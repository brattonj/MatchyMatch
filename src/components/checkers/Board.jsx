import Square from './Square'

export default function Board({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
}) {
  return (
    <div className="checkers-board">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="checkers-row">
          {row.map((piece, colIdx) => {
            const isSelected =
              selectedSquare &&
              selectedSquare.row === rowIdx &&
              selectedSquare.col === colIdx

            const isValidMove = validMoves.some(
              (move) => move.row === rowIdx && move.col === colIdx
            )

            const isLight = (rowIdx + colIdx) % 2 === 0

            return (
              <Square
                key={`${rowIdx}-${colIdx}`}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onClick={() => onSquareClick(rowIdx, colIdx)}
                row={rowIdx}
                col={colIdx}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
