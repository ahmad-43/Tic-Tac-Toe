// --- DOM Element Selection ---
// Selecting the game board and all individual cells
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');

// Selecting display elements for status and scores
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');

// Selecting buttons for switching between game modes
const pvpBtn = document.getElementById('pvpBtn');
const pvcBtn = document.getElementById('pvcBtn');

// --- Game State Variables ---
// gameActive controls whether the board can still be clicked
let gameActive = true;
// currentPlayer keeps track of whose turn it is, starting with 'X'
let currentPlayer = 'X';
// gameState represents the 3x3 board, initialized with 9 empty strings
let gameState = ['', '', '', '', '', '', '', '', ''];

// Initialize scores to 0
let scoreX = 0;
let scoreO = 0;

// Flag to determine if the user is playing against the computer
let isVsComputer = false;

// --- Initialization ---
// Display the initial or loaded scores on the screen
scoreXDisplay.innerText = scoreX;
scoreODisplay.innerText = scoreO;

// Define the 8 possible winning combinations (indexes of the gameState array)
// First 3 are rows, next 3 are columns, last 2 are diagonals
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// --- Core Game Functions ---

// Function to update the internal game state and visual board after a valid move
function handleCellPlayed(clickedCell, clickedCellIndex) {
    // Update our array tracking the board
    gameState[clickedCellIndex] = currentPlayer;
    // Visually update the cell to show 'X' or 'O'
    clickedCell.innerText = currentPlayer;
    // Add CSS class for color styling specific to the player
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

// Function to switch the current player from 'X' to 'O' or vice versa
function handlePlayerChange() {
    // Toggle the current player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Update the status text above the board to show who's next
    statusDisplay.innerText = `Player ${currentPlayer}'s Turn`;
    
    // Dynamically change the text color depending on the player
    if(currentPlayer === 'X') {
        statusDisplay.style.color = 'var(--x-color)';
    } else {
        statusDisplay.style.color = 'var(--o-color)';
    }
    
    // If it's Player vs Computer mode, and it's O's (Computer's) turn, trigger the AI
    if (isVsComputer && currentPlayer === 'O' && gameActive) {
        // Add a small 500ms delay to make the computer's move feel more natural
        setTimeout(makeComputerMove, 500);
    }
}

// Function to check if the last move resulted in a win or a draw
function handleResultValidation() {
    let roundWon = false;
    let winningCells = [];

    // Loop through all 8 possible winning combinations
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        
        // Grab the values at the current winning combination's indexes
        const a = gameState[winCondition[0]];
        const b = gameState[winCondition[1]];
        const c = gameState[winCondition[2]];

        // If any of the cells are empty, this combination is not a win, skip to the next
        if (a === '' || b === '' || c === '') {
            continue;
        }

        // If all three cells match, the game is won
        if (a === b && b === c) {
            roundWon = true;
            winningCells = winCondition;
            break;
        }
    }

    // Block to handle what happens when a player wins
    if (roundWon) {
        // Update the status text and color to celebrate the winner
        statusDisplay.innerText = `Player ${currentPlayer} Wins!`;
        statusDisplay.style.color = 'var(--win-color)';
        
        // Stop the game to prevent further moves
        gameActive = false;
        
        // Highlight the specific cells that formed the winning line
        winningCells.forEach(index => {
            cells[index].classList.add('win');
        });

        // Update the winning player's score
        if (currentPlayer === 'X') {
            scoreX++;
            scoreXDisplay.innerText = scoreX;
        } else {
            scoreO++;
            scoreODisplay.innerText = scoreO;
        }

        return; // Exit the function as the game is over
    }

    // Check if there are no empty spaces left, meaning it's a draw
    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        // Update status display for a draw
        statusDisplay.innerText = 'Game ended in a draw!';
        statusDisplay.style.color = 'var(--text-color)';
        gameActive = false;
        return; // Exit the function as the game is over
    }

    // If nobody won and it's not a draw, pass the turn to the other player
    handlePlayerChange();
}

// Function triggered when a user clicks on a cell
function handleCellClick(event) {
    // Prevent the user from clicking when it is the computer's turn
    if (isVsComputer && currentPlayer === 'O') return;

    // Identify which HTML cell element was clicked
    const clickedCell = event.target;
    
    // Extract the index of the clicked cell from its HTML data attribute
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if the cell is already occupied or if the game has finished
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return; // Ignore the click
    }

    // Process the valid move
    handleCellPlayed(clickedCell, clickedCellIndex);
    
    // Check if the move resulted in a win or draw
    handleResultValidation();
}

