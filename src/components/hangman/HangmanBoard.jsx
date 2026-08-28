/**
 * @file HangmanBoard.jsx
 * @description Hangman word guessing game with visual gallows drawing.
 * Players guess letters to reveal a hidden word before running out of wrong guesses (max 6).
 * Features category hints and keyboard/button input.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onNewGame - Callback to start a new game
 * @returns {React.ReactElement} Hangman game with gallows, word display, and keyboard
 * 
 * @state {Object} wordData - Current word data with word, category, and hint
 * @state {Set<string>} guessed - Set of guessed letters
 * @state {number} wrongCount - Number of wrong guesses (0-6)
 * @state {string} gameState - Current game state ('playing', 'won', or 'lost')
 * @state {string|null} toast - Toast message or null
 */

import { useState, useEffect, useCallback } from "react";
import Toast from "../Toast";
import { pickWord } from "../../data/hangmanWords";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_WRONG = 6; // head, body, left arm, right arm, left leg, right leg
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ── Gallows SVG ──────────────────────────────────────────────────────────────

function GallowsSVG({ wrongCount }) {
  const stroke = "var(--label-primary)";
  const sw = 3;
  const round = { strokeLinecap: "round", strokeLinejoin: "round" };

  return (
    <svg
      viewBox="0 0 160 180"
      width="160"
      height="180"
      fill="none"
      aria-label={`Hangman figure: ${wrongCount} of ${MAX_WRONG} wrong guesses`}
    >
      {/* Gallows structure — always visible */}
      {/* Base */}
      <line x1="10" y1="170" x2="150" y2="170" stroke={stroke} strokeWidth={sw} {...round} />
      {/* Pole */}
      <line x1="40" y1="170" x2="40" y2="10"  stroke={stroke} strokeWidth={sw} {...round} />
      {/* Top beam */}
      <line x1="40" y1="10"  x2="110" y2="10" stroke={stroke} strokeWidth={sw} {...round} />
      {/* Rope */}
      <line x1="110" y1="10" x2="110" y2="35" stroke={stroke} strokeWidth={sw} {...round} />

      {/* Head */}
      {wrongCount >= 1 && (
        <circle cx="110" cy="47" r="12" stroke={stroke} strokeWidth={sw} />
      )}
      {/* Body */}
      {wrongCount >= 2 && (
        <line x1="110" y1="59" x2="110" y2="110" stroke={stroke} strokeWidth={sw} {...round} />
      )}
      {/* Left arm */}
      {wrongCount >= 3 && (
        <line x1="110" y1="70" x2="85" y2="95" stroke={stroke} strokeWidth={sw} {...round} />
      )}
      {/* Right arm */}
      {wrongCount >= 4 && (
        <line x1="110" y1="70" x2="135" y2="95" stroke={stroke} strokeWidth={sw} {...round} />
      )}
      {/* Left leg */}
      {wrongCount >= 5 && (
        <line x1="110" y1="110" x2="85" y2="140" stroke={stroke} strokeWidth={sw} {...round} />
      )}
      {/* Right leg */}
      {wrongCount >= 6 && (
        <line x1="110" y1="110" x2="135" y2="140" stroke={stroke} strokeWidth={sw} {...round} />
      )}
    </svg>
  );
}

// ── Letter key ───────────────────────────────────────────────────────────────

