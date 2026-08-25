import { useState, useEffect, useCallback, useRef } from 'react'
import Toast from '../Toast'

// Generate a random number between min and max
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Main game component
export default function NathanielNinjaBoard() {
  const [gameState, setGameState] = useState('playing') // 'playing' | 'won' | 'lost'
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [currentNumber, setCurrentNumber] = useState(randomNumber(1, 100))
  const [options, setOptions] = useState([])
  const [toast, setToast] = useState(null)
  const [streak, setStreak] = useState(0)
  const timerRef = useRef(null)
  const gameRef = useRef(null)

  // Initialize options when current number changes
  useEffect(() => {
    const correct = currentNumber
    const used = new Set([correct])
    const wrongs = []
    while (wrongs.length < 3) {
      const candidate = randomNumber(1, 100)
      if (!used.has(candidate)) {
        used.add(candidate)
        wrongs.push(candidate)
      }
    }

    let opts = [correct, ...wrongs]
    // Shuffle
    opts = opts.sort(() => Math.random() - 0.5)
    const id = setTimeout(() => setOptions(opts), 0)
    return () => clearTimeout(id)
  }, [currentNumber])

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') {
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('lost')
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [gameState])

  const showToast = useCallback((msg) => setToast(msg), [])

  const handleAnswer = (selected) => {
    if (selected === currentNumber) {
      // Correct!
      const newScore = score + (level * 10)
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      showToast('✨ Correct!')

      // Level up every 5 correct answers
      if (newStreak % 5 === 0) {
        setLevel((l) => l + 1)
        showToast(`🎉 Level ${level + 1}!`)
      }

      // Generate new number
      setCurrentNumber(randomNumber(1, 100 + level * 20))
    } else {
      // Wrong!
      showToast('❌ Wrong!')
      setStreak(0)
      setGameState('lost')
    }
  }

  const handlePlayAgain = () => {
    setGameState('playing')
    setScore(0)
    setLevel(1)
    setTimeLeft(30)
    setCurrentNumber(randomNumber(1, 100))
    setStreak(0)
  }

  // Won screen
  if (gameState === 'won') {
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
            background: 'linear-gradient(145deg, #34c759, #30d158)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 8px 24px rgba(52,199,89,0.35)',
          }}
        >
          🥋
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
            Ninja Master!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--label-tertiary)' }}>
            You reached level {level}!
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { label: 'Score', value: score },
            { label: 'Level', value: level },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--label-primary)',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--label-tertiary)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handlePlayAgain} className="btn-primary w-full">
          Play Again
        </button>
      </div>
    )
  }

  // Lost screen
  if (gameState === 'lost') {
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
            background: 'linear-gradient(145deg, #ff3b30, #ff453a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 8px 24px rgba(255,59,48,0.35)',
          }}
        >
          💥
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
            Game Over!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--label-tertiary)' }}>
            You made it to level {level}
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { label: 'Score', value: score },
            { label: 'Streak', value: streak },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--label-primary)',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--label-tertiary)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handlePlayAgain} className="btn-primary w-full">
          Try Again
        </button>
      </div>
    )
  }

  // Playing screen
  return (
    <div
      className="flex flex-col items-center gap-6 w-full max-w-md mx-auto"
      ref={gameRef}
    >
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header stats */}
      <div className="flex gap-4 w-full justify-center flex-wrap">
        {[
          { label: 'Score', value: score, color: '#34c759' },
          { label: 'Level', value: level, color: '#0a84ff' },
          { label: 'Time', value: timeLeft, color: timeLeft <= 5 ? '#ff3b30' : '#ff9f0a' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl"
            style={{ background: 'var(--fill-tertiary)' }}
          >
            <span
              style={{
                fontSize: '1.2rem',
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

      {/* Main challenge */}
      <div className="w-full">
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--label-tertiary)',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Find the number:
        </p>
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 24,
            background: 'linear-gradient(145deg, var(--accent), #5856d6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(3rem, 15vw, 5rem)',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
            marginBottom: '2rem',
          }}
        >
          {currentNumber}
        </div>
      </div>

      {/* Options grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '100%',
        }}
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            style={{
              padding: '1.5rem',
              borderRadius: 16,
              background: 'var(--fill-secondary)',
              border: '1px solid var(--stroke-secondary)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--label-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            {opt}
          </button>
        ))}
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
        Tap the correct number. Get it right to advance and earn points!
      </p>
    </div>
  )
}
