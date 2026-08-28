/**
 * @file GameBoard.jsx
 * @description Main game board for the Matchy Match game.
 * Manages tile selection, category matching, lives, and game state (playing/won/lost).
 * Supports normal and hard modes with different lives counts.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.puzzle - Puzzle data containing categories and words
 * @param {Function} props.onNewGame - Callback to start a new game
 * @returns {React.ReactElement} Game board with tiles, controls, and game state display
 * 
 * @state {string} mode - Game difficulty mode ('normal' or 'hard')
 * @state {boolean} hasStarted - Whether the game has started
 * @state {Array} tiles - Array of tile objects with word and categoryId
 * @state {Array} selected - Currently selected tile words (max 4)
 * @state {Array} revealed - Words that have been correctly matched
 * @state {number} lives - Remaining lives
 * @state {string|null} toast - Toast message to display or null
 * @state {boolean} isShaking - Whether grid is shaking (wrong guess animation)
 * @state {string} gameState - Current game state ('playing', 'won', or 'lost')
 * @state {Array} guessedCategories - Categories that have been correctly guessed
 * @state {number} guessCount - Total number of guesses made
 */

import { useState, useCallback, useRef } from "react";
import { clsx } from "clsx";
import Tile from "./Tile";
import RevealedCategory from "./RevealedCategory";
import LivesDisplay from "./LivesDisplay";
import ModeToggle from "./ModeToggle";
import Toast from "./Toast";
import Confetti from "./Confetti";

