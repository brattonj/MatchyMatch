import { useState, useRef } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

const WORDS = [
  {
    word: 'hat',
    clues: [
      'I am something you wear.',
      'I sit on top of your head.',
      'The Cat in the Hat loves me!',
      'I rhyme with "cat" and "bat".',
      'I have a brim and a crown.',
    ],
  },
  {
    word: 'fish',
    clues: [
      'I live in water.',
      'I have fins and scales.',
      'One fish, two fish — can you guess?',
      'I rhyme with "dish" and "wish".',
      'Red fish, blue fish — what am I?',
    ],
  },
  {
    word: 'star',
    clues: [
      'I shine in the night sky.',
      'I twinkle from very far away.',
      'You might wish upon me.',
      'I rhyme with "car" and "jar".',
      'Starfish share my name!',
    ],
  },
  {
    word: 'egg',
    clues: [
      'I am oval-shaped.',
      'Green ones are famous in a Dr. Seuss book.',
      'I come from a bird.',
      'I rhyme with "leg" and "beg".',
      'You can scramble me or fry me!',
    ],
  },
  {
    word: 'box',
    clues: [
      'I have four sides.',
      'You can put things inside me.',
      'Fox in socks sat on a ___.',
      'I rhyme with "fox" and "socks".',
      'I am a square container.',
    ],
  },
  {
    word: 'moon',
    clues: [
      'I appear at night.',
      'I glow in the dark sky.',
      'I am not the sun.',
      'I rhyme with "spoon" and "tune".',
      'Goodnight, ___!',
    ],
  },
  {
    word: 'tree',
    clues: [
      'I grow tall in the forest.',
      'I have leaves and branches.',
      'The Lorax speaks for me.',
      'I rhyme with "bee" and "free".',
      'Birds build nests in me.',
    ],
  },
  {
    word: 'cake',
    clues: [
      'I am sweet and delicious.',
      'You eat me at birthday parties.',
      'I have frosting on top.',
      'I rhyme with "lake" and "bake".',
      'You blow out candles on me!',
    ],
  },
  {
    word: 'boat',
    clues: [
      'I float on water.',
      'I carry passengers across the sea.',
      'I am not a car or a plane.',
      'I rhyme with "coat" and "goat".',
      'You can row me with oars!',
    ],
  },
  {
    word: 'frog',
    clues: [
      'I am a small green animal.',
      'I jump and leap around.',
      'I live near ponds and lakes.',
      'I rhyme with "log" and "dog".',
      'Ribbit! Ribbit! What am I?',
    ],
  },
]

function pickRandom(exclude) {
  const pool = exclude ? WORDS.filter((w) => w.word !== exclude) : WORDS
  return pool[Math.floor(Math.random() * pool.length)]
}

const MAX_GUESSES = 5

