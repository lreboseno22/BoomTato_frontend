import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";

export default function LobbyPage(){
    const [player, setPlayer] = useState(null);
    const [games, setGames] = useState([]);
    const [gameName, setGameName] = useState("");
    const nav = useNavigate();

    // get and setting player data
    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(!storedPlayer){
            alert("You must be logged in first");
            nav("/login")
        } else {
            setPlayer(storedPlayer);
            getGames(); //inital fetch
        }
    }, [nav]);

    useEffect(() => {
        socket.on("lobbyUpdate", (newGame) => {
            setGames((prevGames) => [...(prevGames || []), newGame]);
        });

        socket.on("gameCreated", (game) => {
            nav(`/game/${game._id}`);
        })

        return () => {
            socket.off("lobbyUpdate");
            socket.off("gameCreated");
        }
    }, []);

    // Get games player can join
    const getGames = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/games/waiting");
            setGames(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    // Create Game logic
    const handleCreateGame = async (e) => {
        e.preventDefault();
        if(!player) return;

        const gameData = { host: player._id, name: gameName };

        socket.emit("createGame", gameData);
    }

    const handleJoinGame = async (gameId) => {
        if(!player) return alert("You must be logged in to join a game");

        try {
            await axios.patch(`http://localhost:3000/api/games/${gameId}/join`, {
                playerId: player._id,
            });
            nav(`/game/${gameId}`);
        } catch (err) {
            console.error(err);
        }
    }
    
    return (
        <div className="lobby-page">
            <h1>Welcome to the Lobby, {player?.username}</h1>
            <div className="lobby-container">
                <div className="join-lobby-container">
                    <h2>Available Games</h2>
                    <ul>
                        {games.length > 0 ? (
                            games.map((g) => (
                                <li key={g._id}>
                                    {g.name} - Host: {g.host.username}
                                    <button onClick={() => handleJoinGame(g._id)}>Join</button>
                                </li>
                            ))
                        ) : (
                            <p>No games available</p>
                        )}
                    </ul>
                </div>  
                <h2>Create a game lobby</h2>
                <form onSubmit={handleCreateGame} className="create-game-form">
                    <input type="text" placeholder="Game Name" value={gameName} onChange={(e) => setGameName(e.target.value)} required />
                    <button type="submit">Create</button>
                </form>
            </div>
        </div>
    )
}