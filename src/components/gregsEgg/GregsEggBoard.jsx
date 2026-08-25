import { useState, useEffect, useCallback, useRef } from 'react'

// ── Constants ─────────────────────────────────────────────────────

const GRID_SIZE = 9       // 3x3 grid
const GAME_DURATION = 30  // seconds
const BASE_INTERVAL = 900 // ms between egg pops
const MIN_INTERVAL = 420  // fastest egg interval (ms)
const EGG_LIFESPAN = 1500 // ms an egg stays before hatching into a chick

const EGG_STATES = {
  EMPTY: 'empty',
  EGG: 'egg',
  CRACKING: 'cracking',
  HATCHED: 'hatched',  // missed — becomes a chick
}

// ── Helpers ───────────────────────────────────────────────────────

function getRandomEmptyIndex(cells) {
  const empty = cells
    .map((c, i) => (c.state === EGG_STATES.EMPTY ? i : null))
    .filter((i) => i !== null)
  if (empty.length === 0) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

// Compute spawn interval based on time elapsed — speeds up as the game progresses
function computeInterval(elapsed) {
  const progress = elapsed / GAME_DURATION
  return Math.max(MIN_INTERVAL, BASE_INTERVAL - progress * (BASE_INTERVAL - MIN_INTERVAL))
}

// ── Egg cell component ────────────────────────────────────────────

function EggCell({ state, onClick }) {
  const isEmpty = state === EGG_STATES.EMPTY
  const isEgg = state === EGG_STATES.EGG
  const isCracking = state === EGG_STATES.CRACKING
  const isHatched = state === EGG_STATES.HATCHED

  const getEmoji = () => {
    if (isEgg) return '🥚'
    if (isCracking) return '🐣'
    if (isHatched) return '🐥'
    return ''
  }

  return (
    <button
      onClick={!isEmpty ? onClick : undefined}
      disabled={isEmpty || isHatched}
      aria-label={isEmpty ? 'Empty nest' : `${state} egg`}
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 16,
        border: '2px solid var(--fill-tertiary)',
        background: isEmpty
          ? 'var(--bg-surface)'
          : isHatched
            ? 'linear-gradient(145deg, #fff3cd, #ffeaa7)'
            : 'linear-gradient(145deg, var(--bg-surface), var(--fill-secondary))',
        fontSize: 'clamp(1.8rem, 6vw, 3rem)',
        cursor: isEmpty || isHatched ? 'default' : 'pointer',
        transition: 'transform 0.1s ease, box-shadow 0.15s ease',
        transform: isEgg || isCracking ? 'scale(1)' : 'scale(0.92)',
        boxShadow:
          isEgg || isCracking
            ? '0 4px 16px rgba(0,0,0,0.12)'
            : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        animation: isEgg
          ? 'egg-pop 0.25s ease-out'
          : isCracking
            ? 'egg-crack 0.2s ease-in-out'
            : isHatched
              ? 'egg-hatch 0.3s ease-out'
              : 'none',
      }}
      onMouseEnter={(e) => {
        if (isEgg || isCracking) {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)'
        }
      }}
      onMouseLeave={(e) => {
        if (isEgg || isCracking) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
        }
      }}
    >
      {getEmoji()}
    </button>
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
        fontSize: '2rem',
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

