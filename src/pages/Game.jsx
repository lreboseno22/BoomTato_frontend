import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import socket from "../socket.js";

export default function GamePage(){
    const { id } = useParams();
    const [game, setGame] = useState(null);
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

    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(storedPlayer) setPlayer(storedPlayer);
        getGame();
    }, [id]);

    const getGame = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/games/${id}`);
            setGame(res.data);
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
            await axios.delete(`http://localhost:3000/api/games/${id}/end`);
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
                {game.players.map((p) => (
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