import styles from "../styles/Home.module.css";

/**
 * LoginModal Component
 *
 * Renders a modal for player login.
 * Controlled form inputs are passed from parent (HomaPage) via props.
 * Clicking outside the modal closes it.
 */

export default function LoginModal({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin,
  onClose,
  switchToRegister,
}) {
  return (
    // Overlay closes modal when clicked outside the box
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Stop click events from closing modal when interacting inside */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>

        {/* Login form: triggers handleLogin from parent on submit */}
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
          <button type="submit" className={styles.modalBtn}>
            Login
          </button>
        </form>

        {/* Switch prompt to registeration */}
        <p className={styles.text}>Don't have a player account?</p>
        <button className={styles.switchBtn} onClick={switchToRegister}>
          Register
        </button>
      </div>
    </div>
  );
}
