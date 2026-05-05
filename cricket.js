document.addEventListener('DOMContentLoaded', () => {
    const challengeTitle = document.getElementById('challenge-title');
    const challengeDesc = document.getElementById('challenge-desc');
    const statScore = document.getElementById('stat-score');
    const statBalls = document.getElementById('stat-balls');
    const message = document.getElementById('message');
    
    const btnStart = document.getElementById('btn-start');
    const btnHit = document.getElementById('btn-hit');
    const btnReset = document.getElementById('btn-reset');
    const helpText = document.getElementById('help-text');
    
    const ball = document.getElementById('ball');
    const pitch = document.getElementById('pitch');
    const bowler = document.getElementById('bowler');
    const batsman = document.getElementById('batsman');

    let targetRuns = 0;
    let totalBalls = 0;
    let totalWickets = 0;

    let score = 0;
    let wickets = 0;
    let ballsLeft = 0;

    let ballMoving = false;
    let ballStartTime = 0;
    let ballDuration = 1500; // base ms
    let currentBallDuration = 1500;
    let animationId;
    let gameState = 'waiting'; // waiting, playing, gameover
    let nextBallTimeout;
    
    function generateChallenge() {
        const diff = Math.random();
        if (diff < 0.4) {
            // Easy - 6 Balls, 10 to 17 runs
            targetRuns = Math.floor(Math.random() * 8) + 10; // 10-17
            totalBalls = 6;   
            totalWickets = 3;
            challengeTitle.textContent = "Easy Challenge";
            challengeTitle.style.color = "#4ade80";
        } else if (diff < 0.7) {
            // Medium - 12 Balls, 25 to 32 runs
            targetRuns = Math.floor(Math.random() * 8) + 25; // 25-32
            totalBalls = 12;
            totalWickets = 5;
            challengeTitle.textContent = "Endurance Challenge";
            challengeTitle.style.color = "#facc15";
        } else {
            // Hard - 6 Balls, 18 to 22 runs
            targetRuns = Math.floor(Math.random() * 5) + 18; // 18-22
            totalBalls = 6;
            totalWickets = 2;
            challengeTitle.textContent = "Hard Challenge";
            challengeTitle.style.color = "#f87171";
        }

        score = 0;
        wickets = 0;
        ballsLeft = totalBalls;
        
        ballDuration = 1000 + Math.random() * 800; // random base speed

        updateUI();
        message.textContent = "Ready for the challenge?";
        message.style.color = "#fff";
        
        btnStart.style.display = "block";
        btnHit.style.display = "none";
        btnReset.style.display = "none";
        helpText.style.display = "none";
        
        gameState = 'waiting';
        clearTimeout(nextBallTimeout);
        ball.style.display = 'none';
        bowler.classList.remove('running', 'bowling');
        batsman.classList.remove('swinging');
    }

    function updateUI() {
        challengeDesc.textContent = `Target: ${targetRuns} Runs in ${totalBalls} Balls (${totalWickets} Wickets)`;
        statScore.textContent = `Score: ${score} / ${wickets}W`;
        statBalls.textContent = `Balls Left: ${ballsLeft}`;
    }

    function startMatch() {
        gameState = 'playing';
        btnStart.style.display = "none";
        btnHit.style.display = "block";
        btnHit.disabled = true;
        helpText.style.display = "block";
        scheduleNextBall(1000);
    }

    function scheduleNextBall(delay = 2000) {
        if (gameState !== 'playing') return;
        
        if (ballsLeft <= 0 || wickets >= totalWickets || score >= targetRuns) {
            checkGameOver();
            return;
        }

        message.textContent = "Bowler is running up...";
        message.style.color = "#cbd5e1";
        
        nextBallTimeout = setTimeout(() => {
            if (gameState === 'playing') playBall();
        }, delay);
    }

    function playBall() {
        if (gameState !== 'playing') return;

        // Reset ball and buttons
        btnHit.disabled = true;
        ballMoving = false;
        ball.style.display = 'none';
        
        // Randomize speed slightly each ball
        currentBallDuration = ballDuration + (Math.random() * 400 - 200); 

        // Start bowler run-up
        bowler.classList.add('running');
        message.textContent = "Here comes the ball!";
        message.style.color = "#fff";

        // After run-up (1000ms), throw ball
        setTimeout(() => {
            if (gameState !== 'playing') return;
            
            bowler.classList.remove('running');
            bowler.classList.add('bowling');
            
            setTimeout(() => {
                bowler.classList.remove('bowling');
            }, 300); // arm rotation time

            throwBall();
        }, 1000);
    }

    function throwBall() {
        // Reset ball visual state completely before showing
        ball.style.transition = 'none';
        ball.style.transform = 'translate(-50%, -50%)';
        ball.style.top = '50%';
        ball.style.display = 'block';
        ball.style.left = '15%'; 
        ballMoving = true;
        
        ballStartTime = performance.now();
        
        function animateBall(currentTime) {
            if (!ballMoving) return;
            
            const elapsed = currentTime - ballStartTime;
            let progress = elapsed / currentBallDuration;
            
            // Map progress: 0 -> 15% left, 1 -> 85% left (batsman crease)
            let leftPos = 15 + (progress * 70);
            
            if (leftPos > 110) {
                // Missed completely (passed the screen)
                handleHit(null);
                return;
            }
            
            ball.style.left = leftPos + '%';
            
            // Enable hit button when ball is halfway
            if (progress > 0.3) {
                btnHit.disabled = false;
            }
            
            animationId = requestAnimationFrame(animateBall);
        }
        
        animationId = requestAnimationFrame(animateBall);
    }

    function hit() {
        if (!ballMoving || btnHit.disabled) return;
        
        // Batsman swing animation
        batsman.classList.add('swinging');
        setTimeout(() => batsman.classList.remove('swinging'), 300);
        
        ballMoving = false;
        cancelAnimationFrame(animationId);
        btnHit.disabled = true;
        
        const hitTime = performance.now() - ballStartTime;
        handleHit(hitTime);
    }

    function handleHit(hitTime) {
        ballMoving = false;
        btnHit.disabled = true;
        ballsLeft--;
        
        // Batsman crease is reached at progress = 1.0 (left=85%)
        const targetTime = currentBallDuration;
        
        let runs = 0;
        let resultMsg = "";
        let color = "#fff";
        
        if (hitTime === null) {
            runs = 0;
            wickets++;
            resultMsg = "Missed! OUT!";
            color = "#ef4444";
        } else {
            const diff = hitTime - targetTime;
            const absDiff = Math.abs(diff);
            
            if (absDiff < 60) {
                runs = 6;
                resultMsg = "PERFECT! 6 Runs!";
                color = "#3b82f6";
                animateBallHit(true);
            } else if (absDiff < 160) {
                runs = 4;
                resultMsg = "Great Timing! 4 Runs!";
                color = "#22c55e";
                animateBallHit(false);
            } else if (absDiff < 320) {
                runs = 2;
                resultMsg = "Okay Hit. 2 Runs.";
                color = "#eab308";
                animateBallHit(false);
            } else if (absDiff < 480) {
                runs = 1;
                resultMsg = "Poor Hit. 1 Run.";
                color = "#f97316";
                animateBallHit(false);
            } else {
                runs = 0;
                wickets++;
                resultMsg = diff < 0 ? "Too Early! OUT!" : "Too Late! OUT!";
                color = "#ef4444";
                ball.style.display = 'none'; // disappears on out
            }
        }
        
        score += runs;
        showHitText(runs > 0 ? `+${runs}` : "OUT", color, ball.style.left || '80%');
        
        message.textContent = resultMsg;
        message.style.color = color;
        
        updateUI();
        
        // Delay before scheduling next step
        setTimeout(() => {
            if (gameState === 'playing') {
                checkGameOver();
                if (gameState === 'playing') {
                    scheduleNextBall(1500); // 1.5s delay before next ball starts
                }
            }
        }, 1500);
    }
    
    function animateBallHit(isSix) {
        ball.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        if (isSix) {
            ball.style.transform = 'translate(-50%, -50%) scale(2.5)';
            ball.style.top = '-100px';
            ball.style.left = '20%';
        } else {
            ball.style.transform = 'translate(-50%, -50%) scale(1.5)';
            ball.style.top = '-20px';
            ball.style.left = '30%';
        }
        
        setTimeout(() => {
            ball.style.display = 'none';
        }, 600);
    }

    function showHitText(text, color, leftPos) {
        const span = document.createElement('span');
        span.className = 'hit-text';
        span.textContent = text;
        span.style.color = color;
        
        if(typeof leftPos === 'string' && leftPos.includes('%')) {
            span.style.left = leftPos;
        } else {
            span.style.left = '80%';
        }
        
        span.style.top = '40%';
        pitch.appendChild(span);
        
        setTimeout(() => {
            if (span.parentNode === pitch) {
                pitch.removeChild(span);
            }
        }, 1000);
    }

    function checkGameOver() {
        if (score >= targetRuns) {
            message.textContent = "YOU WIN! Challenge Complete!";
            message.style.color = "#4ade80";
            endGame();
        } else if (wickets >= totalWickets || ballsLeft <= 0) {
            message.textContent = "YOU LOSE! Challenge Failed.";
            message.style.color = "#ef4444";
            endGame();
        }
    }

    function endGame() {
        gameState = 'gameover';
        btnHit.style.display = "none";
        helpText.style.display = "none";
        btnReset.style.display = "block";
        ball.style.display = 'none';
        clearTimeout(nextBallTimeout);
    }

    btnStart.addEventListener('click', startMatch);
    btnHit.addEventListener('click', hit);
    btnReset.addEventListener('click', generateChallenge);

    // Keyboard support for Hit
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (gameState === 'playing' && !btnHit.disabled && ballMoving) {
                hit();
            } else if (gameState === 'waiting' && btnStart.style.display !== 'none') {
                startMatch();
            } else if (gameState === 'gameover' && btnReset.style.display !== 'none') {
                generateChallenge();
            }
        }
    });

    // Initial setup
    generateChallenge();
});
