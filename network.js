class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.playerId = null;
        this.roomCode = null;
        this.players = new Map();
        this.gameState = null;
        
        // GitHub Pages模式：使用模拟服务器
        this.simulatedServer = new SimulatedServer();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinRoomInput());
        
        // Room code input handling
        const roomCodeInput = document.getElementById('roomCode');
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom(roomCodeInput.value.trim());
            }
        });
    }

    async createRoom() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            this.showError('请输入您的名称');
            return;
        }

        try {
            this.updateConnectionStatus('连接中...');
            
            // Simulate server connection
            const response = await this.simulatedServer.createRoom(playerName);
            
            if (response.success) {
                this.roomCode = response.roomCode;
                this.playerId = response.playerId;
                this.isConnected = true;
                
                this.updateConnectionStatus('已连接');
                this.showRoomInfo(response.roomCode);
                
                // Set up message handling
                this.simulatedServer.onMessage = (message) => this.handleServerMessage(message);
                
            } else {
                this.showError('创建房间失败');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            this.showError('连接失败，请稍后重试');
        }
    }

    showJoinRoomInput() {
        const roomCodeSection = document.querySelector('.room-code-section');
        roomCodeSection.classList.remove('hidden');
        document.getElementById('roomCode').focus();
    }

    async joinRoom(roomCode) {
        if (!roomCode) {
            this.showError('请输入房间代码');
            return;
        }

        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            this.showError('请输入您的名称');
            return;
        }

        try {
            this.updateConnectionStatus('连接中...');
            
            const response = await this.simulatedServer.joinRoom(roomCode, playerName);
            
            if (response.success) {
                this.roomCode = roomCode;
                this.playerId = response.playerId;
                this.isConnected = true;
                
                this.updateConnectionStatus('已连接');
                this.showRoomInfo(roomCode);
                
                // Set up message handling
                this.simulatedServer.onMessage = (message) => this.handleServerMessage(message);
                
                // Start the online game
                this.startOnlineGame();
                
            } else {
                this.showError(response.error || '加入房间失败');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            this.showError('连接失败，请稍后重试');
        }
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'playerJoined':
                this.handlePlayerJoined(message.data);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(message.data);
                break;
            case 'gameState':
                this.handleGameStateUpdate(message.data);
                break;
            case 'playerUpdate':
                this.handlePlayerUpdate(message.data);
                break;
            case 'projectile':
                this.handleProjectile(message.data);
                break;
            case 'gameStart':
                this.handleGameStart(message.data);
                break;
            case 'gameEnd':
                this.handleGameEnd(message.data);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    handlePlayerJoined(data) {
        this.players.set(data.playerId, data.player);
        console.log('Player joined:', data.player.name);
        
        // Update UI to show players in room
        this.updatePlayerList();
    }

    handlePlayerLeft(data) {
        this.players.delete(data.playerId);
        console.log('Player left:', data.playerId);
        
        this.updatePlayerList();
    }

    handleGameStateUpdate(gameState) {
        if (window.game && window.game.gameState === 'playing') {
            // Update game state from server
            this.syncGameState(gameState);
        }
    }

    handlePlayerUpdate(data) {
        const player = this.players.get(data.playerId);
        if (player && data.playerId !== this.playerId) {
            // Update other player's position and state
            Object.assign(player, data.updates);
        }
    }

    handleProjectile(data) {
        if (window.game && window.game.gameState === 'playing') {
            // Add projectile from other players
            if (data.ownerId !== this.playerId) {
                window.game.projectiles.push(data.projectile);
            }
        }
    }

    handleGameStart(data) {
        console.log('Game starting...');
        this.startOnlineGame();
    }

    handleGameEnd(data) {
        console.log('Game ended:', data);
        if (window.game) {
            window.game.showGameOverScreen();
        }
    }

    startOnlineGame() {
        if (window.game) {
            window.game.gameMode = 'online';
            window.game.hideAllScreens();
            window.game.initializeGameCanvas();
            window.game.setupOnlineGame();
            window.game.startGameLoop();
        }
    }

    sendPlayerUpdate(player) {
        if (this.isConnected && this.simulatedServer) {
            this.simulatedServer.sendMessage({
                type: 'playerUpdate',
                data: {
                    playerId: this.playerId,
                    updates: {
                        x: player.x,
                        y: player.y,
                        health: player.health,
                        score: player.score
                    }
                }
            });
        }
    }

    sendProjectile(projectile) {
        if (this.isConnected && this.simulatedServer) {
            this.simulatedServer.sendMessage({
                type: 'projectile',
                data: {
                    ownerId: this.playerId,
                    projectile: projectile
                }
            });
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.textContent = status;
        
        if (status === '已连接') {
            statusElement.parentElement.classList.add('connected');
        } else {
            statusElement.parentElement.classList.remove('connected');
        }
    }

    showRoomInfo(roomCode) {
        alert(`房间创建成功！\n房间代码: ${roomCode}\n请分享此代码给其他玩家`);
    }

    showError(message) {
        alert(`错误: ${message}`);
        this.updateConnectionStatus('离线');
    }

    updatePlayerList() {
        // Update UI to show current players in room
        console.log('Current players:', Array.from(this.players.values()));
    }

    syncGameState(gameState) {
        // Sync local game state with server state
        if (window.game) {
            // Update enemies, power-ups, etc.
            if (gameState.enemies) {
                window.game.enemies = gameState.enemies;
            }
            if (gameState.powerUps) {
                window.game.powerUps = gameState.powerUps;
            }
        }
    }

    disconnect() {
        if (this.simulatedServer) {
            this.simulatedServer.disconnect();
        }
        
        this.isConnected = false;
        this.playerId = null;
        this.roomCode = null;
        this.players.clear();
        
        this.updateConnectionStatus('离线');
    }
}

// Simulated server for development/demo purposes
class SimulatedServer {
    constructor() {
        this.rooms = new Map();
        this.players = new Map();
        this.onMessage = null;
        this.messageQueue = [];
        
        // Simulate server processing
        setInterval(() => this.processMessages(), 50);
    }

    async createRoom(playerName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const roomCode = this.generateRoomCode();
                const playerId = this.generatePlayerId();
                
                const room = {
                    code: roomCode,
                    players: new Map(),
                    gameState: 'waiting',
                    maxPlayers: 4
                };
                
                const player = {
                    id: playerId,
                    name: playerName,
                    isHost: true,
                    x: 0,
                    y: 0,
                    health: 100,
                    score: 0
                };
                
                room.players.set(playerId, player);
                this.rooms.set(roomCode, room);
                this.players.set(playerId, { roomCode, playerId });
                
                resolve({
                    success: true,
                    roomCode: roomCode,
                    playerId: playerId
                });
            }, 500);
        });
    }

    async joinRoom(roomCode, playerName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const room = this.rooms.get(roomCode);
                
                if (!room) {
                    resolve({
                        success: false,
                        error: '房间不存在'
                    });
                    return;
                }
                
                if (room.players.size >= room.maxPlayers) {
                    resolve({
                        success: false,
                        error: '房间已满'
                    });
                    return;
                }
                
                const playerId = this.generatePlayerId();
                const player = {
                    id: playerId,
                    name: playerName,
                    isHost: false,
                    x: 0,
                    y: 0,
                    health: 100,
                    score: 0
                };
                
                room.players.set(playerId, player);
                this.players.set(playerId, { roomCode, playerId });
                
                // Notify other players
                this.broadcastToRoom(roomCode, {
                    type: 'playerJoined',
                    data: {
                        playerId: playerId,
                        player: player
                    }
                }, playerId);
                
                resolve({
                    success: true,
                    playerId: playerId
                });
            }, 500);
        });
    }

    sendMessage(message) {
        this.messageQueue.push(message);
    }

    processMessages() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.handleMessage(message);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'playerUpdate':
                this.handlePlayerUpdate(message.data);
                break;
            case 'projectile':
                this.handleProjectile(message.data);
                break;
        }
    }

    handlePlayerUpdate(data) {
        const playerInfo = this.players.get(data.playerId);
        if (playerInfo) {
            const room = this.rooms.get(playerInfo.roomCode);
            if (room) {
                const player = room.players.get(data.playerId);
                if (player) {
                    Object.assign(player, data.updates);
                    
                    // Broadcast to other players
                    this.broadcastToRoom(playerInfo.roomCode, {
                        type: 'playerUpdate',
                        data: data
                    }, data.playerId);
                }
            }
        }
    }

    handleProjectile(data) {
        const playerInfo = this.players.get(data.ownerId);
        if (playerInfo) {
            // Broadcast projectile to all players in room
            this.broadcastToRoom(playerInfo.roomCode, {
                type: 'projectile',
                data: data
            });
        }
    }

    broadcastToRoom(roomCode, message, excludePlayerId = null) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.players.forEach((player, playerId) => {
                if (playerId !== excludePlayerId && this.onMessage) {
                    // Simulate network delay
                    setTimeout(() => {
                        this.onMessage(message);
                    }, Math.random() * 50 + 10);
                }
            });
        }
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substring(2, 15);
    }

    disconnect() {
        // Clean up server state
        this.messageQueue = [];
    }
}

// Initialize network manager
document.addEventListener('DOMContentLoaded', () => {
    window.networkManager = new NetworkManager();
});
