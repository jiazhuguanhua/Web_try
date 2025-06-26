const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 生产环境优化
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname), {
        maxAge: '1d', // 缓存静态文件
        etag: true
    }));
}

// Game state
const rooms = new Map();
const players = new Map();

class GameRoom {
    constructor(code) {
        this.code = code;
        this.players = new Map();
        this.gameState = 'waiting'; // waiting, playing, ended
        this.maxPlayers = 4;
        this.host = null;
        this.enemies = [];
        this.powerUps = [];
        this.lastEnemySpawn = 0;
    }

    addPlayer(playerId, playerData) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }

        if (this.players.size === 0) {
            this.host = playerId;
            playerData.isHost = true;
        }

        this.players.set(playerId, playerData);
        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        
        // If host left, assign new host
        if (this.host === playerId && this.players.size > 0) {
            this.host = Array.from(this.players.keys())[0];
            this.players.get(this.host).isHost = true;
        }
        
        return this.players.size === 0; // Return true if room is empty
    }

    broadcastToAll(event, data, excludePlayer = null) {
        this.players.forEach((player, playerId) => {
            if (playerId !== excludePlayer && player.socket) {
                player.socket.emit(event, data);
            }
        });
    }

    update() {
        if (this.gameState !== 'playing') return;

        const now = Date.now();
        
        // Spawn enemies
        if (now - this.lastEnemySpawn > 2000 + Math.random() * 3000) {
            this.spawnEnemy();
            this.lastEnemySpawn = now;
        }

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed * 0.016; // Assuming 60fps
            return enemy.y < 1000; // Remove off-screen enemies
        });

        // Broadcast game state
        this.broadcastToAll('gameState', {
            enemies: this.enemies,
            powerUps: this.powerUps
        });
    }

    spawnEnemy() {
        const enemy = {
            id: Math.random().toString(36).substring(7),
            x: Math.random() * 800,
            y: -30,
            width: 30,
            height: 30,
            speed: 100 + Math.random() * 100,
            health: 40,
            color: '#ff4444',
            type: 'basic'
        };
        
        this.enemies.push(enemy);
    }

    startGame() {
        this.gameState = 'playing';
        this.enemies = [];
        this.powerUps = [];
        this.lastEnemySpawn = Date.now();
        
        this.broadcastToAll('gameStart', {
            players: Array.from(this.players.values())
        });
    }
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createRoom', (data) => {
        const roomCode = generateRoomCode();
        const room = new GameRoom(roomCode);
        
        const playerData = {
            id: socket.id,
            name: data.playerName,
            x: 400,
            y: 500,
            health: 100,
            score: 0,
            color: '#00ffff',
            socket: socket
        };

        if (room.addPlayer(socket.id, playerData)) {
            rooms.set(roomCode, room);
            players.set(socket.id, { roomCode, playerId: socket.id });
            
            socket.join(roomCode);
            socket.emit('roomCreated', {
                roomCode: roomCode,
                playerId: socket.id,
                isHost: true
            });
            
            console.log(`Room ${roomCode} created by ${data.playerName}`);
        } else {
            socket.emit('error', { message: '创建房间失败' });
        }
    });

    socket.on('joinRoom', (data) => {
        const room = rooms.get(data.roomCode);
        
        if (!room) {
            socket.emit('error', { message: '房间不存在' });
            return;
        }

        const playerData = {
            id: socket.id,
            name: data.playerName,
            x: 300 + Math.random() * 200,
            y: 500,
            health: 100,
            score: 0,
            color: getRandomColor(),
            socket: socket
        };

        if (room.addPlayer(socket.id, playerData)) {
            players.set(socket.id, { roomCode: data.roomCode, playerId: socket.id });
            
            socket.join(data.roomCode);
            socket.emit('roomJoined', {
                roomCode: data.roomCode,
                playerId: socket.id,
                players: Array.from(room.players.values())
            });
            
            // Notify other players
            room.broadcastToAll('playerJoined', {
                player: playerData
            }, socket.id);
            
            console.log(`${data.playerName} joined room ${data.roomCode}`);
            
            // Auto-start game if we have 2+ players
            if (room.players.size >= 2) {
                setTimeout(() => {
                    room.startGame();
                }, 2000);
            }
        } else {
            socket.emit('error', { message: '房间已满' });
        }
    });

    socket.on('playerUpdate', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const room = rooms.get(playerInfo.roomCode);
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player) return;

        // Update player data
        Object.assign(player, data.updates);

        // Broadcast to other players
        room.broadcastToAll('playerUpdate', {
            playerId: socket.id,
            updates: data.updates
        }, socket.id);
    });

    socket.on('projectile', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const room = rooms.get(playerInfo.roomCode);
        if (!room) return;

        // Broadcast projectile to all players
        room.broadcastToAll('projectile', {
            ownerId: socket.id,
            projectile: data.projectile
        });
    });

    socket.on('enemyHit', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const room = rooms.get(playerInfo.roomCode);
        if (!room) return;

        // Remove enemy and award points
        room.enemies = room.enemies.filter(enemy => enemy.id !== data.enemyId);
        
        const player = room.players.get(socket.id);
        if (player) {
            player.score += 100;
        }

        // Broadcast enemy destruction
        room.broadcastToAll('enemyDestroyed', {
            enemyId: data.enemyId,
            playerId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        const playerInfo = players.get(socket.id);
        if (playerInfo) {
            const room = rooms.get(playerInfo.roomCode);
            if (room) {
                const isEmpty = room.removePlayer(socket.id);
                
                // Notify other players
                room.broadcastToAll('playerLeft', {
                    playerId: socket.id
                });
                
                // Remove empty room
                if (isEmpty) {
                    rooms.delete(playerInfo.roomCode);
                    console.log(`Room ${playerInfo.roomCode} deleted (empty)`);
                }
            }
            
            players.delete(socket.id);
        }
    });
});

// Game update loop
setInterval(() => {
    rooms.forEach(room => {
        room.update();
    });
}, 16); // ~60fps

// Utility functions
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomColor() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        rooms: rooms.size,
        players: players.size,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 飞行器游戏服务器运行在端口 ${PORT}`);
    console.log(`📱 访问 http://localhost:${PORT} 开始游戏`);
});
