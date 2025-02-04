// src/components/Score.tsx
import React from 'react';
import './ScoreGame.css';

// Definimos la interfaz para las props, agregando 'className'
interface ScoreGameProps {
  className?: string; // Propiedad opcional para className
}

const ScoreGame: React.FC<ScoreGameProps> = ({ className }) => {
  return (
    // Pasamos 'className' al div raíz para que se pueda personalizar desde afuera
    <div className={`score-container ${className}`}>
      {/* Aquí iría la representación de la partitura */}
      <canvas id="tutorial" width="1500" height="480"></canvas>
    </div>
  );
};

export default ScoreGame;
