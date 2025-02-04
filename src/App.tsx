// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout'; // Importa el layout principal
//import SecondaryLayout from './components/layouts/SecondaryLayout'; // Importa el layout secundario
import Dashboard from './pages/Dashboard/Dashboard'; // Página del dashboard
import Locker from './pages/Locker/Locker'; // Página del locker
import Lobby from './pages/Lobby/Lobby'; // Página del lobby
import SheetGame from './pages/SheetGame/SheetGame'; // Página del juego
import SheetMusic from './pages/SheetMusic/SheetMusic'; // Página de la partitura
import './App.css'; // Estilos globales

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas con el layout principal */}
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/locker" element={<MainLayout><Locker /></MainLayout>} />
        <Route path="/lobby" element={<MainLayout><Lobby /></MainLayout>} />

        {/* Rutas con el layout secundario */}
        <Route path="/sheet-game" element={<SheetGame/>}/>
        <Route path="/sheet-music" element={<SheetMusic />} />
      </Routes>
    </Router>
  );
};

export default App;
