import { useState } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

export default function RochellesSpinnerBoard() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [rotation, setRotation] = useState(0)

  const segments = ['🎉', '🌟', '💎', '🎁', '🏆', '🎪', '🎨', '🎭']
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e']

  const handleSpin = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)
    setMessage('')

    // Generate random rotation. `spins` must be a whole number of turns —
    // a fractional value would itself shift the final resting angle away
    // from the intended segment.
    const spins = 5 + Math.floor(Math.random() * 5) // 5-9 full rotations
    const randomSegment = Math.floor(Math.random() * segments.length)
    // The pointer is fixed at the top (0deg). To land segment i's centre
    // under it after a clockwise rotation, rotate by 360 minus that centre
    // angle (rotating the wheel clockwise moves each wedge's angle forward,
    // so the wedge that ends up at the top is the one at -rotation).
    const segmentSize = 360 / segments.length
    const segmentCenterAngle = segmentSize * randomSegment + segmentSize / 2
    const finalRotation = spins * 360 - segmentCenterAngle

    setRotation(finalRotation)

    // Simulate spin animation
    setTimeout(() => {
      setResult(randomSegment)

      if (randomSegment % 2 === 0) {
        setWins(wins + 1)
        setMessage('🎉 You won!')
        setShowConfetti(true)
      } else {
        setLosses(losses + 1)
        setMessage('❌ Try again!')
      }

      setIsSpinning(false)
    }, 3000)
  }

  const handleReset = () => {
    setResult(null)
    setMessage('')
    setShowConfetti(false)
  }

  const handleNewGame = () => {
    setResult(null)
    setWins(0)
    setLosses(0)
    setMessage('')
    setShowConfetti(false)
    setRotation(0)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Rochelle's Spinner
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--label-secondary)' }}
        >
          Spin the wheel and try your luck!
        </p>
      </div>

      {/* Score */}
      <div
        className="text-center p-4 rounded-lg mb-6 font-semibold"
        style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
      >
        <p>Wins: {wins} | Losses: {losses}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--label-secondary)' }}>
          Win Rate: {wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%
        </p>
      </div>

      {/* Spinner */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div
              className="w-0 h-0 border-l-4 border-r-4 border-t-8"
              style={{
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: 'var(--label-primary)',
              }}
            />
          </div>

          {/* Wheel */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              background: `conic-gradient(${colors.map((color, i) => `${color} ${(i * 360) / colors.length}deg ${((i + 1) * 360) / colors.length}deg`).join(', ')})`,
            }}
          >
            {/* Center circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: 'var(--fill-primary)' }}
            >
              🎡
            </div>
          </div>
        </div>
      </div>

      {/* Result Text */}
      {result !== null && (
        <div className="text-center mb-6">
          <p className="text-2xl font-bold" style={{ color: 'var(--label-primary)' }}>
            {segments[result]}
          </p>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-50 mb-6"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </button>

      {/* Action Buttons */}
      {result !== null && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
          >
            Again
          </button>
          <button
            onClick={handleNewGame}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            New Game
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
