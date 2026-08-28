/**
 * @file GeoffsGeometryBoard.jsx
 * @description Shape identification game component.
 * Players identify shapes displayed at the top by clicking matching shapes below.
 * Includes 30-second timer, score tracking, and streak counter.
 * 
 * @component
 * @returns {JSX.Element} Shape identification game board
 * 
 * @state {string} gameState - Game state ('start', 'playing', or 'gameover')
 * @state {Object|null} currentShape - Current shape to identify
 * @state {number} score - Number of correct identifications
 * @state {number} streak - Current correct answer streak
 * @state {string} message - Status message to display
 * @state {boolean} showConfetti - Whether to show confetti animation
 * @state {number} timeLeft - Seconds remaining in game
 * @state {boolean} answered - Whether current shape has been answered
 */

import { useState, useEffect, useCallback } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

const SHAPES = [
  { name: 'Circle', emoji: '⭕', sides: 0 },
  { name: 'Triangle', emoji: '🔺', sides: 3 },
  { name: 'Square', emoji: '⬜', sides: 4 },
  { name: 'Pentagon', emoji: '⬠', sides: 5 },
  { name: 'Hexagon', emoji: '⬡', sides: 6 },
  { name: 'Star', emoji: '⭐', sides: 5 },
  { name: 'Diamond', emoji: '💎', sides: 4 },
  { name: 'Heart', emoji: '❤️', sides: 0 },
]

export default function GeoffsGeometryBoard() {
  const [gameState, setGameState] = useState('start') // 'start', 'playing', 'gameover'
  const [currentShape, setCurrentShape] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [answered, setAnswered] = useState(false)

  const pickNewShape = useCallback(() => {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    setCurrentShape(randomShape)
  }, [])

  const handleStartGame = useCallback(() => {
    setGameState('playing')
    setScore(0)
    setStreak(0)
    setTimeLeft(30)
    setMessage('')
    setShowConfetti(false)
    setAnswered(false)
    pickNewShape()
  }, [pickNewShape])

  const handleShapeClick = (shape) => {
    if (gameState !== 'playing' || !currentShape || answered) return
    setAnswered(true)

    if (shape.name === currentShape.name) {
      setScore((prev) => prev + 1)
      setStreak((prev) => prev + 1)
      setMessage('✅ Correct!')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1000)
    } else {
      setStreak(0)
      setMessage(`❌ Wrong! It was ${currentShape.name}`)
    }

    setTimeout(() => {
      setMessage('')
      setAnswered(false)
      pickNewShape()
    }, 800)
  }

  const handlePlayAgain = useCallback(() => {
    handleStartGame()
  }, [handleStartGame])

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setGameState('gameover')
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  if (gameState === 'start') {
    return (
      <div className="w-full max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--label-primary)' }}
          >
            Geoff's Geometry
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--label-secondary)' }}
          >
            Identify the shapes as fast as you can!
          </p>
        </div>

        {/* Instructions */}
        <div
          className="p-6 rounded-lg mb-8"
          style={{ backgroundColor: 'var(--fill-tertiary)' }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ color: 'var(--label-primary)' }}
          >
            How to Play:
          </h3>
          <ul
            className="text-sm space-y-2"
            style={{ color: 'var(--label-secondary)' }}
          >
            <li>✨ A shape will appear at the top</li>
            <li>⏱️ You have 30 seconds</li>
            <li>🎯 Click the matching shape below</li>
            <li>🔥 Build your streak for bonus points!</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full px-6 py-4 rounded-lg font-semibold text-white text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Geoff's Geometry
        </h2>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-lg"
        style={{ backgroundColor: 'var(--fill-tertiary)' }}
      >
        <div className="text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: 'var(--accent)' }}
          >
            {score}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--label-secondary)' }}
          >
            Score
          </p>
        </div>
        <div className="text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: '#ff9500' }}
          >
            {streak}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--label-secondary)' }}
          >
            Streak
          </p>
        </div>
        <div className="text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: timeLeft <= 5 ? '#ff3b30' : 'var(--label-primary)' }}
          >
            {timeLeft}s
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--label-secondary)' }}
          >
            Time
          </p>
        </div>
      </div>

      {/* Current Shape Display */}
      {gameState === 'playing' && currentShape && (
        <div className="text-center mb-8">
          <p
            className="text-sm mb-3"
            style={{ color: 'var(--label-secondary)' }}
          >
            Identify this shape:
          </p>
          <div
            className="text-8xl mb-3 p-6 rounded-lg"
            style={{ backgroundColor: 'var(--fill-secondary)' }}
          >
            {currentShape.emoji}
          </div>
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--label-primary)' }}
          >
            {currentShape.name}
          </p>
        </div>
      )}

      {/* Shape Options Grid */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {SHAPES.map((shape) => (
            <button
              key={shape.name}
              onClick={() => handleShapeClick(shape)}
              disabled={answered}
              className="aspect-square rounded-lg text-4xl transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--fill-secondary)' }}
            >
              {shape.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="text-center mb-6">
          <div
            className="p-6 rounded-lg mb-6"
            style={{ backgroundColor: 'var(--fill-tertiary)' }}
          >
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--label-secondary)' }}
            >
              Final Score
            </p>
            <p
              className="text-5xl font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {score}
            </p>
            <p
              className="text-sm mt-3"
              style={{ color: 'var(--label-secondary)' }}
            >
              Best Streak: {streak}
            </p>
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
