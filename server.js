const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {}; // Store rooms by password (room code)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Player attempts to join a room
  socket.on("join-room", ({ roomId, playerName }) => {
    console.log(`Attempting to join room: ${roomId} with player: ${playerName}`);

    // Check if room exists
    if (!rooms[roomId]) {
      socket.emit("room-error", "Password incorrect. Room does not exist.");
      console.log(`Room ${roomId} does not exist`);
      return;
    }

    const room = rooms[roomId];

    // Check if the player has already joined
    if (room.players.some((p) => p.name === playerName)) {
      socket.emit("room-error", "You are already in this room");
      console.log(`Player ${playerName} already in room ${roomId}`);
      return;
    }

    // Only allow Player 1 to select the number of tiles
    if (room.isStarted) {
      socket.emit("room-error", "Game has already started. You cannot change the number of tiles.");
      return;
    }

    // Add the player to the room
    const maxPlayers = 6;
    if (room.players.length < maxPlayers) {
      room.players.push({ id: socket.id, name: playerName });
      socket.join(roomId);
      console.log(`Player ${playerName} joined room ${roomId}`);
      io.to(roomId).emit("player-joined", room.players); // Notify players in the room
    } else {
      socket.emit("room-full", { message: `Room is full. Max ${maxPlayers} players allowed.` });
      console.log(`Room ${roomId} is full, cannot join`);
    }
  });

  // Player 1 creates a room and selects the number of tiles
  socket.on("create-room", ({ roomId, playerName, tileCount }) => {
    if (rooms[roomId]) {
      socket.emit("room-error", "Room already exists");
      console.log(`Room ${roomId} already exists`);
      return;
    }

    rooms[roomId] = {
      player1: playerName,
      tileCount,
      players: [{ id: socket.id, name: playerName }],
      isStarted: false, // Game has not started yet
    };

    socket.join(roomId);
    console.log(`Room ${roomId} created by Player 1: ${playerName} with ${tileCount} tiles`);
    io.to(roomId).emit("room-created", { roomId, playerName, tileCount });
  });

  // When Player 1 starts the game, lock the tile count
  socket.on("start-game", ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.player1 === socket.id) {
      room.isStarted = true;
      io.to(roomId).emit("game-started", { message: "Game has started!" });
      console.log(`Game started in room ${roomId}`);
    } else {
      socket.emit("room-error", "You are not Player 1, cannot start the game.");
    }
  });

  // Handling tile click and updating the game state
  socket.on("tile-clicked", ({ roomId, tileIndex }) => {
    socket.to(roomId).emit("update-click", tileIndex);
  });

  // Handling matched tiles
  socket.on("matched", ({ roomId, matchedIndices }) => {
    socket.to(roomId).emit("update-matches", matchedIndices);
  });

  // Handling game over and notifying winner
  socket.on("game-over", ({ roomId, winner }) => {
    io.to(roomId).emit("game-over", winner);
  });

  // Player disconnects
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== socket.id);
      if (rooms[roomId].players.length === 0) delete rooms[roomId];
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
