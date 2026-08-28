import { useState, useCallback } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'
import './checkers.css'

// ── Square Component ──────────────────────────────────────────────

function Square({ row, col, piece, isSelected, isValidMove, onClick }) {
  const isDark = (row + col) % 2 === 1
  const isRed = piece === 'red'
  const isBlack = piece === 'black'
  const isRedKing = piece === 'red-king'
  const isBlackKing = piece === 'black-king'

  return (
    <button
      onClick={onClick}
      className={`checkers-square ${isDark ? 'checkers-square--dark' : 'checkers-square--light'} ${
        isSelected ? 'checkers-square--selected' : ''
      } ${isValidMove ? 'checkers-square--valid-move' : ''}`}
      aria-label={`Square ${row},${col}${piece ? ` with ${piece} piece` : ''}`}
    >
      {(isRed || isRedKing) && (
        <div className={`checkers-piece checkers-piece--red ${isRedKing ? 'checkers-piece--king' : ''}`}>
          {isRedKing && <span className="checkers-piece__crown">♔</span>}
        </div>
      )}
      {(isBlack || isBlackKing) && (
        <div className={`checkers-piece checkers-piece--black ${isBlackKing ? 'checkers-piece--king' : ''}`}>
          {isBlackKing && <span className="checkers-piece__crown">♔</span>}
        </div>
      )}
      {isValidMove && <div className="checkers-square__indicator" />}
    </button>
  )
}

// ── Game Logic ────────────────────────────────────────────────────

function initializeBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Red pieces at top (rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'red'
      }
    }
  }

  // Black pieces at bottom (rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'black'
      }
    }
  }

  return board
}

function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const isRed = piece === 'red' || piece === 'red-king'
  const isKing = piece === 'red-king' || piece === 'black-king'

  // Directions: up-left, up-right, down-left, down-right
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]

  // Filter directions based on piece type
  const validDirections = isKing
    ? directions
    : isRed
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ]

  // Regular moves (one square)
  for (const [dr, dc] of validDirections) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, isCapture: false })
      }
    }
  }

  // Capture moves (jump over opponent)
  for (const [dr, dc] of validDirections) {
    const jumpRow = row + dr * 2
    const jumpCol = col + dc * 2
    const captureRow = row + dr
    const captureCol = col + dc

    if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
      const capturedPiece = board[captureRow][captureCol]
      const targetSquare = board[jumpRow][jumpCol]

      if (targetSquare === null && capturedPiece) {
        const capturedIsRed = capturedPiece === 'red' || capturedPiece === 'red-king'
        const isPlayerRed = isRed

        if (capturedIsRed !== isPlayerRed) {
          moves.push({
            row: jumpRow,
            col: jumpCol,
            isCapture: true,
            captureRow,
            captureCol,
          })
        }
      }
    }
  }

  return moves
}

function hasValidMoves(board, isRedTurn) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const isRed = piece === 'red' || piece === 'red-king'
      if (isRed === isRedTurn) {
        const moves = getValidMoves(board, row, col)
        if (moves.length > 0) return true
      }
    }
  }
  return false
}

function countPieces(board) {
  let red = 0
  let black = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece === 'red' || piece === 'red-king') red++
      else if (piece === 'black' || piece === 'black-king') black++
    }
  }

  return { red, black }
}

// ── Win Screen ────────────────────────────────────────────────────

function WinScreen({ winner, onPlayAgain }) {
  const isRedWin = winner === 'red'

  const rating = isRedWin
    ? { emoji: '🔴', label: 'Red Wins!', color: '#ff6b6b' }
    : { emoji: '⚫', label: 'Black Wins!', color: '#2d3748' }

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
          Great game!
        </p>
      </div>

      <button onClick={onPlayAgain} className="btn-primary w-full">
        Play Again
      </button>
    </div>
  )
}

// ── Stats Bar ─────────────────────────────────────────────────────