const MAX_SELECTED = 4;
const LIVES_BY_MODE = { normal: 5, hard: 3 };

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameBoard({ puzzle, onNewGame }) {
  const allWords = puzzle.categories.flatMap((c) =>
    c.words.map((w) => ({ word: w, categoryId: c.id }))
  );

  const [mode, setMode] = useState("normal");
  const [hasStarted, setHasStarted] = useState(false);
  const [tiles, setTiles] = useState(() => shuffleArray(allWords));
  const [selected, setSelected] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [lives, setLives] = useState(LIVES_BY_MODE["normal"]);
  const [toast, setToast] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [gameState, setGameState] = useState("playing");
  const [guessedCategories, setGuessedCategories] = useState([]);
  const [guessCount, setGuessCount] = useState(0);
  const gridRef = useRef(null);

  const isWordRevealed = (word) => revealed.includes(word);
  const isWordSelected = (word) => selected.includes(word);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const handleModeChange = (newMode) => {
    if (hasStarted) return;
    setMode(newMode);
    setLives(LIVES_BY_MODE[newMode]);
    setTiles(shuffleArray(allWords));
    setSelected([]);
    setRevealed([]);
    setGuessedCategories([]);
    setGuessCount(0);
    setGameState("playing");
  };

  const handleTileClick = (word) => {
    if (gameState !== "playing") return;
    if (isWordRevealed(word)) return;
    if (isWordSelected(word)) {
      setSelected((prev) => prev.filter((w) => w !== word));
    } else {
      if (selected.length >= MAX_SELECTED) return;
      setSelected((prev) => [...prev, word]);
    }
  };

  const handleShuffle = () => {
    const unrevealed = tiles.filter((t) => !isWordRevealed(t.word));
    const shuffled = shuffleArray(unrevealed);
    setTiles((prev) => {
      const revealedTiles = prev.filter((t) => isWordRevealed(t.word));
      return [...revealedTiles, ...shuffled];
    });
  };

  const handleDeselectAll = () => setSelected([]);

  const handleSubmit = () => {
    if (selected.length !== MAX_SELECTED) return;
    if (gameState !== "playing") return;

    if (!hasStarted) setHasStarted(true);
    setGuessCount((n) => n + 1);

    const selectedCategoryIds = selected.map((word) => {
      const tile = allWords.find((t) => t.word === word);
      return tile?.categoryId;
    });

    const allSame = selectedCategoryIds.every((id) => id === selectedCategoryIds[0]);

    if (allSame) {
      const matchedCategory = puzzle.categories.find(
        (c) => c.id === selectedCategoryIds[0]
      );
      setRevealed((prev) => [...prev, ...selected]);
      setSelected([]);
      const newGuessed = [...guessedCategories, matchedCategory];
      setGuessedCategories(newGuessed);
      if (newGuessed.length === puzzle.categories.length) {
        setTimeout(() => setGameState("won"), 400);
      }
    } else {
      const oneAway = selectedCategoryIds.some(
        (id) => selectedCategoryIds.filter((x) => x === id).length === 3
      );

      triggerShake();
      const newLives = lives - 1;
      setLives(newLives);
      setSelected([]);

      if (oneAway && mode === "normal") {
        showToast("One away — so close!");
      } else {
        showToast("Not quite. Try again!");
      }

      if (newLives <= 0) {
        setTimeout(() => {
          const remaining = puzzle.categories.filter(
            (c) => !guessedCategories.find((g) => g.id === c.id)
          );
          setGuessedCategories((prev) => [...prev, ...remaining]);
          setRevealed(allWords.map((t) => t.word));
          setGameState("lost");
        }, 600);
      }
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const unrevealed = tiles.filter((t) => !isWordRevealed(t.word));

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Controls row */}
      <div className="flex flex-col items-center gap-3 w-full">
        <p
          className="text-sm font-medium text-center"
          style={{ color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}
        >
          Group the words into five matching sets
        </p>
        <ModeToggle mode={mode} onChange={handleModeChange} disabled={hasStarted} />
      </div>

      {/* Board */}
      <div className="w-full flex flex-col gap-2">
        {guessedCategories.map((cat) => (
          <RevealedCategory key={cat.id} category={cat} />
        ))}

        {unrevealed.length > 0 && (
          <div
            ref={gridRef}
            className={clsx(
              "grid gap-2 w-full",
              "grid-cols-4 sm:grid-cols-5",
              isShaking && "shake"
            )}
          >
            {unrevealed.map(({ word }) => (
              <Tile
                key={word}
                word={word}
                isSelected={isWordSelected(word)}
                isRevealed={false}
                onClick={() => handleTileClick(word)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      {gameState === "playing" && (
        <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex items-center gap-6">
          <LivesDisplay lives={lives} maxLives={LIVES_BY_MODE[mode]} />
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: "var(--label-tertiary)", letterSpacing: "0.04em" }}
            >
              {guessCount === 1 ? "1 guess" : `${guessCount} guesses`}
            </span>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {guessCount}
            </div>
          </div>
        </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <button onClick={handleShuffle} className="btn-outline">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
              Shuffle
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={selected.length === 0}
              className="btn-outline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Deselect
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.length !== MAX_SELECTED}
              className="btn-primary"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <div
          className="spring-pop flex flex-col items-center gap-6 mt-2 p-8 rounded-3xl w-full"
          style={{
            background: "var(--bg-surface)",
            boxShadow: "var(--shadow-xl)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Confetti count={70} />

          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(145deg, #34c759, #30d158)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(52,199,89,0.35)",
              position: "relative",
              zIndex: 1,
            }}
          >
            🎉
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1.5" style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--label-primary)",
              }}
            >
              {mode === "hard" ? "Hard mode conquered!" : "You nailed it!"}
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--label-tertiary)",
                letterSpacing: "-0.01em",
              }}
            >
              Solved with{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {lives} {lives === 1 ? "life" : "lives"}
              </span>{" "}
              remaining in{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {guessCount} {guessCount === 1 ? "guess" : "guesses"}
              </span>
            </p>
          </div>

          <button onClick={onNewGame} className="btn-primary" style={{ position: "relative", zIndex: 1 }}>
            Play Again
          </button>
        </div>
      )}

      {/* Lose state */}
      {gameState === "lost" && (
        <div
          className="spring-pop flex flex-col items-center gap-6 mt-2 p-8 rounded-3xl w-full"
          style={{
            background: "var(--bg-surface)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(145deg, #ff9f0a, #ff6b00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(255,159,10,0.35)",
            }}
          >
            😔
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1.5">
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--label-primary)",
              }}
            >
              So close!
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--label-tertiary)",
                letterSpacing: "-0.01em",
              }}
            >
              The answers are revealed above. You made{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {guessCount} {guessCount === 1 ? "guess" : "guesses"}
              </span>.
            </p>
          </div>

          <button onClick={onNewGame} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
