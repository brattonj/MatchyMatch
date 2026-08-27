/**
 * Checkers game rules and logic
 */

// Initialize an 8x8 checkers board
// Pieces: null, 'red', 'red-king', 'black', 'black-king'
export function initializeBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place red pieces (bottom, rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'red'
      }
    }
  }

  // Place black pieces (top, rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'black'
      }
    }
  }

  return board
}

export function getPieceColor(piece) {
  if (!piece) return null
  return piece.includes('red') ? 'red' : 'black'
}

export function isKing(piece) {
  return piece && piece.includes('king')
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const color = getPieceColor(piece)
  const isKingPiece = isKing(piece)

  // Regular moves (one square diagonally)
  const regularDirections = isKingPiece
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : color === 'red'
      ? [
          [1, -1],
          [1, 1],
        ]
      : [
          [-1, -1],
          [-1, 1],
        ]

  // Check regular moves
  for (const [dr, dc] of regularDirections) {
    const newRow = row + dr
    const newCol = col + dc
    if (
      newRow >= 0 &&
      newRow < 8 &&
      newCol >= 0 &&
      newCol < 8 &&
      !board[newRow][newCol]
    ) {
      moves.push({ row: newRow, col: newCol, isCapture: false })
    }
  }

  // Check capture moves (two squares diagonally)
  const captureDirections = isKingPiece
    ? [
        [-2, -2],
        [-2, 2],
        [2, -2],
        [2, 2],
      ]
    : color === 'red'
      ? [
          [2, -2],
          [2, 2],
        ]
      : [
          [-2, -2],
          [-2, 2],
        ]

  for (const [dr, dc] of captureDirections) {
    const midRow = row + dr / 2
    const midCol = col + dc / 2
    const newRow = row + dr
    const newCol = col + dc

    if (
      newRow >= 0 &&
      newRow < 8 &&
      newCol >= 0 &&
      newCol < 8 &&
      !board[newRow][newCol]
    ) {
      const capturedPiece = board[midRow][midCol]
      if (capturedPiece && getPieceColor(capturedPiece) !== color) {
        moves.push({ row: newRow, col: newCol, isCapture: true, capturedRow: midRow, capturedCol: midCol })
      }
    }
  }

  return moves
}

export function isValidMove(board, fromRow, fromCol, toRow, toCol) {
  const moves = getValidMoves(board, fromRow, fromCol)
  return moves.some((move) => move.row === toRow && move.col === toCol)
}

export function makeMove(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[fromRow][fromCol]
  let capturedPiece = null

  // Move the piece
  newBoard[toRow][toCol] = piece
  newBoard[fromRow][fromCol] = null

  // Handle capture
  const rowDiff = Math.abs(toRow - fromRow)
  if (rowDiff === 2) {
    const capturedRow = (fromRow + toRow) / 2
    const capturedCol = (fromCol + toCol) / 2
    capturedPiece = newBoard[capturedRow][capturedCol]
    newBoard[capturedRow][capturedCol] = null
  }

  // Handle king promotion
  const color = getPieceColor(piece)
  if ((color === 'red' && toRow === 7) || (color === 'black' && toRow === 0)) {
    newBoard[toRow][toCol] = `${color}-king`
  }

  return { newBoard, capturedPiece }
}

export function hasValidMoves(board, color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && getPieceColor(piece) === color) {
        const moves = getValidMoves(board, row, col)
        if (moves.length > 0) {
          return true
        }
      }
    }
  }
  return false
}

export function countPieces(board, color) {
  let count = 0
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && getPieceColor(piece) === color) {
        count++
      }
    }
  }
  return count
}

export function getGameStatus(board, currentTurn) {
  const hasRedMoves = hasValidMoves(board, 'red')
  const hasBlackMoves = hasValidMoves(board, 'black')
  const redCount = countPieces(board, 'red')
  const blackCount = countPieces(board, 'black')

  if (redCount === 0) {
    return 'black-wins'
  }
  if (blackCount === 0) {
    return 'red-wins'
  }
  if (currentTurn === 'red' && !hasRedMoves) {
    return 'black-wins'
  }
  if (currentTurn === 'black' && !hasBlackMoves) {
    return 'red-wins'
  }

  return 'active'
}