export default function SamIAmBoard() {
  const [entry, setEntry] = useState(() => pickRandom())
  const [clueIndex, setClueIndex] = useState(0)
  const [guessInput, setGuessInput] = useState('')
  const [guessHistory, setGuessHistory] = useState([])
  const [gameState, setGameState] = useState('playing') // 'playing' | 'won' | 'lost'
  const [toastMsg, setToastMsg] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const inputRef = useRef(null)

  const guessesLeft = MAX_GUESSES - guessHistory.length

  const showToast = (msg) => {
    setToastMsg(msg)
  }

  const handleGuess = () => {
    const guess = guessInput.trim().toLowerCase()
    if (!guess) return
    if (gameState !== 'playing') return

    const correct = entry.word.toLowerCase()

    if (guess === correct) {
      setGuessHistory((h) => [...h, { guess, correct: true }])
      setGameState('won')
      setShowConfetti(true)
      setGuessInput('')
      return
    }

    const newHistory = [...guessHistory, { guess, correct: false }]
    setGuessHistory(newHistory)
    setGuessInput('')

    if (newHistory.length >= MAX_GUESSES) {
      setGameState('lost')
      return
    }

    // Reveal next clue
    const nextClue = Math.min(clueIndex + 1, entry.clues.length - 1)
    setClueIndex(nextClue)
    showToast('Not quite! Here’s another clue…')

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGuess()
  }

  const handlePlayAgain = () => {
    setEntry(pickRandom(entry.word))
    setClueIndex(0)
    setGuessInput('')
    setGuessHistory([])
    setGameState('playing')
    setShowConfetti(false)
    setToastMsg('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const revealedClues = entry.clues.slice(0, clueIndex + 1)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--label-primary)' }}
        >
          Sam I Am 🎩
        </h2>
        <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
          Guess the secret word from the clues!
        </p>
      </div>

      {/* Clues */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{ backgroundColor: 'var(--fill-secondary)' }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--label-tertiary)' }}
        >
          Clues so far
        </p>
        <ol className="space-y-2">
          {revealedClues.map((clue, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm"
              style={{ color: 'var(--label-primary)' }}
            >
              <span
                className="font-bold shrink-0"
                style={{ color: '#ff9f0a' }}
              >
                {i + 1}.
              </span>
              <span>{clue}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Guess history */}
      {guessHistory.length > 0 && (
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: 'var(--label-tertiary)' }}
          >
            Your guesses
          </p>
          <div className="flex flex-wrap gap-2">
            {guessHistory.map((g, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: g.correct ? '#34c759' : '#ff3b30',
                  color: 'white',
                }}
              >
                {g.guess}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Guesses left indicator */}
      {gameState === 'playing' && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            Guesses left:
          </p>
          <div className="flex gap-1">
            {Array.from({ length: MAX_GUESSES }).map((_, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor:
                    i < guessesLeft ? '#34c759' : 'var(--fill-tertiary)',
                  border: '1px solid var(--label-tertiary)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      {gameState === 'playing' && (
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your guess…"
            autoFocus
            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium outline-none"
            style={{
              backgroundColor: 'var(--fill-tertiary)',
              color: 'var(--label-primary)',
              border: '1.5px solid var(--label-tertiary)',
            }}
          />
          <button
            onClick={handleGuess}
            disabled={!guessInput.trim()}
            className="px-5 py-3 rounded-lg font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Guess
          </button>
        </div>
      )}

      {/* Win state */}
      {gameState === 'won' && (
        <div
          className="rounded-xl p-5 mb-6 text-center"
          style={{ backgroundColor: '#34c75920' }}
        >
          <p className="text-4xl mb-2">🎉</p>
          <p
            className="text-xl font-bold mb-1"
            style={{ color: '#34c759' }}
          >
            You got it!
          </p>
          <p className="text-sm mb-1" style={{ color: 'var(--label-secondary)' }}>
            The word was{' '}
            <span className="font-bold" style={{ color: 'var(--label-primary)' }}>
              &ldquo;{entry.word}&rdquo;
            </span>
          </p>
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            You used {guessHistory.length} guess{guessHistory.length !== 1 ? 'es' : ''} and{' '}
            {clueIndex + 1} clue{clueIndex + 1 !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* Lose state */}
      {gameState === 'lost' && (
        <div
          className="rounded-xl p-5 mb-6 text-center"
          style={{ backgroundColor: '#ff3b3020' }}
        >
          <p className="text-4xl mb-2">😔</p>
          <p
            className="text-xl font-bold mb-1"
            style={{ color: '#ff3b30' }}
          >
            Out of guesses!
          </p>
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            The word was{' '}
            <span className="font-bold" style={{ color: 'var(--label-primary)' }}>
              &ldquo;{entry.word}&rdquo;
            </span>
          </p>
        </div>
      )}

      {/* Play Again */}
      {gameState !== 'playing' && (
        <button
          onClick={handlePlayAgain}
          className="w-full px-6 py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Play Again
        </button>
      )}

      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} onDone={() => setToastMsg('')} />
      )}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
