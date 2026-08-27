import { useState, useCallback } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'
import './checkers.css'

// Initialize an 8x8 checkers board
function initializeBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place red pieces (top)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'red'
      }
    }
  }

  // Place black pieces (bottom)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'black'
      }
    }
  }

  return board
}

// Check if a position is valid
function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

// Get valid moves for a piece
function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]

  // Regular moves (one square diagonally)
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow
    const newCol = col + dCol

    if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol, isCapture: false })
    }
  }

  // Capture moves (jump over opponent)
  for (const [dRow, dCol] of directions) {
    const jumpRow = row + dRow * 2
    const jumpCol = col + dCol * 2
    const midRow = row + dRow
    const midCol = col + dCol

    if (
      isValidPosition(jumpRow, jumpCol) &&
      !board[jumpRow][jumpCol] &&
      board[midRow][midCol] &&
      board[midRow][midCol] !== piece
    ) {
      moves.push({
        row: jumpRow,
        col: jumpCol,
        isCapture: true,
        captureRow: midRow,
        captureCol: midCol,
      })
    }
  }

  return moves
}

// Check if a player has valid moves
function hasValidMoves(board, player) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === player) {
        const moves = getValidMoves(board, row, col)
        if (moves.length > 0) return true
      }
    }
  }
  return false
}

// Count pieces
function countPieces(board, player) {
  let count = 0
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === player) count++
    }
  }
  return count
}

// Square component
function Square({ row, col, piece, isSelected, isValidMove, onClick }) {
  const isBlack = (row + col) % 2 === 1
  const isHighlighted = isSelected || isValidMove

  return (
    <button
      onClick={onClick}
      className={`checkers-square ${isBlack ? 'checkers-square--black' : 'checkers-square--white'} ${
        isHighlighted ? 'checkers-square--highlighted' : ''
      }`}
      aria-label={`Square ${row},${col}${piece ? ` with ${piece} piece` : ''}`}
    >
      {piece && (
        <div className={`checkers-piece checkers-piece--${piece}`}>
          <div className="checkers-piece__inner" />
        </div>
      )}
      {isValidMove && <div className="checkers-move-indicator" />}
    </button>
  )
}

