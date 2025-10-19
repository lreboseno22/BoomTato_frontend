import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
            getGames();
        }
    }, [nav]);

    // Get games player can join
    const getGames = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/games/waiting");
            setGames(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Create Game logic
    const handleCreateGame = async (e) => {
        e.preventDefault();
        console.log(player)
        try {
            const res = await axios.post("http://localhost:3000/api/games", {
                host: player._id,
                name: gameName,
            });
            nav(`/game/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert("Error creating game");
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
                                    <button onClick={() => nav(`/game/${g._id}`)}>Join</button>
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