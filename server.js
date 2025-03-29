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

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create a new room
  socket.on("create-room", ({ roomId, playerName }) => {
    if (rooms[roomId]) {
      socket.emit("room-error", "Room already exists");
      console.log(`Room ${roomId} already exists`);
      return;
    }

    rooms[roomId] = {
      password: roomId, // Password = roomId for simplicity
      players: [{ id: socket.id, name: playerName }],
      isStarted: false,
    };
    socket.join(roomId);
    console.log(`Room ${roomId} created by ${playerName}`);
    io.to(roomId).emit("room-created", { roomId, playerName });
  });

  // Join an existing room
  socket.on("join-room", ({ roomId, playerName }) => {
    if (!rooms[roomId]) {
      socket.emit("room-error", "Room does not exist");
      console.log(`Room ${roomId} does not exist`);
      return;
    }

    const room = rooms[roomId];

    if (room.players.some((p) => p.name === playerName)) {
      socket.emit("room-error", "You are already in this room");
      console.log(`${playerName} is already in room ${roomId}`);
      return;
    }

    const maxPlayers = 6;
    if (room.players.length < maxPlayers) {
      room.players.push({ id: socket.id, name: playerName });
      socket.join(roomId);
      console.log(`${playerName} joined room ${roomId}`);
      io.to(roomId).emit("player-joined", room.players);
    } else {
      socket.emit("room-error", "Room is full");
      console.log(`Room ${roomId} is full`);
    }
  });

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
