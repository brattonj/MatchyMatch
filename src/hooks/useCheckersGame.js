import { useState, useCallback } from 'react'
import {
  initializeBoard,
  isValidMove,
  makeMove,
  getValidMoves,
  getGameStatus,
} from '../utils/checkersRules'

export function useCheckersGame() {
  const [board, setBoard] = useState(() => initializeBoard())
  const [turn, setTurn] = useState('red')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [capturedPieces, setCapturedPieces] = useState({ red: [], black: [] })
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
      if (piece && piece.includes(turn)) {
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

      if (
        !isValidMove(
          board,
          fromSquare.row,
          fromSquare.col,
          toSquare.row,
          toSquare.col
        )
      ) {
        return
      }

      const { newBoard, capturedPiece } = makeMove(
        board,
        fromSquare.row,
        fromSquare.col,
        toSquare.row,
        toSquare.col
      )

      setBoard(newBoard)
      setSelectedSquare(null)

      // Update captured pieces
      if (capturedPiece) {
        setCapturedPieces((prev) => ({
          ...prev,
          [turn]: [...prev[turn], capturedPiece],
        }))
      }

      // Update move history
      setMoveHistory((prev) => [
        ...prev,
        { from: fromSquare, to: toSquare, captured: !!capturedPiece },
      ])

      // Switch turn
      const newTurn = turn === 'red' ? 'black' : 'red'
      setTurn(newTurn)

      // Update game status
      const status = getGameStatus(newBoard, newTurn)
      setGameStatus(status)
    },
    [board, selectedSquare, turn]
  )

  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return

    // Reset to initial board and replay all moves except the last one
    let newBoard = initializeBoard()
    let newCapturedPieces = { red: [], black: [] }
    let newTurn = 'red'

    // Remove the last move, then replay everything before it from scratch.
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
        newCapturedPieces[newTurn].push(capturedPiece)
      }
      newTurn = newTurn === 'red' ? 'black' : 'red'
    }

    setBoard(newBoard)
    setCapturedPieces(newCapturedPieces)
    setTurn(newTurn)
    setSelectedSquare(null)
    const status = getGameStatus(newBoard, newTurn)
    setGameStatus(status)
  }, [moveHistory])

  const resetGame = useCallback(() => {
    setBoard(initializeBoard())
    setTurn('red')
    setSelectedSquare(null)
    setMoveHistory([])
    setCapturedPieces({ red: [], black: [] })
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
