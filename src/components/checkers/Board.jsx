import Square from './Square'

export default function Board({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
}) {
  return (
    <div className="checkers-board">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isSelected =
            selectedSquare &&
            selectedSquare.row === rowIndex &&
            selectedSquare.col === colIndex

          const isValidMove = validMoves.some(
            (move) => move.row === rowIndex && move.col === colIndex
          )

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              piece={piece}
              isSelected={isSelected}
              isValidMove={isValidMove}
              onSquareClick={onSquareClick}
            />
          )
        })
      )}
    </div>
  )
}
