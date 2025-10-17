import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import HomePage from './pages/Home';
import LeaderboardPage from './pages/Leaderboard';
import ProfilePage from './pages/Profile';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import LobbyPage from './pages/Lobby';
import Navbar from './components/Navbar';

function App() {

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/lobby' element={<LobbyPage />} />
        <Route path='/leaderboard' element={<LeaderboardPage />} />
        <Route path='/profile/:id' element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App;
