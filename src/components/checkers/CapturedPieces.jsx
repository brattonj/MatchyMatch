export default function CapturedPieces({ capturedPieces }) {
  const renderPieces = (pieces) => {
    const counts = { regular: 0, king: 0 }
    pieces.forEach((piece) => {
      if (piece.includes('king')) {
        counts.king++
      } else {
        counts.regular++
      }
    })
    return counts
  }

  const redCounts = renderPieces(capturedPieces.red)
  const blackCounts = renderPieces(capturedPieces.black)

  return (
    <div className="checkers-captured">
      <div className="checkers-captured__section">
        <h3 className="checkers-captured__title">🔴 Red Captured</h3>
        <div className="checkers-captured__pieces">
          {blackCounts.regular > 0 && (
            <span className="checkers-captured__count">{blackCounts.regular}×</span>
          )}
          {blackCounts.king > 0 && (
            <span className="checkers-captured__count checkers-captured__count--king">
              {blackCounts.king}♔
            </span>
          )}
          {redCounts.regular === 0 && redCounts.king === 0 && (
            <span className="checkers-captured__empty">—</span>
          )}
        </div>
      </div>
      <div className="checkers-captured__section">
        <h3 className="checkers-captured__title">⚫ Black Captured</h3>
        <div className="checkers-captured__pieces">
          {redCounts.regular > 0 && (
            <span className="checkers-captured__count">{redCounts.regular}×</span>
          )}
          {redCounts.king > 0 && (
            <span className="checkers-captured__count checkers-captured__count--king">
              {redCounts.king}♔
            </span>
          )}
          {blackCounts.regular === 0 && blackCounts.king === 0 && (
            <span className="checkers-captured__empty">—</span>
          )}
        </div>
      </div>
    </div>
  )
}