// Function to reset the game state and UI to start a new round
function handleRestartGame() {
    // Reset internal logic variables
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    
    // Reset the visual status display
    statusDisplay.innerText = `Player ${currentPlayer}'s Turn`;
    statusDisplay.style.color = 'var(--x-color)';
    
    // Clear all the visual marks and classes from the HTML cells
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o', 'win');
    });
}

// --- Event Listeners ---
// Attach the click event to every cell on the board
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// Attach the reset function to the Restart Game button
resetBtn.addEventListener('click', handleRestartGame);

// Event listener for switching to "Player vs Player" mode
pvpBtn.addEventListener('click', () => {
    isVsComputer = false; // Disable AI
    // Update button visual states
    pvpBtn.classList.add('active');
    pvcBtn.classList.remove('active');
    // Restart the game automatically when mode changes
    handleRestartGame();
});

// Event listener for switching to "Player vs Computer" mode
pvcBtn.addEventListener('click', () => {
    isVsComputer = true; // Enable AI
    // Update button visual states
    pvcBtn.classList.add('active');
    pvpBtn.classList.remove('active');
    // Restart the game automatically when mode changes
    handleRestartGame();
});

// Set the initial color of the status text when the page loads
statusDisplay.style.color = 'var(--x-color)';

// --- AI Logic (Minimax Algorithm) ---

// Main function to trigger the computer's move
function makeComputerMove() {
    // Failsafe: Don't let computer play if the game is already over
    if (!gameActive) return;

    // Start with the lowest possible score for the maximizer (computer)
    let bestScore = -Infinity;
    let bestMove;
    
    // Create a copy of the current board state to simulate moves
    let board = [...gameState];
    
    // Optimization: If it's the computer's first move and the center is open, grab it immediately
    // This saves unnecessary calculation time for the very first move
    if (board.filter(cell => cell === '').length === 8 && board[4] === '') {
        bestMove = 4;
    } else {
        // Loop through all empty spots on the board
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                // Simulate placing an 'O' in this spot
                board[i] = 'O';
                // Call the minimax algorithm to evaluate how good this move is
                // depth is 0, and next turn is the human's turn (minimizing player)
                let score = minimax(board, 0, false);
                // Undo the move to keep testing other spots
                board[i] = '';
                
                // If the simulated move yields a better score, update our best move
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
    }

    // Once the best move is found, execute it on the actual game board
    if (bestMove !== undefined) {
        const cellToClick = document.querySelector(`.cell[data-index="${bestMove}"]`);
        handleCellPlayed(cellToClick, bestMove);
        handleResultValidation();
    }
}

// Helper function exclusively used by Minimax to check for terminal states (win/lose/draw)
function checkWinForMinimax(board) {
    // Check all combinations for a win
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            // Return 'X' or 'O' depending on who won
            return board[a];
        }
    }
    // If no one won and board is full, return 'tie'
    if (!board.includes('')) return 'tie';
    
    // Game is still ongoing
    return null;
}

// The recursive Minimax algorithm that simulates all possible future moves
function minimax(board, depth, isMaximizing) {
    // Check if the current simulated board is in a terminal state
    let result = checkWinForMinimax(board);
    
    // Base cases: Return a score if the game is over in this simulation
    // We factor in depth to prefer faster wins over slower ones
    if (result === 'O') return 10 - depth; // Computer wins (good)
    if (result === 'X') return -10 + depth; // Human wins (bad)
    if (result === 'tie') return 0; // Draw (neutral)

    // If it's the computer's turn to simulate a move (seeking highest score)
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O'; // Simulate computer move
                // Call minimax recursively for the next turn (human's turn)
                let score = minimax(board, depth + 1, false);
                board[i] = ''; // Undo move
                // Keep the highest possible score
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
        
    // If it's the human's turn to simulate a move (seeking lowest score)
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X'; // Simulate human move
                // Call minimax recursively for the next turn (computer's turn)
                let score = minimax(board, depth + 1, true);
                board[i] = ''; // Undo move
                // Keep the lowest possible score (worst outcome for computer)
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
