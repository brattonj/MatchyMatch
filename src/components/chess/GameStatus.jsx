/**
 * @file GameStatus.jsx
 * @description Displays current game status for chess game.
 * Shows whose turn it is, game state (check, checkmate, stalemate), and move counter.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.turn - Current player ('white' or 'black')
 * @param {string} props.gameStatus - Game status ('active', 'check', 'checkmate', 'stalemate')
 * @param {number} props.moveCount - Total number of half-moves made
 * @returns {JSX.Element} Status display with emoji, message, and move counter
 */

export default function GameStatus({ turn, gameStatus, moveCount }) {
  const getStatusMessage = () => {
    if (gameStatus === 'checkmate') {
      const winner = turn === 'white' ? 'Black' : 'White'
      return `${winner} wins!`
    }
    if (gameStatus === 'stalemate') {
      return 'Draw - Stalemate'
    }
    if (gameStatus === 'check') {
      return `${turn.charAt(0).toUpperCase() + turn.slice(1)} in check!`
    }
    return `${turn.charAt(0).toUpperCase() + turn.slice(1)} to move`
  }

  const getStatusEmoji = () => {
    if (gameStatus === 'checkmate') return '🏆'
    if (gameStatus === 'stalemate') return '🤝'
    if (gameStatus === 'check') return '⚠️'
    return '♟️'
  }

  return (
    <div className="game-status">
      <div className="status-header">
        <span className="status-emoji">{getStatusEmoji()}</span>
        <span className="status-text">{getStatusMessage()}</span>
      </div>
      <div className="move-counter">Move {Math.ceil(moveCount / 2)}</div>
    </div>
  )
}
