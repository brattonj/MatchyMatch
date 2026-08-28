/**
 * @file KennyKenoBoard.jsx
 * @description Keno lottery game component.
 * Players select 1-10 numbers from 1-80, then 20 numbers are drawn.
 * Displays match count and feedback based on accuracy.
 * 
 * @component
 * @returns {JSX.Element} Keno game board
 * 
 * @state {Array<number>} selectedNumbers - Numbers selected by player (max 10)
 * @state {Array<number>} drawnNumbers - Numbers drawn in the game (20 total)
 * @state {boolean} gameStarted - Whether the game has started
 * @state {boolean} gameOver - Whether the game is over
 * @state {number} matches - Number of matches between selected and drawn
 * @state {string} message - Feedback message based on performance
 */

import { useState } from 'react'
import './kennykeno.css'

export default function KennyKenoBoard() {
  const [selectedNumbers, setSelectedNumbers] = useState([])
  const [drawnNumbers, setDrawnNumbers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [matches, setMatches] = useState(0)
  const [message, setMessage] = useState('')

  const handleNumberSelect = (num) => {
    if (gameStarted || gameOver) return
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num))
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const startGame = () => {
    if (selectedNumbers.length === 0) {
      setMessage('Pick at least one number!')
      return
    }
    setGameStarted(true)
    setMessage('')
    drawNumbers()
  }

  const drawNumbers = () => {
    const drawn = []
    while (drawn.length < 20) {
      const num = Math.floor(Math.random() * 80) + 1
      if (!drawn.includes(num)) {
        drawn.push(num)
      }
    }
    setDrawnNumbers(drawn)

    // Calculate matches
    const matchCount = selectedNumbers.filter((n) =>
      drawn.includes(n)
    ).length
    setMatches(matchCount)

    if (matchCount === selectedNumbers.length) {
      setMessage('🎉 Perfect match! You got them all!')
    } else if (matchCount >= selectedNumbers.length * 0.8) {
      setMessage('🌟 Excellent! Great job!')
    } else if (matchCount >= selectedNumbers.length * 0.5) {
      setMessage('👍 Good effort!')
    } else {
      setMessage('Keep trying!')
    }

    setGameOver(true)
  }

  const resetGame = () => {
    setSelectedNumbers([])
    setDrawnNumbers([])
    setGameStarted(false)
    setGameOver(false)
    setMatches(0)
    setMessage('')
  }

  return (
    <div className="kenny-keno-board">
      <div className="kenny-keno-container">
        <h2 className="kenny-keno-title">Kenny's Keno</h2>

        {!gameStarted && !gameOver && (
          <div className="kenny-keno-section">
            <p className="kenny-keno-instruction">
              Pick 1-10 numbers (1-80), then see how many match the draw!
            </p>
            <div className="kenny-keno-grid">
              {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberSelect(num)}
                  className={`kenny-keno-number ${
                    selectedNumbers.includes(num) ? 'selected' : ''
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="kenny-keno-controls">
              <button
                onClick={startGame}
                className="kenny-keno-btn kenny-keno-btn-primary"
              >
                Draw Numbers
              </button>
              <button
                onClick={resetGame}
                className="kenny-keno-btn kenny-keno-btn-secondary"
              >
                Clear
              </button>
            </div>
            {message && <p className="kenny-keno-message">{message}</p>}
          </div>
        )}

        {gameOver && (
          <div className="kenny-keno-section">
            <div className="kenny-keno-results">
              <p className="kenny-keno-stat">
                Your Numbers: {selectedNumbers.sort((a, b) => a - b).join(', ')}
              </p>
              <p className="kenny-keno-stat">
                Drawn Numbers: {drawnNumbers.join(', ')}
              </p>
              <p className="kenny-keno-stat kenny-keno-matches">
                Matches: {matches} / {selectedNumbers.length}
              </p>
              <p className="kenny-keno-message">{message}</p>
            </div>
            <div className="kenny-keno-controls">
              <button
                onClick={resetGame}
                className="kenny-keno-btn kenny-keno-btn-primary"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