function StatsBar({ redPieces, blackPieces, isRedTurn }) {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {[
        { label: 'Red', value: redPieces, color: '#ff6b6b', active: isRedTurn },
        { label: 'Black', value: blackPieces, color: '#2d3748', active: !isRedTurn },
      ].map(({ label, value, color, active }) => (
        <div
          key={label}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all ${
            active ? 'ring-2' : ''
          }`}
          style={{
            background: 'var(--fill-tertiary)',
            ringColor: color,
            boxShadow: active ? `0 0 12px ${color}40` : 'none',
          }}
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: color,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────

export default function CheckersBoard() {
  const [board, setBoard] = useState(initializeBoard())
  const [isRedTurn, setIsRedTurn] = useState(true)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [gameState, setGameState] = useState('playing') // 'playing' | 'won'
  const [winner, setWinner] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const { red: redPieces, black: blackPieces } = countPieces(board)

  const handleSquareClick = useCallback(
    (row, col) => {
      if (gameState === 'won') return

      // Check if clicking on a valid move
      const isValidMove = validMoves.some((move) => move.row === row && move.col === col)

      if (isValidMove) {
        // Execute the move
        const move = validMoves.find((m) => m.row === row && m.col === col)
        const newBoard = board.map((r) => [...r])
        const piece = newBoard[selectedSquare.row][selectedSquare.col]

        // Move piece
        newBoard[row][col] = piece
        newBoard[selectedSquare.row][selectedSquare.col] = null

        // Handle capture
        if (move.isCapture) {
          newBoard[move.captureRow][move.captureCol] = null
        }

        // Check for king promotion
        if ((piece === 'red' && row === 7) || (piece === 'black' && row === 0)) {
          newBoard[row][col] = piece === 'red' ? 'red-king' : 'black-king'
        }

        // Record move
        const newMove = {
          from: selectedSquare,
          to: { row, col },
          piece,
          isCapture: move.isCapture,
          capturePos: move.isCapture ? { row: move.captureRow, col: move.captureCol } : null,
        }

        setBoard(newBoard)
        setMoveHistory([...moveHistory, newMove])
        setSelectedSquare(null)
        setValidMoves([])

        // Check win conditions
        const { red: newRed, black: newBlack } = countPieces(newBoard)

        if (newRed === 0) {
          setGameState('won')
          setWinner('black')
          setShowConfetti(true)
          setMessage('🎉 Black wins!')
          return
        }

        if (newBlack === 0) {
          setGameState('won')
          setWinner('red')
          setShowConfetti(true)
          setMessage('🎉 Red wins!')
          return
        }

        // Switch turns
        const nextIsRedTurn = !isRedTurn

        if (!hasValidMoves(newBoard, nextIsRedTurn)) {
          setGameState('won')
          setWinner(isRedTurn ? 'red' : 'black')
          setShowConfetti(true)
          setMessage(`🎉 ${isRedTurn ? 'Red' : 'Black'} wins - no valid moves!`)
          return
        }

        setIsRedTurn(nextIsRedTurn)
      } else {
        // Select a piece
        const piece = board[row][col]
        const isRed = piece === 'red' || piece === 'red-king'

        if (piece && isRed === isRedTurn) {
          setSelectedSquare({ row, col })
          setValidMoves(getValidMoves(board, row, col))
        } else {
          setSelectedSquare(null)
          setValidMoves([])
        }
      }
    },
    [board, selectedSquare, validMoves, gameState, isRedTurn, moveHistory]
  )

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
        newBoard[move.capturePos.row][move.capturePos.col] = null
      }

      // Re-apply king promotion
      if ((piece === 'red' && move.to.row === 7) || (piece === 'black' && move.to.row === 0)) {
        newBoard[move.to.row][move.to.col] = piece === 'red' ? 'red-king' : 'black-king'
      }
    }

    setBoard(newBoard)
    setMoveHistory(newHistory)
    setIsRedTurn(newHistory.length % 2 === 0)
    setSelectedSquare(null)
    setValidMoves([])
    setGameState('playing')
    setWinner(null)
    setShowConfetti(false)
    setMessage('')
  }

  const handleNewGame = () => {
    setBoard(initializeBoard())
    setIsRedTurn(true)
    setSelectedSquare(null)
    setValidMoves([])
    setGameState('playing')
    setWinner(null)
    setMoveHistory([])
    setMessage('')
    setShowConfetti(false)
  }

  // ── Won screen ───────────────────────────────────────────────────
  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <WinScreen winner={winner} onPlayAgain={handleNewGame} />

        {/* Move count */}
        <div className="w-full flex flex-col gap-3">
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
              textAlign: 'center',
            }}
          >
            Game Stats
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl"
              style={{ background: 'var(--fill-tertiary)' }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#0a84ff',
                  letterSpacing: '-0.02em',
                }}
              >
                {moveHistory.length}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--label-tertiary)',
                }}
              >
                Moves
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleUndo} className="btn-ghost" disabled={moveHistory.length === 0}>
          ↶ Undo Last Move
        </button>
      </div>
    )
  }

  // ── Playing screen ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
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

      {/* Stats */}
      <StatsBar redPieces={redPieces} blackPieces={blackPieces} isRedTurn={isRedTurn} />

      {/* Status */}
      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--label-primary)',
          textAlign: 'center',
          minHeight: 24,
        }}
      >
        {isRedTurn ? '🔴 Red\'s Turn' : '⚫ Black\'s Turn'}
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
              isSelected={selectedSquare?.row === rowIdx && selectedSquare?.col === colIdx}
              isValidMove={validMoves.some((m) => m.row === rowIdx && m.col === colIdx)}
              onClick={() => handleSquareClick(rowIdx, colIdx)}
            />
          ))
        )}
      </div>

      {/* Hint text */}
      <p
        className="text-center"
        style={{
          fontSize: '0.78rem',
          color: 'var(--label-tertiary)',
          letterSpacing: '-0.01em',
          maxWidth: 400,
        }}
      >
        Click a piece to select it, then click a highlighted square to move. Capture opponent pieces by jumping over them!
      </p>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={handleUndo} className="btn-ghost" disabled={moveHistory.length === 0}>
          ↶ Undo
        </button>
        <button onClick={handleNewGame} className="btn-ghost">
          🔀 New Game
        </button>
      </div>

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
