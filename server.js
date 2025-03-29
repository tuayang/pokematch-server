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

  socket.on("join-room", ({ roomId, playerName }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    if (rooms[roomId].players.length < 2) {
      rooms[roomId].players.push({ id: socket.id, name: playerName });
      socket.join(roomId);
      io.to(roomId).emit("player-joined", rooms[roomId].players);
    } else {
      socket.emit("room-full");
    }
  });

  socket.on("tile-clicked", ({ roomId, tileIndex }) => {
    socket.to(roomId).emit("update-click", tileIndex);
  });

  socket.on("matched", ({ roomId, matchedIndices }) => {
    socket.to(roomId).emit("update-matches", matchedIndices);
  });

  socket.on("game-over", ({ roomId, winner }) => {
    io.to(roomId).emit("game-over", winner);
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
