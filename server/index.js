const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

let games = {}; 
// games = { gameId: { players: [socketIds], roles: { socketId: role }, availableRoles: [] } }

const allRoles = ['m1', 'b1', 'm2', 'b2'];

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createGame', (data, callback) => {
    const gameId = uuidv4();
    games[gameId] = {
      players: [],
      roles: {},
      availableRoles: [...allRoles],
    };
    console.log(`Game created: ${gameId}`);
    callback(gameId);
  });

  socket.on('joinGame', ({ gameId }, callback) => {
    if (games[gameId] && games[gameId].players.length < 4) {
      const role = assignRandomRole(gameId, socket.id);
      const playerId = uuidv4();

      games[gameId].players.push(socket.id);
      games[gameId].roles[socket.id] = role;

      socket.join(gameId);
      console.log(`Player ${playerId} joined game ${gameId} as ${role}`);

      socket.emit('welcome', { playerId, role, gameId });
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('updateParameter', ({ param, value, senderId }) => {
    // Broadcast to all clients in the game
    const gameId = findGameBySocket(socket.id);
    if (gameId) {
      io.to(gameId).emit('parameterUpdated', { param, value, senderId });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const gameId = findGameBySocket(socket.id);
    if (gameId) {
      const role = games[gameId].roles[socket.id];
      games[gameId].availableRoles.push(role);

      games[gameId].players = games[gameId].players.filter(id => id !== socket.id);
      delete games[gameId].roles[socket.id];

      if (games[gameId].players.length === 0) {
        delete games[gameId];
        console.log(`Game ${gameId} deleted (no players left)`);
      }
    }
  });
});

function assignRandomRole(gameId, socketId) {
  const game = games[gameId];
  const available = game.availableRoles;

  if (available.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * available.length);
  const role = available.splice(randomIndex, 1)[0];
  return role;
}

function findGameBySocket(socketId) {
  for (const gameId in games) {
    if (games[gameId].players.includes(socketId)) {
      return gameId;
    }
  }
  return null;
}

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
