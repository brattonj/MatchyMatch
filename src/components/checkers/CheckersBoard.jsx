import { useState, useCallback } from 'react'
import './checkers.css'

// ── Checkers Game Logic ────────────────────────────────────────────

const BOARD_SIZE = 8
const EMPTY = null
const RED = 'red'
const BLACK = 'black'
const RED_KING = 'red-king'
const BLACK_KING = 'black-king'

function initializeBoard() {
  const board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(EMPTY))

  // Place red pieces (bottom)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = RED
      }
    }
  }

  // Place black pieces (top)
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = BLACK
      }
    }
  }

  return board
}

function isKing(piece) {
  return piece === RED_KING || piece === BLACK_KING
}

function getColor(piece) {
  if (!piece) return null
  return piece === RED || piece === RED_KING ? RED : BLACK
}

function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const isRed = piece === RED || piece === RED_KING
  const directions = []

  if (piece === RED) {
    directions.push([1, -1], [1, 1]) // Red moves down
  } else if (piece === BLACK) {
    directions.push([-1, -1], [-1, 1]) // Black moves up
  } else if (isKing(piece)) {
    directions.push([1, -1], [1, 1], [-1, -1], [-1, 1]) // Kings move all directions
  }

  // Regular moves
  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      if (board[newRow][newCol] === EMPTY) {
        moves.push({ row: newRow, col: newCol, isJump: false })
      }
    }
  }

  // Jump moves
  for (const [dr, dc] of directions) {
    const jumpRow = row + dr * 2
    const jumpCol = col + dc * 2
    const captureRow = row + dr
    const captureCol = col + dc

    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      const capturedPiece = board[captureRow][captureCol]
      if (
        capturedPiece &&
        getColor(capturedPiece) !== getColor(piece) &&
        board[jumpRow][jumpCol] === EMPTY
      ) {
        moves.push({
          row: jumpRow,
          col: jumpCol,
          isJump: true,
          captureRow,
          captureCol,
        })
      }
    }
  }

  return moves
}

function hasJumps(board, color) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece && getColor(piece) === color) {
        const moves = getValidMoves(board, row, col)
        if (moves.some((m) => m.isJump)) {
          return true
        }
      }
    }
  }
  return false
}

function getAvailableJumps(board, row, col) {
  const moves = getValidMoves(board, row, col)
  return moves.filter((m) => m.isJump)
}

function makeMove(board, fromRow, fromCol, toRow, toCol, captureRow, captureCol) {
  const newBoard = board.map((r) => [...r])
  const piece = newBoard[fromRow][fromCol]

  newBoard[toRow][toCol] = piece
  newBoard[fromRow][fromCol] = EMPTY

  if (captureRow !== undefined && captureCol !== undefined) {
    newBoard[captureRow][captureCol] = EMPTY
  }

  // Promote to king
  if ((piece === RED && toRow === BOARD_SIZE - 1) || (piece === BLACK && toRow === 0)) {
    newBoard[toRow][toCol] = piece === RED ? RED_KING : BLACK_KING
  }

  return newBoard
}

function checkWinner(board, redPieces, blackPieces) {
  if (redPieces === 0) return BLACK
  if (blackPieces === 0) return RED
  return null
}

// ── Square Component ──────────────────────────────────────────────

