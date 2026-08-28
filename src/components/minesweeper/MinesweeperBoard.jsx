/**
 * @file MinesweeperBoard.jsx
 * @description Minesweeper puzzle game with adjustable difficulty levels.
 * Players reveal cells to find all safe cells while avoiding mines. Features flagging, timer, and difficulty selection.
 * 
 * @component
 * @returns {React.ReactElement} Minesweeper game with grid and controls
 * 
 * @state {Array<Array<Object>>} grid - 2D grid of cell objects with mine, revealed, flagged, adjacent properties
 * @state {boolean} minesPlaced - Whether mines have been placed (after first click)
 * @state {string} gameState - Current game state ('playing', 'won', or 'lost')
 * @state {number} time - Seconds elapsed since game start
 * @state {number|null} timerRef - Timer interval ID or null
 * @state {number} diffIdx - Current difficulty index (0-2)
 */

import { useState, useCallback } from 'react'
import {
  DIFFICULTIES,
  ADJ_COLORS,
  buildEmptyGrid,
  placeMines,
  revealFrom,
  revealAllMines,
  checkWin,
  flagsRemaining,
} from '../../data/minesweeperData'

// ── Single cell ───────────────────────────────────────────────────────────────

function Cell({ cell, onReveal, onFlag, gameOver }) {
  const handleClick = (e) => {
    e.preventDefault()
    if (!cell.revealed && !cell.flagged && !gameOver) onReveal(cell.row, cell.col)
  }

  const handleContext = (e) => {
    e.preventDefault()
    if (!cell.revealed && !gameOver) onFlag(cell.row, cell.col)
  }

  let content = null
  let bg = 'var(--fill-tertiary)'
  let border = '2px solid var(--separator)'
  let cursor = 'pointer'

  if (cell.revealed) {
    bg = 'var(--bg-surface)'
    border = '1px solid var(--separator)'
    cursor = 'default'
    if (cell.mine) {
      bg = '#ff3b30'
      content = '💣'
    } else if (cell.adjacent > 0) {
      content = (
        <span style={{ color: ADJ_COLORS[cell.adjacent] ?? '#333', fontWeight: 800 }}>
          {cell.adjacent}
        </span>
      )
    }
  } else if (cell.flagged) {
    content = '🚩'
  }

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContext}
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        border,
        borderRadius: 4,
        cursor,
        fontSize: 'clamp(0.6rem, 2.5vw, 0.9rem)',
        fontWeight: 700,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'background 0.1s ease',
      }}
    >
      {content}
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function MinesweeperBoard() {
  const [diffIdx, setDiffIdx] = useState(0)
  const diff = DIFFICULTIES[diffIdx]

  const [grid, setGrid] = useState(() => buildEmptyGrid(diff.rows, diff.cols))
  const [minesPlaced, setMinesPlaced] = useState(false)
  const [gameState, setGameState] = useState('playing') // 'playing' | 'won' | 'lost'
  const [time, setTime] = useState(0)
  const [timerRef, setTimerRef] = useState(null)

  const startTimer = useCallback(() => {
    const id = setInterval(() => setTime((t) => t + 1), 1000)
    setTimerRef(id)
    return id
  }, [])

  const stopTimer = useCallback(
    (id) => {
      clearInterval(id ?? timerRef)
      setTimerRef(null)
    },
    [timerRef]
  )

  const resetGame = useCallback(
    (newDiffIdx = diffIdx) => {
      stopTimer()
      const d = DIFFICULTIES[newDiffIdx]
      setGrid(buildEmptyGrid(d.rows, d.cols))
      setMinesPlaced(false)
      setGameState('playing')
      setTime(0)
      setTimerRef(null)
    },
    [diffIdx, stopTimer]
  )

  const handleDiffChange = (idx) => {
    setDiffIdx(idx)
    resetGame(idx)
  }

  const handleReveal = useCallback(
    (row, col) => {
      if (gameState !== 'playing') return

      let currentGrid = grid
      let timerId = timerRef

      // First click — place mines and start timer
      if (!minesPlaced) {
        currentGrid = placeMines(grid, diff.rows, diff.cols, diff.mines, row, col)
        setMinesPlaced(true)
        timerId = startTimer()
      }

      // Hit a mine
      if (currentGrid[row][col].mine) {
        const blasted = revealAllMines(currentGrid)
        setGrid(blasted)
        setGameState('lost')
        stopTimer(timerId)
        return
      }

      const next = revealFrom(currentGrid, diff.rows, diff.cols, row, col)
      setGrid(next)

      if (checkWin(next)) {
        setGameState('won')
        stopTimer(timerId)
      }
    },
    [gameState, grid, minesPlaced, diff, timerRef, startTimer, stopTimer]
  )

  const handleFlag = useCallback(
    (row, col) => {
      if (gameState !== 'playing') return
      setGrid((prev) =>
        prev.map((r) =>
          r.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, flagged: !cell.flagged }
              : cell
          )
        )
      )
    },
    [gameState]
  )

  const flags = flagsRemaining(grid, diff.mines)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">

      {/* Title */}
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0">
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#2e7d32',
              lineHeight: 1,
            }}
          >
            Ryanfield
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--label-tertiary)' }}>
            Right-click / long-press to flag a mine
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 items-center">
          <div
            className="flex flex-col items-center px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--fill-tertiary)', minWidth: 56 }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--label-primary)' }}>
              🚩 {flags}
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-tertiary)' }}>
              Flags
            </span>
          </div>
          <div
            className="flex flex-col items-center px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--fill-tertiary)', minWidth: 56 }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--label-primary)' }}>
              ⏱ {time}s
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-tertiary)' }}>
              Time
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty + New Game */}
      <div className="w-full flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.label}
              onClick={() => handleDiffChange(i)}
              className={i === diffIdx ? 'btn-primary' : 'btn-ghost'}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => resetGame()}
          className="btn-ghost"
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          New Game
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${diff.cols}, minmax(0, 1fr))`,
            gap: 3,
            minWidth: diff.cols * 28,
          }}
        >
          {grid.flat().map((cell) => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              onReveal={handleReveal}
              onFlag={handleFlag}
              gameOver={gameState !== 'playing'}
            />
          ))}
        </div>
      </div>

      {/* Won overlay */}
      {gameState === 'won' && (
        <div
          className="spring-pop fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="flex flex-col items-center gap-6 p-8 rounded-3xl w-full max-w-sm"
            style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}
          >
            <div
              style={{
                width: 80, height: 80, borderRadius: 22,
                background: 'linear-gradient(145deg, #34c759, #30d158)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, boxShadow: '0 8px 28px rgba(52,199,89,0.45)',
              }}
            >
              🎉
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--label-primary)' }}>
                You cleared it!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--label-tertiary)' }}>
                {diff.label} · {time}s
              </p>
            </div>
            <button onClick={() => resetGame()} className="btn-primary" style={{ width: '100%' }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Lost overlay */}
      {gameState === 'lost' && (
        <div
          className="spring-pop fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="flex flex-col items-center gap-6 p-8 rounded-3xl w-full max-w-sm"
            style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}
          >
            <div
              style={{
                width: 80, height: 80, borderRadius: 22,
                background: 'linear-gradient(145deg, #ff6b6b, #ff3b30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, boxShadow: '0 8px 24px rgba(255,59,48,0.4)',
              }}
            >
              💣
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--label-primary)' }}>
                Boom!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--label-tertiary)' }}>
                You hit a mine. Better luck next time.
              </p>
            </div>
            <button onClick={() => resetGame()} className="btn-primary" style={{ width: '100%' }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* How to play */}
      <div
        className="w-full rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}
      >
        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--label-tertiary)' }}>
          How to play
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--label-secondary)', lineHeight: 1.5 }}>
          <strong>Click</strong> a cell to reveal it. <strong>Right-click</strong> (or long-press on mobile) to plant a 🚩 flag on a suspected mine. Reveal every safe cell to win — without hitting a 💣!
        </p>
      </div>
    </div>
  )
}
