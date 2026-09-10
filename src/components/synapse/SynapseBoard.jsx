import { useState, useEffect, useRef } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'
import './synapse.css'

export default function SynapseBoard() {
  const [gameState, setGameState] = useState('ready') // 'ready', 'playing', 'showing', 'won', 'lost'
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [focus, setFocus] = useState(100)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeNode, setActiveNode] = useState(null)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const audioRef = useRef({})

  const GRID_SIZE = 4 // 4x4 grid = 16 nodes
  const NODES = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i)
  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B88B', '#52C4A1', '#FF8C94', '#A8D8EA',
    '#AA96DA', '#FCBAD3', '#A1D82F', '#FFD93D'
  ]

  // Initialize audio context
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioRef.current.context = audioContext
  }, [])

  // Play sound for a node
  const playNodeSound = (nodeIndex) => {
    const context = audioRef.current.context
    if (!context) return

    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    // Frequency based on node position
    const frequency = 200 + (nodeIndex * 50)
    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.3)
  }

  // Show a single node
  const showNode = (nodeIndex, duration = 400) => {
    return new Promise((resolve) => {
      setActiveNode(nodeIndex)
      playNodeSound(nodeIndex)
      setTimeout(() => {
        setActiveNode(null)
        setTimeout(resolve, 100)
      }, duration)
    })
  }

  // Show the entire sequence
  const showSequence = async (seq) => {
    setIsShowingSequence(true)
    setGameState('showing')
    
    for (let i = 0; i < seq.length; i++) {
      await showNode(seq[i], 300 + level * 20)
    }
    
    setIsShowingSequence(false)
    setGameState('playing')
  }

  // Start a new level
  const startLevel = async () => {
    const newSequence = [...sequence, Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)]
    setSequence(newSequence)
    setPlayerSequence([])
    setGameState('showing')
    
    await showSequence(newSequence)
  }

  // Handle node click
  const handleNodeClick = (nodeIndex) => {
    if (gameState !== 'playing' || isShowingSequence) return

    playNodeSound(nodeIndex)
    setActiveNode(nodeIndex)
    setTimeout(() => setActiveNode(null), 200)

    const newPlayerSequence = [...playerSequence, nodeIndex]
    setPlayerSequence(newPlayerSequence)

    // Check if the player's input matches the sequence so far
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      // Wrong node
      const newFocus = Math.max(0, focus - 15)
      setFocus(newFocus)
      setMessage('❌ Wrong node!')

      if (newFocus <= 0) {
        setGameState('lost')
        setMessage('💔 Game Over! Your focus ran out.')
      }
      return
    }

    // Check if player completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      const levelScore = sequence.length * 10 * level
      setScore(score + levelScore)
      setMessage(`✨ Level ${level} complete! +${levelScore} points`)
      setFocus(Math.min(100, focus + 10))
      setLevel(level + 1)
      setGameState('ready')
    }
  }

  // Start game
  const handleStart = () => {
    setLevel(1)
    setSequence([])
    setPlayerSequence([])
    setFocus(100)
    setScore(0)
    setMessage('')
    setShowConfetti(false)
    setGameState('ready')
    startLevel()
  }

  // Continue to next level
  const handleContinue = () => {
    startLevel()
  }

  // Game over - restart
  const handleRestart = () => {
    handleStart()
  }

  // Win condition (reach level 10)
  useEffect(() => {
    if (level > 10 && gameState === 'ready') {
      setGameState('won')
      setShowConfetti(true)
      setMessage('🏆 You mastered Synapse!')
    }
  }, [level, gameState])

  return (
    <div className="synapse-container">
      {/* Header */}
      <div className="synapse-header">
        <h2 className="synapse-title">Synapse</h2>
        <p className="synapse-subtitle">Memorize and recreate the pattern</p>
      </div>

      {/* Stats */}
      <div className="synapse-stats">
        <div className="synapse-stat">
          <span className="synapse-stat-label">Level</span>
          <span className="synapse-stat-value">{level}</span>
        </div>
        <div className="synapse-stat">
          <span className="synapse-stat-label">Score</span>
          <span className="synapse-stat-value">{score}</span>
        </div>
        <div className="synapse-stat">
          <span className="synapse-stat-label">Focus</span>
          <div className="synapse-focus-bar">
            <div 
              className="synapse-focus-fill"
              style={{ 
                width: `${focus}%`,
                backgroundColor: focus > 50 ? '#4ECDC4' : focus > 25 ? '#FFA07A' : '#FF6B6B'
              }}
            />
          </div>
        </div>
      </div>

      {/* Game Grid */}
      {gameState !== 'won' && gameState !== 'lost' && (
        <div className="synapse-grid">
          {NODES.map((nodeIndex) => (
            <button
              key={nodeIndex}
              onClick={() => handleNodeClick(nodeIndex)}
              disabled={gameState !== 'playing' || isShowingSequence}
              className={`synapse-node ${activeNode === nodeIndex ? 'synapse-node--active' : ''}`}
              style={{
                backgroundColor: COLORS[nodeIndex],
                opacity: activeNode === nodeIndex ? 1 : 0.7,
              }}
              aria-label={`Node ${nodeIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* Game State Messages */}
      <div className="synapse-message-area">
        {gameState === 'ready' && sequence.length === 0 && (
          <div className="synapse-message-box">
            <p className="synapse-message-text">Ready to test your memory?</p>
            <button onClick={handleStart} className="synapse-btn synapse-btn--primary">
              Start Game
            </button>
          </div>
        )}

        {gameState === 'ready' && sequence.length > 0 && (
          <div className="synapse-message-box">
            <p className="synapse-message-text">Level {level} complete!</p>
            <button onClick={handleContinue} className="synapse-btn synapse-btn--primary">
              Next Level
            </button>
          </div>
        )}

        {gameState === 'showing' && (
          <div className="synapse-message-box">
            <p className="synapse-message-text">Watch the pattern...</p>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="synapse-message-box">
            <p className="synapse-message-text">Your turn! Repeat the pattern</p>
            <p className="synapse-message-subtext">
              {playerSequence.length} / {sequence.length}
            </p>
          </div>
        )}

        {gameState === 'won' && (
          <div className="synapse-message-box synapse-message-box--win">
            <p className="synapse-message-text">🏆 You Mastered Synapse!</p>
            <p className="synapse-message-subtext">Final Score: {score}</p>
            <button onClick={handleRestart} className="synapse-btn synapse-btn--primary">
              Play Again
            </button>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="synapse-message-box synapse-message-box--lose">
            <p className="synapse-message-text">💔 Game Over</p>
            <p className="synapse-message-subtext">
              You reached Level {level} with {score} points
            </p>
            <button onClick={handleRestart} className="synapse-btn synapse-btn--primary">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
