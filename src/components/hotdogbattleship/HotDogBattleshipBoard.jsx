import { useState, useCallback, useEffect } from 'react'

// ── Game Constants ────────────────────────────────────────────────

const GRID_SIZE = 8
const HOT_DOG_TYPES = [
  { name: 'Footlong', length: 5, emoji: '🌭' },
  { name: 'Chicago Dog', length: 4, emoji: '🌭' },
  { name: 'Brat', length: 3, emoji: '🌭' },
  { name: 'Wiener', length: 2, emoji: '🌭' },
]

const CELL_STATES = {
  EMPTY: 'empty',
  HOT_DOG: 'hotdog',
  HIT: 'hit',
  MISS: 'miss',
  SUNK: 'sunk',
}

// ── Utility Functions ────────────────────────────────────────────

function createEmptyGrid() {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(CELL_STATES.EMPTY))
}

function canPlaceHotDog(grid, row, col, length, isHorizontal) {
  if (isHorizontal) {
    if (col + length > GRID_SIZE) return false
    for (let i = 0; i < length; i++) {
      if (grid[row][col + i] !== CELL_STATES.EMPTY) return false
    }
  } else {
    if (row + length > GRID_SIZE) return false
    for (let i = 0; i < length; i++) {
      if (grid[row + i][col] !== CELL_STATES.EMPTY) return false
    }
  }
  return true
}

function placeHotDog(grid, row, col, length, isHorizontal) {
  const newGrid = grid.map((r) => [...r])
  if (isHorizontal) {
    for (let i = 0; i < length; i++) {
      newGrid[row][col + i] = CELL_STATES.HOT_DOG
    }
  } else {
    for (let i = 0; i < length; i++) {
      newGrid[row + i][col] = CELL_STATES.HOT_DOG
    }
  }
  return newGrid
}

function generateRandomPlacement() {
  let grid = createEmptyGrid()
  const placements = []

  for (const dogType of HOT_DOG_TYPES) {
    let placed = false
    let attempts = 0
    while (!placed && attempts < 50) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)
      const isHorizontal = Math.random() > 0.5

      if (canPlaceHotDog(grid, row, col, dogType.length, isHorizontal)) {
        grid = placeHotDog(grid, row, col, dogType.length, isHorizontal)
        placements.push({ row, col, length: dogType.length, isHorizontal, type: dogType.name })
        placed = true
      }
      attempts++
    }
  }

  return { grid, placements }
}

function countHotDogsRemaining(grid) {
  let count = 0
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === CELL_STATES.HOT_DOG) count++
    }
  }
  return count
}

function getAIMove(playerOpponentGrid, previousMoves) {
  // Simple AI: try to hit adjacent cells to previous hits
  const hits = previousMoves.filter((m) => m.result === 'hit')

  if (hits.length > 0) {
    const lastHit = hits[hits.length - 1]
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    for (const [dr, dc] of directions) {
      const newRow = lastHit.row + dr
      const newCol = lastHit.col + dc
      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE &&
        !previousMoves.some((m) => m.row === newRow && m.col === newCol)
      ) {
        return { row: newRow, col: newCol }
      }
    }
  }

  // Random move
  let row, col
  do {
    row = Math.floor(Math.random() * GRID_SIZE)
    col = Math.floor(Math.random() * GRID_SIZE)
  } while (previousMoves.some((m) => m.row === row && m.col === col))

  return { row, col }
}

// ── Grid Cell Component ───────────────────────────────────────────

