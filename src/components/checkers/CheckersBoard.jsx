import { useState, useEffect } from 'react'
import Board from './Board'
import GameStatus from './GameStatus'
import GameControls from './GameControls'
import { useCheckersGame } from '../../hooks/useCheckersGame'
import Toast from '../Toast'
import Confetti from '../Confetti'
import './checkers.css'

export default function CheckersBoard() {
  const {
    board,
    turn,
    gameStatus,
    selectedSquare,
    validMoves,
    moveHistory,
    capturedPieces,
    selectSquare,
    makeMove,
    undoMove,
    resetGame,
  } = useCheckersGame()

  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      if (gameStatus === 'red-wins') {
        setMessage('🎉 Red wins!')
        setShowConfetti(true)
      } else if (gameStatus === 'black-wins') {
        setMessage('🎉 Black wins!')
        setShowConfetti(true)
      }
    }, 0)
    return () => clearTimeout(id)
  }, [gameStatus])

  const handleSquareClick = (row, col) => {
    if (gameStatus !== 'active') return

    const square = { row, col }

    // Check if clicking on a valid move destination
    const isValidMove = validMoves.some(
      (move) => move.row === row && move.col === col
    )

    if (isValidMove) {
      makeMove(square)
      setMessage('')
    } else {
      selectSquare(square)
    }
  }

  const handleUndo = () => {
    undoMove()
    setMessage('')
    setShowConfetti(false)
  }

  const handleReset = () => {
    resetGame()
    setMessage('')
    setShowConfetti(false)
  }

  return (
    <div className="checkers-container">
      <div className="checkers-main">
        {/* Board */}
        <div className="checkers-board-wrapper">
          <Board
            board={board}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
          />
        </div>

        {/* Right Panel */}
        <div className="checkers-panel">
          {/* Status */}
          <GameStatus
            turn={turn}
            gameStatus={gameStatus}
            moveCount={moveHistory.length}
          />

          {/* Captured Pieces */}
          <div className="checkers-captured">
            <div className="captured-section">
              <div className="captured-label">🔴 Red Captured</div>
              <div className="captured-count">{capturedPieces.black}</div>
            </div>
            <div className="captured-section">
              <div className="captured-label">⚫ Black Captured</div>
              <div className="captured-count">{capturedPieces.red}</div>
            </div>
          </div>

          {/* Controls */}
          <GameControls
            onUndo={handleUndo}
            onReset={handleReset}
            canUndo={moveHistory.length > 0}
            gameOver={gameStatus !== 'active'}
          />
        </div>
      </div>

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
