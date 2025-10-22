import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import socket from "../socket.js";

export default function GamePage(){
    const { id } = useParams();
    const [game, setGame] = useState({ players: [] }); // make sure players is always an array in init game state
    const [player, setPlayer] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        socket.emit("joinGameRoom", id);
        
        // listener
        socket.on("gameStarted", ({ gameId, initialState }) => {
            console.log("Game Started:", gameId, initialState);
            nav(`/play/${gameId}`, { state: { initialState } });
        });

        return () => {
            socket.off("gameStarted");
        };
    }, [id, nav]);

    // runs whenever game or player state changes to ensure prevents host from disappearing from players list
    useEffect(() => {
    if (game && player) {
    // Ensure the host is in the players list
    const playersArray = Array.isArray(game.players) ? game.players : [];
    if (!playersArray.find((p) => p._id === player._id)) {
      setGame((prev) => ({
        ...prev,
        players: [...prev.players, { _id: player._id, username: player.username }],
      }));
    }
  }
}, [game, player]);

    // listens for "playerJoined" event from the server = no need for refresh to see player who joined
    useEffect(() => {
        socket.on("playerJoined", ({ gameId, gameState }) => {
            if(gameId === id){
               setGame((prevGame) => ({
                    ...prevGame,
                    players: Array.isArray(gameState.players)
                    ? [...prevGame.players.filter(p => !gameState.players.some(np => np._id === p._id)), ...gameState.players]
                : prevGame.players,
            }));
            }
        })

        return () => {
            socket.off("playerJoined");
        }
    }, [id]);

    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(storedPlayer) setPlayer(storedPlayer);
        getGame();
    }, [id]);

    const getGame = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/games/${id}`);
            setGame({
                ...res.data,
                players: Array.isArray(res.data.players) ? res.data.players : [],
            });
        } catch (err) {
            console.error(err);
        }
    }

    const handleStartGame = async () => {
        try {
            await axios.put(`http://localhost:3000/api/games/${id}/start`);
            socket.emit("startGame", id);
        } catch (err) {
            console.error(err);
        }
    }

    const handleLeaveGame = async () => {
        if(!player) return alert("You must be logged in");
        try {
            await axios.patch(`http://localhost:3000/api/games/${id}/leave`, {
                playerId: player._id,
            });
            nav("/lobby")
        } catch (err) {
            console.error(err);
            alert("Error Leaving Game");
        }
    };

    const handleEndGame = async () => {
        if(!player) return alert("You must be logged in");
        const confirmEnd = window.confirm("Are you sure you want to end this game?");
        if(!confirmEnd) return;

        try {
            await axios.delete(`http://localhost:3000/api/games/${id}`);
            nav("/lobby");
        } catch (err) {
            console.error(err);
            alert("Error ending game");
        }
    }

    if(!game) return <p>Loading game...</p>

    const isHost = player && game.host && player._id === game.host._id;

    return (
        <div className="game-page">
            <h1>{game.name}</h1>
            <p>Status: {game.status}</p>
            <h3>Players:</h3>
            <ul>
                {Array.isArray(game.players) && game.players.map((p) => (
                    <li key={p._id}>{p.username}</li>
                ))}
            </ul>

            <div className="game-actions">
                {isHost ? (
                    <button onClick={handleEndGame}>End Game</button>
                ) : (
                    <button onClick={handleLeaveGame}>Leave Game</button>
                )}

                {isHost && game.status === "waiting" && game.players.length >=2 && (
                    <button onClick={handleStartGame}>Start Game</button>
                )}
            </div>
        </div>
    )
}