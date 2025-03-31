// server/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const seedrandom = require("seedrandom");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const pokemonList = [
  "bulbasaur", "ivysaur", "venusaur", "charmander", "charmeleon", "charizard",
  "squirtle", "wartortle", "blastoise", "pikachu", "raichu", "mew", "mewtwo", 
  "eevee", "flareon", "vaporeon", "jolteon", "gengar", "onix", "snorlax"
  // ✅ Feel free to add more!
];

const rooms = {};

function shuffleAndDuplicate(arr, count, seed) {
  const rng = seedrandom(seed);
  const uniqueCount = count / 2;
  const selection = arr.slice(0, uniqueCount);
  const doubled = [...selection, ...selection];

  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }

  return doubled;
}

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  socket.on("create-room", ({ roomId, password, playerName }) => {
    if (rooms[roomId]) {
      socket.emit("room-exists", roomId);
      return;
    }

    const tiles = shuffleAndDuplicate(pokemonList, 100, roomId);
    rooms[roomId] = {
      password,
      tiles,
      matched: [],
      scores: {},
      players: [],
      gameStarted: false,
    };

    joinRoom(socket, roomId, password, playerName);
  });

  socket.on("join-room", ({ roomId, password, playerName }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("room-error", "Room does not exist.");
      return;
    }

    if (room.password !== password) {
      socket.emit("room-error", "Incorrect room password.");
      return;
    }

    joinRoom(socket, roomId, password, playerName);
  });

  function joinRoom(socket, roomId, password, playerName) {
    const room = rooms[roomId];
    if (room.players.find(p => p.name === playerName)) {
      socket.emit("room-error", "That name is already taken.");
      return;
    }

    const player = { id: socket.id, name: playerName };
    room.players.push(player);
    room.scores[playerName] = 0;
    socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      tiles: room.tiles,
      scores: room.scores,
    });

    io.to(roomId).emit("player-list", room.players);
  }

  socket.on("start-game", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.gameStarted = true;
    io.to(roomId).emit("start-countdown");

    setTimeout(() => {
      io.to(roomId).emit("game-started", {
        tiles: room.tiles,
      });
    }, 3000);
  });

  socket.on("tile-clicked", ({ roomId, tileIndex }) => {
    socket.to(roomId).emit("update-click", tileIndex);
  });

socket.on("matched", ({ roomId, matchedIndices }) => {
  const room = rooms[roomId];
  if (!room) return;

  const player = room.players.find(p => p.id === socket.id);
  if (!player) return;

  const playerName = player.name;

  // Prevent duplicate matches
  if (room.matched.includes(matchedIndices[0]) || room.matched.includes(matchedIndices[1])) return;

  room.matched.push(...matchedIndices);
  room.scores[playerName] += 1;

  // 🔁 Broadcast matched tiles to all
  io.to(roomId).emit("update-matches", matchedIndices);

  // 🧠 Broadcast the full scores to ALL players (now accurate!)
  io.to(roomId).emit("score-update", room.scores);

  // 🎯 Check game over
  const totalPairs = room.tiles.length / 2;
  const matchedPairs = room.matched.length / 2;

  if (matchedPairs >= totalPairs) {
    const winner = Object.entries(room.scores).sort((a, b) => b[1] - a[1])[0][0];
    io.to(roomId).emit("game-over", winner);
  }
});

  socket.on("rematch", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const newTiles = shuffleAndDuplicate(pokemonList, 100, roomId + "_rematch");
    room.tiles = newTiles;
    room.matched = [];
    room.scores = room.players.reduce((acc, p) => {
      acc[p.name] = 0;
      return acc;
    }, {});
    room.gameStarted = false;

    io.to(roomId).emit("rematch-ready", {
      tiles: newTiles,
      scores: room.scores,
    });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const player = room.players.splice(index, 1)[0];
        delete room.scores[player.name];
        io.to(roomId).emit("player-list", room.players);
      }
    }
  });
});

server.listen(4000, () => {
  console.log("🚀 Pokematch Server running on port 4000");
});
