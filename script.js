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
        if (key >= '1' && key <= '7') {
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
        closePopup()
    }
});

function triggerHover(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('hover');
        setTimeout(() => button.classList.remove('hover'), 300); // Match with your CSS transition duration
    }
}


let playerHealth, playerDamage, playerCoins, playerScore, damageBuffCount, doubleCoinsCount;
let monsterHealth, monsterDamage, coinsMultiplier;
const playerImage = document.getElementById('player-image');
const monsterImage = document.getElementById('monster-image');
const playerHealthElement = document.getElementById('player-health');
const playerCoinsElement = document.getElementById('player-coins');
const playerScoreElement = document.getElementById('player-score');
const playerCoinsStoreElement = document.getElementById('player-coins-store');
const playerFinalScoreElement = document.getElementById('player-final-score');
const monsterHealthElement = document.getElementById('monster-health');
const logTextElement = document.getElementById('log-text');
const popupElement = document.getElementById('popup');
const popupMessageElement = document.getElementById('popup-message');

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
    damageBuffCount = 0;
    doubleCoinsCount = 0;
    updatePlayerInfo();
    encounterMonster();
}

function updatePlayerInfo() {
    playerHealthElement.textContent = `Health: ${Math.ceil(playerHealth)} HP`;
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
        // Secret boss (3%)
        monsterHealth = 1000;
        monsterDamage = randomInt(60, 100);
        coinsMultiplier = 5;
        monsterImage.src = 'secret_boss.gif';
        logTextElement.textContent = "\nA secret boss monster appears!";
    } else if (encounterChance <= 9) {
        // Rare boss (6%)
        monsterHealth = 500;
        monsterDamage = randomInt(30, 60);
        coinsMultiplier = 3;
        monsterImage.src = 'rare_boss.gif';
        logTextElement.textContent = "\nA rare boss monster appears!";
    } else if (encounterChance <= 24) {
        // Regular boss (15%)
        monsterHealth = 200;
        monsterDamage = randomInt(15, 25);
        coinsMultiplier = 2;
        monsterImage.src = 'boss.gif';
        logTextElement.textContent = "\nA boss monster appears!";
    } else {
        // Regular monster (remaining 76%)
        monsterHealth = randomInt(20, 70);
        monsterDamage = randomInt(5, 15);
        coinsMultiplier = 1;
        monsterImage.src = 'monster.gif';
        logTextElement.textContent = "\nA wild monster appears!";
    }
    monsterHealthElement.textContent = `Monster Health: ${Math.ceil(monsterHealth)} HP`;
}

function fight() {
    // Disable buttons during animation
    const fightButton = document.getElementById('fight-button');
    const runButton = document.getElementById('run-button');
    const quitButton = document.getElementById('quit-button');
    
    fightButton.disabled = true;
    runButton.disabled = true;
    quitButton.disabled = true;

    // Player attack sequence
    playerImage.classList.add('player-attack');
    monsterImage.classList.add('monster-hit');

    setTimeout(() => {
        // Remove animations after they complete
        playerImage.classList.remove('player-attack');
        monsterImage.classList.remove('monster-hit');

        // Calculate player damage
        const playerAttackDamage = Math.ceil(randomInt(12, 18) * (1 + damageBuffCount * 0.1));
        monsterHealth -= playerAttackDamage;
        logTextElement.innerText = ` You dealt ${Math.ceil(playerAttackDamage)} damage to the monster.\n`;
        monsterHealthElement.textContent = `Monster Health: ${Math.ceil(monsterHealth)} HP`;

        if (monsterHealth <= 0) {
            logTextElement.innerText += " Congratulations! You defeated the monster!\n";
            const coinsEarned = Math.ceil(randomInt(30, 120) * coinsMultiplier * (1 + doubleCoinsCount * 0.5));
            playerCoins += coinsEarned;
            playerScore += coinsMultiplier;
            logTextElement.innerText += ` You earned ${Math.ceil(coinsEarned)} coins!\n`;
            updatePlayerInfo();
            
            // Re-enable buttons before page transition
            fightButton.disabled = false;
            runButton.disabled = false;
            quitButton.disabled = false;
            
            showPage('store-page');
            return;
        }

        // Monster counter-attack sequence (after a brief delay)
        setTimeout(() => {
            monsterImage.classList.add('monster-attack');
            playerImage.classList.add('player-hit');

            setTimeout(() => {
                // Remove animations
                monsterImage.classList.remove('monster-attack');
                playerImage.classList.remove('player-hit');

                // Calculate monster damage
                const monsterAttackDamage = Math.ceil(monsterDamage);
                playerHealth -= monsterAttackDamage;
                logTextElement.innerText += ` The monster dealt ${Math.ceil(monsterAttackDamage)} damage to you.\n`;
                updatePlayerInfo();

                if (playerHealth <= 0) {
                    gameOver();
                }

                // Re-enable buttons after all animations complete
                fightButton.disabled = false;
                runButton.disabled = false;
                quitButton.disabled = false;
            }, 400); // Monster attack animation duration
        }, 300); // Delay between player and monster attacks
    }, 400); // Player attack animation duration
}

function run() {
    if (Math.random() < 0.5) {
        logTextElement.innerText = "You managed to escape from the monster!\n";
        showPage('store-page');
    } else {
        const monsterAttackDamage = Math.ceil(randomInt(10, 20));
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
        case '1':  // This matches the first item in your store (Damage Buff)
            if (playerCoins >= 100) {
                playerCoins -= 100;
                damageBuffCount++;
                logTextElement.innerText = "You bought the Damage Buff!\n";
                affordable = true;
            }
            break;
        case '2':  // Better Damage Buff
            if (playerCoins >= 250) {
                playerCoins -= 250;
                damageBuffCount += 3;
                logTextElement.innerText = "You bought the Better Damage Buff!\n";
                affordable = true;
            }
            break;
        case '3':  // Legendary Health Potion
            if (playerCoins >= 400) {
                playerCoins -= 400;
                playerHealth += 1000;
                logTextElement.innerText = "You bought a Legendary Health Potion and restored 1000 HP!\n";
                affordable = true;
            }
            break;
        case '4':  // Super Potion
            if (playerCoins >= 100) {
                playerCoins -= 100;
                playerHealth += 50;
                logTextElement.innerText = "You bought a Super Potion and restored 50 HP!\n";
                affordable = true;
            }
            break;
        case '5':  // Potion
            if (playerCoins >= 40) {
                playerCoins -= 40;
                playerHealth += 20;
                logTextElement.innerText = "You bought a Potion and restored 20 HP!\n";
                affordable = true;
            }
            break;
        case '6':  // Coins Upgrade
            if (playerCoins >= 250) {
                playerCoins -= 250;
                doubleCoinsCount++;
                logTextElement.innerText = "You bought the 50% More Coins item!\n";
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

// Start the game initially
showPage('start-page');
