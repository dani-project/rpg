// DOM Elements
const startButton = document.getElementById('start-button');
const continueButton = document.getElementById('continue-button');
const retryButton = document.getElementById('retry-button');
const fightButton = document.getElementById('fight-button');
const runButton = document.getElementById('run-button');
const quitButton = document.getElementById('quit-button');
const popupCloseButton = document.getElementById('popup-close-button');
const backButton = document.getElementById('back-button');

const playerImage = document.getElementById('player-image');
const monsterImage = document.getElementById('monster-image');
const playerHealthFill = document.getElementById('player-health-fill');
const playerHealthText = document.getElementById('player-health-text');
const playerStaminaFill = document.getElementById('player-stamina-fill');
const playerStaminaText = document.getElementById('player-stamina-text');
const monsterHealthFill = document.getElementById('monster-health-fill');
const monsterHealthText = document.getElementById('monster-health-text');
const playerCoinsElement = document.getElementById('player-coins');
const playerCoinsStoreElement = document.getElementById('player-coins-store');
const playerScoreElement = document.getElementById('player-score');
const playerFinalScoreElement = document.getElementById('player-final-score');
const logTextElement = document.getElementById('log-text');
const popupElement = document.getElementById('popup');
const popupMessageElement = document.getElementById('popup-message');

const actionsElement = document.getElementById('actions');
const moveSelectionElement = document.getElementById('move-selection');
const moveButtonsElement = document.getElementById('move-buttons');

// Game State
let playerHealth = 100;
let playerMaxHealth = 100;
let playerDamage = 10;
let playerCoins = 0;
let playerScore = 0;
let playerStamina = 100;
let damageBuffCount = 0;
let doubleCoinsCount = 0;
let monsterHealth = 0;
let monsterDamage = 0;
let coinsMultiplier = 1;

const playerMoves = [];
const allPossibleMoves = [
    { name: "Hollow Purple", baseDamage: [100, 100], staminaCost: 30 },
    { name: "Flare Blitz", baseDamage: [70, 70], staminaCost: 25 },
    { name: "Flying Raijin", baseDamage: [35, 35], staminaCost: 15 },
    { name: "Slash", baseDamage: [20, 20], staminaCost: 5 },
    { name: "Last Resort", baseDamage: [0, 0], staminaCost: 25, special: "50% chance to do 100 or 0 damage" }
];

// Initialize the game
function initGame() {
    // Set up event listeners
    startButton.addEventListener('click', startGame);
    continueButton.addEventListener('click', continueToBattle);
    retryButton.addEventListener('click', retryGame);
    fightButton.addEventListener('click', showMoveSelection);
    runButton.addEventListener('click', runFromBattle);
    quitButton.addEventListener('click', gameOver);
    popupCloseButton.addEventListener('click', closePopup);
    backButton.addEventListener('click', hideMoveSelection);

    // Set up buy button event listeners
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item');
            buyItem(itemId);
        });
    });

    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);

    // Start on the title screen
    showPage('start-page');
}

// Show a specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Start a new game
function startGame() {
    playerHealth = 100;
    playerMaxHealth = 100;
    playerDamage = 10;
    playerCoins = 0;
    playerScore = 0;
    playerStamina = 100;
    damageBuffCount = 0;
    doubleCoinsCount = 0;
    playerMoves.length = 0;
    playerMoves.push({ name: "Basic Punch", baseDamage: [10, 15], staminaCost: 5 });

    updatePlayerInfo();
    encounterMonster();
    showPage('dungeon-page');
}

// Continue to battle from store
function continueToBattle() {
    showPage('dungeon-page');
    encounterMonster();
}

// Retry game after game over
function retryGame() {
    showPage('start-page');
}

// Set up buy button event listeners
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function () {
        const itemId = this.getAttribute('data-item');
        buyItem(itemId);
    });
});

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key;
    const activePageId = document.querySelector('.page.active').id;
    console.log(`Active page: ${activePageId}`); // Debug log

    // Prevent default for keys we're using
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Enter', 'Backspace'].includes(key)) {
        event.preventDefault();
    }

    // Handle popup first
    if (popupElement.classList.contains('active')) {
        if (key === 'Enter' || key === 'Backspace') {
            closePopup();
            return;
        }
        // Don't process other keys when popup is open
        return;
    }

    // Rest of the function remains the same...
    switch (activePageId) {
        case 'start-page':
            if (key === 'Enter') {
                triggerHover('start-button');
                startGame();
            }
            break;

        case 'dungeon-page':
            handleDungeonPageKeys(key);
            break;

        case 'store-page':
            handleStorePageKeys(key);
            break;

        case 'end-page':
            if (key === 'Enter') {
                triggerHover('retry-button');
                retryGame();
            }
            break;
    }
}

