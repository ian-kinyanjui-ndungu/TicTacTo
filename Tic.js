// Gameboard Module: Manages the game state and board logic
const Gameboard = (() => {
    let board = Array(9).fill(null);
    
    const getBoard = () => [...board];
    
    const setMark = (index, mark) => {
        if (index < 0 || index > 8 || board[index] !== null) {
            return false;
        }
        board[index] = mark;
        return true;
    };
    
    const reset = () => {
        board = Array(9).fill(null);
    };
    
    // Check for winning combinations
    const checkWin = () => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return {
                    winner: board[a],
                    combination: combination
                };
            }
        }
        
        return null;
    };
    
    // Check if the board is full (tie)
    const checkTie = () => {
        return board.every(cell => cell !== null);
    };
    
    return {
        getBoard,
        setMark,
        reset,
        checkWin,
        checkTie
    };
})();

// Player Factory: Creates player objects
const Player = (name, mark) => {
    return {
        name,
        mark
    };
};

// Game Controller Module: Manages game flow and logic
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let winResult = null;
    
    const initialize = (player1Name, player2Name) => {
        players = [
            Player(player1Name || "Player 1", "X"),
            Player(player2Name || "Player 2", "O")
        ];
        
        currentPlayerIndex = 0;
        gameOver = false;
        winResult = null;
        Gameboard.reset();
    };
    
    const getCurrentPlayer = () => players[currentPlayerIndex];
    
    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };
    
    const playTurn = (index) => {
        if (gameOver) return false;
        
        const currentPlayer = getCurrentPlayer();
        const validMove = Gameboard.setMark(index, currentPlayer.mark);
        
        if (validMove) {
            // Check for win
            winResult = Gameboard.checkWin();
            if (winResult) {
                gameOver = true;
                return { status: "win", result: winResult };
            }
            
            // Check for tie
            if (Gameboard.checkTie()) {
                gameOver = true;
                return { status: "tie" };
            }
            
            // Switch player if game continues
            switchPlayer();
            return { status: "continue" };
        }
        
        return false;
    };
    
    const getWinResult = () => winResult;
    const isGameOver = () => gameOver;
    
    return {
        initialize,
        getCurrentPlayer,
        playTurn,
        getWinResult,
        isGameOver
    };
})();

// Display Controller Module: Handles DOM manipulation and user interface
const DisplayController = (() => {
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const resultScreen = document.getElementById("result-screen");
    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const playAgainBtn = document.getElementById("play-again-btn");
    const playerTurn = document.getElementById("player-turn");
    const resultMessage = document.getElementById("result-message");
    const cells = document.querySelectorAll(".cell");
    
    const showScreen = (screen) => {
        startScreen.classList.remove("active");
        gameScreen.classList.remove("active");
        resultScreen.classList.remove("active");
        screen.classList.add("active");
    };
    
    const updateBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.classList.remove("x", "o");
            if (board[index] === "X") {
                cell.classList.add("x");
            } else if (board[index] === "O") {
                cell.classList.add("o");
            }
        });
    };
    
    const updatePlayerTurn = () => {
        const currentPlayer = GameController.getCurrentPlayer();
        playerTurn.textContent = `${currentPlayer.name}'s turn (${currentPlayer.mark})`;
        playerTurn.className = currentPlayer.mark === "X" ? "player-x" : "player-o";
    };
    
    const highlightWinningCombination = (combination) => {
        combination.forEach(index => {
            cells[index].classList.add("winning");
        });
    };
    
    const clearHighlights = () => {
        cells.forEach(cell => {
            cell.classList.remove("winning");
        });
    };
    
    const showResult = (result) => {
        if (result.status === "win") {
            const winner = GameController.getCurrentPlayer();
            resultMessage.textContent = `${winner.name} wins!`;
            highlightWinningCombination(result.result.combination);
        } else if (result.status === "tie") {
            resultMessage.textContent = "It's a tie!";
        }
        showScreen(resultScreen);
    };
    
    const initializeGame = () => {
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();
        
        GameController.initialize(player1Name, player2Name);
        clearHighlights();
        updateBoard();
        updatePlayerTurn();
        showScreen(gameScreen);
    };
    
    const handleCellClick = (e) => {
        const index = parseInt(e.target.dataset.index);
        const result = GameController.playTurn(index);
        
        if (result) {
            updateBoard();
            if (result.status === "continue") {
                updatePlayerTurn();
            } else {
                showResult(result);
            }
        }
    };
    
    const bindEvents = () => {
        startBtn.addEventListener("click", initializeGame);
        restartBtn.addEventListener("click", initializeGame);
        playAgainBtn.addEventListener("click", () => {
            showScreen(startScreen);
        });
        
        cells.forEach(cell => {
            cell.addEventListener("click", handleCellClick);
        });
    };
    
    const init = () => {
        bindEvents();
        showScreen(startScreen);
    };
    
    return {
        init
    };
})();

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", DisplayController.init);