import React, { useMemo } from "react";
import { NoteData } from "../types"; // Importar desde el archivo común
import { Stage } from "@pixi/react";
import Columns from "./Columns";
import Notes from "./Notes";
import "./FallingNotes.css";

interface FallingNotesProps {
  className?: string;
  notes: NoteData[];
  bpm: number; // Prop para el BPM
  isPlaying: boolean; // Prop para el estado de reproducción
  setIsPlaying: (value: boolean) => void; 
  currentTime: number; // Prop para la posición actual en segundos
  totalDuration:number;
}

const FallingNotes: React.FC<FallingNotesProps> = ({
  className,
  notes,
  bpm,
  isPlaying,
  setIsPlaying,
  currentTime,
  totalDuration,
}) => {
  const canvasWidth = 1192;
  const canvasHeight = 500;
  const margin = 0;
  const totalKeys = 52;

  const naturalNotes = [
    "A0", "B0", "C1", "D1", "E1", "F1", "G1",
    "A1", "B1", "C2", "D2", "E2", "F2", "G2",
    "A2", "B2", "C3", "D3", "E3", "F3", "G3",
    "A3", "B3", "C4", "D4", "E4", "F4", "G4",
    "A4", "B4", "C5", "D5", "E5", "F5", "G5",
    "A5", "B5", "C6", "D6", "E6", "F6", "G6",
    "A6", "B6", "C7", "D7", "E7", "F7", "G7",
    "A7", "B7", "C8",
  ];

  const sharps = ["C#", "D#", "F#", "G#", "A#"];

  // Memorizar columnas ya que son estáticas
  const RenderedColumns = useMemo(
    () => (
      <Columns
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        margin={margin}
        totalKeys={totalKeys}
        naturalNotes={naturalNotes}
        sharps={sharps}
      />
    ),
    [canvasWidth, canvasHeight, margin, totalKeys, naturalNotes, sharps]
  );

  return (
    <div className={className}>
      <div className="notes-canvas-container">
        <Stage
          className="canvas-stage"
          width={canvasWidth}
          height={canvasHeight}
          options={{ backgroundAlpha: 0 }}
        >
          {RenderedColumns}
          <Notes
            canvasWidth={canvasWidth}
            margin={margin}
            totalKeys={totalKeys}
            naturalNotes={naturalNotes}
            sharps={sharps}
            notes={notes}
            bpm={bpm}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying} 
            currentTime={currentTime} // Pasar el tiempo actual al componente Notes
            totalDuration={totalDuration}
          />
        </Stage>
      </div>
    </div>
  );
};

export default FallingNotes;