function handleDungeonPageKeys(key) {
    console.log(`Handling key ${key} in dungeon page`); // Debug log
    console.log(`Move selection visible? ${!moveSelectionElement.classList.contains('hidden')}`); // Debug log
    // If move selection is open
    if (!moveSelectionElement.classList.contains('hidden')) {
        // Handle move selection (1-4)
        if (key >= '1' && key <= '4') {
            const moveIndex = parseInt(key) - 1;
            if (moveIndex < playerMoves.length) {
                const moveButtons = document.querySelectorAll('.move-button');
                if (moveButtons[moveIndex]) {
                    triggerHover(moveButtons[moveIndex].id || `move-${moveIndex}`);
                    executeMove(playerMoves[moveIndex]);
                }
            }
        }
        // Backspace to go back
        else if (key === 'Backspace') {
            triggerHover('back-button');
            hideMoveSelection();
        }
    }
    // If actions are visible
    else {
        switch (key) {
            case '1':
                console.log('Pressed 1 - attempting to fight'); // Debug log
                if (fightButton && !fightButton.disabled) {
                    triggerHover('fight-button');
                    showMoveSelection();
                } else {
                    console.log('Fight button not available or disabled');
                }
                break;
            case 'Enter':
                // Only trigger fight on Enter if not in move selection
                if (moveSelectionElement.classList.contains('hidden')) {
                    triggerHover('fight-button');
                    showMoveSelection();
                }
                break;
            case '2':
                triggerHover('run-button');
                runFromBattle();
                break;
            case '3':
                triggerHover('quit-button');
                gameOver();
                break;
        }
    }
}

function handleStorePageKeys(key) {
    // Handle item selection (1-9)
    if (key >= '1' && key <= '9') {
        const itemIndex = parseInt(key);
        const buyButtons = document.querySelectorAll('.buy-btn');
        if (buyButtons[itemIndex - 1]) {
            triggerHover(buyButtons[itemIndex - 1].id || `buy-btn-${itemIndex}`);
            buyItem(itemIndex.toString());
        }
    }
    // Enter to continue
    else if (key === 'Enter') {
        triggerHover('continue-button');
        continueToBattle();
    }
}

// Update player info display
function updatePlayerInfo() {
    // Update health
    const healthPercentage = (playerHealth / playerMaxHealth) * 100;
    playerHealthFill.style.width = `${healthPercentage}%`;
    playerHealthText.textContent = `${Math.ceil(playerHealth)}/${playerMaxHealth}`;

    // Update stamina
    const staminaPercentage = playerStamina;
    playerStaminaFill.style.width = `${staminaPercentage}%`;
    playerStaminaText.textContent = `${Math.ceil(playerStamina)}/100`;

    // Update coins and score
    playerCoinsElement.textContent = playerCoins;
    playerCoinsStoreElement.textContent = playerCoins;
    playerScoreElement.textContent = playerScore;
    playerFinalScoreElement.textContent = playerScore;
}

// Generate a random monster encounter
// Update your encounterMonster function:
let initialMonsterHealth = 0; // Add this with your other game state variables

function encounterMonster() {
    const encounterChance = Math.random() * 100;

    if (encounterChance <= 3) {
        // Secret boss
        initialMonsterHealth = 1000;
        monsterHealth = 1000;
        monsterDamage = randomInt(60, 100);
        coinsMultiplier = 5;
        monsterImage.src = 'secret_boss.gif';
        logTextElement.textContent = "\nA secret boss monster appears!";
    } else if (encounterChance <= 9) {
        // Rare boss
        initialMonsterHealth = 500;
        monsterHealth = 500;
        monsterDamage = randomInt(30, 60);
        coinsMultiplier = 3;
        monsterImage.src = 'rare_boss.gif';
        logTextElement.textContent = "\nA rare boss monster appears!";
    } else if (encounterChance <= 24) {
        // Regular boss
        initialMonsterHealth = 200;
        monsterHealth = 200;
        monsterDamage = randomInt(15, 25);
        coinsMultiplier = 2;
        monsterImage.src = 'boss.gif';
        logTextElement.textContent = "\nA boss monster appears!";
    } else {
        // Normal monster
        initialMonsterHealth = randomInt(20, 70);
        monsterHealth = initialMonsterHealth;
        monsterDamage = randomInt(5, 15);
        coinsMultiplier = 1;
        monsterImage.src = 'monster.gif';
        logTextElement.textContent = "\nA wild monster appears!";
    }

    // Update monster health display
    updateMonsterHealthDisplay();
}

