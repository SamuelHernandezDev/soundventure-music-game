import { useState, useEffect } from 'react';
import { NoteData } from '../../components/types';
import Piano from '../../components/Piano/PianoGame';
import ControlReproduccion from '../../components/Layout/ControlReproduccion/ControlsGame';
import FallingNotes from '../../components/PixiJS/FallingNotes';
import ToneJs from '../../components/Midi/ToneJs';
import './SheetGame.css';

const SheetGame = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [bpm, setBpm] = useState<number>(120); // 🔹 Inicializamos BPM en 120 por defecto
  const [totalDuration, setTotalDuration] = useState<number>(0); // 🔹 Inicializamos totalDuration en 0
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleNotesProcessed = (processedNotes: NoteData[]) => {
    const convertedNotes = processedNotes.map((note) => ({
      name: note.name,
      startTime: note.startTime * 1000,
      duration: note.duration * 1000,
      velocity: note.velocity,
      track: note.track, // Incluir el canal
    }));
    setNotes(convertedNotes);
  };

  const handleBpmDetected = (detectedBpm: number) => {
    setBpm(detectedBpm);
    //console.log("BPM actualizado:", detectedBpm);
  };

  const handleDurationDetected = (detectedDuration: number) => {
    setTotalDuration(detectedDuration);
    //console.log("Duración total actualizada:", detectedDuration);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSliderChange = (time: number) => {
    setCurrentTime(time);
  };

  const handleBackward = () => {
    setCurrentTime((prevTime) => {
      const newTime = Math.max(prevTime - 5, 0); // Retrocede 5 segundos
      handleSliderChange(newTime);
      return newTime;
    });
  };

  // Sincronizar currentTime con la reproducción
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1; // Incrementa 0.1 segundos (100 ms)
          if (newTime >= totalDuration) {
            clearInterval(interval);
            setIsPlaying(false); // Detiene la reproducción al final
            return totalDuration;
          }
          return newTime;
        });
      }, 100); // Actualización cada 100 ms

      return () => clearInterval(interval);
    }
  }, [isPlaying, totalDuration]);

  return (
    <div className="sheetgame-wrapper">
      <div className="sheetgame-container">
        <div className="game-elements-wrapper">
          <ToneJs 
            onNotesProcessed={handleNotesProcessed} 
            onBpmDetected={handleBpmDetected} 
            onDurationDetected={handleDurationDetected} // 🔹 Pasamos la función para actualizar duración
          />
          <FallingNotes
            className="falling-notes-custom"
            notes={notes}
            bpm={bpm}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying} // ✅ Pasamos la función para modificar isPlaying
            currentTime={currentTime}
            totalDuration={totalDuration}
          />
          <Piano className="piano-custom" />
        </div>
      </div>
      <div className="control-Game">
        <ControlReproduccion
          isPlaying={isPlaying}
          currentTime={currentTime}
          totalDuration={totalDuration} // 🔹 Ahora usamos la duración detectada
          onPlay={handlePlay}
          onStop={handleStop}
          onReset={handleReset}
          onBackward={handleBackward}
          onSliderChange={handleSliderChange}
        />
      </div>
    </div>
  );
};

export default SheetGame;
