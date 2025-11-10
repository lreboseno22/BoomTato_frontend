import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import axios from "axios";
import styles from "../styles/Home.module.css";

/**
 * HomePage
 *
 * This page serves as the entry point for the BOOMTATO app.
 * Allows players to register or log in, and navigates them to their profile upon successful authentication.
 */

// Define a base API URL for cleaner and maintainable requests
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/players` || "http://localhost:3000/api/players";

export default function HomePage() {
  // State to toggle login and registration modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Controlled inputs for authentication forms
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  /**
   * Handles user login submission.
   * Sends credentials to backend API and stores player info in localStorage.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });

      const player = res.data;
      localStorage.setItem("player", JSON.stringify(player)); // save player info in local storage
      nav(`/profile/${player._id}`);
    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  };

  /**
   * Handles new player registration.
   * On success, automatically logs in and navigates to profile page
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, {
        username,
        password,
      });

      const player = res.data;
      localStorage.setItem("player", JSON.stringify(player)); // save player info in local storage
      console.log("Register response:", res.data);
      nav(`/profile/${player._id}`);
    } catch (err) {
      console.error(err);
      alert("Register Failed");
    }
  };

  return (
    <div className={styles.homePage}>
      <h1 className={styles.title}>BOOMTATO</h1>

      {/* Main menu buttons */}
      <div className={styles.btnsContainer}>
        <button onClick={() => setShowRegister(true)} className={styles.btn}>
          Register
        </button>
        <button onClick={() => setShowLogin(true)} className={styles.btn}>
          Login
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          switchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterModal
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleRegister={handleRegister}
          onClose={() => setShowRegister(false)}
          switchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}
