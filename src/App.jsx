import { Routes, Route } from "react-router-dom";
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import LobbyPage from './pages/Lobby';
import GamePage from './pages/Game';
import KaboomCanvas from './pages/KaboomCanvas';

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/lobby' element={<LobbyPage />} />
        <Route path='/profile/:id' element={<ProfilePage />} />
        <Route path='/game/:id' element={<GamePage />} />
        <Route path='/play/:id' element={<KaboomCanvas />} />
      </Routes>
    </div>
  )
}

export default App;
