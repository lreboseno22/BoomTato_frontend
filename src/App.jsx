import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import HomePage from './pages/Home';
import LeaderboardPage from './pages/Leaderboard';
import ProfilePage from './pages/Profile';

function App() {

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/leaderboard' element={<LeaderboardPage />} />
        <Route path='/profile/:id' element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App;
