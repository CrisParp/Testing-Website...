// Global variables
let timerInterval;
let timerSeconds = 0;
let isWhiteTurn = true;
let gameStarted = false;
let boardState = [];
let selectedPiece = null;
let selectedCell = null;

// Initialize the board
function initializeBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    boardState = [];
    
    for (let row = 0; row < 8; row++) {
        let rowArr = [];
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if ((row + col) % 2 !== 0) {
                cell.classList.add('dark');
                if (row < 3) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece', 'white');
                    cell.appendChild(piece);
                } else if (row > 4) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    cell.appendChild(piece);
                }
            }
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            rowArr.push(cell);
            boardElement.appendChild(cell);
        }
        boardState.push(rowArr);
    }
}

// Start game
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    initializeBoard();
    startTimer();
}

// Reset game
function resetGame() {
    gameStarted = false;
    clearInterval(timerInterval);
    timerSeconds = 0;
    document.getElementById('timer').textContent = '00:00';
    startGame();
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Handle cell click (piece movement logic)
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedRow = parseInt(clickedCell.dataset.row);
    const clickedCol = parseInt(clickedCell.dataset.col);

    // Check if cell is dark
    if (!clickedCell.classList.contains('dark')) return;

    const piece = clickedCell.children[0];
    const pieceColor = piece ? piece.classList.contains('white') ? 'white' : 'black' : null;

    // If a piece is selected
    if (selectedPiece) {
        if (isValidMove(clickedRow, clickedCol)) {
            movePiece(clickedRow, clickedCol);
        } else {
            resetSelection();
        }
    } else {
        // If no piece is selected, select a piece if it belongs to the current player
        if (pieceColor === null || (isWhiteTurn && pieceColor === 'black') || (!isWhiteTurn && pieceColor === 'white')) {
            return;
        }

        selectPiece(clickedCell, piece);
    }
}

// Select a piece
function selectPiece(cell, piece) {
    selectedPiece = piece;
    selectedCell = cell;
    cell.classList.add('selected');
}

// Reset selection
function resetSelection() {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedPiece = null;
    selectedCell = null;
}

// Check if move is valid (only 1-square diagonal move for now)
function isValidMove(row, col) {
    const selectedRow = parseInt(selectedCell.dataset.row);
    const selectedCol = parseInt(selectedCell.dataset.col);
    const rowDiff = Math.abs(row - selectedRow);
    const colDiff = Math.abs(col - selectedCol);

    // Basic move validation for one square diagonally
    if (rowDiff === 1 && colDiff === 1) {
        return true;
    }

    return false;
}

// Move piece
function movePiece(row, col) {
    selectedCell.removeChild(selectedPiece);
    boardState[row][col].appendChild(selectedPiece);

    // Toggle turn
    isWhiteTurn = !isWhiteTurn;
    resetSelection();
}

// Event listeners for buttons
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);
