/**
 * @file FlipCoinBoard.jsx
 * @description Coin flip prediction game component.
 * Players predict heads or tails and flip a coin to test their luck.
 * Tracks wins/losses and displays win rate with confetti on correct predictions.
 * 
 * @component
 * @returns {JSX.Element} Coin flip game board
 * 
 * @state {string|null} prediction - Player's prediction ('heads', 'tails', or null)
 * @state {string|null} result - Coin flip result ('heads', 'tails', or null)
 * @state {boolean} isFlipping - Whether coin is currently flipping
 * @state {number} wins - Number of correct predictions
 * @state {number} losses - Number of incorrect predictions
 * @state {string} message - Status message to display
 * @state {boolean} showConfetti - Whether to show confetti animation
 */

import { useState } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

export default function FlipCoinBoard() {
  const [prediction, setPrediction] = useState(null) // 'heads' or 'tails'
  const [result, setResult] = useState(null) // 'heads' or 'tails'
  const [isFlipping, setIsFlipping] = useState(false)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const handlePredict = (choice) => {
    if (isFlipping || result !== null) return
    setPrediction(choice)
    setMessage('')
  }

  const handleFlip = () => {
    if (!prediction || isFlipping) return

    setIsFlipping(true)
    setResult(null)

    // Simulate coin flip animation
    setTimeout(() => {
      const coinResult = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(coinResult)

      if (coinResult === prediction) {
        setWins(wins + 1)
        setMessage('🎉 You got it right!')
        setShowConfetti(true)
      } else {
        setLosses(losses + 1)
        setMessage(`❌ Wrong! It was ${coinResult}.`)
      }

      setIsFlipping(false)
    }, 1000)
  }

  const handleReset = () => {
    setPrediction(null)
    setResult(null)
    setMessage('')
    setShowConfetti(false)
  }

  const handleNewGame = () => {
    setPrediction(null)
    setResult(null)
    setWins(0)
    setLosses(0)
    setMessage('')
    setShowConfetti(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Flip Coin
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--label-secondary)' }}
        >
          Predict heads or tails and test your luck!
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

      {/* Coin Display */}
      <div className="flex justify-center mb-8">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center font-bold text-6xl transition-transform ${
            isFlipping ? 'animate-spin' : ''
          }`}
          style={{
            backgroundColor: 'var(--fill-secondary)',
            color: 'var(--label-primary)',
            animationDuration: isFlipping ? '0.5s' : '0s',
          }}
        >
          {result === 'heads' ? '🪙' : result === 'tails' ? '🪙' : '❓'}
        </div>
      </div>

      {/* Result Text */}
      {result && (
        <div className="text-center mb-6">
          <p className="text-2xl font-bold" style={{ color: 'var(--label-primary)' }}>
            {result === 'heads' ? 'Heads!' : 'Tails!'}
          </p>
        </div>
      )}

      {/* Prediction Buttons */}
      {!result && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handlePredict('heads')}
            disabled={isFlipping}
            className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
              prediction === 'heads'
                ? 'ring-2 ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: prediction === 'heads' ? '#0a84ff' : 'var(--fill-tertiary)',
              color: prediction === 'heads' ? 'white' : 'var(--label-primary)',
              ringColor: '#0a84ff',
            }}
          >
            Heads
          </button>
          <button
            onClick={() => handlePredict('tails')}
            disabled={isFlipping}
            className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
              prediction === 'tails'
                ? 'ring-2 ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: prediction === 'tails' ? '#ff3b30' : 'var(--fill-tertiary)',
              color: prediction === 'tails' ? 'white' : 'var(--label-primary)',
              ringColor: '#ff3b30',
            }}
          >
            Tails
          </button>
        </div>
      )}

      {/* Flip Button */}
      {prediction && !result && (
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-50 mb-6"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {isFlipping ? 'Flipping...' : 'Flip Coin'}
        </button>
      )}

      {/* Action Buttons */}
      {result && (
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
