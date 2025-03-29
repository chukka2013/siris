class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        
        this.initializeBoard();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeBoard() {
        const initialPosition = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];

        this.board = initialPosition;
        this.createBoardUI();
    }

    createBoardUI() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = 'piece';
                    piece.textContent = this.board[row][col];
                    piece.dataset.color = this.getPieceColor(this.board[row][col]);
                    square.appendChild(piece);
                }

                chessboard.appendChild(square);
            }
        }
    }

    getPieceColor(piece) {
        return '♔♕♖♗♘♙'.includes(piece) ? 'white' : 'black';
    }

    setupEventListeners() {
        const chessboard = document.getElementById('chessboard');
        chessboard.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            this.handleSquareClick(row, col);
        });

        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('undo-move').addEventListener('click', () => {
            this.undoMove();
        });
    }

    handleSquareClick(row, col) {
        const piece = this.board[row][col];
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        // Clear previous highlights
        this.clearHighlights();

        if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            }
            this.selectedPiece = null;
        } else if (piece && this.getPieceColor(piece) === this.currentPlayer) {
            this.selectedPiece = { row, col };
            square.classList.add('selected');
            this.highlightValidMoves(row, col);
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];

        // Can't capture your own pieces
        if (targetPiece && this.getPieceColor(targetPiece) === this.currentPlayer) {
            return false;
        }

        // Basic movement rules (simplified for this example)
        switch (piece) {
            case '♙': // White pawn
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, 'white');
            case '♟': // Black pawn
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, 'black');
            case '♖': // White rook
            case '♜': // Black rook
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case '♘': // White knight
            case '♞': // Black knight
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case '♗': // White bishop
            case '♝': // Black bishop
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case '♕': // White queen
            case '♛': // Black queen
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case '♔': // White king
            case '♚': // Black king
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
        }

        return false;
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (fromCol === toCol && toRow === fromRow + direction && !this.board[toRow][toCol]) {
            return true;
        }

        // First move can be 2 squares
        if (fromRow === startRow && fromCol === toCol && 
            toRow === fromRow + 2 * direction && 
            !this.board[fromRow + direction][fromCol] && 
            !this.board[toRow][toCol]) {
            return true;
        }

        // Capture
        if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
            return this.board[toRow][toCol] && this.getPieceColor(this.board[toRow][toCol]) !== color;
        }

        return false;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
        const colStep = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    highlightValidMoves(row, col) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isValidMove(row, col, i, j)) {
                    const square = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    square.classList.add('highlighted');
                }
            }
        }
    }

    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'highlighted');
        });
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
        }

        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: this.board[fromRow][fromCol],
            captured: capturedPiece
        });

        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = '';

        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateUI();
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

        if (lastMove.captured) {
            this.capturedPieces[this.currentPlayer].pop();
        }

        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateUI();
    }

    resetGame() {
        this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.updateUI();
    }

    updateUI() {
        this.createBoardUI();
        document.getElementById('current-player').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        this.updateCapturedPieces('white');
        this.updateCapturedPieces('black');
    }

    updateCapturedPieces(color) {
        const container = document.getElementById(`${color}-captured-pieces`);
        container.innerHTML = '';
        
        this.capturedPieces[color].forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = piece;
            container.appendChild(pieceElement);
        });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
}); 