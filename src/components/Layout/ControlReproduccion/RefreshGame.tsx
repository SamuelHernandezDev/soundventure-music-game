import { Player } from '@lottiefiles/react-lottie-player';
import { useRef } from 'react';
import animationData from './Refresh.json'; // Importación del JSON
import './RefreshGame.css';
const RefreshGame = () => {
  const playerRef = useRef<Player>(null);

  const modifiedAnimation = {
    ...animationData,
    layers: animationData.layers.map(layer => ({
        ...layer,
        shapes: layer.shapes?.map(shape => ({
            ...shape,
            it: shape.it?.map(item =>
                item.c ? { ...item, c: { k: [1.0, 0.647, 0.0, 1]} } : item
            ) ?? []  // Agregado el manejo seguro
        })) ?? []  // Agregado el manejo seguro
    }))
};
  const handleClick = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.play();
    }
  };

  return (
    <div className="game-info" onClick={handleClick}>
      <Player
        ref={playerRef}
        loop={false}
        autoplay={false}
        src={modifiedAnimation} // Usando la animación modificada
        className="player"
      />
    </div>
  );
};

export default RefreshGame;
