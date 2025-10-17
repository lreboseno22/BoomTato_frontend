import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfilePage(){
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const nav = useNavigate();

    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(!storedPlayer || storedPlayer._id !== id){
            alert("No player data found")
            nav("/login"); 
        }

        const playerId = id || storedPlayer._id;

        const getPlayer = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/players/${playerId}`);
                setPlayer(res.data);
                setUsername(res.data.username);
            } catch (err) {
                console.error(err);
            }
        };
        getPlayer();
    }, [id, nav]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
           const res = await axios.put(`http://localhost:3000/api/players/${id}`, {
            username,
           });
           setPlayer(res.data);
           localStorage.setItem("player", JSON.stringify(res.data));
           setIsEditing(false);
        } catch (err) {
            console.error("Error updating player:", err);
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/players/${id}`)
            localStorage.removeItem("player"); // clear from storage
            nav("/"); // Go back Home
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("player");
        nav("/");
    }

    if(!player) return <p>Loading...</p>

    return (
        <div className="profile-page">
            <h1>Player Profile</h1>
            {!isEditing ? (
            <div>
                <h2>{player.username}</h2>
                <p>Score: {player.score}</p>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={handleDelete}>Delete Profile</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
            ) : (
               <form onSubmit={handleUpdate}>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
               </form>
            )}
            <p>Play!</p>
            <button onClick={() => nav("/lobby")}>Lobby</button>
        </div>
    )
}