// Win screen
function WinScreen({ winner, redCount, blackCount, onPlayAgain }) {
  const isRed = winner === 'red'
  const rating = isRed
    ? { emoji: '🎉', label: 'Red Wins!', color: '#ff6b6b' }
    : { emoji: '🎉', label: 'Black Wins!', color: '#2d3748' }

  return (
    <div
      className="spring-pop flex flex-col items-center gap-6 p-8 rounded-3xl w-full max-w-sm mx-auto"
      style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}
    >
      {/* Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: `linear-gradient(145deg, ${rating.color}, ${rating.color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: `0 8px 24px ${rating.color}40`,
        }}
      >
        {rating.emoji}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--label-primary)',
          }}
        >
          {rating.label}
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--label-tertiary)' }}>
          {isRed ? 'Red' : 'Black'} has captured all opponent pieces!
        </p>
      </div>

      <button onClick={onPlayAgain} className="btn-primary w-full">
        Play Again
      </button>
    </div>
  )
}

export default function CheckersBoard() {
  const [board, setBoard] = useState(initializeBoard())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [gameState, setGameState] = useState('playing')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [moveHistory, setMoveHistory] = useState([])

  const redCount = countPieces(board, 'red')
  const blackCount = countPieces(board, 'black')

  const handleSquareClick = useCallback(
    (row, col) => {
      if (gameState !== 'playing') return

      // Check if clicking on a valid move
      const isValidMove = validMoves.some(
        (move) => move.row === row && move.col === col
      )

      if (isValidMove) {
        // Make the move
        const newBoard = board.map((r) => [...r])
        const move = validMoves.find((m) => m.row === row && m.col === col)

        // Move piece
        newBoard[row][col] = newBoard[selectedSquare.row][selectedSquare.col]
        newBoard[selectedSquare.row][selectedSquare.col] = null

        // Handle capture
        if (move.isCapture) {
          newBoard[move.captureRow][move.captureCol] = null
        }

        setBoard(newBoard)
        setMoveHistory([
          ...moveHistory,
          {
            from: selectedSquare,
            to: { row, col },
            isCapture: move.isCapture,
          },
        ])

        // Check win condition
        const nextPlayer = currentPlayer === 'red' ? 'black' : 'red'
        const opponent = nextPlayer === 'red' ? 'black' : 'red'

        if (countPieces(newBoard, opponent) === 0 || !hasValidMoves(newBoard, nextPlayer)) {
          setGameState('won')
          setMessage(`${currentPlayer === 'red' ? 'Red' : 'Black'} wins!`)
          setShowConfetti(true)
        } else {
          setCurrentPlayer(nextPlayer)
        }

        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // Select a piece
        const piece = board[row][col]
        if (piece === currentPlayer) {
          setSelectedSquare({ row, col })
          setValidMoves(getValidMoves(board, row, col))
        } else {
          setSelectedSquare(null)
          setValidMoves([])
        }
      }
    },
    [board, selectedSquare, validMoves, currentPlayer, gameState, moveHistory]
  )

  const handlePlayAgain = () => {
    setBoard(initializeBoard())
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer('red')
    setGameState('playing')
    setMessage('')
    setShowConfetti(false)
    setMoveHistory([])
  }

  const handleUndo = () => {
    if (moveHistory.length === 0) return

    const newBoard = initializeBoard()
    const newHistory = moveHistory.slice(0, -1)

    // Replay all moves except the last one
    for (const move of newHistory) {
      const piece = newBoard[move.from.row][move.from.col]
      newBoard[move.to.row][move.to.col] = piece
      newBoard[move.from.row][move.from.col] = null

      if (move.isCapture) {
        // Restore captured piece
        const capturedPiece = currentPlayer === 'red' ? 'black' : 'red'
        newBoard[move.captureRow][move.captureCol] = capturedPiece
      }
    }

    setBoard(newBoard)
    setMoveHistory(newHistory)
    setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red')
    setSelectedSquare(null)
    setValidMoves([])
  }

  // Win screen
  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <WinScreen
          winner={currentPlayer}
          redCount={redCount}
          blackCount={blackCount}
          onPlayAgain={handlePlayAgain}
        />
        <Confetti count={70} />
      </div>
    )
  }

  // Playing screen
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      {message && <Toast message={message} />}

      {/* Title */}
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--label-primary)',
          textAlign: 'center',
        }}
      >
        Checkers ♟️
      </h2>

      {/* Status */}
      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--label-primary)',
          textAlign: 'center',
        }}
      >
        <span style={{ color: currentPlayer === 'red' ? '#ff6b6b' : '#2d3748' }}>
          {currentPlayer === 'red' ? '🔴' : '⚫'} {currentPlayer.toUpperCase()}'s Turn
        </span>
      </div>

      {/* Piece counts */}
      <div className="flex gap-6 justify-center">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff6b6b' }}>
            {redCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--label-tertiary)', textTransform: 'uppercase' }}>
            Red
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748' }}>
            {blackCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--label-tertiary)', textTransform: 'uppercase' }}>
            Black
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="checkers-board">
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => (
            <Square
              key={`${rowIdx}-${colIdx}`}
              row={rowIdx}
              col={colIdx}
              piece={piece}
              isSelected={
                selectedSquare && selectedSquare.row === rowIdx && selectedSquare.col === colIdx
              }
              isValidMove={validMoves.some((m) => m.row === rowIdx && m.col === colIdx)}
              onClick={() => handleSquareClick(rowIdx, colIdx)}
            />
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0}
          className="btn-outline"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6M21 17v-6h-6" />
            <path d="M18 9a9 9 0 0 0-13.5 1.5" />
          </svg>
          Undo
        </button>
        <button onClick={handlePlayAgain} className="btn-primary">
          New Game
        </button>
      </div>
    </div>
  )
}
