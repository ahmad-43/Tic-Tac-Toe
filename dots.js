const board = document.getElementById('dots-board');
const scoreP1El = document.getElementById('score-p1');
const scoreP2El = document.getElementById('score-p2');
const statusEl = document.getElementById('dots-status');
const resetBtn = document.getElementById('dots-resetBtn');

const ROWS = 5; // number of boxes
const COLS = 5;

let currentPlayer = 1; // 1 or 2
let scoreP1 = 0;
let scoreP2 = 0;
let lines = {}; // key: "r,c", value: owner
let boxes = {}; // key: "r,c", value: owner

function initGame() {
    board.innerHTML = '';
    currentPlayer = 1;
    scoreP1 = 0;
    scoreP2 = 0;
    lines = {};
    boxes = {};
    
    updateScoreUI();
    updateStatusUI();

    // The grid has (ROWS*2 + 1) rows and (COLS*2 + 1) cols
    for (let r = 0; r <= ROWS * 2; r++) {
        for (let c = 0; c <= COLS * 2; c++) {
            const isDot = r % 2 === 0 && c % 2 === 0;
            const isHLine = r % 2 === 0 && c % 2 !== 0;
            const isVLine = r % 2 !== 0 && c % 2 === 0;
            const isBox = r % 2 !== 0 && c % 2 !== 0;

            const el = document.createElement('div');
            
            if (isDot) {
                el.classList.add('dot');
            } else if (isHLine) {
                el.classList.add('hline');
                el.dataset.type = 'hline';
                el.dataset.r = r;
                el.dataset.c = c;
                el.addEventListener('click', onLineClick);
            } else if (isVLine) {
                el.classList.add('vline');
                el.dataset.type = 'vline';
                el.dataset.r = r;
                el.dataset.c = c;
                el.addEventListener('click', onLineClick);
            } else if (isBox) {
                el.classList.add('box');
                el.id = `box-${r}-${c}`;
            }

            board.appendChild(el);
        }
    }
}

function onLineClick(e) {
    const el = e.target;
    const r = parseInt(el.dataset.r);
    const c = parseInt(el.dataset.c);
    const key = `${r},${c}`;

    if (lines[key]) return; // already clicked

    lines[key] = currentPlayer;
    el.classList.add(`active-${currentPlayer}`);

    const boxFilled = checkBoxes(r, c);

    if (boxFilled) {
        // Player gets another turn
        updateScoreUI();
        if (scoreP1 + scoreP2 === ROWS * COLS) {
            endGame();
        }
    } else {
        // Switch turn
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateStatusUI();
    }
}

function checkBoxes(r, c) {
    let filledAny = false;

    // Check adjacent boxes
    if (r % 2 === 0) { // HLine
        // Box above
        if (checkAndFillBox(r - 1, c)) filledAny = true;
        // Box below
        if (checkAndFillBox(r + 1, c)) filledAny = true;
    } else { // VLine
        // Box left
        if (checkAndFillBox(r, c - 1)) filledAny = true;
        // Box right
        if (checkAndFillBox(r, c + 1)) filledAny = true;
    }

    return filledAny;
}

function checkAndFillBox(r, c) {
    if (r < 1 || r > ROWS * 2 || c < 1 || c > COLS * 2) return false;
    
    // A box is at (r, c)
    const top = `${r-1},${c}`;
    const bottom = `${r+1},${c}`;
    const left = `${r},${c-1}`;
    const right = `${r},${c+1}`;

    if (lines[top] && lines[bottom] && lines[left] && lines[right] && !boxes[`${r},${c}`]) {
        boxes[`${r},${c}`] = currentPlayer;
        const boxEl = document.getElementById(`box-${r}-${c}`);
        boxEl.classList.add(`filled-${currentPlayer}`);
        
        if (currentPlayer === 1) scoreP1++;
        else scoreP2++;
        
        return true;
    }
    return false;
}

function updateScoreUI() {
    scoreP1El.textContent = scoreP1;
    scoreP2El.textContent = scoreP2;
}

function updateStatusUI() {
    statusEl.textContent = `Player ${currentPlayer}'s Turn`;
    if (currentPlayer === 1) {
        statusEl.style.color = 'var(--x-color)';
    } else {
        statusEl.style.color = 'var(--o-color)';
    }
}

function endGame() {
    if (scoreP1 > scoreP2) {
        statusEl.textContent = 'Player 1 Wins!';
        statusEl.style.color = 'var(--x-color)';
    } else if (scoreP2 > scoreP1) {
        statusEl.textContent = 'Player 2 Wins!';
        statusEl.style.color = 'var(--o-color)';
    } else {
        statusEl.textContent = 'It\'s a Tie!';
        statusEl.style.color = 'inherit';
    }
}

resetBtn.addEventListener('click', initGame);

initGame();
