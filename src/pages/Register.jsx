import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(storedPlayer){
            nav(`/profile/${storedPlayer._id}`);
        }
    }, [nav]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/players/register", {
                username,
                password,
            });

            const player = res.data;
            localStorage.setItem("player", JSON.stringify(player)); // save player info in local storage
            nav(`/profile/${player._id}`);
        } catch (err) {
            if(err.response && err.response.data.message){
                alert(err.response.data.message);
            } else {
                alert("Something went wrong");
            }
        }
    }

    return (
        <div className="register-page">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <button type="submit">Create Player</button>
            </form>
            <p>Already have a player account?</p>
            <button onClick={() => nav("/login")}>Login</button>
        </div>
    )
}