import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfilePage(){
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [username, setUsername] = useState("");

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
            <h2>{player.username}</h2>
            <p>Score: {player.score}</p>
            <button onClick={handleDelete}>Delete Profile</button>
        </div>
    )
}