function updateMonsterHealthDisplay() {
    const healthPercentage = (monsterHealth / initialMonsterHealth) * 100;
    monsterHealthFill.style.width = `${healthPercentage}%`;
    monsterHealthText.textContent = `${Math.max(0, Math.ceil(monsterHealth))}/${initialMonsterHealth}`;
}

// Initialize the fight button
fightButton.addEventListener('click', function () {
    console.log("Fight button clicked");
    console.log("Player moves:", playerMoves);
    showMoveSelection();
});

// Replace these functions:
function showMoveSelection() {
    console.log("Showing move selection");
    if (!actionsElement || !moveSelectionElement) {
        console.error("Elements not found!");
        return;
    }
    actionsElement.classList.add('hidden');
    moveSelectionElement.classList.remove('hidden');
    renderMoveButtons();
}

function hideMoveSelection() {
    if (!actionsElement || !moveSelectionElement) {
        console.error("Elements not found!");
        return;
    }
    actionsElement.classList.remove('hidden');
    moveSelectionElement.classList.add('hidden');
}

// Initialize back button
backButton.addEventListener('click', hideMoveSelection);

// Initialize event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    fightButton.addEventListener('click', showMoveSelection);
    backButton.addEventListener('click', hideMoveSelection);

    // Make sure elements exist
    if (!actionsElement) console.error("Actions element not found!");
    if (!moveSelectionElement) console.error("Move selection element not found!");
    if (!moveButtonsElement) console.error("Move buttons element not found!");
});

// Render move buttons
function renderMoveButtons() {
    const moveButtonsElement = document.getElementById('move-buttons');
    moveButtonsElement.innerHTML = ''; // Clear existing buttons

    playerMoves.forEach((move, index) => {
        const moveButton = document.createElement('div');
        moveButton.className = 'move-button';
        moveButton.id = `move-${index + 1}`; // Add ID for keyboard targeting
        moveButton.innerHTML = `
            <div class="move-name">${move.name}</div>
            <div class="move-details">
                DMG: ${calculateMoveDamage(move)} | STM: ${move.staminaCost}
                ${move.special ? `<br>${move.special}` : ''}
            </div>
        `;
        moveButton.addEventListener('click', () => executeMove(move));
        moveButtonsElement.appendChild(moveButton);
    });
}

// Trigger button hover effect
function triggerHover(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 200);
    }
}

// Calculate move damage
function calculateMoveDamage(move) {
    const damageMultiplier = 1 + damageBuffCount * 0.1;
    const minDamage = Math.ceil(move.baseDamage[0] * damageMultiplier);
    const maxDamage = Math.ceil(move.baseDamage[1] * damageMultiplier);
    return minDamage === maxDamage ? minDamage : `${minDamage}-${maxDamage}`;
}

// Execute a move
function executeMove(move) {
    if (playerStamina < move.staminaCost) {
        showPopup("Not enough stamina!");
        return;
    }

    playerStamina -= move.staminaCost;
    updatePlayerInfo();
    hideMoveSelection();

    if (move.name === "Last Resort") {
        const success = Math.random() < 0.5;
        if (success) {
            fightWithMove({ ...move, baseDamage: [100, 100] });
        } else {
            logTextElement.innerText = `${move.name} failed (0 damage)!\n`;
            setTimeout(() => monsterCounterAttack(), 1000);
        }
        return;
    }

    fightWithMove(move);
}

