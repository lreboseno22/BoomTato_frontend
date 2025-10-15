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
        const getPlayer = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/players/${id}`);
                setPlayer(res.data);
                setUsername(res.data.username);
            } catch (err) {
                console.error(err);
            }
        };
        getPlayer();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
           const res = await axios.put(`http://localhost:3000/api/players/${id}`, {
            username,
           });
           setPlayer(res.data);
           setIsEditing(false);
        } catch (err) {
            console.error("Error updating player:", err);
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/players/${id}`)
            nav("/"); // Go back Home
        } catch (err) {
            console.error(err);
        }
    };

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
            </div>
            ) : (
               <form onSubmit={handleUpdate}>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
               </form>
            )}
        </div>
    )
}