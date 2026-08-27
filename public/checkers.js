// Checkers Game Logic
class CheckersGame {
    constructor() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = 'red';
        this.moveHistory = [];
        this.gameOver = false;
        this.init();
    }

    initializeBoard() {
        // Create 8x8 board
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Place red pieces (top)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'red', isKing: false };
                }
            }
        }

        // Place black pieces (bottom)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'black', isKing: false };
                }
            }
        }

        return board;
    }

    init() {
        this.renderBoard();
        this.attachEventListeners();
        this.updateStatus();
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Check if this square is selected
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    square.classList.add('selected');
                }

                // Check if this is a valid move
                if (this.validMoves.some(m => m.row === row && m.col === col && !m.isCapture)) {
                    square.classList.add('valid-move');
                }

                // Check if this is a valid capture
                if (this.validMoves.some(m => m.row === row && m.col === col && m.isCapture)) {
                    square.classList.add('valid-capture');
                }

                // Add piece if present
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color}${piece.isKing ? ' king' : ''}`;
                    pieceElement.textContent = piece.isKing ? '♔' : '';
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.gameOver || this.currentPlayer !== 'red') return;

        const piece = this.board[row][col];

        // If clicking on a valid move
        if (this.validMoves.some(m => m.row === row && m.col === col)) {
            this.movePiece(row, col);
            return;
        }

        // If clicking on own piece
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.renderBoard();
            return;
        }

        // Deselect if clicking elsewhere
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = piece.isKing
            ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
            : piece.color === 'red'
            ? [[1, -1], [1, 1]]
            : [[-1, -1], [-1, 1]];

        // Check regular moves
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            }
        }

        // Check capture moves
        for (const [dRow, dCol] of directions) {
            const captureRow = row + dRow;
            const captureCol = col + dCol;
            const newRow = row + dRow * 2;
            const newCol = col + dCol * 2;

            if (this.isValidPosition(captureRow, captureCol) && this.isValidPosition(newRow, newCol)) {
                const capturedPiece = this.board[captureRow][captureCol];
                if (capturedPiece && capturedPiece.color !== piece.color && !this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol, isCapture: true, captureRow, captureCol });
                }
            }
        }

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    movePiece(newRow, newCol) {
        if (!this.selectedPiece) return;

        const { row, col } = this.selectedPiece;
        const piece = this.board[row][col];
        const move = this.validMoves.find(m => m.row === newRow && m.col === newCol);

        if (!move) return;

        // Save to history
        this.moveHistory.push({
            piece: JSON.parse(JSON.stringify(piece)),
            fromRow: row,
            fromCol: col,
            toRow: newRow,
            toCol: newCol,
            capturedPiece: move.isCapture ? this.board[move.captureRow][move.captureCol] : null,
            captureRow: move.captureRow,
            captureCol: move.captureCol
        });

        // Move piece
        this.board[newRow][newCol] = piece;
        this.board[row][col] = null;

        // Handle capture
        if (move.isCapture) {
            this.board[move.captureRow][move.captureCol] = null;
        }

        // Promote to king
        if ((piece.color === 'red' && newRow === 7) || (piece.color === 'black' && newRow === 0)) {
            piece.isKing = true;
        }

        // Check for additional captures
        const additionalCaptures = this.getValidMoves(newRow, newCol).filter(m => m.isCapture);
        if (additionalCaptures.length > 0 && move.isCapture) {
            this.selectedPiece = { row: newRow, col: newCol };
            this.validMoves = additionalCaptures;
            this.renderBoard();
            this.updateStatus();
            return;
        }

        // Switch player
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.renderBoard();
        this.updateStatus();

        // Check game state
        this.checkGameState();

        // Computer move if it's black's turn
        if (this.currentPlayer === 'black' && !this.gameOver) {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    computerMove() {
        const validMoves = this.getAllValidMoves('black');

        if (validMoves.length === 0) {
            this.gameOver = true;
            this.updateStatus();
            return;
        }

        // Prioritize captures
        const captures = validMoves.filter(m => m.isCapture);
        const moveToMake = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : validMoves[Math.floor(Math.random() * validMoves.length)];

        const piece = this.board[moveToMake.fromRow][moveToMake.fromCol];

        // Save to history
        this.moveHistory.push({
            piece: JSON.parse(JSON.stringify(piece)),
            fromRow: moveToMake.fromRow,
            fromCol: moveToMake.fromCol,
            toRow: moveToMake.toRow,
            toCol: moveToMake.toCol,
            capturedPiece: moveToMake.isCapture ? this.board[moveToMake.captureRow][moveToMake.captureCol] : null,
            captureRow: moveToMake.captureRow,
            captureCol: moveToMake.captureCol
        });

        // Move piece
        this.board[moveToMake.toRow][moveToMake.toCol] = piece;
        this.board[moveToMake.fromRow][moveToMake.fromCol] = null;

        // Handle capture
        if (moveToMake.isCapture) {
            this.board[moveToMake.captureRow][moveToMake.captureCol] = null;
        }

        // Promote to king
        if ((piece.color === 'black' && moveToMake.toRow === 0) || (piece.color === 'red' && moveToMake.toRow === 7)) {
            piece.isKing = true;
        }

        // Switch player
        this.currentPlayer = 'red';
        this.renderBoard();
        this.updateStatus();

        // Check game state
        this.checkGameState();
    }

    getAllValidMoves(color) {
        const moves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const pieceMoves = this.getValidMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            isCapture: move.isCapture,
                            captureRow: move.captureRow,
                            captureCol: move.captureCol
                        });
                    }
                }
            }
        }

        return moves;
    }

    checkGameState() {
        const redPieces = this.countPieces('red');
        const blackPieces = this.countPieces('black');

        document.getElementById('redCount').textContent = redPieces;
        document.getElementById('blackCount').textContent = blackPieces;

        if (redPieces === 0) {
            this.gameOver = true;
            document.getElementById('message').textContent = 'Black wins!';
        } else if (blackPieces === 0) {
            this.gameOver = true;
            document.getElementById('message').textContent = 'Red wins!';
        } else if (this.getAllValidMoves(this.currentPlayer).length === 0) {
            this.gameOver = true;
            document.getElementById('message').textContent = `${this.currentPlayer === 'red' ? 'Red' : 'Black'} has no valid moves. ${this.currentPlayer === 'red' ? 'Black' : 'Red'} wins!`;
        }
    }

    countPieces(color) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].color === color) {
                    count++;
                }
            }
        }
        return count;
    }

    updateStatus() {
        if (this.gameOver) {
            document.getElementById('status').textContent = 'Game Over';
        } else {
            document.getElementById('status').textContent = `${this.currentPlayer === 'red' ? 'Red' : 'Black'}'s turn`;
        }
    }

    reset() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = 'red';
        this.moveHistory = [];
        this.gameOver = false;
        document.getElementById('message').textContent = '';
        this.renderBoard();
        this.updateStatus();
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        // Undo last two moves (one for each player) or just one if it's the first move
        const movesToUndo = this.moveHistory.length >= 2 ? 2 : 1;

        for (let i = 0; i < movesToUndo && this.moveHistory.length > 0; i++) {
            const move = this.moveHistory.pop();

            // Restore piece
            this.board[move.fromRow][move.fromCol] = move.piece;
            this.board[move.toRow][move.toCol] = null;

            // Restore captured piece
            if (move.capturedPiece) {
                this.board[move.captureRow][move.captureCol] = move.capturedPiece;
            }
        }

        this.currentPlayer = 'red';
        this.gameOver = false;
        document.getElementById('message').textContent = '';
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
        this.updateStatus();
    }

    attachEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new CheckersGame();
});
