import { useState, useRef, useCallback } from "react";
import { clsx } from "clsx";
import Toast from "../Toast";
import { WORD_CHAIN_PUZZLES, VALID_WORDS } from "../../data/wordChainPuzzles";

// ── Helpers ──────────────────────────────────────────────────────────────────
function pickPuzzle() {
  return WORD_CHAIN_PUZZLES[Math.floor(Math.random() * WORD_CHAIN_PUZZLES.length)];
}

// ── Letter tile (for the current editable word) ───────────────────────────────

function LetterTile({ letter, isChanged, inputRef, onChange, onKeyDown, disabled }) {
  return (
    <input
      ref={inputRef}
      type="text"
      maxLength={1}
      value={letter}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={clsx(
        "tile-transition text-center uppercase font-bold select-none focus:outline-none rounded-xl",
        isChanged && "wordle-pop"
      )}
      style={{
        width: 56,
        height: 64,
        fontSize: "1.6rem",
        letterSpacing: "-0.02em",
        caretColor: "transparent",
        cursor: disabled ? "default" : "pointer",
        border: isChanged
          ? "2px solid var(--accent)"
          : "1.5px solid var(--separator-opaque)",
        background: isChanged ? "var(--accent-light)" : "var(--bg-surface)",
        color: isChanged ? "var(--accent)" : "var(--label-primary)",
        boxShadow: isChanged
          ? "0 0 0 3px rgba(0,122,255,0.12)"
          : "var(--shadow-sm)",
      }}
    />
  );
}

// ── A completed step row ──────────────────────────────────────────────────────

