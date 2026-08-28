/**
 * @file NumberCrunchBoard.jsx
 * @description Number Crunch - A Countdown-style puzzle where players combine 6 numbers using +−×÷ to reach a target.
 * Features dynamic puzzle generation, step tracking, and solution display.
 * 
 * @component
 * @returns {React.ReactElement} Number crunch game with tiles and operators
 * 
 * @state {Array} slots - Array of number slots with value, originalIndex, used, isResult
 * @state {number|null} firstPick - Index of first selected number or null
 * @state {string|null} selectedOp - Currently selected operator (+, −, ×, ÷) or null
 * @state {Array} steps - Array of completed calculation steps
 * @state {string} gameState - Current game state ('playing' or 'won')
 * @state {string|null} toast - Toast message or null
 */

import { useState, useCallback } from "react";
import { clsx } from "clsx";
import Toast from "../Toast";

// ── Puzzle generation ────────────────────────────────────────────────────────

/**
 * Generate a puzzle: pick 6 numbers from the classic Countdown pool,
 * then find a target (100–999) that is reachable in ≤4 operations.
 * Returns { numbers, target }.
 */
function generatePuzzle() {
  const SMALL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
  const LARGE = [25, 50, 75, 100];

  // Pick 1–2 large numbers, rest small
  const largeCount = Math.random() < 0.5 ? 1 : 2;
  const large = shuffle([...LARGE]).slice(0, largeCount);
  const small = shuffle([...SMALL]).slice(0, 6 - largeCount);
  const numbers = shuffle([...large, ...small]);

  // Find a reachable target between 100 and 999
  const reachable = getAllReachable(numbers);
  const candidates = reachable.filter((n) => n >= 100 && n <= 999);
  if (candidates.length === 0) return generatePuzzle(); // retry (rare)

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  return { numbers, target };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Return all integers reachable by combining any subset of `nums` with +−×÷ */
function getAllReachable(nums) {
  const results = new Set();
  function search(available) {
    available.forEach((n) => results.add(n));
    for (let i = 0; i < available.length; i++) {
      for (let j = 0; j < available.length; j++) {
        if (i === j) continue;
        const a = available[i];
        const b = available[j];
        const rest = available.filter((_, k) => k !== i && k !== j);
        const ops = [a + b, a - b, a * b];
        if (b !== 0 && a % b === 0) ops.push(a / b);
        ops.forEach((val) => {
          if (val > 0) search([...rest, val]);
        });
      }
    }
  }
  search(nums);
  return [...results];
}

// ── Operator button ──────────────────────────────────────────────────────────

function OpButton({ op, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx("op-btn", active && "op-btn--active")}
      style={
        active
          ? {
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 2px 10px rgba(0,122,255,0.4)",
              border: "1.5px solid var(--accent)",
            }
          : {
              background: "var(--bg-surface)",
              color: "var(--label-secondary)",
              border: "0.5px solid rgba(0,0,0,0.10)",
              boxShadow: "var(--shadow-sm)",
            }
      }
    >
      {op}
    </button>
  );
}

// ── Number tile ──────────────────────────────────────────────────────────────

function NumberTile({ value, state, onClick }) {
  // state: 'idle' | 'selected' | 'used' | 'result'
  const isUsed = state === "used";
  const isSelected = state === "selected";
  const isResult = state === "result";

  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className="tile-transition relative flex items-center justify-center rounded-2xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      style={{
        height: 64,
        width: "100%",
        fontSize: "1.25rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        cursor: isUsed ? "default" : "pointer",
        opacity: isUsed ? 0.22 : 1,
        ...(isResult
          ? {
              background: "linear-gradient(145deg, #34c759, #30d158)",
              color: "#fff",
              border: "1.5px solid #28a745",
              boxShadow: "0 4px 16px rgba(52,199,89,0.35)",
            }
          : isSelected
          ? {
              background: "var(--accent-light)",
              border: "1.5px solid var(--accent)",
              color: "var(--accent)",
              boxShadow: "0 0 0 3px rgba(0,122,255,0.12)",
              transform: "scale(0.96)",
            }
          : {
              background: "var(--bg-surface)",
              border: "0.5px solid rgba(0,0,0,0.08)",
              color: "var(--label-secondary)",
              boxShadow: "var(--shadow-sm)",
            }),
      }}
    >
      {value}
    </button>
  );
}

