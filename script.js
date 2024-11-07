// Game state variables
let board = [];
let selectedPiece = null;
let isWhiteTurn = true;

// Initialize board and pieces
function initializeBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = [];
    
    for (let row = 0; row < 8; row++) {
        const rowArray = [];
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', (row + col) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            
            if ((row + col) % 2 !== 0) { // Place pieces only on dark squares
                if (row < 3) {
                    const piece = createPiece('white');
                    cell.appendChild(piece);
                } else if (row > 4) {
                    const piece = createPiece('black');
                    cell.appendChild(piece);
                }
            }

            rowArray.push(cell);
            boardElement.appendChild(cell);
        }
        board.push(rowArray);
    }
}

// Create a piece element
function createPiece(color) {
    const piece = document.createElement('div');
    piece.classList.add('piece', color);
    piece.dataset.color = color;
    piece.dataset.king = false;
    return piece;
}

// Handle cell click events
function handleCellClick(event) {
    const cell = event.currentTarget;
    const piece = cell.querySelector('.piece');

    if (selectedPiece) {
        // Move the selected piece if it's a valid move
        const validMove = isValidMove(cell);
        if (validMove) {
            movePiece(selectedPiece, cell);
            checkKingPromotion(cell);
            toggleTurn();
        }
        deselectPiece();
    } else if (piece && piece.dataset.color === (isWhiteTurn ? 'white' : 'black')) {
        // Select a piece if it matches the current player's turn
        selectPiece(piece);
    }
}

// Select a piece
function selectPiece(piece) {
    piece.classList.add('selected');
    selectedPiece = piece;
}

// Deselect the currently selected piece
function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
    }
    selectedPiece = null;
}

// Check if a move is valid, including captures
function isValidMove(cell) {
    if (!selectedPiece) return false;

    const startRow = parseInt(selectedPiece.parentElement.dataset.row);
    const startCol = parseInt(selectedPiece.parentElement.dataset.col);
    const targetRow = parseInt(cell.dataset.row);
    const targetCol = parseInt(cell.dataset.col);
    const rowDiff = targetRow - startRow;
    const colDiff = targetCol - startCol;

    // Regular move (one square diagonally)
    if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1 && !cell.querySelector('.piece')) {
        return true;
    }

    // Capture move (two squares diagonally)
    if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
        const middleRow = (startRow + targetRow) / 2;
        const middleCol = (startCol + targetCol) / 2;
        const middleCell = board[middleRow][middleCol];
        const middlePiece = middleCell.querySelector('.piece');

        // Check if there's an opponent piece to capture
        if (middlePiece && middlePiece.dataset.color !== selectedPiece.dataset.color) {
            middleCell.removeChild(middlePiece); // Remove captured piece
            return true;
        }
    }

    return false;
}

// Move the piece to the target cell
function movePiece(piece, targetCell) {
    targetCell.appendChild(piece);
}

// Toggle turns between players
function toggleTurn() {
    isWhiteTurn = !isWhiteTurn;
}

// Check for king promotion
function checkKingPromotion(cell) {
    const row = parseInt(cell.dataset.row);
    const piece = cell.querySelector('.piece');

    if (piece && ((piece.dataset.color === 'white' && row === 7) || (piece.dataset.color === 'black' && row === 0))) {
        piece.dataset.king = "true"; // Set king status
        piece.classList.add('king'); // Apply king CSS class for styling
    }
}

// Initialize the game on page load
window.onload = initializeBoard;
