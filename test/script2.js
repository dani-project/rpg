//script2.js

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const message = document.getElementById('message');
    
    // Game state
    const gameState = {
        playerPosition: { row: 0, col: 0 },
        endPosition: { row: 5, col: 5 },
        walls: [
            { row: 1, col: 2 },
            { row: 2, col: 2 },
            { row: 3, col: 2 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 4 }
        ],
        gameOver: false
    };

    // Initialize the grid
    function initializeGrid() {
        grid.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Set start position
                if (row === gameState.playerPosition.row && col === gameState.playerPosition.col) {
                    cell.classList.add('start');
                }
                
                // Set end position
                if (row === gameState.endPosition.row && col === gameState.endPosition.col) {
                    cell.classList.add('end');
                }
                
                // Set walls
                if (gameState.walls.some(wall => wall.row === row && wall.col === col)) {
                    cell.classList.add('wall');
                }
                
                grid.appendChild(cell);
            }
        }
        
        // Place player
        updatePlayerPosition();
    }

    // Update player position on grid
    function updatePlayerPosition() {
        // Clear all player classes
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('player');
            cell.classList.remove('start');
        });
        
        // Get current cell
        const playerIndex = gameState.playerPosition.row * 6 + gameState.playerPosition.col;
        const playerCell = grid.children[playerIndex];
        
        // Add player class (unless it's the end cell)
        if (!(gameState.playerPosition.row === gameState.endPosition.row && 
              gameState.playerPosition.col === gameState.endPosition.col)) {
            playerCell.classList.add('player');
        }
    }

    // Check if position is valid (within bounds and not a wall)
    function isValidPosition(row, col) {
        // Check bounds
        if (row < 0 || row >= 6 || col < 0 || col >= 6) return false;
        
        // Check walls
        return !gameState.walls.some(wall => wall.row === row && wall.col === col);
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (gameState.gameOver) return;
        
        let newRow = gameState.playerPosition.row;
        let newCol = gameState.playerPosition.col;
        
        switch (e.key.toLowerCase()) {
            case 'w':
                newRow--;
                break;
            case 's':
                newRow++;
                break;
            case 'a':
                newCol--;
                break;
            case 'd':
                newCol++;
                break;
            case 'enter':
                // Check if player is on end position
                if (gameState.playerPosition.row === gameState.endPosition.row && 
                    gameState.playerPosition.col === gameState.endPosition.col) {
                    gameWin();
                }
                return;
            default:
                return;
        }
        
        // Update position if valid
        if (isValidPosition(newRow, newCol)) {
            gameState.playerPosition.row = newRow;
            gameState.playerPosition.col = newCol;
            updatePlayerPosition();
        }
    });

    // Game win function
    function gameWin() {
        gameState.gameOver = true;
        message.textContent = 'Congratulations! You reached the end!';
        message.classList.add('show');
    }

    // Initialize the game
    initializeGrid();
});