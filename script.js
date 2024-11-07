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
        const validMove = isValidMove(cell);
        if (validMove) {
            movePiece(selectedPiece, cell);
            checkKingPromotion(cell);
            toggleTurn();
        }
        deselectPiece();
    } else if (piece && piece.dataset.color === (isWhiteTurn ? 'white' : 'black')) {
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

// Validate move for regular and king pieces, including capturing logic
function isValidMove(targetCell) {
    if (!selectedPiece) return false;

    const startRow = parseInt(selectedPiece.parentElement.dataset.row);
    const startCol = parseInt(selectedPiece.parentElement.dataset.col);
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);
    const rowDiff = targetRow - startRow;
    const colDiff = targetCol - startCol;

    const isKing = selectedPiece.dataset.king === "true";

    if (isKing) {
        // Kings can move any number of squares in any direction
        if (Math.abs(rowDiff) === Math.abs(colDiff)) {
            return canCaptureAlongPath(startRow, startCol, targetRow, targetCol);
        }
    } else {
        // Regular pieces can move only one square forward
        const direction = selectedPiece.dataset.color === 'white' ? 1 : -1;

        // Regular move
        if (Math.abs(rowDiff) === 1 && rowDiff === direction && Math.abs(colDiff) === 1 && !targetCell.querySelector('.piece')) {
            return !hasMandatoryCapture(); // Check if no capture is available
        }

        // Capture move (two squares forward)
        if (Math.abs(rowDiff) === 2 && rowDiff === 2 * direction && Math.abs(colDiff) === 2) {
            const middleRow = (startRow + targetRow) / 2;
            const middleCol = (startCol + targetCol) / 2;
            const middleCell = board[middleRow][middleCol];
            const middlePiece = middleCell.querySelector('.piece');

            if (middlePiece && middlePiece.dataset.color !== selectedPiece.dataset.color) {
                middleCell.removeChild(middlePiece);
                return true;
            }
        }
    }

    return false;
}

// Check for mandatory captures
function hasMandatoryCapture() {
    for (const row of board) {
        for (const cell of row) {
            const piece = cell.querySelector('.piece');
            if (piece && piece.dataset.color === (isWhiteTurn ? 'white' : 'black')) {
                if (canCaptureFromCell(cell)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check if a piece can capture from a given cell
function canCaptureFromCell(cell) {
    const piece = cell.querySelector('.piece');
    if (!piece) return false;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Check all four directions for a possible capture
    const directions = piece.dataset.king === "true" ?
        [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
        [[piece.dataset.color === 'white' ? 1 : -1, 1], [piece.dataset.color === 'white' ? 1 : -1, -1]];

    for (const [dr, dc] of directions) {
        if (canCaptureAlongPath(row, col, row + dr * 2, col + dc * 2)) {
            return true;
        }
    }
    return false;
}

// Check if a piece can capture along a path (used by kings for multi-square captures)
function canCaptureAlongPath(startRow, startCol, targetRow, targetCol) {
    const rowStep = targetRow > startRow ? 1 : -1;
    const colStep = targetCol > startCol ? 1 : -1;
    let foundOpponentPiece = false;

    let row = startRow + rowStep;
    let col = startCol + colStep;

    while (row !== targetRow && col !== targetCol) {
        const cell = board[row][col];
        const piece = cell.querySelector('.piece');

        if (piece) {
            if (piece.dataset.color === selectedPiece.dataset.color || foundOpponentPiece) {
                return false; // Blocked by a friendly piece or already found an opponent
            }
            foundOpponentPiece = true; // Found an opponent piece to capture
        }
        row += rowStep;
        col += colStep;
    }

    if (foundOpponentPiece) {
        // Remove captured piece
        board[(startRow + targetRow) / 2][(startCol + targetCol) / 2].innerHTML = '';
        return true;
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
