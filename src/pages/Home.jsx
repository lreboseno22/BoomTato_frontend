import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";

export default function HomePage(){
    const nav = useNavigate();
    
    return (
        <div className={styles.homePage}>
            <h1 className={styles.title}>BOOMTATO</h1>
            <div className={styles.btnsContainer}>
                <button onClick={() => nav("/register")} className={styles.btn}>Register</button>
                <button onClick={() => nav("/login")} className={styles.btn}>Login</button>
            </div>
        </div>
    )
}