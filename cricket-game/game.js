class CricketGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.score = 0;
        this.wickets = 0;
        this.overs = 0;
        this.balls = 0;
        this.isBatting = true;
        this.currentBatsman = 1;
        this.currentBowler = 1;
        
        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: 100,
            radius: 10,
            speed: 5,
            isMoving: false
        };
        
        this.batsman = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 20,
            height: 60,
            stance: 'normal' // 'defensive', 'normal', 'aggressive'
        };
        
        this.bowler = {
            x: this.canvas.width / 2,
            y: 100,
            width: 20,
            height: 60,
            runUp: false
        };
        
        // Initialize controls
        this.initControls();
        
        // T20 specific settings
        this.maxOvers = 20;
        this.currentOver = 0;
        this.ballsInOver = 0;
        this.targetScore = 0;
        this.isChasing = false;
        this.requiredRunRate = 0;
        this.powerPlayOvers = 6; // First 6 overs are power play
        this.powerPlayActive = true;
        
        // Add T20 specific UI elements
        this.updateUI();
        
        // Add fielder positions
        this.fielders = [
            { x: this.canvas.width / 2 - 150, y: 200, position: 'slip' },
            { x: this.canvas.width / 2 + 150, y: 300, position: 'cover' },
            { x: this.canvas.width / 2 - 100, y: 400, position: 'midwicket' },
            { x: this.canvas.width / 2 + 200, y: 200, position: 'point' },
            { x: this.canvas.width / 2, y: 500, position: 'long on' }
        ];
        
        // Start game loop
        this.gameLoop();
    }
    
    initControls() {
        // Batting controls
        document.getElementById('defensiveBtn').addEventListener('click', () => this.setBattingStyle('defensive'));
        document.getElementById('normalBtn').addEventListener('click', () => this.setBattingStyle('normal'));
        document.getElementById('aggressiveBtn').addEventListener('click', () => this.setBattingStyle('aggressive'));
        
        // Bowling controls
        document.getElementById('fastBtn').addEventListener('click', () => this.bowl('fast'));
        document.getElementById('mediumBtn').addEventListener('click', () => this.bowl('medium'));
        document.getElementById('spinBtn').addEventListener('click', () => this.bowl('spin'));
    }
    
    setBattingStyle(style) {
        if (!this.isBatting) return;
        this.batsman.stance = style;
    }
    
    bowl(style) {
        if (this.isBatting || this.ball.isMoving) return;
        
        this.ball.isMoving = true;
        this.bowler.runUp = true;
        
        // Different bowling speeds based on style
        const speeds = {
            fast: 8,
            medium: 6,
            spin: 4
        };
        
        this.ball.speed = speeds[style];
        this.updateOver();
    }
    
    updateUI() {
        // Add T20 specific stats to the header
        const gameStats = document.querySelector('.game-stats');
        gameStats.innerHTML = `
            <span>Score: <span id="score">0</span>/<span id="wickets">0</span></span>
            <span>Overs: <span id="overs">0.0</span>/20.0</span>
            <span>RR: <span id="runRate">0.00</span></span>
            ${this.isChasing ? `<span>Need: <span id="target">${this.targetScore - this.score}</span></span>` : ''}
        `;
    }
    
    startT20Match() {
        this.isChasing = false;
        this.score = 0;
        this.wickets = 0;
        this.currentOver = 0;
        this.ballsInOver = 0;
        this.powerPlayActive = true;
        this.updateUI();
    }
    
    startChase(target) {
        this.isChasing = true;
        this.targetScore = target;
        this.score = 0;
        this.wickets = 0;
        this.currentOver = 0;
        this.ballsInOver = 0;
        this.powerPlayActive = true;
        this.updateUI();
    }
    
    updateOver() {
        this.ballsInOver++;
        if (this.ballsInOver >= 6) {
            this.currentOver++;
            this.ballsInOver = 0;
            this.currentBowler++;
            
            // Check power play
            if (this.currentOver === 6) {
                this.powerPlayActive = false;
            }
            
            // Check if innings is complete
            if (this.currentOver >= this.maxOvers || this.wickets >= 10) {
                this.endInnings();
            }
        }
        
        // Update run rate
        const totalBalls = this.currentOver * 6 + this.ballsInOver;
        const runRate = totalBalls > 0 ? (this.score * 6 / totalBalls).toFixed(2) : '0.00';
        document.getElementById('runRate').textContent = runRate;
        
        // Update overs display
        document.getElementById('overs').textContent = `${this.currentOver}.${this.ballsInOver}`;
    }
    
    calculateRuns(battingStyle, bowlingStyle) {
        const baseProbabilities = {
            defensive: { fast: 0.3, medium: 0.4, spin: 0.5 },
            normal: { fast: 0.4, medium: 0.5, spin: 0.6 },
            aggressive: { fast: 0.5, medium: 0.6, spin: 0.7 }
        };
        
        // Power play bonus
        const powerPlayMultiplier = this.powerPlayActive ? 1.2 : 1;
        
        const probability = baseProbabilities[battingStyle][bowlingStyle] * powerPlayMultiplier;
        const random = Math.random();
        
        // T20 specific probabilities (more aggressive)
        if (random < probability * 0.15) return 6; // 15% chance of six
        if (random < probability * 0.35) return 4; // 20% chance of four
        if (random < probability * 0.65) return 2; // 30% chance of two
        if (random < probability) return 1; // 30% chance of one
        return 0; // Out
    }
    
    endInnings() {
        if (!this.isChasing) {
            // First innings complete
            this.targetScore = this.score;
            this.startChase(this.targetScore);
        } else {
            // Match complete
            const result = this.score >= this.targetScore ? 'Won' : 'Lost';
            alert(`Match Complete! You ${result} by ${Math.abs(this.targetScore - this.score)} runs!`);
            this.startT20Match();
        }
    }
    
    update() {
        if (this.ball.isMoving) {
            // Move ball
            this.ball.y += this.ball.speed;
            
            // Check for collision with batsman
            if (this.checkCollision(this.ball, this.batsman)) {
                const runs = this.calculateRuns(this.batsman.stance, 'medium');
                if (runs === 0) {
                    this.wickets++;
                    document.getElementById('wickets').textContent = this.wickets;
                    this.currentBatsman++;
                    if (this.currentBatsman > 10) {
                        this.endInnings();
                    }
                } else {
                    this.score += runs;
                    document.getElementById('score').textContent = this.score;
                    
                    // Update target if chasing
                    if (this.isChasing) {
                        const remaining = this.targetScore - this.score;
                        document.getElementById('target').textContent = remaining;
                        if (remaining <= 0) {
                            this.endInnings();
                        }
                    }
                }
                this.ball.isMoving = false;
                this.ball.y = 100;
            }
            
            // Check if ball is past batsman
            if (this.ball.y > this.canvas.height) {
                this.ball.isMoving = false;
                this.ball.y = 100;
            }
        }
    }
    
    checkCollision(ball, batsman) {
        return ball.x + ball.radius > batsman.x &&
               ball.x - ball.radius < batsman.x + batsman.width &&
               ball.y + ball.radius > batsman.y &&
               ball.y - ball.radius < batsman.y + batsman.height;
    }
    
    drawUmpire(x, y, isSignaling = false) {
        this.ctx.save();
        
        // Base color for umpire
        this.ctx.fillStyle = '#2c3e50';
        
        // Head with hat
        this.ctx.beginPath();
        this.ctx.arc(x, y - 45, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(x - 15, y - 55, 30, 10); // Hat
        
        // Body in white coat
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x - 12, y - 35, 24, 45);
        
        if (isSignaling) {
            // Arms signaling
            this.ctx.beginPath();
            this.ctx.moveTo(x - 10, y - 20);
            this.ctx.lineTo(x - 25, y - 40); // Left arm up
            this.ctx.moveTo(x + 10, y - 20);
            this.ctx.lineTo(x + 25, y - 40); // Right arm up
        } else {
            // Arms at rest
            this.ctx.beginPath();
            this.ctx.moveTo(x - 12, y - 20);
            this.ctx.lineTo(x - 20, y); // Left arm down
            this.ctx.moveTo(x + 12, y - 20);
            this.ctx.lineTo(x + 20, y); // Right arm down
        }
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Legs in black pants
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6, y + 10);
        this.ctx.lineTo(x - 8, y + 40);
        this.ctx.moveTo(x + 6, y + 10);
        this.ctx.lineTo(x + 8, y + 40);
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawCrowd() {
        this.ctx.save();
        
        // Create gradient for stadium background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height / 3);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 3);
        
        // Draw crowd rows
        for (let row = 0; row < 3; row++) {
            for (let i = 0; i < this.canvas.width; i += 20) {
                const y = row * 30 + 20;
                const crowdColor = Math.random() > 0.5 ? '#e74c3c' : '#3498db';
                
                // Draw simplified person in crowd
                this.ctx.fillStyle = crowdColor;
                this.ctx.beginPath();
                this.ctx.arc(i + 10, y, 5, 0, Math.PI * 2); // Head
                this.ctx.fill();
                this.ctx.fillRect(i + 5, y + 5, 10, 15); // Body
                
                // Randomly add animation (raising arms)
                if (Math.random() > 0.8) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i + 5, y + 10);
                    this.ctx.lineTo(i, y);
                    this.ctx.moveTo(i + 15, y + 10);
                    this.ctx.lineTo(i + 20, y);
                    this.ctx.strokeStyle = crowdColor;
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
    }
    
    drawSaiPlayer(x, y, isMoving = false) {
        this.ctx.save();
        
        // Special jersey number
        const drawJersey = () => {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(x - 12, y - 27, 24, 32);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText('07', x - 8, y - 5);
        };

        // Draw cap with team logo
        const drawCap = () => {
            this.ctx.fillStyle = '#c0392b';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 35, 10, 0, Math.PI, true);
            this.ctx.fill();
            this.ctx.fillRect(x - 10, y - 45, 20, 10);
            
            // Add cap logo
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 8px Arial';
            this.ctx.fillText('SAI', x - 6, y - 38);
        };

        // Draw special wristband
        const drawWristband = (armX, armY) => {
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillRect(armX - 3, armY - 3, 6, 6);
        };

        if (isMoving) {
            // Dynamic running animation
            drawCap();
            
            // Head with slight tilt
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 35, 8, 0.2, Math.PI * 2.2);
            this.ctx.fill();
            
            // Athletic running pose
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 27);
            this.ctx.quadraticCurveTo(x - 5, y - 10, x - 12, y + 5);
            this.ctx.lineTo(x + 12, y + 5);
            this.ctx.closePath();
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fill();
            drawJersey();

            // Dynamic arms
            this.ctx.beginPath();
            this.ctx.moveTo(x - 12, y - 15);
            this.ctx.lineTo(x - 28, y - 25);
            this.ctx.moveTo(x + 12, y - 15);
            this.ctx.lineTo(x + 28, y - 5);
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Add wristbands in motion
            drawWristband(x - 28, y - 25);
            drawWristband(x + 28, y - 5);
            
            // Athletic running legs
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + 5);
            this.ctx.lineTo(x - 18, y + 30);
            this.ctx.moveTo(x, y + 5);
            this.ctx.lineTo(x + 18, y + 30);
            this.ctx.stroke();
        } else {
            // Ready position with unique stance
            drawCap();
            
            // Alert head position
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 35, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Athletic ready stance
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 27);
            this.ctx.quadraticCurveTo(x - 5, y - 10, x - 10, y + 5);
            this.ctx.lineTo(x + 10, y + 5);
            this.ctx.closePath();
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fill();
            drawJersey();

            // Ready position arms
            this.ctx.beginPath();
            this.ctx.moveTo(x - 10, y - 15);
            this.ctx.lineTo(x - 25, y);
            this.ctx.moveTo(x + 10, y - 15);
            this.ctx.lineTo(x + 25, y);
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Add wristbands
            drawWristband(x - 25, y);
            drawWristband(x + 25, y);
            
            // Athletic stance legs
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y + 5);
            this.ctx.lineTo(x - 15, y + 30);
            this.ctx.moveTo(x + 5, y + 5);
            this.ctx.lineTo(x + 15, y + 30);
            this.ctx.stroke();
        }
        
        // Enhanced player identification
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('SAI - 07', x - 25, y + 45);
        this.ctx.font = 'italic 12px Arial';
        this.ctx.fillText('★ Star Fielder ★', x - 35, y + 60);
        
        // Add fielding position with special styling
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillText('Extra Cover', x - 30, y + 75);
        
        this.ctx.restore();
    }
    
    draw() {
        // Clear canvas and draw field
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw crowd first (background)
        this.drawCrowd();
        
        // Draw pitch
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(this.canvas.width / 2 - 30, 0, 60, this.canvas.height);
        
        // Draw crease lines
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.canvas.width / 2 - 40, this.canvas.height - 150, 80, 10);
        this.ctx.strokeRect(this.canvas.width / 2 - 40, 140, 80, 10);
        
        // Draw umpires
        // Square leg umpire
        this.drawUmpire(this.canvas.width / 2 + 100, this.canvas.height - 120);
        // Main umpire
        this.drawUmpire(this.canvas.width / 2, 160, this.ball.isMoving);
        
        // Draw batsman
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.batsman.x,
            this.batsman.y,
            this.batsman.width,
            this.batsman.height
        );
        
        // Draw bowler
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.bowler.x,
            this.bowler.y,
            this.bowler.width,
            this.bowler.height
        );
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fill();
        this.ctx.closePath();
        
        // Add power play indicator
        if (this.powerPlayActive) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Power Play', 10, 30);
        }
        
        // Draw fielders
        this.fielders.forEach(fielder => {
            this.drawSaiPlayer(
                fielder.x,
                fielder.y,
                // Add movement when ball is hit near them
                this.ball.isMoving && 
                Math.abs(this.ball.x - fielder.x) < 50 && 
                Math.abs(this.ball.y - fielder.y) < 50
            );
        });
        
        // Add crowd cheering animation when runs are scored
        if (this.lastRunsScored > 0) {
            this.crowdCheering = true;
            setTimeout(() => {
                this.crowdCheering = false;
            }, 1000);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new CricketGame();
    game.startT20Match();
}); 