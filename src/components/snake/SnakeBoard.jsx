/**
 * @file SnakeBoard.jsx
 * @description Classic Snake arcade game rendered on HTML5 canvas.
 * Players control a snake to eat food and grow longer while avoiding walls and self-collision.
 * Features adjustable speed, pause/resume, and mobile D-pad controls.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.dark - Dark mode enabled state
 * @returns {React.ReactElement} Snake game with canvas, controls, and score display
 * 
 * @state {Object} gameState - Current game state (snake, direction, food, score, status)
 * @state {number} speedIdx - Selected speed index (0-2)
 * @state {number} best - Best score achieved
 * @state {Object} renderState - State to render (may be interpolated)
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const COLS = 20;
const ROWS = 20;
const CELL = 20; // px per cell (canvas is COLS*CELL × ROWS*CELL)

const DIR = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x: 1,  y:  0 },
};

const OPPOSITE = {
  UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT",
};

// Speed in ms per tick (lower = faster)
const SPEEDS = [
  { label: "Chill",  ms: 180 },
  { label: "Normal", ms: 120 },
  { label: "Fast",   ms:  70 },
];

function randomCell(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (occupied.has(`${cell.x},${cell.y}`));
  return cell;
}

function initState() {
  const head = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
  const snake = [head, { x: head.x - 1, y: head.y }, { x: head.x - 2, y: head.y }];
  return {
    snake,
    dir: DIR.RIGHT,
    dirKey: "RIGHT",
    food: randomCell(snake),
    score: 0,
    status: "idle", // 'idle' | 'playing' | 'paused' | 'won' | 'lost'
  };
}

// ── Canvas renderer ───────────────────────────────────────────────────────────

function drawGame(ctx, state, dark) {
  const W = COLS * CELL;
  const H = ROWS * CELL;

  // Background
  ctx.fillStyle = dark ? "#1c1c1e" : "#f2f2f7";
  ctx.fillRect(0, 0, W, H);

  // Grid lines (subtle)
  ctx.strokeStyle = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
  }

  const { snake, food } = state;

  // Food — pulsing apple emoji via fillText
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;
  ctx.font = `${CELL - 2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🍎", fx, fy + 1);

  // Snake body
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const t = 1 - i / snake.length; // 1 at head → 0 at tail
    const alpha = 0.45 + t * 0.55;

    const x = seg.x * CELL + 1;
    const y = seg.y * CELL + 1;
    const size = CELL - 2;
    const r = isHead ? 7 : 5;

    // Gradient fill
    const grd = ctx.createLinearGradient(x, y, x + size, y + size);
    if (isHead) {
      grd.addColorStop(0, `rgba(94,92,230,${alpha})`);
      grd.addColorStop(1, `rgba(0,122,255,${alpha})`);
    } else {
      grd.addColorStop(0, `rgba(94,92,230,${alpha * 0.85})`);
      grd.addColorStop(1, `rgba(0,122,255,${alpha * 0.85})`);
    }

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, r);
    ctx.fill();

    // Eyes on head
    if (isHead) {
      ctx.fillStyle = "#fff";
      const eyeSize = 3.5;
      const { dirKey } = state;
      let e1, e2;
      if (dirKey === "RIGHT") { e1 = { x: x+size-6, y: y+4 }; e2 = { x: x+size-6, y: y+size-7 }; }
      else if (dirKey === "LEFT") { e1 = { x: x+3, y: y+4 }; e2 = { x: x+3, y: y+size-7 }; }
      else if (dirKey === "UP")   { e1 = { x: x+4, y: y+3 }; e2 = { x: x+size-7, y: y+3 }; }
      else                        { e1 = { x: x+4, y: y+size-6 }; e2 = { x: x+size-7, y: y+size-6 }; }
      ctx.beginPath(); ctx.arc(e1.x, e1.y, eyeSize, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2.x, e2.y, eyeSize, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#1c1c1e";
      ctx.beginPath(); ctx.arc(e1.x, e1.y, 1.8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2.x, e2.y, 1.8, 0, Math.PI*2); ctx.fill();
    }
  });
}

// ── Speed picker ──────────────────────────────────────────────────────────────

function SpeedPicker({ selected, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--label-tertiary)" }}>
        Speed
      </span>
      <div className="flex gap-1.5">
        {SPEEDS.map((s, i) => {
          const active = selected === i;
          return (
            <button
              key={s.label}
              onClick={() => !disabled && onChange(i)}
              disabled={disabled}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                border: "none",
                fontSize: "0.78rem",
                fontWeight: active ? 600 : 500,
                cursor: disabled ? "not-allowed" : "pointer",
                background: active ? "var(--accent)" : "var(--fill-tertiary)",
                color: active ? "#fff" : "var(--label-secondary)",
                boxShadow: active ? "0 2px 8px rgba(0,122,255,0.3)" : "none",
                transition: "all 0.15s ease",
                opacity: disabled && !active ? 0.5 : 1,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, best }) {
  return (
    <div className="flex items-center gap-4">
      {[
        { label: "Score", value: score },
        { label: "Best",  value: best  },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl"
          style={{ background: "var(--fill-tertiary)", minWidth: 68 }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--label-primary)" }}>
            {value}
          </span>
          <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--label-tertiary)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function SnakeBoard({ dark }) {
  const canvasRef   = useRef(null);
  const tickRef     = useRef(null);
  const dirQueueRef = useRef([]); // buffer up to 2 direction changes per tick

  // renderState is the single source for the initial game state; stateRef
  // is seeded from it (rather than the other way around) so no ref is read
  // during render.
  const [renderState, setRenderState] = useState(initState);
  const stateRef = useRef(renderState);
  const [speedIdx, setSpeedIdx]       = useState(1); // Normal
  const [best, setBest]               = useState(0);

  // Touch tracking for swipe
  const touchStartRef = useRef(null);

  // ── Draw whenever renderState changes ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawGame(ctx, renderState, dark ?? false);
  }, [renderState, dark]);

  // ── Tick logic ──────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== "playing") return;

    // Apply next queued direction
    let nextDirKey = s.dirKey;
    let nextDir    = s.dir;
    while (dirQueueRef.current.length > 0) {
      const candidate = dirQueueRef.current.shift();
      if (candidate !== OPPOSITE[s.dirKey]) {
        nextDirKey = candidate;
        nextDir    = DIR[candidate];
        break;
      }
    }

    const head = s.snake[0];
    const newHead = {
      x: (head.x + nextDir.x + COLS) % COLS,
      y: (head.y + nextDir.y + ROWS) % ROWS,
    };

    // Collision with self
    const hitSelf = s.snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y);
    if (hitSelf) {
      const lost = { ...s, status: "lost" };
      stateRef.current = lost;
      setRenderState(lost);
      clearInterval(tickRef.current);
      return;
    }

    const ateFood = newHead.x === s.food.x && newHead.y === s.food.y;
    const newSnake = [newHead, ...s.snake];
    if (!ateFood) newSnake.pop();

    const newScore = ateFood ? s.score + 10 : s.score;
    const newFood  = ateFood ? randomCell(newSnake) : s.food;

    // Win condition: snake fills the board
    const won = newSnake.length === COLS * ROWS;

    const next = {
      snake: newSnake,
      dir: nextDir,
      dirKey: nextDirKey,
      food: newFood,
      score: newScore,
      status: won ? "won" : "playing",
    };
    stateRef.current = next;
    setRenderState({ ...next });

    if (won) {
      clearInterval(tickRef.current);
      setBest((b) => Math.max(b, newScore));
    } else if (ateFood) {
      setBest((b) => Math.max(b, newScore));
    }
  }, []);

  // ── Start / restart ─────────────────────────────────────────────
  const startGame = useCallback(() => {
    clearInterval(tickRef.current);
    dirQueueRef.current = [];
    const fresh = { ...initState(), status: "playing" };
    stateRef.current = fresh;
    setRenderState(fresh);
    tickRef.current = setInterval(tick, SPEEDS[speedIdx].ms);
  }, [tick, speedIdx]);

  // ── Pause / resume ──────────────────────────────────────────────
  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "playing") {
      clearInterval(tickRef.current);
      const paused = { ...s, status: "paused" };
      stateRef.current = paused;
      setRenderState(paused);
    } else if (s.status === "paused") {
      const resumed = { ...s, status: "playing" };
      stateRef.current = resumed;
      setRenderState(resumed);
      tickRef.current = setInterval(tick, SPEEDS[speedIdx].ms);
    }
  }, [tick, speedIdx]);

  // ── Keyboard controls ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const s = stateRef.current;

      // Space = start / pause / resume
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (s.status === "idle" || s.status === "lost" || s.status === "won") {
          startGame();
        } else {
          togglePause();
        }
        return;
      }

      if (s.status !== "playing") return;

      const map = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
        W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        if (dirQueueRef.current.length < 2) {
          dirQueueRef.current.push(dir);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [startGame, togglePause]);

  // ── Touch / swipe controls ──────────────────────────────────────
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const s = stateRef.current;
    if (s.status === "idle" || s.status === "lost" || s.status === "won") {
      startGame();
      return;
    }
    if (s.status === "paused") { togglePause(); return; }

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // tap = pause
    if (Math.abs(dx) > Math.abs(dy)) {
      dirQueueRef.current.push(dx > 0 ? "RIGHT" : "LEFT");
    } else {
      dirQueueRef.current.push(dy > 0 ? "DOWN" : "UP");
    }
  };

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => () => clearInterval(tickRef.current), []);

  const status = renderState.status;
  const isActive = status === "playing" || status === "paused";

  // ── Overlay content ─────────────────────────────────────────────
  const overlayContent = () => {
    if (status === "idle") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div style={{ fontSize: 48 }}>🐍</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
            Snake
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--label-tertiary)", textAlign: "center", maxWidth: 220 }}>
            Eat apples, grow longer, don't bite yourself!
          </p>
          <button onClick={startGame} className="btn-primary">
            Start Game
          </button>
          <p style={{ fontSize: "0.72rem", color: "var(--label-quaternary)", letterSpacing: "-0.01em" }}>
            Arrow keys / WASD · Space to pause · Swipe on mobile
          </p>
        </div>
      );
    }
    if (status === "paused") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div style={{ fontSize: 40 }}>⏸️</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
            Paused
          </h2>
          <button onClick={togglePause} className="btn-primary">
            Resume
          </button>
        </div>
      );
    }
    if (status === "lost") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(145deg, #ff453a, #ff3b30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, boxShadow: "0 8px 24px rgba(255,59,48,0.35)",
            }}
          >
            💀
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
            Game Over
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)" }}>
            Score: <strong style={{ color: "var(--label-primary)" }}>{renderState.score}</strong>
          </p>
          <button onClick={startGame} className="btn-primary">
            Try Again
          </button>
        </div>
      );
    }
    if (status === "won") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(145deg, #34c759, #30d158)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, boxShadow: "0 8px 24px rgba(52,199,89,0.35)",
            }}
          >
            🏆
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--label-primary)" }}>
            You Win!
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--label-tertiary)" }}>
            Perfect score: <strong style={{ color: "var(--label-primary)" }}>{renderState.score}</strong>
          </p>
          <button onClick={startGame} className="btn-primary">
            Play Again
          </button>
        </div>
      );
    }
    return null;
  };

  const overlay = overlayContent();

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">

      {/* Score + speed row */}
      <div className="w-full flex items-center justify-between flex-wrap gap-3">
        <ScoreBadge score={renderState.score} best={best} />
        <SpeedPicker selected={speedIdx} onChange={setSpeedIdx} disabled={isActive} />
      </div>

      {/* Canvas + overlay wrapper */}
      <div
        style={{
          position: "relative",
          width: COLS * CELL,
          maxWidth: "100%",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          border: "0.5px solid var(--separator)",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          style={{ display: "block", width: "100%", height: "auto" }}
        />

        {/* Overlay for idle / paused / end states */}
        {overlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <div
              className="spring-pop flex flex-col items-center gap-4 p-7 rounded-3xl"
              style={{
                background: "var(--bg-surface)",
                boxShadow: "var(--shadow-xl)",
                minWidth: 200,
              }}
            >
              {overlay}
            </div>
          </div>
        )}
      </div>

      {/* In-game controls */}
      {isActive && (
        <div className="flex gap-3">
          <button onClick={togglePause} className="btn-ghost">
            {status === "paused" ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button onClick={startGame} className="btn-ghost">
            🔄 Restart
          </button>
        </div>
      )}

      {/* D-pad for mobile (shown when playing or paused) */}
      {isActive && (
        <div
          className="flex flex-col items-center gap-1"
          style={{ userSelect: "none" }}
          aria-label="Direction pad"
        >
          {/* Up */}
          <button
            className="btn-outline"
            style={{ width: 48, height: 48, fontSize: "1.1rem", padding: 0 }}
            onPointerDown={() => dirQueueRef.current.push("UP")}
          >▲</button>
          <div className="flex gap-1">
            <button
              className="btn-outline"
              style={{ width: 48, height: 48, fontSize: "1.1rem", padding: 0 }}
              onPointerDown={() => dirQueueRef.current.push("LEFT")}
            >◀</button>
            <div style={{ width: 48, height: 48 }} />
            <button
              className="btn-outline"
              style={{ width: 48, height: 48, fontSize: "1.1rem", padding: 0 }}
              onPointerDown={() => dirQueueRef.current.push("RIGHT")}
            >▶</button>
          </div>
          {/* Down */}
          <button
            className="btn-outline"
            style={{ width: 48, height: 48, fontSize: "1.1rem", padding: 0 }}
            onPointerDown={() => dirQueueRef.current.push("DOWN")}
          >▼</button>
        </div>
      )}

      <p
        className="text-center"
        style={{ fontSize: "0.75rem", color: "var(--label-tertiary)", letterSpacing: "-0.01em" }}
      >
        {isActive
          ? "Arrow keys / WASD to steer · Space to pause"
          : "Press Space or tap Start to play"}
      </p>
    </div>
  );
}
