import React, { useState } from 'react';
import { FaPlay, FaStop, FaRedo, FaBackward } from 'react-icons/fa';
import './ControlsGame.css';

interface ControlsGameProps {
  className?: string;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onBackward: () => void; // Nuevo callback
  onSliderChange: (time: number) => void;
}

const ControlsGame: React.FC<ControlsGameProps> = ({
  className,
  isPlaying,
  currentTime,
  totalDuration,
  onPlay,
  onStop,
  onReset,
  onBackward,
  onSliderChange,
}) => {
  const [selectedClef, setSelectedClef] = useState<string>("dual");
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const handleTemporaryActive = (value: string, duration = 200) => {
    setActiveOption(value);
    setTimeout(() => setActiveOption(null), duration);
  };

  const handlePlayStop = () => {
    isPlaying ? onStop() : onPlay();
  };

  const handleSelection = (value: string) => {
    if (value === "reset") {
      handleTemporaryActive(value);
      onReset();
    }
    if (value === "backward") {
      if (!isPlaying) {
        handleTemporaryActive(value);
        onBackward(); // Llama al callback para retroceder
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSliderChange(parseInt(e.target.value, 10));
  };

  const formatTime = (seconds: number): string => {
    const roundedSeconds = Math.floor(seconds); // Redondea a un número entero
    const minutes = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  const handleClefSelection = (value: string) => {
    setSelectedClef(value);
  };

  return (
    <div className={`game-controls ${className}`}>
      {/* Modo Lectura */}
      <div className="control-group">
        <div
          className={`option ${selectedClef === "treble" ? "active" : ""}`}
          onClick={() => handleClefSelection("treble")}
        >
          𝄞 Clave
        </div>
        <div
          className={`option ${selectedClef === "bass" ? "active" : ""}`}
          onClick={() => handleClefSelection("bass")}
        >
          𝄢 Clave
        </div>
        <div
          className={`option ${selectedClef === "dual" ? "active" : ""}`}
          onClick={() => handleClefSelection("dual")}
        >
          𝄞𝄢 Dual
        </div>
      </div>
      <div className="separator"></div>

      {/* Control de Reproducción */}
      <div className="control-group">
        {/* Atrás */}
        <div
          className={`option ${
            activeOption === "backward" ? "active" : ""
          } ${isPlaying ? "disabled" : ""}`}
          onClick={() => handleSelection("backward")}
        >
          <FaBackward />
        </div>
        {/* Play/Stop */}
        <div
          className={`option ${isPlaying ? "active" : ""}`}
          onClick={handlePlayStop}
        >
          {isPlaying ? <FaStop /> : <FaPlay />}
        </div>
        {/* Reiniciar */}
        <div
          className={`option ${activeOption === "reset" ? "active" : ""}`}
          onClick={() => handleSelection("reset")}
        >
          <FaRedo />
        </div>
      </div>
      <div className="separator"></div>

      {/* Deslizador de Posición */}
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={totalDuration}
          value={currentTime}
          onChange={handleSliderChange}
          className="slider"
        />
        <div className="slider-label">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
};

export default ControlsGame;

