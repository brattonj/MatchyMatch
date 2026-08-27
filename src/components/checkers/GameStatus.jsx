export default function GameStatus({ turn, gameStatus }) {
  const getTurnDisplay = () => {
    if (gameStatus === 'red-wins') {
      return '🎉 Red Wins!'
    }
    if (gameStatus === 'black-wins') {
      return '🎉 Black Wins!'
    }
    return `${turn === 'red' ? '🔴' : '⚫'} ${turn.charAt(0).toUpperCase() + turn.slice(1)}'s Turn`
  }

  return (
    <div className="checkers-status">
      <h2 className="checkers-status__title">{getTurnDisplay()}</h2>
    </div>
  )
}
