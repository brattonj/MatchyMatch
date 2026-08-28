/**
 * Checkers game rules and logic
 * Standard American checkers (8x8 board)
 */

export function initializeBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place red pieces (top)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false }
      }
    }
  }

  // Place black pieces (bottom)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false }
      }
    }
  }

  return board
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const directions = piece.isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : piece.color === 'red'
      ? [
          [1, -1],
          [1, 1],
        ]
      : [
          [-1, -1],
          [-1, 1],
        ]

  // Regular moves
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow
    const newCol = col + dCol

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, isCapture: false })
      }
    }
  }

  // Capture moves
  for (const [dRow, dCol] of directions) {
    const captureRow = row + dRow
    const captureCol = col + dCol
    const newRow = row + dRow * 2
    const newCol = col + dCol * 2

    if (
      captureRow >= 0 &&
      captureRow < 8 &&
      newRow >= 0 &&
      newRow < 8 &&
      newCol >= 0 &&
      newCol < 8
    ) {
      const capturedPiece = board[captureRow][captureCol]
      if (
        capturedPiece &&
        capturedPiece.color !== piece.color &&
        !board[newRow][newCol]
      ) {
        moves.push({
          row: newRow,
          col: newCol,
          isCapture: true,
          captureRow,
          captureCol,
        })
      }
    }
  }

  return moves
}

export function makeMove(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[fromRow][fromCol]

  if (!piece) return { newBoard, capturedPiece: null }

  let capturedPiece = null
  const dRow = toRow - fromRow
  const dCol = toCol - fromCol

  // Check if it's a capture move
  if (Math.abs(dRow) === 2) {
    const captureRow = fromRow + dRow / 2
    const captureCol = fromCol + dCol / 2
    capturedPiece = newBoard[captureRow][captureCol]
    newBoard[captureRow][captureCol] = null
  }

  // Move the piece
  newBoard[toRow][toCol] = piece

  // Check for king promotion
  if (
    (piece.color === 'red' && toRow === 7) ||
    (piece.color === 'black' && toRow === 0)
  ) {
    piece.isKing = true
  }

  newBoard[fromRow][fromCol] = null

  return { newBoard, capturedPiece }
}

export function hasValidMoves(board, color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col)
        if (moves.length > 0) {
          return true
        }
      }
    }
  }
  return false
}

export function isGameOver(board, currentTurn) {
  const redHasPieces = board.some((row) =>
    row.some((piece) => piece && piece.color === 'red')
  )
  const blackHasPieces = board.some((row) =>
    row.some((piece) => piece && piece.color === 'black')
  )

  if (!redHasPieces) return { isOver: true, winner: 'black' }
  if (!blackHasPieces) return { isOver: true, winner: 'red' }

  const currentPlayerHasMoves = hasValidMoves(board, currentTurn)
  if (!currentPlayerHasMoves) {
    const winner = currentTurn === 'red' ? 'black' : 'red'
    return { isOver: true, winner }
  }

  return { isOver: false, winner: null }
}
