class TicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        this.colors = {
            X: '#FF6B6B',  // Coral Red
            O: '#4ECDC4',  // Turquoise
            winner: '#A8E6CF'  // Mint Green
        };
        
        this.statusDisplay = document.getElementById('status');
        this.cells = document.querySelectorAll('.cell');
        this.restartButton = document.getElementById('restartButton');
        
        this.initializeGame();
    }

    initializeGame() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(cell, index));
            cell.style.transition = 'all 0.3s ease';  // Smooth color transition
        });
        
        this.restartButton.addEventListener('click', () => this.handleRestartGame());
        this.updateStatusColor();
    }

    handleCellClick(cell, index) {
        if (this.gameState[index] !== '' || !this.gameActive) return;

        this.updateCell(cell, index);
        this.handleResultValidation();
    }

    updateCell(cell, index) {
        this.gameState[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.style.color = this.colors[this.currentPlayer];
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add pop-in animation
        cell.style.transform = 'scale(0)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 50);
    }

    updateStatusColor() {
        this.statusDisplay.style.color = this.colors[this.currentPlayer];
    }

    handleResultValidation() {
        let roundWon = false;
        let winningCells = [];

        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            const position1 = this.gameState[a];
            const position2 = this.gameState[b];
            const position3 = this.gameState[c];

            if (position1 === '' || position2 === '' || position3 === '') continue;

            if (position1 === position2 && position2 === position3) {
                roundWon = true;
                winningCells = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            this.statusDisplay.textContent = `Player ${this.currentPlayer} has won!`;
            this.statusDisplay.style.color = this.colors.winner;
            winningCells.forEach(index => {
                this.cells[index].classList.add('winner');
                this.cells[index].style.backgroundColor = this.colors.winner;
                this.cells[index].style.color = '#2d3436';
            });
            this.gameActive = false;
            return;
        }

        const roundDraw = !this.gameState.includes('');
        if (roundDraw) {
            this.statusDisplay.textContent = 'Game ended in a draw!';
            this.statusDisplay.style.color = '#2d3436';
            this.gameActive = false;
            return;
        }

        this.handlePlayerChange();
    }

    handlePlayerChange() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.updateStatusColor();
    }

    handleRestartGame() {
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.updateStatusColor();
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
            cell.style.backgroundColor = 'white';
            cell.style.transform = 'scale(1)';
        });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 