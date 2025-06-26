class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameMode = 'menu'; // menu, singlePlayer, localMultiplayer, online
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.players = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.powerUps = [];
        this.gameConfig = {
            width: 0,
            height: 0,
            maxPlayers: 4
        };
        this.keys = {};
        this.touchControls = {};
        this.gameLoop = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showMainMenu();
        }, 3000);
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('singlePlayerBtn').addEventListener('click', () => this.startSinglePlayer());
        document.getElementById('localMultiplayerBtn').addEventListener('click', () => this.startLocalMultiplayer());
        document.getElementById('onlineMultiplayerBtn').addEventListener('click', () => this.showOnlineMenu());
        document.getElementById('customizeBtn').addEventListener('click', () => this.showCustomizeMenu());
        document.getElementById('aiGenerateBtn').addEventListener('click', () => this.showAiGenerateMenu());
        
        // Online menu
        document.getElementById('backToMainBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinRoom());
        
        // Customize menu
        document.getElementById('backFromCustomBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('saveCustomBtn').addEventListener('click', () => this.saveCustomization());
        
        // AI Generate menu
        document.getElementById('backFromAiBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('generateAiBtn').addEventListener('click', () => this.generateAiAircraft());
        document.getElementById('useAiBtn').addEventListener('click', () => this.useAiAircraft());
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('exitGameBtn').addEventListener('click', () => this.exitToMenu());
        
        // Pause menu
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('exitToMenuBtn').addEventListener('click', () => this.exitToMenu());
        
        // Game over menu
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.exitToMenu());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mobile controls
        this.setupMobileControls();
        
        // Color options for customization
        this.setupColorOptions();
        
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    setupMobileControls() {
        const controlButtons = document.querySelectorAll('.control-button, .action-button');
        
        controlButtons.forEach(button => {
            const key = button.dataset.key;
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls[key] = true;
                this.keys[key] = true;
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls[key] = false;
                this.keys[key] = false;
            });
            
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
        });
    }

    setupColorOptions() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.style.backgroundColor = option.dataset.color;
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.updatePreview();
            });
        });
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code.toLowerCase()] = true;
        
        // Prevent default for game keys
        if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code.toLowerCase()] = false;
    }

    handleResize() {
        if (this.canvas) {
            this.resizeCanvas();
        }
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }

    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('mainMenu').classList.remove('hidden');
        this.gameState = 'menu';
    }

    showOnlineMenu() {
        this.hideAllScreens();
        document.getElementById('onlineMenu').classList.remove('hidden');
    }

    showCustomizeMenu() {
        this.hideAllScreens();
        document.getElementById('customizeMenu').classList.remove('hidden');
        this.initializePreviewCanvas();
    }

    showAiGenerateMenu() {
        this.hideAllScreens();
        document.getElementById('aiGenerateMenu').classList.remove('hidden');
        this.initializeAiPreviewCanvas();
    }

    hideAllScreens() {
        const screens = ['mainMenu', 'onlineMenu', 'customizeMenu', 'aiGenerateMenu', 'gameContainer', 'pauseMenu', 'gameOverMenu'];
        screens.forEach(screen => {
            document.getElementById(screen).classList.add('hidden');
        });
    }

    startSinglePlayer() {
        this.gameMode = 'singlePlayer';
        this.initializeGameCanvas();
        this.setupSinglePlayerGame();
        this.startGameLoop();
    }

    startLocalMultiplayer() {
        this.gameMode = 'localMultiplayer';
        this.initializeGameCanvas();
        this.setupLocalMultiplayerGame();
        this.startGameLoop();
    }

    initializeGameCanvas() {
        this.hideAllScreens();
        document.getElementById('gameContainer').classList.remove('hidden');
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.gameState = 'playing';
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gameConfig.width = this.canvas.width;
        this.gameConfig.height = this.canvas.height;
    }

    setupSinglePlayerGame() {
        this.players = [this.createPlayer(1, this.gameConfig.width / 2, this.gameConfig.height - 100, '#00ffff')];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.powerUps = [];
        
        // Update UI
        document.getElementById('player2Stats').style.display = 'none';
        this.updatePlayerUI();
    }

    setupLocalMultiplayerGame() {
        this.players = [
            this.createPlayer(1, this.gameConfig.width / 2 - 50, this.gameConfig.height - 100, '#00ffff'),
            this.createPlayer(2, this.gameConfig.width / 2 + 50, this.gameConfig.height - 100, '#ff00ff')
        ];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.powerUps = [];
        
        // Update UI
        document.getElementById('player2Stats').style.display = 'block';
        this.updatePlayerUI();
    }

    setupOnlineGame() {
        // Initialize players for online game
        this.players = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.powerUps = [];
        
        // Create local player
        const localPlayer = this.createPlayer(1, this.gameConfig.width / 2, this.gameConfig.height - 100, '#00ffff');
        this.players.push(localPlayer);
        
        // Additional players will be added via network events
        document.getElementById('player2Stats').style.display = 'none';
        this.updatePlayerUI();
    }

    createPlayer(id, x, y, color) {
        return {
            id: id,
            x: x,
            y: y,
            width: 30,
            height: 40,
            color: color,
            health: 100,
            maxHealth: 100,
            score: 0,
            speed: 300,
            fireRate: 200,
            lastFire: 0,
            weaponType: 'laser',
            aircraftType: 'fighter',
            velocity: { x: 0, y: 0 },
            controls: id === 1 ? 
                { up: 'w', down: 's', left: 'a', right: 'd', fire: ' ', special: 'shift' } :
                { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright', fire: 'enter', special: 'shiftright' }
        };
    }

    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    update(currentTime) {
        if (this.gameState === 'playing') {
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            this.updateGame();
            this.render();
            
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
        }
    }

    updateGame() {
        // Update players
        this.players.forEach(player => this.updatePlayer(player));
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update particles
        this.updateParticles();
        
        // Update enemies
        this.updateEnemies();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updatePlayerUI();
        
        // Check game over
        this.checkGameOver();
    }

    updatePlayer(player) {
        const controls = player.controls;
        
        // Movement
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys[controls.left] || this.keys['a'] && player.id === 1) moveX -= 1;
        if (this.keys[controls.right] || this.keys['d'] && player.id === 1) moveX += 1;
        if (this.keys[controls.up] || this.keys['w'] && player.id === 1) moveY -= 1;
        if (this.keys[controls.down] || this.keys['s'] && player.id === 1) moveY += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        player.x += moveX * player.speed * this.deltaTime;
        player.y += moveY * player.speed * this.deltaTime;
        
        // Keep player in bounds
        player.x = Math.max(0, Math.min(this.gameConfig.width - player.width, player.x));
        player.y = Math.max(0, Math.min(this.gameConfig.height - player.height, player.y));
        
        // Firing
        if (this.keys[controls.fire] || this.keys[' '] && player.id === 1) {
            this.fireProjectile(player);
        }
        
        // Send player update in online mode
        if (this.gameMode === 'online' && player.id === 1 && window.networkManager) {
            // Throttle network updates
            if (!this.lastNetworkUpdate || performance.now() - this.lastNetworkUpdate > 50) {
                window.networkManager.sendPlayerUpdate(player);
                this.lastNetworkUpdate = performance.now();
            }
        }
    }

    fireProjectile(player) {
        const currentTime = performance.now();
        if (currentTime - player.lastFire < player.fireRate) return;
        
        player.lastFire = currentTime;
        
        const projectile = {
            x: player.x + player.width / 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 500,
            color: player.color,
            owner: player.id,
            damage: 20,
            type: player.weaponType
        };
        
        this.projectiles.push(projectile);
        this.createParticle(projectile.x, projectile.y, player.color, 'muzzleFlash');
        
        // Send projectile to other players in online mode
        if (this.gameMode === 'online' && window.networkManager) {
            window.networkManager.sendProjectile(projectile);
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.y -= projectile.speed * this.deltaTime;
            
            // Remove projectiles that are off-screen
            if (projectile.y < -projectile.height) {
                return false;
            }
            
            return true;
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * this.deltaTime;
            particle.y += particle.vy * this.deltaTime;
            particle.life -= this.deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            return particle.life > 0;
        });
    }

    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed * this.deltaTime;
            
            // Simple AI movement
            if (Math.random() < 0.02) {
                enemy.vx = (Math.random() - 0.5) * 100;
            }
            
            enemy.x += enemy.vx * this.deltaTime;
            enemy.x = Math.max(0, Math.min(this.gameConfig.width - enemy.width, enemy.x));
            
            // Remove enemies that are off-screen
            if (enemy.y > this.gameConfig.height + enemy.height) {
                return false;
            }
            
            return true;
        });
    }

    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += powerUp.speed * this.deltaTime;
            powerUp.rotation += powerUp.rotationSpeed * this.deltaTime;
            
            return powerUp.y < this.gameConfig.height + powerUp.height;
        });
    }

    spawnEnemies() {
        if (Math.random() < 0.01) {
            const enemy = {
                x: Math.random() * (this.gameConfig.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 100 + Math.random() * 100,
                health: 40,
                color: '#ff4444',
                vx: 0,
                type: 'basic'
            };
            
            this.enemies.push(enemy);
        }
    }

    checkCollisions() {
        // Player-Enemy collisions
        this.players.forEach(player => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(player, enemy)) {
                    player.health -= 30;
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.enemies.splice(enemyIndex, 1);
                }
            });
        });
        
        // Projectile-Enemy collisions
        this.projectiles.forEach((projectile, projIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(projectile, enemy)) {
                    enemy.health -= projectile.damage;
                    this.createParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffff00', 'hit');
                    this.projectiles.splice(projIndex, 1);
                    
                    if (enemy.health <= 0) {
                        const player = this.players.find(p => p.id === projectile.owner);
                        if (player) {
                            player.score += 100;
                        }
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        this.enemies.splice(enemyIndex, 1);
                        
                        // Chance to spawn power-up
                        if (Math.random() < 0.3) {
                            this.spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        }
                    }
                }
            });
        });
        
        // Player-PowerUp collisions
        this.players.forEach(player => {
            this.powerUps.forEach((powerUp, powerUpIndex) => {
                if (this.isColliding(player, powerUp)) {
                    this.applyPowerUp(player, powerUp);
                    this.createParticle(powerUp.x, powerUp.y, powerUp.color, 'powerUp');
                    this.powerUps.splice(powerUpIndex, 1);
                }
            });
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createParticle(x, y, color, type) {
        const particleCount = type === 'explosion' ? 15 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: color,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 0.5 + Math.random() * 0.5,
                alpha: 1,
                size: 2 + Math.random() * 3,
                type: type
            };
            
            this.particles.push(particle);
        }
    }

    createExplosion(x, y) {
        this.createParticle(x, y, '#ff8800', 'explosion');
        this.createParticle(x, y, '#ff4400', 'explosion');
        this.createParticle(x, y, '#ffff00', 'explosion');
    }

    spawnPowerUp(x, y) {
        const types = ['health', 'fireRate', 'speed', 'weapon'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            x: x - 10,
            y: y,
            width: 20,
            height: 20,
            speed: 50,
            type: type,
            color: this.getPowerUpColor(type),
            rotation: 0,
            rotationSpeed: 180
        };
        
        this.powerUps.push(powerUp);
    }

    getPowerUpColor(type) {
        const colors = {
            health: '#00ff00',
            fireRate: '#ff8800',
            speed: '#00ffff',
            weapon: '#ff00ff'
        };
        return colors[type] || '#ffffff';
    }

    applyPowerUp(player, powerUp) {
        switch (powerUp.type) {
            case 'health':
                player.health = Math.min(player.maxHealth, player.health + 30);
                break;
            case 'fireRate':
                player.fireRate = Math.max(50, player.fireRate - 50);
                break;
            case 'speed':
                player.speed = Math.min(500, player.speed + 50);
                break;
            case 'weapon':
                const weapons = ['laser', 'missile', 'plasma', 'railgun'];
                player.weaponType = weapons[Math.floor(Math.random() * weapons.length)];
                break;
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.gameConfig.width, this.gameConfig.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw players
        this.players.forEach(player => this.drawPlayer(player));
        
        // Draw projectiles
        this.projectiles.forEach(projectile => this.drawProjectile(projectile));
        
        // Draw enemies
        this.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
    }

    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() * this.gameConfig.width);
            const y = (Math.random() * this.gameConfig.height + performance.now() * 0.01) % this.gameConfig.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    drawPlayer(player) {
        this.ctx.save();
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        
        // Draw aircraft body
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        
        // Draw aircraft details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-5, -player.height / 2, 10, 5);
        
        // Draw wings
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(-player.width / 2 - 10, 0, 20, 8);
        this.ctx.fillRect(player.width / 2 - 10, 0, 20, 8);
        
        this.ctx.restore();
    }

    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.color;
        this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        
        // Add glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = projectile.color;
        this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        this.ctx.shadowBlur = 0;
    }

    drawEnemy(enemy) {
        this.ctx.save();
        this.ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        this.ctx.rotate(Math.PI);
        
        this.ctx.fillStyle = enemy.color;
        this.ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        
        this.ctx.restore();
    }

    drawPowerUp(powerUp) {
        this.ctx.save();
        this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        this.ctx.rotate(powerUp.rotation * Math.PI / 180);
        
        this.ctx.fillStyle = powerUp.color;
        this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
        
        // Add glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = powerUp.color;
        this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
        this.ctx.shadowBlur = 0;
        
        this.ctx.restore();
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        this.ctx.restore();
    }

    updatePlayerUI() {
        this.players.forEach((player, index) => {
            const healthElement = document.getElementById(`player${index + 1}Health`);
            const scoreElement = document.getElementById(`player${index + 1}Score`);
            
            if (healthElement) {
                const healthPercent = (player.health / player.maxHealth) * 100;
                healthElement.style.width = `${Math.max(0, healthPercent)}%`;
            }
            
            if (scoreElement) {
                scoreElement.textContent = player.score;
            }
        });
    }

    checkGameOver() {
        const alivePlayers = this.players.filter(player => player.health > 0);
        
        if (alivePlayers.length <= 1 && this.gameMode === 'localMultiplayer') {
            this.showGameOverScreen();
        } else if (alivePlayers.length === 0) {
            this.showGameOverScreen();
        }
    }

    showGameOverScreen() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverMenu').classList.remove('hidden');
        
        // Update final scores
        document.getElementById('finalScore1').textContent = this.players[0]?.score || 0;
        if (this.players[1]) {
            document.getElementById('finalScore2').textContent = this.players[1].score;
        }
        
        // Determine winner
        let winner = '';
        if (this.gameMode === 'localMultiplayer') {
            const player1Score = this.players[0]?.score || 0;
            const player2Score = this.players[1]?.score || 0;
            
            if (player1Score > player2Score) {
                winner = '玩家1 获胜!';
            } else if (player2Score > player1Score) {
                winner = '玩家2 获胜!';
            } else {
                winner = '平局!';
            }
        } else {
            winner = `最终分数: ${this.players[0]?.score || 0}`;
        }
        
        document.getElementById('winnerDisplay').textContent = winner;
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').classList.remove('hidden');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseMenu').classList.add('hidden');
            this.lastTime = performance.now();
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
        }
    }

    restartGame() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.add('hidden');
        
        if (this.gameMode === 'singlePlayer') {
            this.setupSinglePlayerGame();
        } else if (this.gameMode === 'localMultiplayer') {
            this.setupLocalMultiplayerGame();
        }
        
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    exitToMenu() {
        this.gameState = 'menu';
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.showMainMenu();
    }

    // Online functionality placeholders
    createRoom() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('请输入您的名称');
            return;
        }
        
        // This would connect to a real server
        console.log('Creating room for player:', playerName);
        // For now, just show a message
        alert('房间创建功能将在服务器配置后启用');
    }

    showJoinRoom() {
        document.querySelector('.room-code-section').classList.remove('hidden');
    }

    // Customization functionality
    initializePreviewCanvas() {
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        
        // Draw default aircraft
        this.drawPreviewAircraft(ctx, canvas.width / 2, canvas.height / 2, '#00ffff');
    }

    initializeAiPreviewCanvas() {
        const canvas = document.getElementById('aiPreviewCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawPreviewAircraft(ctx, x, y, color) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw aircraft
        ctx.fillStyle = color;
        ctx.fillRect(-15, -20, 30, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -20, 10, 5);
        
        ctx.fillStyle = color;
        ctx.fillRect(-25, 0, 20, 8);
        ctx.fillRect(5, 0, 20, 8);
        
        ctx.restore();
    }

    updatePreview() {
        const selectedColor = document.querySelector('.color-option.selected');
        if (selectedColor) {
            const canvas = document.getElementById('previewCanvas');
            const ctx = canvas.getContext('2d');
            this.drawPreviewAircraft(ctx, canvas.width / 2, canvas.height / 2, selectedColor.dataset.color);
        }
    }

    saveCustomization() {
        // Save customization settings
        const selectedColor = document.querySelector('.color-option.selected');
        const aircraftType = document.getElementById('aircraftType').value;
        const weaponType = document.getElementById('weaponType').value;
        
        console.log('Saved customization:', {
            color: selectedColor?.dataset.color || '#00ffff',
            aircraftType,
            weaponType
        });
        
        alert('配置已保存!');
        this.showMainMenu();
    }

    generateAiAircraft() {
        const prompt = document.getElementById('aiPrompt').value.trim();
        if (!prompt) {
            alert('请描述您想要的飞行器');
            return;
        }
        
        // Simulate AI generation
        setTimeout(() => {
            const aircraftData = this.simulateAiGeneration(prompt);
            this.displayAiResult(aircraftData);
        }, 2000);
        
        // Show loading state
        document.getElementById('generateAiBtn').textContent = '正在生成...';
        document.getElementById('generateAiBtn').disabled = true;
    }

    simulateAiGeneration(prompt) {
        // Simple AI simulation based on keywords
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const names = ['雷霆战机', '星际猎手', '量子驱逐舰', '光速拦截机', '等离子轰炸机'];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        
        return {
            name: name,
            color: color,
            description: `基于您的描述"${prompt}"生成的独特飞行器。这架${name}配备了先进的推进系统和强大的武器系统。`,
            stats: {
                speed: Math.floor(Math.random() * 50) + 50,
                firepower: Math.floor(Math.random() * 50) + 50,
                armor: Math.floor(Math.random() * 50) + 50
            }
        };
    }

    displayAiResult(aircraftData) {
        document.getElementById('generatedName').textContent = aircraftData.name;
        document.getElementById('generatedDescription').textContent = aircraftData.description;
        document.getElementById('generatedSpeed').textContent = aircraftData.stats.speed;
        document.getElementById('generatedFirepower').textContent = aircraftData.stats.firepower;
        document.getElementById('generatedArmor').textContent = aircraftData.stats.armor;
        
        // Draw AI aircraft
        const canvas = document.getElementById('aiPreviewCanvas');
        const ctx = canvas.getContext('2d');
        this.drawPreviewAircraft(ctx, canvas.width / 2, canvas.height / 2, aircraftData.color);
        
        // Show use button
        document.getElementById('useAiBtn').classList.remove('hidden');
        
        // Reset generate button
        document.getElementById('generateAiBtn').textContent = '生成飞行器';
        document.getElementById('generateAiBtn').disabled = false;
    }

    useAiAircraft() {
        alert('AI生成的飞行器配置已应用!');
        this.showMainMenu();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
