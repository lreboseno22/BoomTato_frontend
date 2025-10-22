import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";


export default function HomePage(){
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    // useEffect(() => {
    //     const storedPlayer = JSON.parse(localStorage.getItem("player"));
    //     if(storedPlayer){
    //         nav(`/profile/${storedPlayer._id}`);
    //     }
    // }, [nav]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/players/login", {
                username,
                password,
            });

            const player = res.data;
            localStorage.setItem("player", JSON.stringify(player));
            nav(`/profile/${player._id}`);
        } catch (err) {
            console.error(err);
            alert('Login Failed');
        }
    }

    // handle register
    
    return (
        <div className={styles.homePage}>
            <h1 className={styles.title}>BOOMTATO</h1>
            <div className={styles.btnsContainer}>
                <button onClick={() => setShowRegister(true)} className={styles.btn}>Register</button>
                <button onClick={() => setShowLogin(true)} className={styles.btn}>Login</button>
            </div>

            { showLogin && (
                <div className={styles.modalOverlay} onClick={() => setShowLogin(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Login</h2>
                        <form onSubmit={handleLogin} className={styles.form}>
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
                            <button type="submit" className={styles.modalBtn}>Login</button>
                        </form>
                        <p className={styles.text}>Don't have a player account?</p>
                        <button className={styles.switchBtn} onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                            Register
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}