// ── Main board ───────────────────────────────────────────────────────────────

const OPS = ["+", "−", "×", "÷"];

export default function NumberCrunchBoard() {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle());
  const [gameKey, setGameKey] = useState(0);

  return <Game key={gameKey} puzzle={puzzle} onNewGame={() => {
    setPuzzle(generatePuzzle());
    setGameKey((k) => k + 1);
  }} />;
}

function Game({ puzzle, onNewGame }) {
  const { numbers, target } = puzzle;

  // Each slot: { value, originalIndex, used }
  const [slots, setSlots] = useState(() =>
    numbers.map((v, i) => ({ value: v, originalIndex: i, used: false }))
  );
  const [selectedOp, setSelectedOp] = useState(null);
  const [firstPick, setFirstPick] = useState(null); // index into slots
  const [toast, setToast] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won'
  const [shaking, setShaking] = useState(false);
  const [steps, setSteps] = useState([]); // history of { expr, result }

  const showToast = useCallback((msg) => setToast(msg), []);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleOpSelect = (op) => {
    if (gameState !== "playing") return;
    setSelectedOp((prev) => (prev === op ? null : op));
    setFirstPick(null);
  };

  const handleTileClick = (idx) => {
    if (gameState !== "playing") return;
    const slot = slots[idx];
    if (slot.used) return;

    // No operator chosen yet — just highlight as first pick
    if (!selectedOp) {
      setFirstPick((prev) => (prev === idx ? null : idx));
      return;
    }

    // Operator chosen, no first pick yet
    if (firstPick === null) {
      setFirstPick(idx);
      return;
    }

    // Same tile clicked again → deselect
    if (firstPick === idx) {
      setFirstPick(null);
      return;
    }

    // We have both operands — compute
    const a = slots[firstPick].value;
    const b = slot.value;
    let result;

    if (selectedOp === "+") result = a + b;
    else if (selectedOp === "−") result = a - b;
    else if (selectedOp === "×") result = a * b;
    else if (selectedOp === "÷") {
      if (b === 0 || a % b !== 0) {
        showToast("Division must be exact and non-zero");
        triggerShake();
        setFirstPick(null);
        return;
      }
      result = a / b;
    }

    if (result <= 0) {
      showToast("Result must be positive");
      triggerShake();
      setFirstPick(null);
      return;
    }

    const opSymbol = selectedOp;
    const expr = `${a} ${opSymbol} ${b} = ${result}`;

    // Mark both tiles used, add a new result tile
    const newSlots = slots.map((s, i) =>
      i === firstPick || i === idx ? { ...s, used: true } : s
    );
    newSlots.push({ value: result, originalIndex: -1, used: false, isResult: true });

    setSlots(newSlots);
    setSteps((prev) => [...prev, { expr, result, usedIndices: [firstPick, idx] }]);
    setFirstPick(null);
    setSelectedOp(null);

    if (result === target) {
      setTimeout(() => setGameState("won"), 200);
    }
  };

  const handleUndo = () => {
    if (steps.length === 0) return;
    const lastStep = steps[steps.length - 1];

    // The last step always appended exactly one result tile to the end of
    // `slots`, so it's safe to drop the final slot and un-use precisely
    // the two operand indices that step recorded.
    const restored = slots
      .slice(0, -1)
      .map((s, i) =>
        lastStep.usedIndices.includes(i) ? { ...s, used: false } : s
      );

    setSlots(restored);
    setSteps((prev) => prev.slice(0, -1));
    setFirstPick(null);
    setSelectedOp(null);
  };

  const handleReset = () => {
    setSlots(numbers.map((v, i) => ({ value: v, originalIndex: i, used: false })));
    setSteps([]);
    setFirstPick(null);
    setSelectedOp(null);
  };

  const closestResult = steps.length > 0
    ? steps[steps.length - 1].result
    : null;
  const diff = closestResult !== null ? Math.abs(closestResult - target) : null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Target */}
      <div className="flex flex-col items-center gap-1">
        <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--label-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Target
        </p>
        <div
          className={clsx("flex items-center justify-center rounded-3xl", shaking && "wordle-shake")}
          style={{
            width: 140,
            height: 80,
            background: "linear-gradient(145deg, #007aff, #5856d6)",
            boxShadow: "0 8px 28px rgba(0,122,255,0.35)",
            fontSize: "2.75rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#fff",
          }}
        >
          {target}
        </div>
      </div>

      {/* Steps log */}
      {steps.length > 0 && (
        <div
          className="w-full rounded-2xl px-4 py-3 flex flex-col gap-1.5"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}
        >
          {steps.map((s, i) => (
            <p
              key={i}
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: s.result === target ? "#34c759" : "var(--label-secondary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.expr}
            </p>
          ))}
        </div>
      )}

      {/* Number tiles */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {slots.map((slot, idx) => (
          <NumberTile
            key={idx}
            value={slot.value}
            state={
              slot.used
                ? "used"
                : firstPick === idx
                ? "selected"
                : slot.isResult
                ? "result"
                : "idle"
            }
            onClick={() => handleTileClick(idx)}
          />
        ))}
      </div>

      {/* Operator row */}
      {gameState === "playing" && (
        <div className="flex gap-2 justify-center w-full">
          {OPS.map((op) => (
            <OpButton
              key={op}
              op={op}
              active={selectedOp === op}
              onClick={() => handleOpSelect(op)}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      {gameState === "playing" && (
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleUndo}
            disabled={steps.length === 0}
            className="btn-outline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 14 4 9 9 4"/>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
            Undo
          </button>
          <button onClick={handleReset} className="btn-outline">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
            </svg>
            Reset
          </button>
        </div>
      )}

      {/* Hint: how close */}
      {gameState === "playing" && diff !== null && diff > 0 && (
        <p style={{ fontSize: "0.8rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
          Last result is{" "}
          <span style={{ fontWeight: 600, color: diff <= 5 ? "#ff9f0a" : "var(--label-secondary)" }}>
            {diff} away
          </span>{" "}
          from the target
        </p>
      )}

      {/* Instructions */}
      {gameState === "playing" && steps.length === 0 && (
        <p
          className="text-center"
          style={{ fontSize: "0.8rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em", maxWidth: 300 }}
        >
          Pick an operator, then tap two numbers to combine them. Reach the target using as few steps as possible!
        </p>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <div
          className="spring-pop flex flex-col items-center gap-6 mt-2 p-8 rounded-3xl w-full"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)" }}
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
            🎯
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h2
              style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}
            >
              {steps.length === 1 ? "One-shot!" : steps.length <= 3 ? "Nailed it!" : "You got there!"}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}>
              Reached{" "}
              <span style={{ color: "var(--label-primary)", fontWeight: 700 }}>{target}</span>
              {" "}in{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </span>
            </p>
            {/* Show the solution steps */}
            <div className="flex flex-col items-center gap-0.5 mt-2">
              {steps.map((s, i) => (
                <p key={i} style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--label-secondary)", fontVariantNumeric: "tabular-nums" }}>
                  {s.expr}
                </p>
              ))}
            </div>
          </div>
          <button onClick={onNewGame} className="btn-primary">
            New Puzzle
          </button>
        </div>
      )}
    </div>
  );
}
