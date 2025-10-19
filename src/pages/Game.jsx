import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function GamePage(){
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [player, setPlayer] = useState(null);

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

    if(!game) return <p>Loading game...</p>
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
            
            <button>Leave Game</button> 
        </div>
    )
}