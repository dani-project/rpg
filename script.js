document.getElementById('start-button').addEventListener('click', () => {
    showPage('dungeon-page');
    startGame();
});

document.getElementById('continue-button').addEventListener('click', () => {
    showPage('dungeon-page');
    encounterMonster();
});

document.getElementById('retry-button').addEventListener('click', () => {
    showPage('start-page');
});

document.getElementById('fight-button').addEventListener('click', () => {
    fight();
});

document.getElementById('run-button').addEventListener('click', () => {
    run();
});

document.getElementById('quit-button').addEventListener('click', () => {
    gameOver();
});

document.getElementById('popup-close-button').addEventListener('click', () => {
    closePopup();
});

document.getElementById('back-button').addEventListener('click', () => {
    hideMoveSelection();
});

document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const item = event.target.dataset.item;
        buyItem(item);
    });
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const activePageId = document.querySelector('.page.active').id;

    if (activePageId === 'dungeon-page') {
        if (key === '1') {
            triggerHover('fight-button');
            fight();
        } else if (key === '2') {
            triggerHover('run-button');
            run();
        } else if (key === '3') {
            triggerHover('quit-button');
            gameOver();
        } else if (key === 'Enter') {
            triggerHover('fight-button');
            fight();
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
});

function triggerHover(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 300);
    }
}

let playerHealth, playerDamage, playerCoins, playerScore, damageBuffCount, doubleCoinsCount, playerStamina;
let monsterHealth, monsterDamage, coinsMultiplier;
const playerMoves = [];
const allPossibleMoves = [
    { name: "Hollow Purple", baseDamage: [100, 100], staminaCost: 30 },
    { name: "Flare Blitz", baseDamage: [70, 70], staminaCost: 25 },
    { name: "Flying Raijin", baseDamage: [35, 35], staminaCost: 15 },
    { name: "Slash", baseDamage: [20, 20], staminaCost: 5 },
    { name: "Last Resort", baseDamage: [0, 0], staminaCost: 25, special: "50% chance to do 100 or 0 damage" }
];

const playerImage = document.getElementById('player-image');
const monsterImage = document.getElementById('monster-image');
const playerHealthElement = document.getElementById('player-health');
const playerStaminaElement = document.getElementById('player-stamina');
const playerCoinsElement = document.getElementById('player-coins');
const playerScoreElement = document.getElementById('player-score');
const playerCoinsStoreElement = document.getElementById('player-coins-store');
const playerFinalScoreElement = document.getElementById('player-final-score');
const monsterHealthElement = document.getElementById('monster-health');
const logTextElement = document.getElementById('log-text');
const popupElement = document.getElementById('popup');
const popupMessageElement = document.getElementById('popup-message');
const moveSelectionElement = document.getElementById('move-selection');
const moveButtonsElement = document.getElementById('move-buttons');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function startGame() {
    playerHealth = 100;
    playerDamage = 10;
    playerCoins = 0;
    playerScore = 0;
    playerStamina = 100;
    damageBuffCount = 0;
    doubleCoinsCount = 0;
    playerMoves.length = 0;
    playerMoves.push({ name: "Basic Punch", baseDamage: [10, 15], staminaCost: 5 }); // Changed to 5 STM
    updatePlayerInfo();
    encounterMonster();
}

function updatePlayerInfo() {
    playerHealthElement.textContent = `Health: ${Math.ceil(playerHealth)} HP`;
    playerStaminaElement.textContent = `Stamina: ${Math.ceil(playerStamina)} STM`;
    playerCoinsElement.textContent = `Coins: ${Math.ceil(playerCoins)}`;
    playerCoinsStoreElement.textContent = `Coins: ${Math.ceil(playerCoins)}`;
    playerScoreElement.textContent = `Score: ${Math.ceil(playerScore)}`;
    playerFinalScoreElement.textContent = `Score: ${Math.ceil(playerScore)}`;
}

function randomInt(min, max) {
    return Math.ceil(Math.random() * (max - min + 1)) + min - 1;
}

function encounterMonster() {
    const encounterChance = Math.random() * 100;

    if (encounterChance <= 3) {
        monsterHealth = 1000;
        monsterDamage = randomInt(60, 100);
        coinsMultiplier = 5;
        monsterImage.src = 'secret_boss.gif';
        logTextElement.textContent = "\nA secret boss monster appears!";
    } else if (encounterChance <= 9) {
        monsterHealth = 500;
        monsterDamage = randomInt(30, 60);
        coinsMultiplier = 3;
        monsterImage.src = 'rare_boss.gif';
        logTextElement.textContent = "\nA rare boss monster appears!";
    } else if (encounterChance <= 24) {
        monsterHealth = 200;
        monsterDamage = randomInt(15, 25);
        coinsMultiplier = 2;
        monsterImage.src = 'boss.gif';
        logTextElement.textContent = "\nA boss monster appears!";
    } else {
        monsterHealth = randomInt(20, 70);
        monsterDamage = randomInt(5, 15);
        coinsMultiplier = 1;
        monsterImage.src = 'monster.gif';
        logTextElement.textContent = "\nA wild monster appears!";
    }
    monsterHealthElement.textContent = `Monster Health: ${Math.ceil(monsterHealth)} HP`;
}

function showMoveSelection() {
    document.getElementById('actions').classList.add('hidden');
    moveSelectionElement.classList.remove('hidden');
    renderMoveButtons();
}

function hideMoveSelection() {
    document.getElementById('actions').classList.remove('hidden');
    moveSelectionElement.classList.add('hidden');
}