// Fight with selected move
function fightWithMove(move) {
    // Disable buttons during attack
    fightButton.disabled = true;
    runButton.disabled = true;
    quitButton.disabled = true;

    // Play attack animation
    playerImage.classList.add('player-attack');
    monsterImage.classList.add('monster-hit');

    setTimeout(() => {
        playerImage.classList.remove('player-attack');
        monsterImage.classList.remove('monster-hit');

        // Calculate damage
        const damageMultiplier = 1 + damageBuffCount * 0.1;
        const minDamage = move.baseDamage[0] * damageMultiplier;
        const maxDamage = move.baseDamage[1] * damageMultiplier;
        const playerAttackDamage = Math.ceil(randomInt(minDamage, maxDamage));

        // Apply damage
        monsterHealth -= playerAttackDamage;
        logTextElement.innerText = ` You used ${move.name} and dealt ${playerAttackDamage} damage!\n`;

        // Update monster health display
        updateMonsterHealthDisplay();

        // Check if monster is defeated
        if (monsterHealth <= 0) {
            logTextElement.innerText += " Congratulations! You defeated the monster!\n";
            const coinsEarned = Math.ceil(randomInt(50, 150) * coinsMultiplier * (1 + doubleCoinsCount * 0.5));
            playerCoins += coinsEarned;
            playerScore += coinsMultiplier;
            logTextElement.innerText += ` You earned ${Math.ceil(coinsEarned)} coins!\n`;
            updatePlayerInfo();

            // Re-enable buttons
            fightButton.disabled = false;
            runButton.disabled = false;
            quitButton.disabled = false;

            // Go to store
            showPage('store-page');
            return;
        }

        // Monster counter attack
        setTimeout(() => monsterCounterAttack(), 1000);
    }, 400);
}

// Monster counter attack
function monsterCounterAttack() {
    monsterImage.classList.add('monster-attack');
    playerImage.classList.add('player-hit');

    setTimeout(() => {
        monsterImage.classList.remove('monster-attack');
        playerImage.classList.remove('player-hit');

        const monsterAttackDamage = Math.ceil(monsterDamage);
        playerHealth -= monsterAttackDamage;
        logTextElement.innerText += ` The monster dealt ${Math.ceil(monsterAttackDamage)} damage to you.\n`;
        updatePlayerInfo();
        updateMonsterHealthDisplay(); // Ensure health is still displayed correctly

        // Check if player is defeated
        if (playerHealth <= 0) {
            gameOver();
        }

        // Re-enable buttons
        fightButton.disabled = false;
        runButton.disabled = false;
        quitButton.disabled = false;
    }, 400);
}

// Run from battle
function runFromBattle() {
    if (Math.random() < 0.7) {
        logTextElement.innerText = "You managed to escape from the monster!\n";
        showPage('store-page');
    } else {
        const monsterAttackDamage = Math.ceil(randomInt(9, 11));
        playerHealth -= monsterAttackDamage;
        logTextElement.innerText = `You failed to escape! The monster dealt ${Math.ceil(monsterAttackDamage)} damage to you.\n`;
        if (playerHealth <= 0) {
            gameOver();
        }
        updatePlayerInfo();
    }
}

// Game over
function gameOver() {
    logTextElement.innerText = "Game over! You were defeated by the monster.";
    updatePlayerInfo();
    showPage('end-page');
}

// Buy item from store
// Buy item from store
function buyItem(item) {
    let affordable = false;
    let message = "";

    switch (item) {
        case '1': // Damage Buff
            if (playerCoins >= 100) {
                playerCoins -= 100;
                damageBuffCount++;
                message = "You bought the Damage Buff (+10% damage)!";
                affordable = true;
            }
            break;

        case '2': // Better Damage Buff
            if (playerCoins >= 250) {
                playerCoins -= 250;
                damageBuffCount += 3;
                message = "You bought the Better Damage Buff (+30% damage)!";
                affordable = true;
            }
            break;

        case '3': // Potion
            if (playerCoins >= 40) {
                playerCoins -= 40;
                playerHealth = Math.min(playerHealth + 20, playerMaxHealth);
                message = "You bought a Potion (+20 HP)!";
                affordable = true;
            }
            break;

        case '4': // Super Potion
            if (playerCoins >= 100) {
                playerCoins -= 100;
                playerHealth = Math.min(playerHealth + 50, playerMaxHealth);
                message = "You bought a Super Potion (+50 HP)!";
                affordable = true;
            }
            break;

        case '5': // Legendary Potion
            if (playerCoins >= 400) {
                playerCoins -= 400;
                playerHealth = Math.min(playerHealth + 1000, playerMaxHealth + 1000);
                playerMaxHealth += 1000;
                message = "You bought a Legendary Potion (+1000 HP)!";
                affordable = true;
            }
            break;

        case '6': // Coins Upgrade
            if (playerCoins >= 250) {
                playerCoins -= 250;
                doubleCoinsCount++;
                message = "You bought the Coins Upgrade (+50% coins earned)!";
                affordable = true;
            }
            break;

        case '7': // Random Move
            if (playerCoins < 200) {
                showPopup("You don't have enough coins for this item!");
                return;
            }

            if (playerMoves.length >= 4) {
                showMoveReplacementPopup();
                return;
            }

            playerCoins -= 200;
            const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
            playerMoves.push(randomMove);
            message = `You learned ${randomMove.name}!`;
            affordable = true;
            break;

        case '8': // STM Potion
            if (playerCoins >= 50) {
                playerCoins -= 50;
                playerStamina = Math.min(playerStamina + 50, 100);
                message = "You bought a STM Potion (+50 STM)!";
                affordable = true;
            }
            break;

        case '9': // Better STM Potion
            if (playerCoins >= 200) {
                playerCoins -= 200;
                playerStamina = Math.min(playerStamina + 200, 100);
                message = "You bought a Better STM Potion (+200 STM)!";
                affordable = true;
            }
            break;

        default:
            message = "Invalid item selection!";
            break;
    }

    if (affordable) {
        showPopup(message);
        updatePlayerInfo();
    } else if (!message) {
        showPopup("You don't have enough coins for this item!");
    }
}

