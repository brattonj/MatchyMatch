/**
 * @file WordleBoard.jsx
 * @description Wordle game - guess the 5-letter word in 6 tries.
 * Features keyboard input, letter state tracking (correct/present/absent), and daily puzzle rotation.
 * 
 * @component
 * @returns {React.ReactElement} Wordle game with grid, keyboard, and result display
 * 
 * @state {string} answer - The target word to guess
 * @state {Array<string>} guesses - Array of submitted guesses
 * @state {string} current - Current word being typed
 * @state {string} gameState - Current game state ('playing', 'won', or 'lost')
 * @state {string|null} toast - Toast message or null
 * @state {boolean} shakeRow - Whether current row is shaking (error animation)
 * @state {boolean} bounceRow - Whether winning row is bouncing (celebration animation)
 * @state {number} revealKey - Key to force re-render of rows for tile flip animation
 */

import { useState, useEffect, useCallback } from "react";
import WordleRow from "./WordleRow";
import WordleKeyboard from "./WordleKeyboard";
import Toast from "../Toast";
import { WORDLE_ANSWERS, ALL_VALID_WORDS } from "../../data/wordleWords";

const MAX_GUESSES = 6;

function pickAnswer() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff  = now - start;
  const day   = Math.floor(diff / (1000 * 60 * 60 * 24));
  return WORDLE_ANSWERS[day % WORDLE_ANSWERS.length];
}

export default function WordleBoard() {
  const [answer]        = useState(pickAnswer);
  const [guesses,  setGuesses]   = useState([]);
  const [current,  setCurrent]   = useState("");
  const [gameState, setGameState] = useState("playing");
  const [toast,    setToast]     = useState(null);
  const [shakeRow, setShakeRow]  = useState(false);
  const [bounceRow, setBounceRow] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const letterStates = {};
  guesses.forEach((guess) => {
    const answerArr = answer.split("");
    const guessArr  = guess.split("");
    const result    = Array(5).fill("absent");
    const remaining = [...answerArr];

    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === answerArr[i]) {
        result[i] = "correct";
        remaining[i] = null;
      }
    }
    for (let i = 0; i < 5; i++) {
      if (result[i] === "correct") continue;
      const idx = remaining.indexOf(guessArr[i]);
      if (idx !== -1) {
        result[i] = "present";
        remaining[idx] = null;
      }
    }
    guessArr.forEach((letter, i) => {
      const prev = letterStates[letter];
      const next = result[i];
      if (!prev || next === "correct" || (next === "present" && prev === "absent")) {
        letterStates[letter] = next;
      }
    });
  });

  const showToast = (msg) => setToast(msg);

  const triggerShake = () => {
    setShakeRow(true);
    setTimeout(() => setShakeRow(false), 500);
  };

  const handleKey = useCallback((key) => {
    if (gameState !== "playing") return;

    if (key === "⌫" || key === "BACKSPACE") {
      setCurrent((c) => c.slice(0, -1));
      return;
    }
    if (key === "ENTER") {
      if (current.length < 5) {
        showToast("Not enough letters");
        triggerShake();
        return;
      }
      if (!ALL_VALID_WORDS.includes(current)) {
        showToast("Not in word list");
        triggerShake();
        return;
      }

      const newGuesses = [...guesses, current];
      setGuesses(newGuesses);
      setCurrent("");
      setRevealKey((k) => k + 1);

      const flipDuration = 5 * 120 + 400;

      if (current === answer) {
        const msgs = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
        const msg  = msgs[Math.min(newGuesses.length - 1, msgs.length - 1)];
        setTimeout(() => {
          setBounceRow(true);
          showToast(msg);
          setGameState("won");
        }, flipDuration);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setTimeout(() => {
          showToast(`The word was ${answer}`);
          setGameState("lost");
        }, flipDuration);
      }
      return;
    }

    if (/^[A-Z]$/.test(key) && current.length < 5) {
      setCurrent((c) => c + key);
    }
  }, [gameState, current, guesses, answer]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "BACKSPACE") { handleKey("⌫"); return; }
      if (key === "ENTER")     { handleKey("ENTER"); return; }
      if (/^[A-Z]$/.test(key)) { handleKey(key); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const handleNewGame = () => window.location.reload();

  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) {
      return { guess: guesses[i], submitted: true, isActive: false, bounce: bounceRow && i === guesses.length - 1 };
    }
    if (i === guesses.length && gameState === "playing") {
      return { guess: current, submitted: false, isActive: true };
    }
    return { guess: "", submitted: false, isActive: false };
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Grid */}
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <WordleRow
            key={`${i}-${revealKey}`}
            guess={row.guess}
            answer={answer}
            submitted={row.submitted}
            isActive={row.isActive}
            shake={row.isActive && shakeRow}
            bounce={row.bounce}
          />
        ))}
      </div>

      {/* Keyboard */}
      {gameState === "playing" && (
        <div className="w-full pt-2">
          <WordleKeyboard onKey={handleKey} letterStates={letterStates} />
        </div>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <div
          className="spring-pop flex flex-col items-center gap-6 mt-2 p-8 rounded-3xl w-full"
          style={{
            background: "var(--bg-surface)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
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
            }}
          >
            🎉
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--label-primary)",
              }}
            >
              You got it!
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              The word was{" "}
              <span style={{ color: "var(--label-primary)", fontWeight: 700, letterSpacing: "0.06em" }}>
                {answer}
              </span>
              {" "}— solved in{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
              </span>
            </p>
          </div>
          <button onClick={handleNewGame} className="btn-primary">
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
            <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              The word was{" "}
              <span style={{ color: "var(--label-primary)", fontWeight: 700, letterSpacing: "0.06em" }}>
                {answer}
              </span>
            </p>
          </div>
          <button onClick={handleNewGame} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
