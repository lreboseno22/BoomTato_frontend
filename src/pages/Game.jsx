import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import socket from "../socket.js";
import styles from "../styles/Game.module.css";

/**
 * GamePage
 *
 * Handles a single game lobby page where players wait before starting a match.
 * Displays current players, allows the host to start or end the game
 * As well as managing real-time updates using socket.io
 */

export default function GamePage() {
  const { id } = useParams();
  const [game, setGame] = useState({ players: [] }); // make sure players is always an array in init game state
  const [player, setPlayer] = useState(null);
  const nav = useNavigate();

  // Socket setup: join game room and handle game start
  useEffect(() => {
    // When user opens this page, join the corresponding game room on the server.
    socket.emit("joinGameRoom", id);

    // Listen for when the host starts the game
    socket.on("gameStarted", ({ gameId, initialState }) => {
      console.log("Game Started:", gameId, initialState);

      // Redirect to the play screen (kaboom canvas) once the game begins.
      nav(`/play/${gameId}`, { state: { initialState } });
    });

    // Cleanup listener when leaving the component
    return () => {
      socket.off("gameStarted");
    };
  }, [id, nav]);

  // Ensure host is always included in players list
  useEffect(() => {
    if (game && player) {
      // Safely ensure we always have a players array
      const playersArray = Array.isArray(game.players) ? game.players : [];

      // If the host/player is missiong from the list, re-add them
      if (!playersArray.find((p) => p._id === player._id)) {
        setGame((prev) => ({
          ...prev,
          players: [
            ...prev.players,
            { _id: player._id, username: player.username },
          ],
        }));
      }
    }
  }, [game, player]);

  // Listen for real-time updates when new players join
  useEffect(() => {
    socket.on("playerJoined", ({ gameId, gameState }) => {
      // Only update if this is the current game
      if (gameId === id) {
        setGame((prevGame) => ({
          ...prevGame,
          players: Array.isArray(gameState.players) // Merge new players with existing, ensuring no duplicates
            ? [
                ...prevGame.players.filter(
                  (p) => !gameState.players.some((np) => np._id === p._id)
                ),
                ...gameState.players,
              ]
            : prevGame.players,
        }));
      }
    });

    // Cleanup listener when leaving the page
    return () => {
      socket.off("playerJoined");
    };
  }, [id]);

  // Load player data from localStorage and fetch game info
  useEffect(() => {
    const storedPlayer = JSON.parse(localStorage.getItem("player"));
    if (storedPlayer) setPlayer(storedPlayer);
    getGame();
  }, [id]);

  // Fetch current game details from backend
  const getGame = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/games/${id}`);
      // Ensure players field is always a valid array
      setGame({
        ...res.data,
        players: Array.isArray(res.data.players) ? res.data.players : [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  // HOST ACTION: Start the game -> tells backend to mark the game as started as well as emit to notify all connected players
  const handleStartGame = async () => {
    try {
      await axios.put(`http://localhost:3000/api/games/${id}/start`);
      socket.emit("startGame", id);
    } catch (err) {
      console.error(err);
    }
  };

  // PLAYER ACTION: Leave the current game -> navigates player back to lobby after leaving and notifying backend that player left the game
  const handleLeaveGame = async () => {
    if (!player) return alert("You must be logged in");
    try {
      await axios.patch(`http://localhost:3000/api/games/${id}/leave`, {
        playerId: player._id,
      });
      nav("/lobby");
    } catch (err) {
      console.error(err);
      alert("Error Leaving Game");
    }
  };

  // HOST ACTION: end and delete the game -> removes the game from database and returns host to lobby after game deletion
  const handleEndGame = async () => {
    if (!player) return alert("You must be logged in");
    const confirmEnd = window.confirm(
      "Are you sure you want to end this game?"
    );
    if (!confirmEnd) return;

    try {
      await axios.delete(`http://localhost:3000/api/games/${id}`);
      nav("/lobby");
    } catch (err) {
      console.error(err);
      alert("Error ending game");
    }
  };

  if (!game) return <p>Loading game...</p>;

  // Detemine if current player is the host
  const isHost = player && game.host && player._id === game.host._id;

  return (
    <div className={styles.gamePage}>
      <img
        src="/assets/explosiongif.gif"
        alt="explosion"
        className={styles.explosionLeft}
      />
      <img
        src="/assets/explosiongif.gif"
        alt="explosion"
        className={styles.explosionRight}
      />
      <img
        src="/assets/explosiongif.gif"
        alt="explosion"
        className={styles.explosionTop}
      />
      <img
        src="/assets/explosiongif.gif"
        alt="explosion"
        className={styles.explosionBottom}
      />

      {/* Main Game Container */}
      <div className={styles.gameContainer}>
        {/* Game Info */}
        <h1 className={styles.title}>{game.name}</h1>
        <h2 className={styles.status}>Status: {game.status}</h2>

        {/* Player List */}
        <h3 className={styles.playersTitle}>Players:</h3>
        <ul className={styles.playersList}>
          {Array.isArray(game.players) &&
            game.players.map((p) => (
              <li key={p._id} className={styles.playerItem}>
                {p.username}
              </li>
            ))}
        </ul>

        {/* Game Actions */}
        <div className={styles.actions}>
          {isHost ? (
            <button className={styles.actionBtn} onClick={handleEndGame}>
              End Game
            </button>
          ) : (
            <button className={styles.actionBtn} onClick={handleLeaveGame}>
              Leave Game
            </button>
          )}

          {/* Host can only start the game if it's waiting and has >= 2 players */}
          {isHost && game.status === "waiting" && game.players.length >= 2 && (
            <button className={styles.startBtn} onClick={handleStartGame}>
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
