import { useState, useCallback } from "react"
import { DOG_PAIRS } from "../../data/puppyFetchData"

function initializeGame() {
  const cards = []
  DOG_PAIRS.forEach((pair) => {
    cards.push({ ...pair, id: Math.random() })
    cards.push({ ...pair, id: Math.random() })
  })
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return {
    cards,
    flipped: new Set(),
    matched: new Set(),
    moves: 0,
    gameState: "playing", // 'playing' | 'won'
  }
}

// ── Card component ───────────────────────────────────────────────────────────

function Card({ card, index, isFlipped, isMatched, onClick }) {
  return (
    <button
      onClick={() => !isMatched && onClick(index)}
      disabled={isMatched}
      className="flip-card"
      style={{
        width: 80,
        height: 80,
        borderRadius: 12,
        border: "2px solid var(--separator)",
        background: isMatched ? "rgba(139, 69, 19, 0.1)" : "var(--bg-surface)",
        cursor: isMatched ? "default" : "pointer",
        fontSize: "2rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        perspective: "1000px",
        boxShadow: isMatched
          ? "inset 0 2px 8px rgba(139, 69, 19, 0.2)"
          : "var(--shadow-sm)",
        opacity: isMatched ? 0.6 : 1,
      }}
    >
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: isFlipped ? "rotateY(0deg)" : "rotateY(90deg)",
        }}
      >
        {isFlipped || isMatched ? card.emoji : "🦴"}
      </span>
    </button>
  )
}

// ── Stats display ────────────────────────────────────────────────────────────

function Stats({ moves, matched, total }) {
  return (
    <div className="flex items-center gap-4 justify-center flex-wrap">
      {[
        { label: "Fetches", value: moves },
        { label: "Pairs", value: `${matched}/${total}` },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl"
          style={{ background: "var(--fill-tertiary)", minWidth: 80 }}
        >
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--label-primary)",
            }}
          >
            {value}
          </span>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--label-tertiary)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main board ───────────────────────────────────────────────────────────────

export default function PuppyFetchBoard() {
  const [gameKey, setGameKey] = useState(0)

  return (
    <Game
      key={gameKey}
      onNewGame={() => setGameKey((k) => k + 1)}
    />
  )
}

function Game({ onNewGame }) {
  const [state, setState] = useState(initializeGame())

  const handleCardClick = useCallback((index) => {
    setState((prev) => {
      if (prev.gameState !== "playing") return prev
      if (prev.flipped.size >= 2) return prev
      if (prev.flipped.has(index) || prev.matched.has(index)) return prev

      const newFlipped = new Set(prev.flipped)
      newFlipped.add(index)

      // If we have 2 cards flipped, check for match
      if (newFlipped.size === 2) {
        const [first, second] = Array.from(newFlipped)
        const firstCard = prev.cards[first]
        const secondCard = prev.cards[second]

        const isMatch = firstCard.breed === secondCard.breed

        if (isMatch) {
          const newMatched = new Set(prev.matched)
          newMatched.add(first)
          newMatched.add(second)

          const allMatched = newMatched.size === prev.cards.length

          return {
            ...prev,
            flipped: new Set(),
            matched: newMatched,
            moves: prev.moves + 1,
            gameState: allMatched ? "won" : "playing",
          }
        } else {
          // No match - flip back after delay
          setTimeout(() => {
            setState((s) => ({
              ...s,
              flipped: new Set(),
            }))
          }, 1000)

          return {
            ...prev,
            flipped: newFlipped,
            moves: prev.moves + 1,
          }
        }
      }

      return {
        ...prev,
        flipped: newFlipped,
      }
    })
  }, [])

  const { cards, flipped, matched, moves, gameState } = state
  const totalPairs = DOG_PAIRS.length

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
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(145deg, #d4a574, #c89968)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(212, 165, 116, 0.35)",
            }}
          >
            🐕
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
              Good Puppy!
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--label-tertiary)",
              }}
            >
              All pairs matched!
            </p>
            <p
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--accent)",
              }}
            >
              {moves} {moves === 1 ? "fetch" : "fetches"}
            </p>
          </div>
          <button onClick={onNewGame} className="btn-primary">
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // ── Playing screen ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Title */}
      <div className="w-full flex flex-col items-center gap-2">
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--label-primary)",
          }}
        >
          Puppy Fetch
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--label-tertiary)",
            textAlign: "center",
          }}
        >
          Match all the dog breed pairs!
        </p>
      </div>

      {/* Stats */}
      <Stats moves={moves} matched={matched.size / 2} total={totalPairs} />

      {/* Game grid */}
      <div
        className="w-full flex flex-wrap justify-center gap-3 rounded-3xl p-6"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-md)" }}
      >
        {cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            index={index}
            isFlipped={flipped.has(index)}
            isMatched={matched.has(index)}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* Instructions */}
      <p
        className="text-center"
        style={{
          fontSize: "0.75rem",
          color: "var(--label-tertiary)",
          letterSpacing: "-0.01em",
        }}
      >
        Tap the bones to find matching puppy pairs.
      </p>

      {/* New game button */}
      <button onClick={onNewGame} className="btn-ghost">
        🐕 New Game
      </button>
    </div>
  )
}
