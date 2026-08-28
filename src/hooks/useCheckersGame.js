import { useState, useCallback } from 'react'
import {
  initializeBoard,
  getValidMoves,
  makeMove,
  isGameOver,
} from '../utils/checkersRules'

export function useCheckersGame() {
  const [board, setBoard] = useState(() => initializeBoard())
  const [turn, setTurn] = useState('red')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [capturedPieces, setCapturedPieces] = useState({ red: 0, black: 0 })
  const [gameStatus, setGameStatus] = useState('active')

  const validMoves = selectedSquare
    ? getValidMoves(board, selectedSquare.row, selectedSquare.col)
    : []

  const selectSquare = useCallback(
    (square) => {
      if (gameStatus !== 'active') return

      const piece = board[square.row][square.col]

      // If clicking the same square, deselect
      if (
        selectedSquare &&
        selectedSquare.row === square.row &&
        selectedSquare.col === square.col
      ) {
        setSelectedSquare(null)
        return
      }

      // If clicking a piece of the current player, select it
      if (piece && piece.color === turn) {
        setSelectedSquare(square)
      } else if (!piece) {
        // If clicking empty square, deselect
        setSelectedSquare(null)
      }
    },
    [board, selectedSquare, turn, gameStatus]
  )

  const makeGameMove = useCallback(
    (toSquare) => {
      if (!selectedSquare) return

      const fromSquare = selectedSquare
      const moves = getValidMoves(board, fromSquare.row, fromSquare.col)
      const validMove = moves.find(
        (m) => m.row === toSquare.row && m.col === toSquare.col
      )

      if (!validMove) return

      const { newBoard, capturedPiece } = makeMove(
        board,
        fromSquare.row,
        fromSquare.col,
        toSquare.row,
        toSquare.col
      )

      setBoard(newBoard)
      setSelectedSquare(null)

      // Update captured pieces count
      if (capturedPiece) {
        setCapturedPieces((prev) => ({
          ...prev,
          [turn]: prev[turn] + 1,
        }))
      }

      // Update move history
      setMoveHistory((prev) => [
        ...prev,
        {
          from: fromSquare,
          to: toSquare,
          captured: !!capturedPiece,
        },
      ])

      // Switch turn
      const newTurn = turn === 'red' ? 'black' : 'red'
      setTurn(newTurn)

      // Check game status
      const gameOverResult = isGameOver(newBoard, newTurn)
      if (gameOverResult.isOver) {
        setGameStatus(`${gameOverResult.winner}-wins`)
      }
    },
    [board, selectedSquare, turn]
  )

  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return

    // Reset to initial board and replay all moves except the last one
    let newBoard = initializeBoard()
    let newCapturedPieces = { red: 0, black: 0 }
    let newTurn = 'red'

    const newHistory = moveHistory.slice(0, -1)
    setMoveHistory(newHistory)

    for (const move of newHistory) {
      const { newBoard: updatedBoard, capturedPiece } = makeMove(
        newBoard,
        move.from.row,
        move.from.col,
        move.to.row,
        move.to.col
      )
      newBoard = updatedBoard
      if (capturedPiece) {
        newCapturedPieces[newTurn]++
      }
      newTurn = newTurn === 'red' ? 'black' : 'red'
    }

    setBoard(newBoard)
    setCapturedPieces(newCapturedPieces)
    setTurn(newTurn)
    setSelectedSquare(null)
    setGameStatus('active')
  }, [moveHistory])

  const resetGame = useCallback(() => {
    setBoard(initializeBoard())
    setTurn('red')
    setSelectedSquare(null)
    setMoveHistory([])
    setCapturedPieces({ red: 0, black: 0 })
    setGameStatus('active')
  }, [])

  return {
    board,
    turn,
    gameStatus,
    selectedSquare,
    validMoves,
    moveHistory,
    capturedPieces,
    selectSquare,
    makeMove: makeGameMove,
    undoMove,
    resetGame,
  }
}
