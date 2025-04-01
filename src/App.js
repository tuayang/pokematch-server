import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000");

const getImageUrl = (name) => `/images/${name}.png`;

function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("Pokematch");
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState("");

  const musicRef = useRef(new Audio("/sounds/background.mp3"));

  const playSound = (type) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play();
  };

  const handleTileClick = useCallback((index, isRemote = false) => {
    if (matched.includes(index) || selected.includes(index)) return;
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (!isRemote) {
      socket.emit("tile-clicked", { roomId: roomCode, tileIndex: index });
    }

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (tiles[first] === tiles[second]) {
        playSound("match");
        const matchedIndices = [first, second];
        socket.emit("matched", { roomId: roomCode, matchedIndices });
        setMatched((prev) => [...prev, first, second]);
        setSelected([]);
      } else {
        playSound("mismatch");
        setTimeout(() => setSelected([]), 800);
      }
    }
  }, [matched, selected, roomCode, tiles]);

  useEffect(() => {
    const music = musicRef.current;
    music.loop = true;

    socket.on("room-error", (msg) => setError(msg));

    socket.on("room-joined", ({ tiles, players, scores }) => {
      setTiles(tiles);
      setScores(scores);
      setStatus("Waiting to start...");
    });

    socket.on("player-list", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("start-countdown", (timer) => {
      setCountdown(timer);
    });

    socket.on("game-started", ({ tiles }) => {
      setTiles(tiles);
      setMatched([]);
      setSelected([]);
      setGameStarted(true);
      setStatus("Game Started!");
      musicRef.current.play();
    });

    socket.on("update-click", (index) => {
      handleTileClick(index, true);
    });

    socket.on("update-matches", (indices) => {
      setMatched((prev) => [...prev, ...indices]);
    });

    socket.on("score-update", (scoreObj) => {
      setScores((prev) => ({
        ...prev,
        ...scoreObj,
      }));
    });

    socket.on("game-over", (winner) => {
      setStatus(`${winner} wins!`);
      playSound("victory");
      setGameStarted(false);
    });

    return () => {
      socket.off(); // cleanup
    };
  }, [playerName, roomCode, handleTileClick]);

  const handleCreateRoom = () => {
    if (!roomCode || !playerName) {
      setError("Missing room code or player name");
      return;
    }
    socket.emit("create-room", { roomId: roomCode, password: roomCode, playerName });
  };

  const handleStartGame = () => {
    socket.emit("start-game", { roomId: roomCode });
    musicRef.current.play(); // Play the music when the game starts
  };

  const handleRematch = () => {
    socket.emit("rematch", { roomId: roomCode });
  };

  return (
    <div className="container">
      {!gameStarted && !tiles.length ? (
        <div className="lobby">
          <h1>🎮 Pokematch</h1>
          <input
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            placeholder="Room Code (used as password)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create / Join Room</button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <>
          <h1 className="game-title">🎮 Pokematch</h1>
          {status === "Waiting to start..." && !gameStarted && (
            <div className="start-button-container">
              <button className="start-button" onClick={handleStartGame}>Start Game</button>
            </div>
          )}

          <h2>{status}</h2>

          {countdown !== null && <h1 className="countdown">{countdown}</h1>}

          <div className="scoreboard">
            <h3>Scoreboard</h3>
            {players.map((p, i) => (
              <div key={i}>
                <strong>{p.name}</strong>: {scores[p.name] || 0}
              </div>
            ))}
          </div>

          <div className={`grid ${gameStarted ? "active" : "inactive"}`}>
            {tiles.map((pokemon, index) => {
              const isFlipped = selected.includes(index);
              const isMatched = matched.includes(index);
              return (
                <div
                  key={index}
                  className={`tile ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
                  onClick={() => handleTileClick(index)}
                >
                  <div className="tile-inner">
                    <div className="tile-front">
                      <img src={getImageUrl(pokemon)} alt={pokemon} />
                    </div>
                    <div className="tile-back" />
                  </div>
                </div>
              );
            })}
          </div>

          {!gameStarted && matched.length === tiles.length && (
            <button onClick={handleRematch}>Play Again</button>
          )}

          {gameStarted && (
            <button onClick={handleRematch}>Restart Game</button>
          )}

          {!gameStarted && matched.length !== tiles.length && players.length >= 2 && (
            <button onClick={handleStartGame}>Start Game</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;