function GridCell({ state, isRevealed, onClick, disabled, isPlayerGrid }) {
  let displayState = state
  if (!isRevealed && state === CELL_STATES.HOT_DOG && !isPlayerGrid) {
    displayState = CELL_STATES.EMPTY
  }

  const getBackground = () => {
    if (!isRevealed && state === CELL_STATES.EMPTY) return 'var(--fill-secondary)'
    if (displayState === CELL_STATES.HOT_DOG) return '#ff6b6b'
    if (displayState === CELL_STATES.HIT) return '#ffd700'
    if (displayState === CELL_STATES.MISS) return '#a0a0a0'
    return 'var(--fill-secondary)'
  }

  const getEmoji = () => {
    if (displayState === CELL_STATES.HOT_DOG) return '🌭'
    if (displayState === CELL_STATES.HIT) return '💥'
    if (displayState === CELL_STATES.MISS) return '💨'
    return ''
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: 6,
        background: getBackground(),
        border: '1px solid var(--fill-tertiary)',
        fontSize: 'clamp(0.8rem, 3vw, 1.2rem)',
        fontWeight: 700,
        transition: 'all 0.2s ease',
        transform: !disabled && state === CELL_STATES.EMPTY ? 'scale(1)' : 'scale(0.95)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && state === CELL_STATES.EMPTY) {
          e.target.style.background = 'var(--fill-tertiary)'
          e.target.style.borderColor = 'var(--accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && state === CELL_STATES.EMPTY) {
          e.target.style.background = 'var(--fill-secondary)'
          e.target.style.borderColor = 'var(--fill-tertiary)'
        }
      }}
    >
      {getEmoji()}
    </button>
  )
}

// ── Setup Phase Component ────────────────────────────────────────

function SetupPhase({ onSetupComplete }) {
  const [grid, setGrid] = useState(createEmptyGrid())
  const [currentDogIndex, setCurrentDogIndex] = useState(0)
  const [isHorizontal, setIsHorizontal] = useState(true)
  const [hoveredCells, setHoveredCells] = useState([])

  const currentDog = HOT_DOG_TYPES[currentDogIndex]
  const dogsPlaced = currentDogIndex

  const handleCellHover = (row, col) => {
    if (currentDogIndex >= HOT_DOG_TYPES.length) return

    const cells = []
    if (isHorizontal) {
      for (let i = 0; i < currentDog.length; i++) {
        if (col + i < GRID_SIZE) cells.push([row, col + i])
      }
    } else {
      for (let i = 0; i < currentDog.length; i++) {
        if (row + i < GRID_SIZE) cells.push([row + i, col])
      }
    }
    setHoveredCells(cells)
  }

  const handleCellClick = (row, col) => {
    if (currentDogIndex >= HOT_DOG_TYPES.length) return

    if (canPlaceHotDog(grid, row, col, currentDog.length, isHorizontal)) {
      const newGrid = placeHotDog(grid, row, col, currentDog.length, isHorizontal)
      setGrid(newGrid)
      setCurrentDogIndex(currentDogIndex + 1)
      setHoveredCells([])
    }
  }

  const handleRandomPlacement = () => {
    const { grid: newGrid } = generateRandomPlacement()
    setGrid(newGrid)
    setCurrentDogIndex(HOT_DOG_TYPES.length)
    setHoveredCells([])
  }

  const handleReset = () => {
    setGrid(createEmptyGrid())
    setCurrentDogIndex(0)
    setHoveredCells([])
  }

  const handleDone = () => {
    if (currentDogIndex === HOT_DOG_TYPES.length) {
      onSetupComplete(grid)
    }
  }

  const isHovered = (row, col) => hoveredCells.some(([r, c]) => r === row && c === col)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--label-primary)',
          textAlign: 'center',
        }}
      >
        🌭 Hot Dog Battleship
      </h2>

      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--label-secondary)',
          textAlign: 'center',
        }}
      >
        {currentDogIndex < HOT_DOG_TYPES.length ? (
          <>
            <p>Place your {currentDog.name} ({currentDog.length} cells)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--label-tertiary)', marginTop: 4 }}>
              {dogsPlaced} / {HOT_DOG_TYPES.length} placed
            </p>
          </>
        ) : (
          <p>All hot dogs placed! Ready to battle?</p>
        )}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: 4,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <GridCell
              key={`${rowIdx}-${colIdx}`}
              state={isHovered(rowIdx, colIdx) ? CELL_STATES.HOT_DOG : cell}
              isRevealed={true}
              onClick={() => handleCellClick(rowIdx, colIdx)}
              disabled={currentDogIndex >= HOT_DOG_TYPES.length}
              isPlayerGrid={true}


            />
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        {currentDogIndex < HOT_DOG_TYPES.length && (
          <>
            <button
              onClick={() => setIsHorizontal(!isHorizontal)}
              className="btn-ghost"
              style={{ fontSize: '0.9rem' }}
            >
              {isHorizontal ? '↔️ Horizontal' : '↕️ Vertical'}
            </button>
            <button onClick={handleRandomPlacement} className="btn-ghost" style={{ fontSize: '0.9rem' }}>
              🎲 Random
            </button>
            <button onClick={handleReset} className="btn-ghost" style={{ fontSize: '0.9rem' }}>
              🔄 Reset
            </button>
          </>
        )}
      </div>

      {currentDogIndex === HOT_DOG_TYPES.length && (
        <button onClick={handleDone} className="btn-primary w-full">
          Start Battle! 🪰
        </button>
      )}
    </div>
  )
}