function renderMoveButtons() {
    moveButtonsElement.innerHTML = '';
    playerMoves.forEach((move, index) => {
        const moveButton = document.createElement('div');
        moveButton.className = 'move-button';
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

function calculateMoveDamage(move) {
    const damageMultiplier = 1 + damageBuffCount * 0.1;
    const minDamage = Math.ceil(move.baseDamage[0] * damageMultiplier);
    const maxDamage = Math.ceil(move.baseDamage[1] * damageMultiplier);
    return minDamage === maxDamage ? minDamage : `${minDamage}-${maxDamage}`;
}

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
            // Force 100 damage on success
            fightWithMove({...move, baseDamage: [100, 100]});
        } else {
            logTextElement.innerText = `${move.name} failed (0 damage)!\n`;
            setTimeout(() => monsterCounterAttack(), 1000);
        }
        return;
    }

    fightWithMove(move);
}

function fightWithMove(move) {
    const fightButton = document.getElementById('fight-button');
    const runButton = document.getElementById('run-button');
    const quitButton = document.getElementById('quit-button');
    
    fightButton.disabled = true;
    runButton.disabled = true;
    quitButton.disabled = true;

    playerImage.classList.add('player-attack');
    monsterImage.classList.add('monster-hit');

    setTimeout(() => {
        playerImage.classList.remove('player-attack');
        monsterImage.classList.remove('monster-hit');

        const damageMultiplier = 1 + damageBuffCount * 0.1;
        const minDamage = move.baseDamage[0] * damageMultiplier;
        const maxDamage = move.baseDamage[1] * damageMultiplier;
        const playerAttackDamage = Math.ceil(randomInt(minDamage, maxDamage));
        
        monsterHealth -= playerAttackDamage;
        logTextElement.innerText = ` You used ${move.name} and dealt ${playerAttackDamage} damage!\n`;
        monsterHealthElement.textContent = `Monster Health: ${Math.ceil(monsterHealth)} HP`;

        if (monsterHealth <= 0) {
            logTextElement.innerText += " Congratulations! You defeated the monster!\n";
            const coinsEarned = Math.ceil(randomInt(30, 120) * coinsMultiplier * (1 + doubleCoinsCount * 0.5));
            playerCoins += coinsEarned;
            playerScore += coinsMultiplier;
            logTextElement.innerText += ` You earned ${Math.ceil(coinsEarned)} coins!\n`;
            updatePlayerInfo();
            
            fightButton.disabled = false;
            runButton.disabled = false;
            quitButton.disabled = false;
            
            showPage('store-page');
            return;
        }

        setTimeout(() => monsterCounterAttack(), 1000);
    }, 400);
}

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

        if (playerHealth <= 0) {
            gameOver();
        }

        document.getElementById('fight-button').disabled = false;
        document.getElementById('run-button').disabled = false;
        document.getElementById('quit-button').disabled = false;
    }, 400);
}

function fight() {
    showMoveSelection();
}

function run() {
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

function gameOver() {
    logTextElement.innerText = "Game over! You were defeated by the monster.";
    updatePlayerInfo();
    showPage('end-page');
}

function buyItem(item) {
    let affordable = false;
    switch (item) {
        case '1':
            if (playerCoins >= 100) {
                playerCoins -= 100;
                damageBuffCount++;
                logTextElement.innerText = "You bought the Damage Buff!\n";
                affordable = true;
            }
            break;
        case '2':
            if (playerCoins >= 250) {
                playerCoins -= 250;
                damageBuffCount += 3;
                logTextElement.innerText = "You bought the Better Damage Buff!\n";
                affordable = true;
            }
            break;
        case '3':
            if (playerCoins >= 400) {
                playerCoins -= 400;
                playerHealth += 1000;
                logTextElement.innerText = "You bought a Legendary Health Potion and restored 1000 HP!\n";
                affordable = true;
            }
            break;
        case '4':
            if (playerCoins >= 100) {
                playerCoins -= 100;
                playerHealth += 50;
                logTextElement.innerText = "You bought a Super Potion and restored 50 HP!\n";
                affordable = true;
            }
            break;
        case '5':
            if (playerCoins >= 40) {
                playerCoins -= 40;
                playerHealth += 20;
                logTextElement.innerText = "You bought a Potion and restored 20 HP!\n";
                affordable = true;
            }
            break;
        case '6':
            if (playerCoins >= 250) {
                playerCoins -= 250;
                doubleCoinsCount++;
                logTextElement.innerText = "You bought the 50% More Coins item!\n";
                affordable = true;
            }
            break;
        case '7':
            if (playerCoins >= 200) {
                if (playerMoves.length >= 4) {
                    showPopup("You already have 4 moves! Replace one?");
                    return;
                }
                playerCoins -= 200;
                const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
                playerMoves.push(randomMove);
                logTextElement.innerText = `You learned ${randomMove.name}!\n`;
                affordable = true;
            }
            break;
        case '8':
            if (playerCoins >= 50) { // Changed to 50 coins
                playerCoins -= 50;
                playerStamina += 50;
                logTextElement.innerText = "You bought a STM Potion and restored 50 STM!\n";
                affordable = true;
            }
            break;
        case '9':
            if (playerCoins >= 200) {
                playerCoins -= 200;
                playerStamina += 200;
                logTextElement.innerText = "You bought a Better STM Potion and restored 200 STM!\n";
                affordable = true;
            }
            break;
        default:
            logTextElement.innerText = "Invalid choice!\n";
            break;
    }

    if (affordable) {
        updatePlayerInfo();
        showPage('dungeon-page');
        encounterMonster();
    } else {
        showPopup("You can't afford this item!");
    }
}

function showPopup(message) {
    popupMessageElement.textContent = message;
    popupElement.classList.add('active');
}

function closePopup() {
    popupElement.classList.remove('active');
}

showPage('start-page');