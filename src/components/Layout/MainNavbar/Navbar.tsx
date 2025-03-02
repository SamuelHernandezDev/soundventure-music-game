import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import { useRef } from 'react';
import animationData from './icons8-menú.json'; // Importar animación JSON
import './Navbar.css';

const Navbar = () => {
  const playerRef = useRef<Player>(null);

  const modifiedAnimation = {
    ...animationData,
    layers: animationData.layers.map(layer => ({
      ...layer,
      shapes: layer.shapes?.map(shape => ({
        ...shape,
        it: shape.it?.map(item =>
          item.c ? { ...item, c: { k: [1.0, 0.647, 0.0, 1]
          } } : item
        ) ?? [] // Manejo seguro
      })) ?? [] // Manejo seguro
    }))
  };

  const handleConfigClick = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.play();
    }
    // Puedes añadir lógica adicional aquí (e.g., redirigir o abrir un modal)
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="\assets\SoundVentureicon.png" alt="Logo" />
          <span className="logo-text">SoundVenture</span>
        </Link>
      </div>
      {/* Opciones de navegación */}
      <ul className="nav-links">
        {/* <li><Link to="/">Lobby</Link></li>*/}
        <li><Link to="/sheet-music">SheetMusic</Link></li>
        <li><Link to="/sheet-Game">SheetLearn</Link></li>
        {/* <li><Link to="/sheet-type">SheetType</Link></li>*/}
        {/* <li><Link to="/locker">Locker</Link></li>*/}
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>

      {/* Icono de Configuración - Moved to the right */}
      <div className="config-icon" onClick={handleConfigClick}>
        <Player
          ref={playerRef}
          loop={false}
          autoplay={false}
          src={modifiedAnimation}
          className="player"
        />
      </div>
    </nav>
  );
};

export default Navbar;
