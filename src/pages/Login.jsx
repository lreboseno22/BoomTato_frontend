import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(storedPlayer){
            nav(`/profile/${storedPlayer._id}`);
        }
    }, [nav]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/players/login", {
                username,
                password,
            });
            const player = res.data;
            localStorage.setItem("player", JSON.stringify(player)); // save player info
            nav(`/profile/${player._id}`);
        } catch (err) {
            console.error(err);
            alert("Login Failed");
        }
    }

    return (
        <div className="login-page">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
                />
                <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have a player account?</p>
            <button onClick={() => nav("/register")}>Register</button>
        </div>
    )
}