export default function GameStatus({ turn, gameStatus, moveCount }) {
  const getTurnDisplay = () => {
    if (gameStatus === 'red-wins') {
      return '🎉 Red Wins!'
    }
    if (gameStatus === 'black-wins') {
      return '🎉 Black Wins!'
    }
    return turn === 'red' ? '🔴 Red\'s Turn' : '⚫ Black\'s Turn'
  }

  return (
    <div className="checkers-status">
      <div className="status-display">{getTurnDisplay()}</div>
      <div className="move-count">Moves: {moveCount}</div>
    </div>
  )
}
