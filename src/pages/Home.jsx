import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage(){
    const [username, setUsername] = useState("");
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/players", {
                username,
            });

            const player = res.data;
            nav(`/profile/${player._id}`);
        } catch (err) {
            console.error(err);
        }
    }
    
    return (
        <div className="home-page">
            <h1>BOOMTATO</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    placeholder="Enter your username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <button type="submit">Create Player</button>
            </form>
        </div>
    )
}