const grid = document.getElementById('memory-grid');
const movesEl = document.getElementById('moves-count');
const matchesEl = document.getElementById('matches-count');
const statusEl = document.getElementById('memory-status');
const resetBtn = document.getElementById('memory-resetBtn');

const emojis = ['🍎', '🍌', '🍉', '🍇', '🍓', '🥑', '🥕', '🌽'];
let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let lockBoard = false;

function initGame() {
    // Reset state
    grid.innerHTML = '';
    moves = 0;
    matches = 0;
    flippedCards = [];
    lockBoard = false;
    movesEl.textContent = moves;
    matchesEl.textContent = `${matches} / 8`;
    statusEl.textContent = 'Find all pairs!';
    statusEl.style.color = 'inherit';

    // Create pairs and shuffle
    cards = [...emojis, ...emojis];
    cards.sort(() => Math.random() - 0.5);

    // Create card elements
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;

        const front = document.createElement('div');
        front.classList.add('card-face', 'card-front');

        const back = document.createElement('div');
        back.classList.add('card-face', 'card-back');
        back.textContent = emoji;

        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesEl.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards[0].classList.add('matched');
    flippedCards[1].classList.add('matched');
    matches++;
    matchesEl.textContent = `${matches} / 8`;
    flippedCards = [];

    if (matches === 8) {
        statusEl.textContent = `You won in ${moves} moves!`;
        statusEl.style.color = 'var(--win-color)';
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        flippedCards[0].classList.remove('flipped');
        flippedCards[1].classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
    }, 1000);
}

resetBtn.addEventListener('click', initGame);

// Start the game for the first time
initGame();
