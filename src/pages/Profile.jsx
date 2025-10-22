import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Start.module.css";

export default function ProfilePage(){
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

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
        if(!window.confirm("Are you sure you want to delete your profile?")) return;
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
        <div className={styles.startPage}>
            <h1 className={styles.gameTitle}>BOOMTATO</h1>

            <div className={styles.container}>
                <div className={styles.userInfo}>
                    {!isEditing ? (
                        <div className={styles.usernameSection}>
                            <h2>Welcome {player.username}</h2>
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className={styles.editForm}>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                        </form>
                    )}

                    {showDelete && (
                        <div className={styles.deleteModal}> 
                            <p>Are you sure you want to delete your profile?</p>
                            <button className={styles.confirm} onClick={handleDelete}>
                                Yes, delete my profile
                            </button>
                            <button onClick={() => setShowDelete(false)}>Cancel</button>
                        </div>
                    )}
                </div>

                <div className={styles.actionsContainer}>
                    <button className={styles.playBtn} onClick={() => nav("/lobby")}>
                        Play
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setShowDelete(!showDelete)}>
                        Delete Profile
                    </button>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}