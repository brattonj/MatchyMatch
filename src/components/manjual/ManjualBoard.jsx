/**
 * @file ManjualBoard.jsx
 * @description Manju-themed hangman word guessing game component.
 * Players guess letters to reveal manju-related words with hints.
 * Tracks score across 10 words with 6 wrong guesses allowed.
 * Shows confetti on correct word guesses and win screen on completion.
 * 
 * @component
 * @returns {JSX.Element} Manju word guessing game board
 * 
 * @state {number} currentWordIndex - Index of current word in MANJU_WORDS
 * @state {Set} guessedLetters - Set of letters guessed so far
 * @state {number} wrongGuesses - Number of incorrect guesses
 * @state {number} score - Number of words correctly guessed
 * @state {boolean} gameOver - Whether the game has ended
 * @state {boolean} won - Whether the player won (all words guessed)
 * @state {string} message - Status message
 * @state {boolean} showConfetti - Whether to show confetti animation
 * @ref {boolean} gameOverRef - Reference to gameOver for nested timeouts
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

const MANJU_WORDS = [
  { word: 'SWEET', hint: 'A type of Indian confection' },
  { word: 'FILLING', hint: 'What goes inside a manju' },
  { word: 'STEAM', hint: 'How manju is cooked' },
  { word: 'DOUGH', hint: 'The outer layer' },
  { word: 'JAGGERY', hint: 'A common sweetener in manju' },
  { word: 'BEAN', hint: 'Red or black, often used as filling' },
  { word: 'FESTIVAL', hint: 'When manju is often served' },
  { word: 'INDIA', hint: 'Where manju originates' },
  { word: 'DESSERT', hint: 'Type of course' },
  { word: 'TREAT', hint: 'A special ___ for guests' },
]

export default function ManjualBoard() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [guessedLetters, setGuessedLetters] = useState(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const MAX_WRONG = 6
  const currentWord = MANJU_WORDS[currentWordIndex]
  const wordLetters = useMemo(() => new Set(currentWord.word), [currentWord.word])
  const isWordComplete = [...wordLetters].every((l) => guessedLetters.has(l))

  // Mirrors `gameOver` for the nested timeouts below — the alphabet stays
  // clickable during the word-complete delay, so a wrong-guesses loss can
  // happen while an "advance to next word" chain is still pending. Reading
  // this ref (instead of the closed-over `gameOver`) keeps that chain from
  // overwriting a loss that occurred after it was scheduled.
  const gameOverRef = useRef(gameOver)
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    if (isWordComplete) {
      let advanceId
      const id = setTimeout(() => {
        if (gameOverRef.current) return
        setScore((prevScore) => prevScore + 1)
        setMessage('🎉 Correct!')
        setShowConfetti(true)
        advanceId = setTimeout(() => {
          if (gameOverRef.current) return
          if (currentWordIndex < MANJU_WORDS.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1)
            setGuessedLetters(new Set())
            setMessage('')
            setShowConfetti(false)
          } else {
            setWon(true)
            setGameOver(true)
          }
        }, 1500)
      }, 0)
      return () => {
        clearTimeout(id)
        clearTimeout(advanceId)
      }
    }
  }, [isWordComplete, currentWordIndex])

  useEffect(() => {
    if (wrongGuesses >= MAX_WRONG) {
      const id = setTimeout(() => {
        setGameOver(true)
        setMessage(`Game Over! The word was: ${currentWord.word}`)
      }, 0)
      return () => clearTimeout(id)
    }
  }, [wrongGuesses, currentWord.word])

  const handleGuess = useCallback((letter) => {
    if (gameOver || isWordComplete || guessedLetters.has(letter)) return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (!wordLetters.has(letter)) {
      setWrongGuesses((prevWrong) => prevWrong + 1)
    }
  }, [gameOver, isWordComplete, guessedLetters, wordLetters])

  const handleNewGame = () => {
    setCurrentWordIndex(0)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setMessage('')
    setShowConfetti(false)
  }

  const displayWord = currentWord.word
    .split('')
    .map((l) => (guessedLetters.has(l) ? l : '_'))
    .join(' ')

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Manju-al
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--label-secondary)' }}
        >
          Guess the manju-related words!
        </p>
      </div>

      {/* Score and Lives */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="p-4 rounded-lg text-center font-semibold"
          style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>Words Guessed</p>
          <p className="text-2xl">{score}/{MANJU_WORDS.length}</p>
        </div>
        <div
          className="p-4 rounded-lg text-center font-semibold"
          style={{ backgroundColor: 'var(--fill-tertiary)', color: 'var(--label-primary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>Wrong Guesses</p>
          <p className="text-2xl">{wrongGuesses}/{MAX_WRONG}</p>
        </div>
      </div>

      {/* Hint */}
      {!gameOver && (
        <div
          className="p-4 rounded-lg mb-6 text-center"
          style={{ backgroundColor: 'var(--fill-secondary)', color: 'var(--label-primary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>Hint:</p>
          <p className="font-semibold">{currentWord.hint}</p>
        </div>
      )}

      {/* Word Display */}
      <div
        className="p-6 rounded-lg mb-6 text-center font-mono text-4xl font-bold tracking-widest"
        style={{ backgroundColor: 'var(--fill-secondary)', color: 'var(--label-primary)' }}
      >
        {displayWord}
      </div>

      {/* Alphabet Buttons */}
      {!gameOver && (
        <div className="grid grid-cols-7 gap-2 mb-6">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.has(letter)
            const isCorrect = wordLetters.has(letter)
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed || gameOver || isWordComplete}
                className="py-2 rounded font-semibold text-sm transition-all disabled:opacity-50"
                style={{
                  backgroundColor: isGuessed
                    ? isCorrect
                      ? '#34c759'
                      : '#ff3b30'
                    : 'var(--fill-tertiary)',
                  color: isGuessed ? 'white' : 'var(--label-primary)',
                }}
              >
                {letter}
              </button>
            )
          })}
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="text-center mb-6">
          <p
            className="text-2xl font-bold mb-4"
            style={{ color: won ? '#34c759' : '#ff3b30' }}
          >
            {won ? '🎉 You Won!' : '😢 Game Over!'}
          </p>
          {!won && (
            <p className="mb-4" style={{ color: 'var(--label-primary)' }}>
              You guessed {score} out of {MANJU_WORDS.length} words.
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      {gameOver && (
        <button
          onClick={handleNewGame}
          className="w-full px-6 py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Play Again
        </button>
      )}

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
