/**
 * @file LatchamBoard.jsx
 * @description Latch-am If You Can - rapid clicking game component.
 * Players click locks that appear on a grid before they disappear.
 * Difficulty increases with score (faster spawns, shorter visibility).
 * 30-second time limit with confetti on good performance.
 * 
 * @component
 * @returns {JSX.Element} Lock clicking game board
 * 
 * @state {string} phase - Game phase ('idle', 'playing', 'gameover')
 * @state {number} score - Number of locks latched
 * @state {number} timeLeft - Seconds remaining
 * @state {Set} activeCells - Set of currently active cell indices
 * @state {string} message - Status message
 * @state {boolean} showConfetti - Whether to show confetti
 * @state {number|null} missedFlash - Cell index that just expired (for visual feedback)
 * @ref {number} scoreRef - Reference to current score for callbacks
 * @ref {number} spawnTimerRef - Timeout ID for next spawn
 * @ref {Function} spawnCellRef - Reference to spawnCell function
 * @ref {number} countdownRef - Interval ID for countdown
 * @ref {Object} cellTimersRef - Map of cell index to timeout IDs
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

const GAME_DURATION = 30 // seconds
const GRID_COLS = 5
const GRID_ROWS = 4
const TOTAL_CELLS = GRID_COLS * GRID_ROWS

// How long a target stays visible (ms), decreases as score grows
function getVisibleDuration(score) {
  return Math.max(600, 1800 - score * 40)
}

// How long between spawns (ms), decreases as score grows
function getSpawnInterval(score) {
  return Math.max(400, 1200 - score * 30)
}

const GOOD_SCORE = 15

export default function LatchamBoard() {
  const [phase, setPhase] = useState('idle') // 'idle' | 'playing' | 'gameover'
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [activeCells, setActiveCells] = useState(new Set()) // cell indices that are "live"
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [missedFlash, setMissedFlash] = useState(null) // cell index that just expired

  const scoreRef = useRef(0)
  const spawnTimerRef = useRef(null)
  const spawnCellRef = useRef(null) // holds latest spawnCell to allow self-scheduling
  const countdownRef = useRef(null)
  const cellTimersRef = useRef({}) // cellIndex -> timeout id

  // Keep scoreRef in sync so callbacks always see latest score
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const clearAllTimers = useCallback(() => {
    clearInterval(countdownRef.current)
    clearTimeout(spawnTimerRef.current)
    Object.values(cellTimersRef.current).forEach(clearTimeout)
    cellTimersRef.current = {}
  }, [])

  const expireCell = useCallback((cellIndex) => {
    setActiveCells((prev) => {
      const next = new Set(prev)
      next.delete(cellIndex)
      return next
    })
    setMissedFlash(cellIndex)
    setTimeout(() => setMissedFlash(null), 300)
    delete cellTimersRef.current[cellIndex]
  }, [])

  const spawnCell = useCallback(() => {
    setActiveCells((prev) => {
      // Pick a random cell that isn't already active
      const available = []
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!prev.has(i)) available.push(i)
      }
      if (available.length === 0) return prev

      const cellIndex = available[Math.floor(Math.random() * available.length)]
      const next = new Set(prev)
      next.add(cellIndex)

      // Schedule expiry
      const duration = getVisibleDuration(scoreRef.current)
      cellTimersRef.current[cellIndex] = setTimeout(() => expireCell(cellIndex), duration)

      return next
    })

    // Schedule next spawn via ref to avoid self-reference lint error
    const interval = getSpawnInterval(scoreRef.current)
    spawnTimerRef.current = setTimeout(() => spawnCellRef.current?.(), interval)
  }, [expireCell])

  // Keep spawnCellRef in sync with the latest spawnCell callback
  useEffect(() => {
    spawnCellRef.current = spawnCell
  }, [spawnCell])

  const startGame = useCallback(() => {
    clearAllTimers()
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(GAME_DURATION)
    setActiveCells(new Set())
    setMessage('')
    setShowConfetti(false)
    setMissedFlash(null)
    setPhase('playing')

    // Start countdown — end game when time reaches 0
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current)
          clearTimeout(spawnTimerRef.current)
          Object.values(cellTimersRef.current).forEach(clearTimeout)
          cellTimersRef.current = {}
          setActiveCells(new Set())
          setPhase('gameover')
          if (scoreRef.current >= GOOD_SCORE) {
            setShowConfetti(true)
            setMessage(`🎉 Amazing! You latched ${scoreRef.current}!`)
          } else {
            setMessage(`Time's up! You latched ${scoreRef.current} — can you do better?`)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)

    // Start spawning
    spawnTimerRef.current = setTimeout(spawnCell, 600)
  }, [clearAllTimers, spawnCell])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers()
  }, [clearAllTimers])

  const handleCellClick = useCallback(
    (cellIndex) => {
      if (phase !== 'playing') return
      if (!activeCells.has(cellIndex)) return

      // Cancel the expiry timer for this cell
      clearTimeout(cellTimersRef.current[cellIndex])
      delete cellTimersRef.current[cellIndex]

      setActiveCells((prev) => {
        const next = new Set(prev)
        next.delete(cellIndex)
        return next
      })

      setScore((s) => s + 1)
    },
    [phase, activeCells]
  )

  // Urgency colour: green → yellow → red as time runs low
  const timerColor =
    timeLeft > 15 ? '#34c759' : timeLeft > 8 ? '#ff9f0a' : '#ff3b30'

  return (
    <div className="w-full max-w-lg mx-auto" style={{ position: 'relative' }}>
      {/* Title */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--label-primary)' }}
        >
          Latch-am If You Can
        </h2>
        <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
          Click the locks before they escape — latch as many as you can in {GAME_DURATION}s!
        </p>
      </div>

      {/* Stats bar */}
      {phase !== 'idle' && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div
            className="p-3 rounded-lg text-center font-semibold"
            style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--label-secondary)' }}>
              Latched
            </p>
            <p className="text-2xl">{score}</p>
          </div>
          <div
            className="p-3 rounded-lg text-center font-semibold"
            style={{ backgroundColor: 'var(--fill-tertiary)', color: timerColor }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--label-secondary)' }}>
              Time Left
            </p>
            <p className="text-2xl">{timeLeft}s</p>
          </div>
        </div>
      )}

      {/* Game grid */}
      {phase === 'playing' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          {Array.from({ length: TOTAL_CELLS }, (_, i) => {
            const isActive = activeCells.has(i)
            const isMissed = missedFlash === i
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                aria-label={isActive ? 'Latch it!' : 'Empty'}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: isActive ? 'pointer' : 'default',
                  fontSize: isActive ? '28px' : '20px',
                  transition: 'transform 0.1s ease, background-color 0.15s ease',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  backgroundColor: isActive
                    ? 'var(--arcade-blue)'
                    : isMissed
                    ? '#ff3b3033'
                    : 'var(--fill-tertiary)',
                  boxShadow: isActive
                    ? '0 4px 16px rgba(0,134,234,0.45)'
                    : 'none',
                }}
              >
                {isActive ? '🔒' : isMissed ? '💨' : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* Idle / start screen */}
      {phase === 'idle' && (
        <div
          className="rounded-xl p-8 text-center mb-6"
          style={{ backgroundColor: 'var(--fill-secondary)' }}
        >
          <p className="text-5xl mb-4">🔒</p>
          <p className="font-semibold mb-2" style={{ color: 'var(--label-primary)' }}>
            Locks will appear on the grid — click them before they escape!
          </p>
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            They get faster as your score climbs. Can you latch {GOOD_SCORE}+?
          </p>
        </div>
      )}

      {/* Game over screen */}
      {phase === 'gameover' && (
        <div
          className="rounded-xl p-8 text-center mb-6"
          style={{ backgroundColor: 'var(--fill-secondary)', position: 'relative', overflow: 'hidden' }}
        >
          {showConfetti && <Confetti />}
          <p className="text-5xl mb-3">{score >= GOOD_SCORE ? '🏆' : '🔓'}</p>
          <p
            className="text-2xl font-bold mb-2"
            style={{ color: score >= GOOD_SCORE ? '#34c759' : 'var(--label-primary)' }}
          >
            {score >= GOOD_SCORE ? 'Latched it!' : "Time's up!"}
          </p>
          <p className="text-4xl font-bold mb-1" style={{ color: 'var(--arcade-blue)' }}>
            {score}
          </p>
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            {score === 1 ? 'lock latched' : 'locks latched'}
          </p>
          {score < GOOD_SCORE && (
            <p className="text-sm mt-3" style={{ color: 'var(--label-secondary)' }}>
              Target: {GOOD_SCORE} — you can do it!
            </p>
          )}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={startGame}
        className="w-full px-6 py-3 rounded-lg font-semibold text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {phase === 'idle' ? 'Start Game' : 'Play Again'}
      </button>

      {/* Toast */}
      {message && <Toast message={message} />}
    </div>
  )
}
