import styles from "../styles/Home.module.css";

/**
 * RegisterModal Component
 *
 * Displays a modal for player registeration.
 * Controlled input values and handlers are recieved via props.
 * Provides ability to switch to Login modal.
 */

export default function RegisterModal({
  username,
  password,
  setUsername,
  setPassword,
  handleRegister,
  onClose,
  switchToLogin,
}) {
  return (
    // Overlay closes modal when clicked outside the box
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Stop click events from closing modal when interacting inside */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Register</h2>

        {/* Registeration form: executes handleRegister from parent */}
        <form onSubmit={handleRegister} className={styles.form}>
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
          <button type="submit" className={styles.modalBtn}>
            Create Player
          </button>
        </form>

        {/* Switch prompt back to login */}
        <p className={styles.text}>Already have a player account?</p>
        <button className={styles.switchBtn} onClick={switchToLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
