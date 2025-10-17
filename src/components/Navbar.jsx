import { Link } from "react-router-dom";

export default function Navbar(){
    const player = JSON.parse(localStorage.getItem("player"));

    return (
        <nav>
        <Link to="/">Home</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        { !player ? (
                <>
                    <Link to="/register">Register</Link>
                    <Link to="/login">Login</Link>
                </>

            ) : (
                <>
                <Link to={`profile/${player._id}`}>Profile</Link>
                </>
            )}
      </nav>
    );
}