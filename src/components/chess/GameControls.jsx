/**
 * @file GameControls.jsx
 * @description Control buttons for chess game (Undo and New Game).
 * Provides game state management controls with conditional button states.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUndo - Callback to undo the last move
 * @param {Function} props.onReset - Callback to reset the game
 * @param {boolean} props.canUndo - Whether undo is available
 * @param {boolean} props.gameOver - Whether the game is over
 * @returns {JSX.Element} Control button group
 */

export default function GameControls({
  onUndo,
  onReset,
  canUndo,
  gameOver,
}) {
  return (
    <div className="game-controls">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="control-btn undo-btn"
        title="Undo last move"
      >
        ↶ Undo
      </button>
      <button
        onClick={onReset}
        className="control-btn reset-btn"
        title="Start a new game"
      >
        {gameOver ? '🔄 Play Again' : '🔄 New Game'}
      </button>
    </div>
  )
}