function GameOverScreen({ score, hits, misses, onPlayAgain }) {
  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0
  const rating =
    accuracy >= 80
      ? { emoji: '🏆', label: 'Egg-cellent!', color: '#ffd700' }
      : accuracy >= 60
        ? { emoji: '🎉', label: 'Cracking job!', color: '#34c759' }
        : accuracy >= 40
          ? { emoji: '🥚', label: 'Shell-shocked?', color: '#ff9f0a' }
          : { emoji: '🐥', label: 'They all hatched!', color: '#ff6b6b' }

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
          {"Greg's eggs have been judged."}
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-3 w-full"
        style={{ borderTop: '1px solid var(--fill-tertiary)', paddingTop: '1.25rem' }}
      >
        {[
          { label: 'Score', value: score, color: '#0a84ff' },
          { label: 'Hits', value: hits, color: '#34c759' },
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

export default function GregsEggBoard() {
  const initialCells = () =>
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      state: EGG_STATES.EMPTY,
    }))

  const [phase, setPhase] = useState('menu') // menu | playing | gameover
  const [cells, setCells] = useState(initialCells)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [scorePopups, setScorePopups] = useState([])

  const elapsedRef = useRef(0)
  const popupIdRef = useRef(0)
  const eggTimersRef = useRef({}) // cellIndex → array of pending timeout ids for that cell's hatch chain

  const addEggTimer = (idx, id) => {
    eggTimersRef.current[idx] = [...(eggTimersRef.current[idx] || []), id]
  }

  // Clear all pending egg timers (every stage of every cell's hatch chain)
  const clearEggTimers = () => {
    Object.values(eggTimersRef.current).forEach((ids) => ids.forEach(clearTimeout))
    eggTimersRef.current = {}
  }

  const endGame = useCallback(() => {
    clearEggTimers()
    setPhase('gameover')
  }, [])

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          endGame()
          return 0
        }
        elapsedRef.current += 1
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, endGame])

  // ── Egg spawner ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return

    const spawnTimerRef = { current: null }

    const spawn = () => {
      setCells((prev) => {
        const idx = getRandomEmptyIndex(prev)
        if (idx === null) return prev
        const next = prev.map((c, i) =>
          i === idx ? { ...c, state: EGG_STATES.EGG } : c
        )

        // Schedule auto-hatch if the player doesn't tap in time
        const hatchId = setTimeout(() => {
          setCells((cur) => {
            // Only update if still an egg (not already tapped)
            if (cur[idx].state !== EGG_STATES.EGG) return cur
            const cracked = cur.map((c, i) =>
              i === idx ? { ...c, state: EGG_STATES.CRACKING } : c
            )
            // After crack animation, fully hatch — unless the player taps
            // it during the cracking window for the timing bonus, in which
            // case this must not also count as a miss.
            const crackId = setTimeout(() => {
              setCells((c2) => {
                if (c2[idx].state !== EGG_STATES.CRACKING) return c2
                setMisses((m) => m + 1)
                return c2.map((c, i) =>
                  i === idx ? { ...c, state: EGG_STATES.HATCHED } : c
                )
              })
              // Clear the nest shortly after
              const emptyId = setTimeout(() => {
                setCells((c3) =>
                  c3.map((c, i) =>
                    i === idx && c.state === EGG_STATES.HATCHED
                      ? { ...c, state: EGG_STATES.EMPTY }
                      : c
                  )
                )
              }, 700)
              addEggTimer(idx, emptyId)
            }, 250)
            addEggTimer(idx, crackId)
            return cracked
          })
        }, EGG_LIFESPAN)

        addEggTimer(idx, hatchId)
        return next
      })

      // Schedule next spawn
      const interval = computeInterval(elapsedRef.current)
      spawnTimerRef.current = setTimeout(spawn, interval)
    }

    spawnTimerRef.current = setTimeout(spawn, 500)

    return () => {
      clearTimeout(spawnTimerRef.current)
    }
  }, [phase])

  // ── Tap handler ───────────────────────────────────────────────
  const handleTap = useCallback(
    (idx) => {
      setCells((prev) => {
        if (prev[idx].state !== EGG_STATES.EGG && prev[idx].state !== EGG_STATES.CRACKING)
          return prev
        // Cancel every pending stage of this cell's hatch chain
        const pendingTimers = eggTimersRef.current[idx] || []
        pendingTimers.forEach(clearTimeout)
        delete eggTimersRef.current[idx]

        const next = prev.map((c, i) =>
          i === idx ? { ...c, state: EGG_STATES.EMPTY } : c
        )

        // Score based on state: egg = 10, cracking = 15 (timing bonus)
        const pts = prev[idx].state === EGG_STATES.CRACKING ? 15 : 10
        setScore((s) => s + pts)
        setHits((h) => h + 1)

        // Score popup
        const pid = ++popupIdRef.current
        setScorePopups((p) => [...p, { id: pid, pts }])
        setTimeout(() => {
          setScorePopups((p) => p.filter((x) => x.id !== pid))
        }, 900)

        return next
      })
    },
    []
  )

  // ── Start / restart ───────────────────────────────────────────
  const startGame = () => {
    clearEggTimers()
    setCells(initialCells())
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setHits(0)
    setMisses(0)
    setScorePopups([])
    elapsedRef.current = 0
    setPhase('playing')
  }

  // ── Menu ──────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
        <style>{KEYFRAMES}</style>
        <div className="flex flex-col items-center gap-3 text-center">
          <span style={{ fontSize: '4rem' }}>🥚</span>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--label-primary)',
            }}
          >
            {"Greg's Egg"}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--label-secondary)', maxWidth: 320 }}>
            {"Greg's chickens have gone rogue. Tap the eggs before they hatch — but watch out, the closer to hatching, the bigger the bonus!"}
          </p>
        </div>

        <div
          className="flex flex-col gap-3 w-full rounded-2xl p-5"
          style={{ background: 'var(--fill-tertiary)' }}
        >
          {[
            { emoji: '🥚', text: 'Tap an egg to crack it — 10 pts' },
            { emoji: '🐣', text: "Tap while it's cracking for 15 pts!" },
            { emoji: '🐥', text: 'Miss it and a chick escapes…' },
            { emoji: '⏱️', text: `You have ${GAME_DURATION} seconds. Go fast!` },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span style={{ fontSize: '1.5rem', width: 32, textAlign: 'center' }}>{emoji}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--label-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={startGame} className="btn-primary w-full" style={{ maxWidth: 320 }}>
          {"🥚 Crack 'em, Greg!"}
        </button>
      </div>
    )
  }

  // ── Game Over ─────────────────────────────────────────────────
  if (phase === 'gameover') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <style>{KEYFRAMES}</style>
        <GameOverScreen
          score={score}
          hits={hits}
          misses={misses}
          onPlayAgain={startGame}
        />
      </div>
    )
  }

  // ── Playing ───────────────────────────────────────────────────
  const timerColor =
    timeLeft <= 5 ? '#ff3b30' : timeLeft <= 10 ? '#ff9f0a' : '#34c759'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <style>{KEYFRAMES}</style>

      {scorePopups.map(({ id, pts }) => (
        <ScorePopup key={id} id={id} points={pts} />
      ))}

      {/* Header */}
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--label-primary)',
          textAlign: 'center',
        }}
      >
        {"Greg's Egg 🥚"}
      </h2>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {[
          { label: 'Time', value: `${timeLeft}s`, color: timerColor },
          { label: 'Score', value: score, color: '#0a84ff' },
          { label: 'Hits', value: hits, color: '#34c759' },
          { label: 'Misses', value: misses, color: '#ff6b6b' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl"
            style={{ background: 'var(--fill-tertiary)' }}
          >
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color,
                letterSpacing: '-0.02em',
                animation:
                  label === 'Time' && timeLeft <= 5 ? 'pulse-warn 0.8s infinite' : 'none',
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

      {/* Timer bar */}
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: 'var(--fill-tertiary)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(timeLeft / GAME_DURATION) * 100}%`,
            borderRadius: 999,
            background: timerColor,
            transition: 'width 1s linear, background 0.3s',
          }}
        />
      </div>

      {/* 3×3 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(8px, 2vw, 14px)',
          width: '100%',
          maxWidth: 340,
        }}
      >
        {cells.map((cell, idx) => (
          <EggCell
            key={cell.id}
            state={cell.state}
            onClick={() => handleTap(idx)}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: '0.78rem',
          color: 'var(--label-tertiary)',
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        {"Don't let Greg's eggs hatch! 🐣"}
      </p>
    </div>
  )
}

// ── Keyframe animations ───────────────────────────────────────────

const KEYFRAMES = `
@keyframes egg-pop {
  0%   { transform: scale(0.4); opacity: 0; }
  70%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes egg-crack {
  0%   { transform: scale(1) rotate(0deg); }
  25%  { transform: scale(1.05) rotate(-6deg); }
  50%  { transform: scale(1.05) rotate(6deg); }
  75%  { transform: scale(1.05) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes egg-hatch {
  0%   { transform: scale(0.8); opacity: 0.6; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes score-float {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-60px); }
}
@keyframes pulse-warn {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`
