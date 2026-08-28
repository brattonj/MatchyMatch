import { useState, useEffect } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

export default function NumberGuessBoard() {
  const MIN = 1
  const MAX = 100
  const MAX_ATTEMPTS = 7
  const [targetNumber, setTargetNumber] = useState(null)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [guessHistory, setGuessHistory] = useState([])
  const [hint, setHint] = useState('')

  // Initialize game on mount
  useEffect(() => {
    const newTarget = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN
    setTargetNumber(newTarget)
  }, [])

  const handleGuess = () => {
    if (gameState !== 'playing' || !guess) return

    const guessNum = parseInt(guess, 10)
    if (isNaN(guessNum) || guessNum < MIN || guessNum > MAX) {
      setMessage(`Please enter a number between ${MIN} and ${MAX}`)
      return
    }

    const newAttemptCount = attempts + 1
    setAttempts(newAttemptCount)
    setGuessHistory([...guessHistory, guessNum])
    setGuess('')

    if (guessNum === targetNumber) {
      setGameState('won')
      setMessage(`🎉 You got it! The number was ${targetNumber}. Won in ${newAttemptCount} attempt${newAttemptCount === 1 ? '' : 's'}!`)
      setShowConfetti(true)
      setHint('')
    } else if (newAttemptCount >= MAX_ATTEMPTS) {
      setGameState('lost')
      setMessage(`Game Over! The number was ${targetNumber}. Better luck next time!`)
      setHint('')
    } else {
      const remaining = MAX_ATTEMPTS - newAttemptCount
      if (guessNum < targetNumber) {
        setHint(`Too low! Try higher. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`)
      } else {
        setHint(`Too high! Try lower. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`)
      }
    }
  }

  const handleReset = () => {
    const newTarget = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN
    setTargetNumber(newTarget)
    setGuess('')
    setAttempts(0)
    setGameState('playing')
    setMessage('')
    setShowConfetti(false)
    setGuessHistory([])
    setHint('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGuess()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Number Guess
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--label-secondary)' }}
        >
          I'm thinking of a number between {MIN} and {MAX}
        </p>
      </div>

      {/* Status */}
      <div
        className="text-center p-4 rounded-lg mb-6 font-semibold"
        style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
      >
        <p>Attempts: {attempts} / {MAX_ATTEMPTS}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--label-secondary)' }}>
          Range: {MIN} – {MAX}
        </p>
      </div>

      {/* Hint Display */}
      {hint && (
        <div
          className="text-center p-3 rounded-lg mb-6 font-semibold"
          style={{
            backgroundColor: 'var(--fill-secondary)',
            color: 'var(--label-primary)',
          }}
        >
          {hint}
        </div>
      )}

      {/* Input Section */}
      {gameState === 'playing' && (
        <div className="flex gap-2 mb-6">
          <input
            type="number"
            min={MIN}
            max={MAX}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your guess"
            className="flex-1 px-4 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: 'var(--fill-secondary)',
              color: 'var(--label-primary)',
              border: '2px solid var(--fill-tertiary)',
            }}
          />
          <button
            onClick={handleGuess}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Guess
          </button>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 rounded-lg font-semibold"
          style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
        >
          {gameState === 'playing' ? 'New Game' : 'Play Again'}
        </button>
      </div>

      {/* Guess History */}
      {guessHistory.length > 0 && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: 'var(--fill-tertiary)' }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--label-primary)' }}>
            Your Guesses
          </p>
          <div className="flex flex-wrap gap-2">
            {guessHistory.map((g, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-sm rounded font-mono font-semibold"
                style={{
                  backgroundColor: g === targetNumber ? '#30d158' : 'var(--fill-secondary)',
                  color: g === targetNumber ? 'white' : 'var(--label-primary)',
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <Toast message={message} />
      )}

      {/* Confetti */}
      {showConfetti && (
        <Confetti />
      )}
    </div>
  )
}