function Square({ piece, isSelected, isValidMove, isHighlighted, onClick }) {
  const isDark = true // Checkers are always on dark squares
  const isRed = piece === RED || piece === RED_KING
  const isKing = piece === RED_KING || piece === BLACK_KING

  return (
    <button
      onClick={onClick}
      className="checkers-square"
      style={{
        background: isHighlighted
          ? '#ffd700'
          : isSelected
            ? '#ffed4e'
            : isDark
              ? '#8b7355'
              : '#d2b48c',
        border: isValidMove ? '3px solid #00ff00' : '1px solid #666',
        cursor: 'pointer',
      }}
    >
      {piece && (
        <div
          className={`checkers-piece ${isRed ? 'red' : 'black'} ${isKing ? 'king' : ''}`}
          style={{
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            background: isRed ? '#ff4444' : '#222222',
            border: `3px solid ${isRed ? '#ff8888' : '#666666'}`,
            boxShadow: `0 4px 8px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, ${isRed ? 0.3 : 0.1})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: isRed ? '#ffcccc' : '#cccccc',
          }}
        >
          {isKing && '♔'}
        </div>
      )}
    </button>
  )
}

// ── Status Bar ────────────────────────────────────────────────────

function StatusBar({ currentPlayer, redPieces, blackPieces, gameOver, winner }) {
  return (
    <div className="checkers-status">
      <div className="status-item">
        <span className="status-label">Red Pieces:</span>
        <span className="status-value" style={{ color: '#ff4444' }}>
          {redPieces}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Black Pieces:</span>
        <span className="status-value" style={{ color: '#222222' }}>
          {blackPieces}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Current:</span>
        <span
          className="status-value"
          style={{ color: currentPlayer === RED ? '#ff4444' : '#222222' }}
        >
          {currentPlayer === RED ? '🔴 Red' : '⚫ Black'}
        </span>
      </div>
      {gameOver && (
        <div className="status-item" style={{ color: '#00aa00', fontWeight: 'bold' }}>
          {winner === RED ? '🔴 Red Wins!' : '⚫ Black Wins!'}
        </div>
      )}
    </div>
  )
}

// ── Win Screen ────────────────────────────────────────────────────

function WinScreen({ winner, onPlayAgain }) {
  const isRed = winner === RED
  const emoji = isRed ? '🔴' : '⚫'
  const color = isRed ? '#ff4444' : '#222222'

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
          background: `linear-gradient(145deg, ${color}, ${color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: `0 8px 24px ${color}40`,
        }}
      >
        {emoji}
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
          {isRed ? '🔴 Red Wins!' : '⚫ Black Wins!'}
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--label-tertiary)' }}>
          Congratulations!
        </p>
      </div>

      <button onClick={onPlayAgain} className="btn-primary w-full">
        Play Again
      </button>
    </div>
  )
}

// ── Main Board Component ──────────────────────────────────────────

export default function CheckersBoard() {
  const [board, setBoard] = useState(initializeBoard())
  const [currentPlayer, setCurrentPlayer] = useState(RED)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [mustJump, setMustJump] = useState(false)
  const [jumpedFrom, setJumpedFrom] = useState(null)

  const countPieces = useCallback((board, color) => {
    let count = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col]
        if (piece && getColor(piece) === color) {
          count++
        }
      }
    }
    return count
  }, [])

  const handleSquareClick = useCallback(
    (row, col) => {
      if (gameOver) return

      const piece = board[row][col]
      const isCurrentPlayerPiece = piece && getColor(piece) === currentPlayer

      // If clicking on a valid move destination
      if (selectedSquare && validMoves.some((m) => m.row === row && m.col === col)) {
        const move = validMoves.find((m) => m.row === row && m.col === col)
        const newBoard = makeMove(
          board,
          selectedSquare.row,
          selectedSquare.col,
          row,
          col,
          move.captureRow,
          move.captureCol
        )

        const redCount = countPieces(newBoard, RED)
        const blackCount = countPieces(newBoard, BLACK)
        const gameWinner = checkWinner(newBoard, redCount, blackCount)

        if (gameWinner) {
          setBoard(newBoard)
          setGameOver(true)
          setWinner(gameWinner)
          setSelectedSquare(null)
          setValidMoves([])
          return
        }

        // Check if there are more jumps available
        if (move.isJump) {
          const moreJumps = getAvailableJumps(newBoard, row, col)
          if (moreJumps.length > 0) {
            setBoard(newBoard)
            setSelectedSquare({ row, col })
            setValidMoves(moreJumps)
            setMustJump(true)
            setJumpedFrom({ row, col })
            return
          }
        }

        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setMustJump(false)
        setJumpedFrom(null)
        setCurrentPlayer(currentPlayer === RED ? BLACK : RED)
      } else if (isCurrentPlayerPiece) {
        // Select a piece
        if (mustJump && jumpedFrom && (jumpedFrom.row !== row || jumpedFrom.col !== col)) {
          return // Must continue jumping with the same piece
        }

        setSelectedSquare({ row, col })
        const moves = getValidMoves(board, row, col)

        // If there are jumps available anywhere, only show jumps
        if (hasJumps(board, currentPlayer)) {
          setValidMoves(moves.filter((m) => m.isJump))
        } else {
          setValidMoves(moves)
        }
      } else {
        // Deselect
        setSelectedSquare(null)
        setValidMoves([])
      }
    },
    [board, currentPlayer, selectedSquare, validMoves, gameOver, mustJump, jumpedFrom, countPieces]
  )

  const handlePlayAgain = () => {
    setBoard(initializeBoard())
    setCurrentPlayer(RED)
    setSelectedSquare(null)
    setValidMoves([])
    setGameOver(false)
    setWinner(null)
    setMustJump(false)
    setJumpedFrom(null)
  }

  const redPieces = countPieces(board, RED)
  const blackPieces = countPieces(board, BLACK)

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <WinScreen winner={winner} onPlayAgain={handlePlayAgain} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
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
        Checkers
      </h2>

      {/* Status Bar */}
      <StatusBar
        currentPlayer={currentPlayer}
        redPieces={redPieces}
        blackPieces={blackPieces}
        gameOver={gameOver}
        winner={winner}
      />

      {/* Board */}
      <div className="checkers-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isSelected =
              selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex
            const isValidMove = validMoves.some(
              (m) => m.row === rowIndex && m.col === colIndex
            )
            const isDarkSquare = (rowIndex + colIndex) % 2 === 1

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  display: isDarkSquare ? 'block' : 'none',
                }}
              >
                {isDarkSquare && (
                  <Square
                    piece={piece}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isHighlighted={false}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Instructions */}
      <p
        className="text-center"
        style={{
          fontSize: '0.78rem',
          color: 'var(--label-tertiary)',
          letterSpacing: '-0.01em',
          maxWidth: 300,
        }}
      >
        {mustJump
          ? 'Continue jumping with the same piece!'
          : 'Click a piece to select it, then click a valid square to move.'}
      </p>

      {/* New game button */}
      <button onClick={handlePlayAgain} className="btn-ghost">
        🔀 New Game
      </button>
    </div>
  )
}
