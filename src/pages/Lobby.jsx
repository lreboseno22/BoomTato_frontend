import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import styles from "../styles/Lobby.module.css";

/**
 * LobbyPage
 *
 * This page is the where users see avaiable ("waiting" state) games created by other users
 * User can join game or create their own game using the form
 */
export default function LobbyPage() {
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const [gameName, setGameName] = useState("");
  const nav = useNavigate();

  // On mount, verify player session and load inital games (redirects user if not logged in)
  useEffect(() => {
    const storedPlayer = JSON.parse(localStorage.getItem("player"));
    if (!storedPlayer) {
      alert("You must be logged in first");
      nav("/login");
    } else {
      setPlayer(storedPlayer);
      getGames();
    }
  }, [nav]);

  /**
   * Socket listeners for real-time updates
   * "lobbyUpdate" -> add new games as the're created
   * "gameCreated" -> navigates host directly to their new game
   */
  useEffect(() => {
    socket.on("lobbyUpdate", (newGame) => {
      setGames((prevGames) => [...(prevGames || []), newGame]);
    });

    socket.on("gameCreated", (game) => {
      nav(`/game/${game._id}`);
    });

    // Cleanup listeners on component mount
    return () => {
      socket.off("lobbyUpdate");
      socket.off("gameCreated");
    };
  }, []);

  // Fetch all games currenlty in "waiting" state, used to populate the lobby list.
  const getGames = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/games/waiting");
      setGames(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle creating a new game lobby, emits socket event to notify server and other players.
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!player) return;

    const gameData = { host: player._id, name: gameName };

    socket.emit("createGame", gameData);
  };

  // Handle joining an existing game, updates game state on backend and navigates to game screen.
  const handleJoinGame = async (gameId) => {
    if (!player) return alert("You must be logged in to join a game");

    try {
      await axios.patch(`http://localhost:3000/api/games/${gameId}/join`, {
        playerId: player._id,
      });
      socket.emit("joinGameRoom", gameId);
      socket.emit("playerHasJoined", gameId);

      nav(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.lobbyPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>BOOMTATO</h1>
        <span className={styles.username}>Player: {player?.username}</span>
      </header>

      {/* Available Games Section */}
      <section className={styles.gamesSection}>
        <h2 className={styles.sectionTitle}>Available Games</h2>
        <div className={styles.gamesList}>
          {games.length > 0 ? (
            games.map((g) => (
              <div key={g._id} className={styles.gameItem}>
                <span className={styles.gameName}>{g.name}</span>
                <button
                  onClick={() => handleJoinGame(g._id)}
                  className={styles.joinBtn}
                >
                  Join
                </button>
              </div>
            ))
          ) : (
            <div className={styles.noGames}>
              <p>No games available</p>
              <p className={styles.arrow}>Try creating one below!</p>
            </div>
          )}
        </div>
      </section>

      {/* Create Game Section */}
      <section className={styles.createSection}>
        <h2 className={styles.sectionTitle}>Create a Game Lobby</h2>
        <form onSubmit={handleCreateGame} className={styles.createForm}>
          <input
            type="text"
            placeholder="Game Name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.createBtn}>
            Create
          </button>
        </form>
      </section>
    </div>
  );
}
