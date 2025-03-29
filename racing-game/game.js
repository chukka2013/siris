class RacingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.speed = 0;
        this.isGameRunning = false;
        this.nitro = 100;
        this.isNitroActive = false;
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize key states
        this.rightPressed = false;
        this.leftPressed = false;
        this.upPressed = false;
        this.downPressed = false;

        // Car position and movement
        this.playerX = this.canvas.width / 2 - 20;
        this.playerY = this.canvas.height - 100;
        
        // Player car
        this.player = {
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 100,
            width: 40,
            height: 80,
            speed: 0,
            maxSpeed: 5,
            acceleration: 0.2,
            deceleration: 0.1,
            handling: 3
        };
        
        // AI cars
        this.aiCars = [];
        this.maxAiCars = 5;
        
        // Set up controls
        this.setupControls();
        
        // Start the game loop
        this.draw();
    }
    
    setupControls() {
        document.addEventListener("keydown", (event) => this.keyDownHandler(event), false);
        document.addEventListener("keyup", (event) => this.keyUpHandler(event), false);
    }

    keyDownHandler(event) {
        if (event.code === "ArrowRight") {
            this.rightPressed = true;
        } else if (event.code === "ArrowLeft") {
            this.leftPressed = true;
        }
        if (event.code === "ArrowDown") {
            this.downPressed = true;
        } else if (event.code === "ArrowUp") {
            this.upPressed = true;
        }
    }

    keyUpHandler(event) {
        if (event.code === "ArrowRight") {
            this.rightPressed = false;
        } else if (event.code === "ArrowLeft") {
            this.leftPressed = false;
        }
        if (event.code === "ArrowDown") {
            this.downPressed = false;
        } else if (event.code === "ArrowUp") {
            this.upPressed = false;
        }
    }
    
    updatePlayer() {
        // Handle acceleration
        if (this.upPressed) {
            this.player.speed = Math.min(
                this.player.speed + this.player.acceleration, 
                this.player.maxSpeed
            );
        } else if (this.downPressed) {
            this.player.speed = Math.max(
                this.player.speed - this.player.acceleration, 
                -this.player.maxSpeed / 2
            );
        } else {
            // Apply deceleration when no keys are pressed
            this.player.speed *= (1 - this.player.deceleration);
            if (Math.abs(this.player.speed) < 0.01) this.player.speed = 0;
        }
        
        // Handle steering
        if (this.leftPressed) {
            this.player.x -= this.player.handling;
        }
        if (this.rightPressed) {
            this.player.x += this.player.handling;
        }
        
        // Keep player within bounds
        this.player.x = Math.max(100, Math.min(this.canvas.width - 140, this.player.x));
        
        // Update speed display
        this.speed = Math.abs(this.player.speed * 20);
        document.getElementById('speed').textContent = Math.round(this.speed);
    }
    
    updateAiCars() {
        for (let i = this.aiCars.length - 1; i >= 0; i--) {
            const car = this.aiCars[i];
            
            // Basic AI movement
            car.y += car.speed;
            
            // Add lane changing behavior
            if (Math.random() < 0.02) { // 2% chance to change lanes
                const targetX = 100 + Math.floor(Math.random() * 3) * 200;
                car.targetX = targetX;
            }
            
            // Smooth lane changing
            if (car.targetX) {
                const diff = car.targetX - car.x;
                car.x += Math.sign(diff) * Math.min(Math.abs(diff), 3);
            }
            
            // Remove cars that are off screen
            if (car.y > this.canvas.height) {
                this.aiCars.splice(i, 1);
                this.spawnAiCar();
            }
        }
    }
    
    checkCollisions() {
        for (const car of this.aiCars) {
            if (this.isColliding(this.player, car)) {
                this.score += 100;
                document.getElementById('score').textContent = this.score;
                this.aiCars = this.aiCars.filter(c => c !== car);
                this.spawnAiCar();
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(100, 0, this.canvas.width - 200, this.canvas.height);
        
        // Draw road lines
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.fillRect(this.canvas.width / 2 - 2, i, 4, 30);
        }
        
        // Draw cars with better shapes
        this.drawCars();
        
        // Draw nitro bar
        this.drawNitroBar();
        
        // Update car position based on key states
        if (this.rightPressed && this.playerX < this.canvas.width - 140) {
            this.playerX += this.speed;
        } else if (this.leftPressed && this.playerX > 100) {
            this.playerX -= this.speed;
        }

        if (this.downPressed && this.playerY < this.canvas.height - 90) {
            this.playerY += this.speed;
        } else if (this.upPressed && this.playerY > 0) {
            this.playerY -= this.speed;
        }

        // Draw the car
        this.drawCar();
        
        // Continue game loop
        requestAnimationFrame(() => this.draw());
    }
    
    drawCars() {
        // Draw AI cars
        for (const car of this.aiCars) {
            this.drawCar(car.x, car.y, '#e74c3c');
        }
        
        // Draw player car
        this.drawCar(this.player.x, this.player.y, this.isNitroActive ? '#3498db' : '#2ecc71');
    }
    
    drawCar(x, y, color) {
        this.ctx.save();
        
        // Car body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 40, 80);
        
        // Car details
        this.ctx.fillStyle = '#000';
        // Windows
        this.ctx.fillRect(x + 5, y + 10, 30, 20);
        // Wheels
        this.ctx.fillRect(x - 5, y + 10, 8, 20);
        this.ctx.fillRect(x + 37, y + 10, 8, 20);
        this.ctx.fillRect(x - 5, y + 50, 8, 20);
        this.ctx.fillRect(x + 37, y + 50, 8, 20);
        
        this.ctx.restore();
    }
    
    drawNitroBar() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(10, 10, 200, 20);
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(10, 10, this.nitro * 2, 20);
    }
    
    spawnAiCar() {
        if (this.aiCars.length >= this.maxAiCars) return;
        
        // Define lanes
        const lanes = [150, 350, 550];
        let safeLane = lanes[Math.floor(Math.random() * lanes.length)];
        
        // Check for safe distance from other cars
        const minDistance = 150;
        let isSafe = this.aiCars.every(car => 
            Math.abs(car.y - (-100)) > minDistance &&
            Math.abs(car.x - safeLane) > 80
        );
        
        if (isSafe) {
            const car = {
                x: safeLane,
                y: -100,
                width: 40,
                height: 80,
                speed: 2 + Math.random() * 2,
                targetX: null
            };
            
            this.aiCars.push(car);
        }
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new RacingGame();
}); 