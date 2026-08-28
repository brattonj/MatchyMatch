/**
 * @file ColourClashBoard.jsx
 * @description Colour Clash - A Stroop effect game where players tap the ink colour, not the word.
 * Players race against 30 seconds to tap the correct colour buttons while rounds accelerate.
 * Features streak tracking, accuracy calculation, and difficulty progression.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onNewGame - Callback to start a new game
 * @returns {React.ReactElement} Colour Clash game with colour display and button grid
 * 
 * @state {string} phase - Current game phase ('menu', 'playing', or 'gameover')
 * @state {number} score - Total points accumulated
 * @state {number} correct - Current correct streak
 * @state {number} wrong - Number of wrong answers
 * @state {number} timeLeft - Seconds remaining
 * @state {Object|null} round - Current round with wordColor and inkColor
 * @state {string|null} feedback - Feedback state ('correct', 'wrong', or null)
 * @state {Array} scorePopups - Array of floating score popups
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Constants ─────────────────────────────────────────────────────

const GAME_DURATION = 30 // seconds
const INITIAL_ROUND_TIME = 2000 // ms per round
const MIN_ROUND_TIME = 600 // fastest round (ms)
const COLORS = [
  { name: 'RED', hex: '#ff3b30', label: 'Red' },
  { name: 'BLUE', hex: '#0a84ff', label: 'Blue' },
  { name: 'GREEN', hex: '#34c759', label: 'Green' },
  { name: 'YELLOW', hex: '#ff9f0a', label: 'Yellow' },
  { name: 'PURPLE', hex: '#5856d6', label: 'Purple' },
  { name: 'PINK', hex: '#ff2d55', label: 'Pink' },
]

// ── Helpers ───────────────────────────────────────────────────────

function pickRandomColor(exclude = null) {
  let available = COLORS
  if (exclude) {
    available = COLORS.filter((c) => c.name !== exclude)
  }
  return available[Math.floor(Math.random() * available.length)]
}

function generateRound() {
  const wordColor = pickRandomColor()
  const inkColor = pickRandomColor(wordColor.name)
  return { wordColor, inkColor }
}

function computeRoundTime(elapsed) {
  const progress = elapsed / GAME_DURATION
  return Math.max(
    MIN_ROUND_TIME,
    INITIAL_ROUND_TIME - progress * (INITIAL_ROUND_TIME - MIN_ROUND_TIME)
  )
}

function getRating(score) {
  if (score >= 30) return { emoji: '🔥', label: 'Colour Master!', color: '#ff3b30' }
  if (score >= 20) return { emoji: '⚡', label: 'Blazing Fast!', color: '#ff9f0a' }
  if (score >= 10) return { emoji: '🎯', label: 'Nice Work!', color: '#34c759' }
  return { emoji: '🎨', label: 'Keep Practicing!', color: '#0a84ff' }
}

// ── Color button ──────────────────────────────────────────────────

function ColorButton({ color, isCorrect, onClick, disabled }) {
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let resetId
    const id = setTimeout(() => {
      if (isCorrect === null) {
        setFeedback(null)
        return
      }
      setFeedback(isCorrect ? 'correct' : 'wrong')
      resetId = setTimeout(() => setFeedback(null), 300)
    }, 0)
    return () => {
      clearTimeout(id)
      clearTimeout(resetId)
    }
  }, [isCorrect])

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${color.label} button`}
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 16,
        border: 'none',
        background: color.hex,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 0.1s ease, box-shadow 0.15s ease',
        boxShadow:
          feedback === 'correct'
            ? `0 0 20px ${color.hex}88, inset 0 0 20px rgba(255,255,255,0.3)`
            : feedback === 'wrong'
              ? `0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)`
              : `0 4px 12px ${color.hex}44`,
        transform:
          feedback === 'correct'
            ? 'scale(1.05)'
            : feedback === 'wrong'
              ? 'scale(0.95)'
              : 'scale(1)',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && feedback === null) {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = `0 6px 20px ${color.hex}66`
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && feedback === null) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = `0 4px 12px ${color.hex}44`
        }
      }}
    />
  )
}

// ── Score popup ───────────────────────────────────────────────────

function ScorePopup({ points, id }) {
  return (
    <div
      key={id}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.5rem',
        fontWeight: 800,
        color: '#34c759',
        animation: 'score-float 0.9s ease-out forwards',
        zIndex: 999,
        textShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      +{points}
    </div>
  )
}

// ── Game Over screen ──────────────────────────────────────────────

function GameOverScreen({ score, correct, wrong, onPlayAgain }) {
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
  const rating = getRating(score)

  return (
    <div
      className="spring-pop flex flex-col items-center gap-6 p-8 rounded-3xl w-full max-w-sm mx-auto"
      style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: `linear-gradient(145deg, ${rating.color}, ${rating.color}cc)`,
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
          Time's up! How did you do?
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-3 w-full"
        style={{ borderTop: '1px solid var(--fill-tertiary)', paddingTop: '1.25rem' }}
      >
        {[
          { label: 'Score', value: score, color: '#0a84ff' },
          { label: 'Correct', value: correct, color: '#34c759' },
          { label: 'Accuracy', value: `${accuracy}%`, color: '#ff9f0a' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color }}>
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

      <button onClick={onPlayAgain} className="btn-primary w-full">
        Play Again
      </button>
    </div>
  )
}

// ── Main Board ────────────────────────────────────────────────────

export default function ColourClashBoard() {
  const [phase, setPhase] = useState('menu') // menu | playing | gameover
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [round, setRound] = useState(null)
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [scorePopups, setScorePopups] = useState([])

  const elapsedRef = useRef(0)
  const popupIdRef = useRef(0)
  const roundTimerRef = useRef(null)
  const gameTimerRef = useRef(null)

  const endGame = useCallback(() => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    setPhase('gameover')
  }, [])

  // ── Start game ────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setPhase('playing')
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setCorrect(0)
    setWrong(0)
    setFeedback(null)
    elapsedRef.current = 0
    setRound(generateRound())
  }, [])

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(gameTimerRef.current)
          endGame()
          return 0
        }
        elapsedRef.current += 1
        return t - 1
      })
    }, 1000)
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [phase, endGame])

  // ── Round timer (auto-advance if no answer) ───────────────────
  useEffect(() => {
    if (phase !== 'playing' || !round) return

    const nextRoundTime = computeRoundTime(elapsedRef.current)
    roundTimerRef.current = setTimeout(() => {
      setWrong((w) => w + 1)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setRound(generateRound())
      }, 300)
    }, nextRoundTime)

    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
    }
  }, [phase, round])

  // ── Handle color button click ─────────────────────────────────
  const handleColorClick = useCallback(
    (selectedColor) => {
      if (phase !== 'playing' || !round || feedback) return

      if (roundTimerRef.current) clearTimeout(roundTimerRef.current)

      const isCorrect = selectedColor.name === round.inkColor.name
      setFeedback(isCorrect ? 'correct' : 'wrong')

      if (isCorrect) {
        const pts = 10
        setScore((s) => s + pts)
        setCorrect((c) => c + 1)

        // Add score popup
        const popupId = popupIdRef.current++
        setScorePopups((prev) => [...prev, { id: popupId, points: pts }])
        setTimeout(() => {
          setScorePopups((prev) => prev.filter((p) => p.id !== popupId))
        }, 900)
      } else {
        setWrong((w) => w + 1)
      }

      setTimeout(() => {
        setFeedback(null)
        setRound(generateRound())
      }, 300)
    },
    [phase, round, feedback]
  )

  // ── Render ────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div
        className="spring-pop flex flex-col items-center gap-8 p-8 rounded-3xl w-full max-w-sm mx-auto"
        style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
            }}
          >
            🎨
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--label-primary)',
            }}
          >
            Colour Clash
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--label-tertiary)', maxWidth: 280 }}>
            Tap the button matching the <strong>ink colour</strong>, not the word!
          </p>
        </div>

        <div
          className="flex flex-col gap-2 w-full p-4 rounded-2xl"
          style={{ background: 'var(--fill-tertiary)' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
              marginBottom: '0.5rem',
            }}
          >
            How to Play
          </p>
          <ul
            style={{
              fontSize: '0.85rem',
              color: 'var(--label-secondary)',
              lineHeight: 1.6,
              listStyle: 'none',
              paddingLeft: 0,
            }}
          >
            <li>✓ You'll see a colour word in a different ink colour</li>
            <li>✓ Tap the button matching the <strong>ink colour</strong></li>
            <li>✓ Rounds get faster as you progress</li>
            <li>✓ 30 seconds to rack up points!</li>
          </ul>
        </div>

        <button onClick={startGame} className="btn-primary w-full">
          Start Game
        </button>
      </div>
    )
  }

  if (phase === 'gameover') {
    return <GameOverScreen score={score} correct={correct} wrong={wrong} onPlayAgain={startGame} />
  }

  // Playing phase
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1">
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            Score
          </span>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--label-primary)',
            }}
          >
            {score}
          </span>
        </div>

        <div
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-full"
          style={{
            background: timeLeft <= 5 ? 'rgba(255, 59, 48, 0.15)' : 'var(--fill-tertiary)',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: timeLeft <= 5 ? '#ff3b30' : 'var(--label-tertiary)',
            }}
          >
            Time
          </span>
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: timeLeft <= 5 ? '#ff3b30' : 'var(--label-primary)',
            }}
          >
            {timeLeft}s
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            Streak
          </span>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--label-primary)',
            }}
          >
            {correct}
          </span>
        </div>
      </div>

      {/* Color display */}
      {round && (
        <div
          className="flex flex-col items-center gap-4 p-8 rounded-3xl"
          style={{ background: 'var(--fill-tertiary)' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            Tap the {round.inkColor.label} button
          </p>
          <div
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: round.inkColor.hex,
              textShadow: `0 2px 8px ${round.inkColor.hex}44`,
              animation: feedback ? 'none' : 'pulse-text 0.6s ease-in-out infinite',
            }}
          >
            {round.wordColor.name}
          </div>
        </div>
      )}

      {/* Color buttons grid */}
      <div className="grid grid-cols-3 gap-3">
        {COLORS.map((color) => (
          <ColorButton
            key={color.name}
            color={color}
            isCorrect={
              feedback === null
                ? null
                : feedback === 'correct' && color.name === round.inkColor.name
                  ? true
                  : feedback === 'wrong' && color.name === round.inkColor.name
                    ? false
                    : null
            }
            onClick={() => handleColorClick(color)}
            disabled={feedback !== null}
          />
        ))}
      </div>

      {/* Score popups */}
      {scorePopups.map((popup) => (
        <ScorePopup key={popup.id} points={popup.points} id={popup.id} />
      ))}
    </div>
  )
}
