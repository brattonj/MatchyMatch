/**
 * @file Board.jsx
 * @description Chess board grid component displaying 8×8 squares with pieces.
 * Renders individual squares and handles square selection and move validation visualization.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Array<Object|null>>} props.board - 8×8 board state with piece objects or null
 * @param {Object|null} props.selectedSquare - Currently selected square {row, col} or null
 * @param {Array<Object>} props.validMoves - Array of valid move positions {row, col}
 * @param {Function} props.onSquareClick - Callback when a square is clicked, receives (row, col)
 * @returns {JSX.Element} Chess board grid with 64 squares
 */

import Square from './Square'

export default function Board({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
}) {
  return (
    <div className="chess-board">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="chess-row">
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