// ── Battle Phase Component ───────────────────────────────────────

function BattlePhase({ playerGrid, onGameEnd }) {
  const [opponentGrid, setOpponentGrid] = useState(() => generateRandomPlacement().grid)
  const [playerShotGrid, setPlayerShotGrid] = useState(createEmptyGrid())
  const [opponentShotGrid, setOpponentShotGrid] = useState(createEmptyGrid())
  const [playerMoves, setPlayerMoves] = useState([])
  const [opponentMoves, setOpponentMoves] = useState([])
  const [gameState, setGameState] = useState('playing') // 'playing' | 'won' | 'lost'
  const [message, setMessage] = useState('Your turn! Shoot a fly 🪰')

  const handlePlayerShot = useCallback(
    (row, col) => {
      if (gameState !== 'playing') return
      if (playerMoves.some((m) => m.row === row && m.col === col)) return

      const targetCell = opponentGrid[row][col]
      const isHit = targetCell === CELL_STATES.HOT_DOG
      const newPlayerShotGrid = playerShotGrid.map((r) => [...r])
      const newPlayerMoves = [
        ...playerMoves,
        { row, col, result: isHit ? 'hit' : 'miss' },
      ]

      newPlayerShotGrid[row][col] = isHit ? CELL_STATES.HIT : CELL_STATES.MISS

      // Mark sunk hot dogs
      if (isHit) {
        const opponentGridCopy = opponentGrid.map((r) => [...r])
        opponentGridCopy[row][col] = CELL_STATES.HIT
        const remaining = countHotDogsRemaining(opponentGridCopy)
        if (remaining === 0) {
          setGameState('won')
          setMessage('🎉 You sank all the hot dogs! You win!')
          setPlayerShotGrid(newPlayerShotGrid)
          setPlayerMoves(newPlayerMoves)
          return
        }
      }

      setPlayerShotGrid(newPlayerShotGrid)
      setPlayerMoves(newPlayerMoves)

      // AI turn
      setTimeout(() => {
        const aiMove = getAIMove(playerGrid, opponentMoves)
        const aiTargetCell = playerGrid[aiMove.row][aiMove.col]
        const aiIsHit = aiTargetCell === CELL_STATES.HOT_DOG
        const newOpponentShotGrid = opponentShotGrid.map((r) => [...r])
        const newOpponentMoves = [
          ...opponentMoves,
          { row: aiMove.row, col: aiMove.col, result: aiIsHit ? 'hit' : 'miss' },
        ]

        newOpponentShotGrid[aiMove.row][aiMove.col] = aiIsHit ? CELL_STATES.HIT : CELL_STATES.MISS

        if (aiIsHit) {
          const playerGridCopy = playerGrid.map((r) => [...r])
          playerGridCopy[aiMove.row][aiMove.col] = CELL_STATES.HIT
          const remaining = countHotDogsRemaining(playerGridCopy)
          if (remaining === 0) {
            setGameState('lost')
            setMessage('💥 All your hot dogs are sunk! You lose!')
            setOpponentShotGrid(newOpponentShotGrid)
            setOpponentMoves(newOpponentMoves)
            return
          }
        }

        setOpponentShotGrid(newOpponentShotGrid)
        setOpponentMoves(newOpponentMoves)
        setMessage(aiIsHit ? '💥 AI hit your hot dog!' : '💨 AI missed!')
      }, 800)
    },
    [gameState, playerMoves, opponentGrid, playerGrid, opponentShotGrid, opponentMoves]
  )

  const playerHotDogsRemaining = countHotDogsRemaining(
    playerGrid.map((row, rowIdx) =>
      row.map((cell, colIdx) =>
        opponentShotGrid[rowIdx][colIdx] === CELL_STATES.HIT ? CELL_STATES.HIT : cell
      )
    )
  )

  const opponentHotDogsRemaining = countHotDogsRemaining(
    opponentGrid.map((row, rowIdx) =>
      row.map((cell, colIdx) =>
        playerShotGrid[rowIdx][colIdx] === CELL_STATES.HIT ? CELL_STATES.HIT : cell
      )
    )
  )

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--label-primary)',
          textAlign: 'center',
        }}
      >
        🌭 Hot Dog Battleship
      </h2>

      {/* Status */}
      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: gameState === 'won' ? '#34c759' : gameState === 'lost' ? '#ff3b30' : 'var(--label-secondary)',
          textAlign: 'center',
          minHeight: 24,
        }}
      >
        {message}
      </div>

      {/* Stats */}
      <div className="flex gap-6 justify-center flex-wrap">
        <div
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl"
          style={{ background: 'var(--fill-tertiary)' }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#34c759' }}>
            {opponentHotDogsRemaining}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            Enemy Hot Dogs
          </span>
        </div>
        <div
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl"
          style={{ background: 'var(--fill-tertiary)' }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ff3b30' }}>
            {playerHotDogsRemaining}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--label-tertiary)',
            }}
          >
            Your Hot Dogs
          </span>
        </div>
      </div>

      {/* Grids */}
      <div className="flex gap-6 flex-wrap justify-center">
        {/* Player's grid (showing opponent's shots) */}
        <div className="flex flex-col items-center gap-2">
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--label-secondary)' }}>
            Your Hot Dogs
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gap: 3,
              maxWidth: 280,
            }}
          >
            {playerGrid.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const shotResult = opponentShotGrid[rowIdx][colIdx]
                let displayState = cell
                if (shotResult === CELL_STATES.HIT) displayState = CELL_STATES.HIT
                else if (shotResult === CELL_STATES.MISS) displayState = CELL_STATES.MISS
                return (
                  <GridCell
                    key={`player-${rowIdx}-${colIdx}`}
                    state={displayState}
                    isRevealed={true}
                    onClick={() => {}}
                    disabled={true}
                    isPlayerGrid={true}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Opponent's grid (player shoots here) */}
        <div className="flex flex-col items-center gap-2">
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--label-secondary)' }}>
            Enemy Hot Dogs
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gap: 3,
              maxWidth: 280,
            }}
          >
            {opponentGrid.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const shotResult = playerShotGrid[rowIdx][colIdx]
                let displayState = cell
                if (shotResult === CELL_STATES.HIT) displayState = CELL_STATES.HIT
                else if (shotResult === CELL_STATES.MISS) displayState = CELL_STATES.MISS
                else displayState = CELL_STATES.EMPTY
                return (
                  <GridCell
                    key={`opponent-${rowIdx}-${colIdx}`}
                    state={displayState}
                    isRevealed={shotResult !== undefined}
                    onClick={() => handlePlayerShot(rowIdx, colIdx)}
                    disabled={gameState !== 'playing' || shotResult !== undefined}
                    isPlayerGrid={false}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Game Over */}
      {gameState !== 'playing' && (
        <button onClick={() => onGameEnd()} className="btn-primary">
          Play Again
        </button>
      )}
    </div>
  )
}

// ── Main Board Component ─────────────────────────────────────────

export default function HotDogBattleshipBoard() {
  const [gamePhase, setGamePhase] = useState('setup') // 'setup' | 'battle'
  const [playerGrid, setPlayerGrid] = useState(null)
  const [gameKey, setGameKey] = useState(0)

  const handleSetupComplete = (grid) => {
    setPlayerGrid(grid)
    setGamePhase('battle')
  }

  const handleGameEnd = () => {
    setGamePhase('setup')
    setPlayerGrid(null)
    setGameKey((k) => k + 1)
  }

  if (gamePhase === 'setup') {
    return <SetupPhase key={`setup-${gameKey}`} onSetupComplete={handleSetupComplete} />
  }

  return (
    <BattlePhase
      key={`battle-${gameKey}`}
      playerGrid={playerGrid}
      onGameEnd={handleGameEnd}
    />
  )
}