function StepRow({ word, prevWord, isStart, isEnd }) {
  return (
    <div className="flex gap-2 items-center justify-center bounce-in">
      {word.split("").map((letter, i) => {
        const changed = !isStart && prevWord && letter !== prevWord[i];
        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-xl font-bold"
            style={{
              width: 48,
              height: 52,
              fontSize: "1.35rem",
              letterSpacing: "-0.02em",
              background: isEnd
                ? "linear-gradient(145deg, #34c759, #30d158)"
                : changed
                ? "var(--accent)"
                : "var(--bg-surface)",
              color: isEnd || changed ? "#fff" : "var(--label-secondary)",
              border: isEnd || changed
                ? "none"
                : "1px solid var(--separator-opaque)",
              boxShadow: isEnd
                ? "0 4px 16px rgba(52,199,89,0.3)"
                : changed
                ? "0 2px 8px rgba(0,122,255,0.3)"
                : "var(--shadow-xs)",
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function WordChainBoard() {
  const [puzzle, setPuzzle] = useState(() => pickPuzzle());
  const [gameKey, setGameKey] = useState(0);

  return (
    <Game
      key={gameKey}
      puzzle={puzzle}
      onNewGame={() => {
        setPuzzle(pickPuzzle());
        setGameKey((k) => k + 1);
      }}
    />
  );
}

function Game({ puzzle, onNewGame }) {
  const { start, end, par, solution } = puzzle;
  const wordLen = start.length;

  // chain: array of words the player has confirmed (starts with `start`)
  const [chain, setChain] = useState([start]);
  // current editable word (array of letters)
  const [current, setCurrent] = useState(start.split(""));
  const [toast, setToast] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won' | 'gave-up'

  const inputRefs = useRef([]);

  const showToast = useCallback((msg) => setToast(msg), []);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const lastConfirmed = chain[chain.length - 1];

  // Which letters differ from the last confirmed word
  const changedIndices = current
    .map((l, i) => (l !== lastConfirmed[i] ? i : -1))
    .filter((i) => i !== -1);

  const handleLetterChange = (idx, value) => {
    if (gameState !== "playing") return;
    const char = value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!char) return;
    const next = [...current];
    next[idx] = char;
    setCurrent(next);
    // Auto-advance focus to next tile
    if (idx < wordLen - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (gameState !== "playing") return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...current];
      next[idx] = lastConfirmed[idx]; // reset this tile to confirmed letter
      setCurrent(next);
      if (idx > 0) inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < wordLen - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // `gameState` only flips to "won" after a short delay (for the win
    // animation), so also check the chain directly — otherwise a player
    // can submit another word in that window and inflate the step count.
    if (gameState !== "playing" || chain[chain.length - 1] === end) return;
    const word = current.join("");

    if (changedIndices.length === 0) {
      showToast("Change at least one letter!");
      triggerShake();
      return;
    }
    if (changedIndices.length > 1) {
      showToast("Change exactly one letter at a time");
      triggerShake();
      return;
    }
    if (!VALID_WORDS.has(word)) {
      showToast(`"${word}" isn't a valid word`);
      triggerShake();
      return;
    }
    if (chain.includes(word)) {
      showToast("You've already used that word");
      triggerShake();
      return;
    }

    const newChain = [...chain, word];
    setChain(newChain);
    setCurrent(word.split(""));

    if (word === end) {
      setTimeout(() => setGameState("won"), 250);
    }
  };

  const handleUndo = () => {
    if (chain.length <= 1) return;
    const newChain = chain.slice(0, -1);
    setChain(newChain);
    setCurrent(newChain[newChain.length - 1].split(""));
  };

  const handleGiveUp = () => {
    setGameState("gave-up");
  };

  const steps = chain.length - 1; // number of moves made
  const atPar = gameState === "won" && steps === par;
  const underPar = gameState === "won" && steps < par;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header: start → end + par */}
      <div
        className="w-full flex items-center justify-between rounded-2xl px-5 py-3"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--label-tertiary)" }}>
            Start
          </span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
            {start}
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--label-tertiary)",
              letterSpacing: "0.04em",
            }}
          >
            ✦ par {par}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--label-quaternary)" }}>
            {steps} step{steps !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--label-tertiary)" }}>
            End
          </span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--accent)" }}>
            {end}
          </span>
        </div>
      </div>

      {/* Chain so far */}
      <div className="flex flex-col gap-2 w-full items-center">
        {chain.map((word, i) => (
          <StepRow
            key={i}
            word={word}
            prevWord={i > 0 ? chain[i - 1] : null}
            isStart={i === 0}
            isEnd={gameState === "won" && i === chain.length - 1}
          />
        ))}
      </div>

      {/* Editable current word */}
      {gameState === "playing" && (
        <div className={clsx("flex gap-2 items-center justify-center", shaking && "wordle-shake")}>
          {current.map((letter, i) => (
            <LetterTile
              key={i}
              letter={letter}
              isChanged={changedIndices.includes(i)}
              inputRef={(el) => (inputRefs.current[i] = el)}
              onChange={(e) => handleLetterChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={chain[chain.length - 1] === end}
            />
          ))}
        </div>
      )}

      {/* Target reminder */}
      {gameState === "playing" && (
        <p style={{ fontSize: "0.78rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
          Change <strong style={{ color: "var(--label-secondary)" }}>one letter</strong> to reach{" "}
          <strong style={{ color: "var(--accent)" }}>{end}</strong>
        </p>
      )}

      {/* Action buttons */}
      {gameState === "playing" && (
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleSubmit}
            disabled={changedIndices.length === 0}
            className="btn-primary"
            style={{ minWidth: 100 }}
          >
            Submit
          </button>
          <button
            onClick={handleUndo}
            disabled={chain.length <= 1}
            className="btn-outline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 14 4 9 9 4"/>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
            Undo
          </button>
          <button onClick={handleGiveUp} className="btn-outline" style={{ color: "var(--label-tertiary)" }}>
            Give Up
          </button>
        </div>
      )}

      {/* Instructions */}
      {gameState === "playing" && steps === 0 && (
        <p
          className="text-center"
          style={{ fontSize: "0.78rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em", maxWidth: 280 }}
        >
          Click a letter tile and type a new letter to change it. Each step must form a valid word. Reach the end word in as few steps as possible!
        </p>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <div
          className="spring-pop flex flex-col items-center gap-5 mt-2 p-7 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: underPar
                ? "linear-gradient(145deg, #ff9f0a, #ff6b00)"
                : atPar
                ? "linear-gradient(145deg, #34c759, #30d158)"
                : "linear-gradient(145deg, #007aff, #5856d6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: underPar
                ? "0 8px 24px rgba(255,159,10,0.35)"
                : atPar
                ? "0 8px 24px rgba(52,199,89,0.35)"
                : "0 8px 24px rgba(0,122,255,0.35)",
            }}
          >
            {underPar ? "🔥" : atPar ? "🎯" : "✅"}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
              {underPar ? "Under par!" : atPar ? "Right on par!" : "You got there!"}
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              {start} → {end} in{" "}
              <span style={{ fontWeight: 700, color: "var(--label-primary)" }}>{steps}</span>{" "}
              step{steps !== 1 ? "s" : ""}{" "}
              <span style={{ color: underPar ? "#ff9f0a" : atPar ? "#34c759" : "var(--label-tertiary)" }}>
                (par {par})
              </span>
            </p>
          </div>

          <button onClick={onNewGame} className="btn-primary">
            New Puzzle
          </button>
        </div>
      )}

      {/* Give-up state */}
      {gameState === "gave-up" && (
        <div
          className="spring-pop flex flex-col items-center gap-5 mt-2 p-7 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(145deg, #8e8e93, #636366)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            🤔
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
              No worries!
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--label-tertiary)" }}>
              Here's one way to get from{" "}
              <strong style={{ color: "var(--label-primary)" }}>{start}</strong> to{" "}
              <strong style={{ color: "var(--accent)" }}>{end}</strong>:
            </p>
          </div>

          {/* Solution path */}
          <div className="flex flex-col gap-2 w-full items-center">
            {solution.map((word, i) => (
              <StepRow
                key={i}
                word={word}
                prevWord={i > 0 ? solution[i - 1] : null}
                isStart={i === 0}
                isEnd={i === solution.length - 1}
              />
            ))}
          </div>

          <button onClick={onNewGame} className="btn-primary">
            Try Another
          </button>
        </div>
      )}
    </div>
  );
}
