const btnRock = document.getElementById('btn-rock');
const btnPaper = document.getElementById('btn-paper');
const btnScissors = document.getElementById('btn-scissors');
const playerHand = document.getElementById('player-hand');
const computerHand = document.getElementById('computer-hand');
const scorePlayerEl = document.getElementById('rps-score-player');
const scoreComputerEl = document.getElementById('rps-score-computer');
const statusEl = document.getElementById('rps-status');
const resetBtn = document.getElementById('rps-resetBtn');

let playerScore = 0;
let computerScore = 0;
let isPlaying = false;

const choices = ['rock', 'paper', 'scissors'];
const emojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

function playRound(playerChoice) {
    if (isPlaying) return;
    isPlaying = true;

    // Reset hands and start shaking
    playerHand.textContent = '✊';
    computerHand.textContent = '✊';
    playerHand.classList.add('shake-left');
    computerHand.classList.add('shake-right');
    playerHand.classList.remove('win-anim');
    computerHand.classList.remove('win-anim');
    
    statusEl.textContent = 'Rock... Paper... Scissors...';
    statusEl.style.color = 'inherit';

    // Wait for animation
    setTimeout(() => {
        playerHand.classList.remove('shake-left');
        computerHand.classList.remove('shake-right');

        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        playerHand.textContent = emojis[playerChoice];
        computerHand.textContent = emojis[computerChoice];

        determineWinner(playerChoice, computerChoice);
        isPlaying = false;
    }, 1000);
}

function determineWinner(player, computer) {
    if (player === computer) {
        statusEl.textContent = 'It\'s a Tie!';
        return;
    }

    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };

    if (winConditions[player] === computer) {
        statusEl.textContent = 'You Win!';
        statusEl.style.color = 'var(--win-color)';
        playerScore++;
        scorePlayerEl.textContent = playerScore;
        playerHand.classList.add('win-anim');
    } else {
        statusEl.textContent = 'Computer Wins!';
        statusEl.style.color = 'var(--o-color)';
        computerScore++;
        scoreComputerEl.textContent = computerScore;
        computerHand.classList.add('win-anim');
    }
}

btnRock.addEventListener('click', () => playRound('rock'));
btnPaper.addEventListener('click', () => playRound('paper'));
btnScissors.addEventListener('click', () => playRound('scissors'));

resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    scorePlayerEl.textContent = playerScore;
    scoreComputerEl.textContent = computerScore;
    statusEl.textContent = 'Choose your weapon!';
    statusEl.style.color = 'inherit';
    playerHand.textContent = '✊';
    computerHand.textContent = '✊';
    playerHand.classList.remove('win-anim');
    computerHand.classList.remove('win-anim');
});
