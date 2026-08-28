/**
 * @file BarrysBlitz.jsx
 * @description Barry's Blitz - A fast-paced word matching game where players race against time.
 * Players match words to their correct categories within 60 seconds.
 * Named after the famous speedster, this game is all about speed!
 * 
 * @component
 * @returns {React.ReactElement} Game interface with menu, playing, and game over states
 * 
 * @state {string} gameState - Current game state ('menu', 'playing', or 'gameOver')
 * @state {Object|null} currentPuzzle - Current puzzle data or null
 * @state {number} timeLeft - Seconds remaining in the game
 * @state {number} score - Current score (points per correct match)
 * @state {Array<string>} matchedPairs - Words that have been correctly matched
 * @state {string|null} selectedWord - Currently selected word or null
 * @state {number|null} selectedCategory - Currently selected category index or null
 * @state {string} feedback - Feedback message for user actions
 * @state {Array} allWords - All words in current puzzle with category indices
 */

import React, { useState, useEffect } from 'react';
import '../styles/BarrysBlitz.css';

const GAME_DURATION = 60; // seconds
const POINTS_PER_MATCH = 10;

const BLITZ_PUZZLES = [
  {
    id: 1,
    title: "Fruits & Veggies",
    categories: [
      { name: "Fruits", words: ["APPLE", "BANANA", "ORANGE", "GRAPE"] },
      { name: "Vegetables", words: ["CARROT", "BROCCOLI", "SPINACH", "TOMATO"] }
    ]
  },
  {
    id: 2,
    title: "Animals",
    categories: [
      { name: "Mammals", words: ["DOG", "CAT", "ELEPHANT", "WHALE"] },
      { name: "Birds", words: ["EAGLE", "PENGUIN", "PARROT", "OSTRICH"] }
    ]
  },
  {
    id: 3,
    title: "Colors",
    categories: [
      { name: "Warm Colors", words: ["RED", "ORANGE", "YELLOW", "PINK"] },
      { name: "Cool Colors", words: ["BLUE", "GREEN", "PURPLE", "CYAN"] }
    ]
  },
  {
    id: 4,
    title: "Sports",
    categories: [
      { name: "Ball Sports", words: ["SOCCER", "BASKETBALL", "TENNIS", "BASEBALL"] },
      { name: "Winter Sports", words: ["SKIING", "SKATING", "SNOWBOARDING", "CURLING"] }
    ]
  },
  {
    id: 5,
    title: "Planets",
    categories: [
      { name: "Rocky Planets", words: ["MERCURY", "VENUS", "EARTH", "MARS"] },
      { name: "Gas Giants", words: ["JUPITER", "SATURN", "URANUS", "NEPTUNE"] }
    ]
  }
];

export default function BarrysBlitz() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [allWords, setAllWords] = useState([]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    const puzzle = BLITZ_PUZZLES[Math.floor(Math.random() * BLITZ_PUZZLES.length)];
    setCurrentPuzzle(puzzle);
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedCategory(null);
    setFeedback('');

    // Shuffle all words
    const words = puzzle.categories.flatMap((cat, catIdx) =>
      cat.words.map(word => ({ word, categoryIdx: catIdx }))
    );
    setAllWords(words.sort(() => Math.random() - 0.5));
  };

  const handleWordClick = (word) => {
    if (matchedPairs.includes(word)) return;
    setSelectedWord(selectedWord === word ? null : word);
    setFeedback('');
  };

  const handleCategoryClick = (categoryIdx) => {
    if (selectedCategory === categoryIdx) {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory(categoryIdx);
    setFeedback('');
  };

  const handleMatch = () => {
    if (selectedWord === null || selectedCategory === null) {
      setFeedback('Select a word and category!');
      return;
    }

    const wordObj = allWords.find(w => w.word === selectedWord);
    if (!wordObj) return;

    if (wordObj.categoryIdx === selectedCategory) {
      // Correct match!
      setMatchedPairs([...matchedPairs, selectedWord]);
      setScore(score + POINTS_PER_MATCH);
      setFeedback('✓ Correct!');
      setSelectedWord(null);
      setSelectedCategory(null);

      // Check if all words matched
      if (matchedPairs.length === currentPuzzle.categories.length * 4 - 1) {
        setGameState('gameOver');
      }
    } else {
      // Wrong match
      setFeedback('✗ Wrong category!');
      setSelectedWord(null);
      setSelectedCategory(null);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentPuzzle(null);
    setScore(0);
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedCategory(null);
    setFeedback('');
  };

  if (gameState === 'menu') {
    return (
      <div className="barrys-blitz-container menu">
        <div className="menu-content">
          <h2 className="title">⚡ Barry's Blitz ⚡</h2>
          <p className="subtitle">Race against time to match words to categories!</p>
          <p className="description">
            Named after the fastest speedster around, Barry's Blitz is a high-speed word matching game.
            You have {GAME_DURATION} seconds to match as many words as possible to their categories.
          </p>
          <button className="btn btn-primary" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) return null;

  const remainingWords = allWords.filter(w => !matchedPairs.includes(w.word));
  const totalMatches = currentPuzzle.categories.length * 4;
  const progress = matchedPairs.length;

  return (
    <div className="barrys-blitz-container playing">
      <div className="game-header">
        <div className="game-title">
          <h2>⚡ {currentPuzzle.title}</h2>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="label">Time:</span>
            <span className={`value ${timeLeft <= 10 ? 'warning' : ''}`}>{timeLeft}s</span>
          </div>
          <div className="stat">
            <span className="label">Score:</span>
            <span className="value">{score}</span>
          </div>
          <div className="stat">
            <span className="label">Progress:</span>
            <span className="value">{progress}/{totalMatches}</span>
          </div>
        </div>
      </div>

      <div className="game-board">
        <div className="words-section">
          <h3>Words</h3>
          <div className="words-grid">
            {remainingWords.map(({ word }) => (
              <button
                key={word}
                className={`word-tile ${selectedWord === word ? 'selected' : ''}`}
                onClick={() => handleWordClick(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="categories-section">
          <h3>Categories</h3>
          <div className="categories-list">
            {currentPuzzle.categories.map((category, idx) => (
              <button
                key={idx}
                className={`category-tile ${selectedCategory === idx ? 'selected' : ''}`}
                onClick={() => handleCategoryClick(idx)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="game-controls">
        {feedback && <div className={`feedback ${feedback.includes('✓') ? 'success' : 'error'}`}>{feedback}</div>}
        <button className="btn btn-primary" onClick={handleMatch}>
          Match
        </button>
        <button className="btn btn-secondary" onClick={resetGame}>
          Quit
        </button>
      </div>
    </div>
  );
}
