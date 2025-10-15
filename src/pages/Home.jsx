import { useNavigate } from "react-router-dom";

export default function HomePage(){
    const nav = useNavigate();
    
    return (
        <div className="home-page">
            <h1>BOOMTATO</h1>
            <div className="btns-container">
                <button onClick={() => nav("/register")}>Register</button>
                <button onClick={() => nav("/login")}>Login</button>
            </div>
        </div>
    )
}