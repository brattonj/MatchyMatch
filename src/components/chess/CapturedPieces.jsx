/**
 * @file CapturedPieces.jsx
 * @description Displays captured pieces for both players in chess game.
 * Shows piece symbols and calculates material advantage (total value of captured pieces).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.capturedPieces - Captured pieces organized by color
 * @param {Array<Object>} props.capturedPieces.white - White pieces captured by black
 * @param {Array<Object>} props.capturedPieces.black - Black pieces captured by white
 * @returns {JSX.Element} Two sections showing captured pieces and material count for each side
 */

const PIECE_SYMBOLS = {
  pawn: { white: '♙', black: '♟' },
  rook: { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' },
}

const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
}

export default function CapturedPieces({ capturedPieces }) {
  const calculateMaterial = (pieces) => {
    return pieces.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0)
  }

  const whiteMaterial = calculateMaterial(capturedPieces.white)
  const blackMaterial = calculateMaterial(capturedPieces.black)

  const renderPieces = (pieces) => {
    return pieces.map((piece, idx) => (
      <span key={idx} className={`captured-piece piece-${piece.color}`}>
        {PIECE_SYMBOLS[piece.type][piece.color]}
      </span>
    ))
  }

  return (
    <div className="captured-pieces">
      <div className="captured-section">
        <div className="captured-label">White captured</div>
        <div className="captured-list">
          {renderPieces(capturedPieces.white, 'white')}
        </div>
        {whiteMaterial > 0 && (
          <div className="material-count">+{whiteMaterial}</div>
        )}
      </div>

      <div className="captured-section">
        <div className="captured-label">Black captured</div>
        <div className="captured-list">
          {renderPieces(capturedPieces.black, 'black')}
        </div>
        {blackMaterial > 0 && (
          <div className="material-count">+{blackMaterial}</div>
        )}
      </div>
    </div>
  )
}