function LetterKey({ letter, state, onClick }) {
  // state: 'idle' | 'correct' | 'wrong'
  const isCorrect = state === "correct";
  const isWrong   = state === "wrong";
  const isUsed    = isCorrect || isWrong;

  const style = isCorrect
    ? {
        background: "rgba(52,199,89,0.15)",
        border: "1.5px solid rgba(52,199,89,0.55)",
        color: "#1a7a35",
        cursor: "default",
      }
    : isWrong
    ? {
        background: "rgba(255,59,48,0.10)",
        border: "1.5px solid rgba(255,59,48,0.40)",
        color: "rgba(192,57,43,0.55)",
        cursor: "default",
      }
    : {
        background: "var(--bg-surface)",
        border: "0.5px solid rgba(0,0,0,0.10)",
        color: "var(--label-primary)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
      };

  return (
    <button
      onClick={() => !isUsed && onClick(letter)}
      disabled={isUsed}
      aria-label={`Letter ${letter}${isCorrect ? " (correct)" : isWrong ? " (wrong)" : ""}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        userSelect: "none",
        ...style,
      }}
    >
      {letter}
    </button>
  );
}

// ── Word display ─────────────────────────────────────────────────────────────

function WordDisplay({ word, guessed, reveal }) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      aria-label="Word to guess"
    >
      {word.split("").map((letter, i) => {
        const shown = reveal || guessed.has(letter);
        const isNew = guessed.has(letter) && !reveal;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              style={{
                display: "block",
                width: 28,
                height: 32,
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                color: reveal && !guessed.has(letter)
                  ? "rgba(255,59,48,0.75)"   // missed letters shown in red on loss
                  : "var(--label-primary)",
                transition: "opacity 0.2s",
                opacity: shown ? 1 : 0,
                animation: isNew ? "bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              }}
            >
              {shown ? letter : ""}
            </span>
            {/* Underline */}
            <span
              style={{
                display: "block",
                width: 28,
                height: 2.5,
                borderRadius: 2,
                background: "var(--label-secondary)",
                opacity: 0.45,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Lives indicator ──────────────────────────────────────────────────────────

function LivesBar({ wrong, max }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: "1.1rem",
            opacity: i < max - wrong ? 1 : 0.2,
            transition: "opacity 0.3s",
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

// ── Main board ───────────────────────────────────────────────────────────────

export default function HangmanBoard() {
  const [gameKey, setGameKey] = useState(0);
  const [entry]   = useState(pickWord);

  return (
    <Game
      key={gameKey}
      entry={entry}
      onNewGame={() => setGameKey((k) => k + 1)}
    />
  );
}

function Game({ entry, onNewGame }) {
  const { word, category, hint } = entry;

  const [guessed,   setGuessed]   = useState(new Set());
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won' | 'lost'
  const [toast,     setToast]     = useState(null);

  const wrongGuesses = [...guessed].filter((l) => !word.includes(l));
  const wrongCount   = wrongGuesses.length;

  // Check win / loss after each guess
  useEffect(() => {
    if (gameState !== "playing") return;
    const allRevealed = word.split("").every((l) => guessed.has(l));
    const id = setTimeout(() => {
      if (allRevealed) {
        setGameState("won");
      } else if (wrongCount >= MAX_WRONG) {
        setGameState("lost");
      }
    }, 0);
    return () => clearTimeout(id);
  }, [guessed, word, wrongCount, gameState]);

  const handleGuess = useCallback((letter) => {
    if (gameState !== "playing" || guessed.has(letter)) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);

    if (!word.includes(letter)) {
      const remaining = MAX_WRONG - wrongCount - 1;
      if (remaining === 1) setToast("One mistake left! 😬");
      else if (remaining === 0) setToast("Out of guesses! 💀");
    }
  }, [gameState, guessed, word, wrongCount]);

  // Physical keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGuess]);

  const getLetterState = (letter) => {
    if (!guessed.has(letter)) return "idle";
    return word.includes(letter) ? "correct" : "wrong";
  };

  const correctCount = word.split("").filter((l) => guessed.has(l)).length;
  const uniqueLetters = new Set(word.split("")).size;

  // ── Win screen ───────────────────────────────────────────────────
  if (gameState === "won") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <div
          className="spring-pop flex flex-col items-center gap-6 p-8 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: "linear-gradient(145deg, #34c759, #30d158)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, boxShadow: "0 8px 24px rgba(52,199,89,0.35)",
            }}
          >
            🎉
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
              You got it!
            </h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.12em", color: "var(--accent)" }}>
              {word}
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              {category} · {wrongCount} wrong {wrongCount === 1 ? "guess" : "guesses"}
            </p>
          </div>
          <button onClick={onNewGame} className="btn-primary">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── Loss screen ──────────────────────────────────────────────────
  if (gameState === "lost") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <div
          className="spring-pop flex flex-col items-center gap-6 p-8 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: "linear-gradient(145deg, #ff453a, #ff3b30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, boxShadow: "0 8px 24px rgba(255,59,48,0.35)",
            }}
          >
            💀
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
              Hanged!
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)" }}>
              The word was
            </p>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.12em", color: "var(--label-primary)" }}>
              {word}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--label-tertiary)" }}>
              {category} · {hint}
            </p>
          </div>
          {/* Reveal the full word */}
          <WordDisplay word={word} guessed={guessed} reveal={true} />
          <button onClick={onNewGame} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Playing screen ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Category + hint */}
      <div className="w-full flex flex-col items-center gap-1">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 12px",
            borderRadius: 999,
            background: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {category}
        </span>
        <p style={{ fontSize: "0.82rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em", textAlign: "center" }}>
          {hint}
        </p>
      </div>

      {/* Gallows + lives */}
      <div
        className="w-full flex flex-col items-center gap-3 rounded-3xl py-5"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <GallowsSVG wrongCount={wrongCount} />
        <LivesBar wrong={wrongCount} max={MAX_WRONG} />
        <p style={{ fontSize: "0.72rem", color: "var(--label-tertiary)", letterSpacing: "0.03em" }}>
          {MAX_WRONG - wrongCount} {MAX_WRONG - wrongCount === 1 ? "guess" : "guesses"} remaining
        </p>
      </div>

      {/* Word blanks */}
      <div
        className="w-full flex flex-col items-center gap-3 rounded-3xl py-5 px-4"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <WordDisplay word={word} guessed={guessed} reveal={false} />
        <p style={{ fontSize: "0.72rem", color: "var(--label-tertiary)", letterSpacing: "0.03em" }}>
          {word.length} letters · {correctCount} of {uniqueLetters} unique letters found
        </p>
      </div>

      {/* Keyboard */}
      <div className="w-full flex flex-col gap-2">
        {[
          ALPHABET.slice(0, 9),
          ALPHABET.slice(9, 18),
          ALPHABET.slice(18),
        ].map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5 flex-wrap">
            {row.map((letter) => (
              <LetterKey
                key={letter}
                letter={letter}
                state={getLetterState(letter)}
                onClick={handleGuess}
              />
            ))}
          </div>
        ))}
      </div>

      <p
        className="text-center"
        style={{ fontSize: "0.75rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}
      >
        Tap a letter or use your keyboard to guess.
      </p>
    </div>
  );
}