// Show popup to replace a move
function showMoveReplacementPopup() {
    popupMessageElement.innerHTML = `
        <h3>Replace a Move</h3>
        <p>You already have 4 moves. Choose one to replace:</p>
        <div class="move-replace-grid" id="move-replace-grid"></div>
        <button class="custom-button" id="cancel-replace-btn">Cancel</button>
    `;

    const grid = document.getElementById('move-replace-grid');

    playerMoves.forEach((move, index) => {
        const button = document.createElement('button');
        button.className = 'move-replace-btn';
        button.dataset.index = index;
        button.innerHTML = `
            <div class="move-name">${move.name}</div>
            <div class="move-details">
                DMG: ${calculateMoveDamage(move)} | STM: ${move.staminaCost}
                ${move.special ? `<br>${move.special}` : ''}
            </div>
        `;
        button.addEventListener('click', () => {
            if (playerCoins >= 200) {
                replaceMove(index);
            } else {
                showPopup("You don't have enough coins!");
            }
        });
        grid.appendChild(button);
    });

    document.getElementById('cancel-replace-btn').addEventListener('click', closePopup);
    popupElement.classList.remove('hidden');
    popupElement.classList.add('active');
}

function replaceMove(index) {
    const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
    const oldMoveName = playerMoves[index].name;
    playerMoves[index] = randomMove;
    playerCoins -= 200;

    closePopup();
    showPopup(`You replaced ${oldMoveName} with ${randomMove.name}!`);
    updatePlayerInfo();
}

// Show popup message
function showPopup(message) {
    popupMessageElement.textContent = message;
    popupElement.classList.remove('hidden');
    popupElement.classList.add('active');
}

// Close popup
function closePopup() {
    popupElement.classList.remove('active');
    popupElement.classList.add('hidden');
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key;
    const activePageId = document.querySelector('.page.active').id;

    if (activePageId === 'dungeon-page') {
        if (key === '1') {
            triggerHover('fight-button');
            showMoveSelection();
        } else if (key === '2') {
            triggerHover('run-button');
            runFromBattle();
        } else if (key === '3') {
            triggerHover('quit-button');
            gameOver();
        } else if (key === 'Enter') {
            triggerHover('fight-button');
            showMoveSelection();
        }
    } else if (activePageId === 'store-page') {
        if (key >= '1' && key <= '9') {
            triggerHover(`buy-button-${key}`);
            buyItem(key);
        } else if (key == 'Enter') {
            triggerHover('continue-button');
            showPage('dungeon-page');
            encounterMonster();
        }
    } else if (activePageId === 'start-page') {
        if (key == 'Enter') {
            triggerHover('start-button');
            showPage('dungeon-page');
            startGame();
        }
    } else if (activePageId === 'end-page') {
        if (key == 'Enter') {
            triggerHover('retry-button');
            showPage('start-page');
            startGame();
        }
    } else if (key == 'Backspace') {
        closePopup();
    }
}

// Trigger button hover effect
function triggerHover(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 300);
    }
}

// Generate random integer
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize the game when loaded
window.addEventListener('DOMContentLoaded', initGame);