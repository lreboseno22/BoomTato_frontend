import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function GamePage(){
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [player, setPlayer] = useState(null);
    const nav = useNavigate();

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

    const handleLeaveGame = async () => {
        // leave game logic
    }

    const handleEndGame = async () => {
        if(!player) return alert ("You must be logged in");
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
            <h1>{game.gameName}</h1>
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
            </div>
        </div>
    )
}