import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Start.module.css";

/**
 * ProfilePage aka the 'Start'
 *
 * This page is the main user's profile/starting page after they login or register.
 * From here the user can update name, delete their user, logout or click play which will navigate them to the LobbyPage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/players"

export default function ProfilePage(){
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const nav = useNavigate();

    // Fetch player data on mount or when 'id' changes
    useEffect(() => {
        const storedPlayer = JSON.parse(localStorage.getItem("player"));
        if(!storedPlayer || storedPlayer._id !== id){
            alert("No player data found")
            nav("/login");
            return; 
        }

        fetchPlayer(storedPlayer._id);
    }, [id, nav]);

    const fetchPlayer = async (playerId) => {
        try {
             const res = await axios.get(`${API_BASE_URL}/${playerId}`);
            setPlayer(res.data);
            setUsername(res.data.username);
        } catch (err) {
            console.error("Error fetching player:", err);
        }
    }

    // Handle username update
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
           const res = await axios.put(`${API_BASE_URL}/${id}`, {
            username,
           });
           setPlayer(res.data);
           localStorage.setItem("player", JSON.stringify(res.data));
           setIsEditing(false);
        } catch (err) {
            console.error("Error updating player:", err);
        }
    }

    // Handle profile deletion 
    const handleDelete = async () => {
        if(!window.confirm("Are you sure you want to delete your profile?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`)
            localStorage.removeItem("player"); // clear from storage
            nav("/"); // Go back Home
        } catch (err) {
            console.error(err);
        }
    };

    // Logout and clear session
    const handleLogout = () => {
        localStorage.removeItem("player");
        nav("/");
    }

    if(!player) return <p>Loading...</p>

    return (
        <div className={styles.startPage}>
            <h1 className={styles.gameTitle}>BOOMTATO</h1>

            <div className={styles.container}>
                {/* Profile Info section */}
                <div className={styles.userInfo}>
                    {!isEditing ? (
                        <div className={styles.usernameSection}>
                            <h2>{player.username}</h2>
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                ✎﹏﹏﹏﹏
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
                            <div>
                                <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            </div> 
                        </form>
                    )}

                    {/* Delete Modal */}
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
                
                {/* Action Buttons */}
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