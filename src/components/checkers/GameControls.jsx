export default function GameControls({
  onUndo,
  onReset,
  canUndo,
  gameOver,
}) {
  return (
    <div className="checkers-controls">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="checkers-btn checkers-btn--secondary"
      >
        ↶ Undo
      </button>
      <button
        onClick={onReset}
        className="checkers-btn checkers-btn--primary"
      >
        🔄 New Game
      </button>
    </div>
  )
}
