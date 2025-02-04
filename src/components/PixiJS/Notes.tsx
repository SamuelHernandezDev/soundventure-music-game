import React, { useEffect, useRef, useState } from "react";
import { Graphics } from "@pixi/react";

interface Note {
  name: string;
  startTime: number;
  duration: number;
  velocity: number;
  track: number;
}

interface NotesProps {
  canvasWidth: number;
  margin: number;
  totalKeys: number;
  naturalNotes: string[];
  sharps: string[];
  notes: Note[];
  bpm: number;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void; 
  currentTime: number;
  totalDuration: number;
}

const Notes: React.FC<NotesProps> = ({
  canvasWidth,
  margin,
  totalKeys,
  naturalNotes,
  sharps,
  notes,
  bpm,
  isPlaying,
  setIsPlaying,
  currentTime,
  totalDuration,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notesAtBottom, setNotesAtBottom] = useState<Set<string>>(new Set());
  const lastUpdateRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const elapsedOffsetRef = useRef<number>(0);

  const canvasHeight = 500;
  const baseSpeed = 0.3;
  const speed = (bpm / 120) * baseSpeed;

  const MIN_ALPHA = 0.7;
  const MAX_ALPHA = 1.0;
  const CORNER_RADIUS = 5;
  const MIN_HEIGHT = 10;

  /** 🎹 **Colores por track** */
  const trackColors: Record<number, { normal: number; sharp: number }> = {
    0: { normal: 0xb500ff, sharp: 0x530076 },
    1: { normal: 0xff00d2, sharp: 0x7a0164 },
  };

  const getFirstNote = () => {
    if (notes.length === 0) return null;
    return notes.reduce((earliest, note) =>
      note.startTime < earliest.startTime ? note : earliest,
      notes[0]
    );
  };

  const calculateYPosition = (startTime: number, duration: number) => {
    const elapsed = elapsedTime - startTime;
    return elapsed * speed - calculateHeight(duration);
  };

  const calculateHeight = (duration: number) => {
    const scaledHeight = duration * speed;
    return Math.max(scaledHeight, MIN_HEIGHT);
  };

  const scaleVelocity = (velocity: number) => {
    return MIN_ALPHA + velocity * (MAX_ALPHA - MIN_ALPHA);
  };

  const getNoteProperties = (noteName: string, duration: number) => {
    const drawingWidth = canvasWidth - margin * 2;
    const columnWidth = drawingWidth / totalKeys;
    const isSharp = sharps.includes(noteName.slice(0, 2));

    if (isSharp) {
      const baseNote = `${noteName[0]}${noteName.slice(2)}`;
      const baseIndex = naturalNotes.indexOf(baseNote);
      if (baseIndex === -1) return null;

      return {
        x: margin + columnWidth * baseIndex + columnWidth * 0.75,
        width: columnWidth * 0.48,
        height: calculateHeight(duration),
        isSharp,
      };
    } else {
      const naturalIndex = naturalNotes.indexOf(noteName);
      if (naturalIndex === -1) return null;

      return {
        x: margin + columnWidth * naturalIndex,
        width: columnWidth,
        height: calculateHeight(duration),
        isSharp: false,
      };
    }
  };

  useEffect(() => {
    const firstNote = getFirstNote();
    if (!firstNote) return;

    const firstNoteHeight = calculateHeight(firstNote.duration);
    const initialY = canvasHeight - firstNoteHeight + ((bpm / 200) * (totalDuration / 400));
    const requiredElapsedTime = ((initialY + firstNoteHeight - (canvasHeight * 0.005)) / speed) + firstNote.startTime;
    const timeAdjustmentFactor = (Math.log(totalDuration + 1) / bpm) * -0.0095;

    elapsedOffsetRef.current = ((requiredElapsedTime + 0.1) * timeAdjustmentFactor * 1000);
    setElapsedTime((currentTime * 1000) - elapsedOffsetRef.current);

    lastUpdateRef.current = null;
  }, [currentTime, totalDuration]);

  useEffect(() => {
    if (isPlaying) {
      const update = (timestamp: number) => {
        if (lastUpdateRef.current !== null) {
          let delta = (timestamp - lastUpdateRef.current) / 1000;
          delta = Math.min(Math.max(delta, 1 / 120), 1 / 30);
          setElapsedTime((prevTime) => prevTime + delta * 1000);
        }
        lastUpdateRef.current = timestamp;
        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        lastUpdateRef.current = null;
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        lastUpdateRef.current = null;
      }
    };
  }, [isPlaying]);

  const lastPausedNote = useRef<string | null>(null); // 🚀 Guarda la última nota que pausó
  const pausedNotes = useRef<Set<string>>(new Set()); // 🚀 Rastrea qué notas específicas ya pausaron
  
  useEffect(() => {
    if (currentTime === 0) {
      console.log("🔄 Reiniciando registros...");
      pausedNotes.current.clear(); // 🚀 Limpiar todas las notas pausadas
      lastPausedNote.current = null; // 🚀 Permitir futuras pausas
      setNotesAtBottom(new Set()); // 🚀 Resetear las notas que tocan el borde
    }
  }, [currentTime]);
  
  const MARGIN_BEFORE_DETECTION = 6; // 🔥 Ajustamos el margen para que sea más preciso

  useEffect(() => {
    if (!isPlaying) return; // 🚀 No detecta colisiones si está pausado
  
    const updatedNotesAtBottom = new Set(notesAtBottom);
    let shouldPause = false;
    let newPausedNote: string | null = null;
  
    notes.forEach((note) => {
      const noteId = `${note.name}-${note.startTime}`; // 🔥 Identificador único por nota y tiempo
      const y = Math.round(calculateYPosition(note.startTime, note.duration)); // 🔥 Redondeamos
      const height = Math.round(calculateHeight(note.duration)); // 🔥 Redondeamos
  
      // 🚀 Detectamos con margen ajustado
      const detectionThreshold = Math.round(canvasHeight - MARGIN_BEFORE_DETECTION);
      const isTouchingBottom = y + height >= detectionThreshold;
      const isCompletelyOut = y > canvasHeight;
  
      if (isTouchingBottom && !isCompletelyOut) {
        if (!notesAtBottom.has(noteId)) {
          console.log(`🔴 La nota ${noteId} TOCÓ el borde (${MARGIN_BEFORE_DETECTION}px antes)`);
          updatedNotesAtBottom.add(noteId);
  
          if (!pausedNotes.current.has(noteId) && lastPausedNote.current !== noteId) {
            shouldPause = true;
            newPausedNote = noteId;
            pausedNotes.current.add(noteId);
          }
        }
      } else if (notesAtBottom.has(noteId) && isCompletelyOut) {
        console.log(`🟢 La nota ${noteId} DEJÓ de tocar el borde`);
        updatedNotesAtBottom.delete(noteId);
  
        if (updatedNotesAtBottom.size === 0) {
          lastPausedNote.current = null;
        }
      }
    });
  
    setNotesAtBottom(updatedNotesAtBottom);
  
    if (shouldPause) {
      console.log(`⏸️ Pausando la caída de notas por ${newPausedNote}`);
      lastPausedNote.current = newPausedNote;
      setIsPlaying(false);
    }
  }, [elapsedTime, notes, isPlaying]);
  
  return (
    <>
      {notes.map((note, index) => {
        const noteProps = getNoteProperties(note.name, note.duration);
        if (!noteProps) return null;

        const y = calculateYPosition(note.startTime, note.duration);
        if (y > canvasHeight) return null;

        const { x, width, height, isSharp } = noteProps;
        const adjustedAlpha = scaleVelocity(note.velocity);

        /** 🎹 **Asignar color a la nota según su track y si es sostenida o no** */
        const trackColor = trackColors[note.track] || { normal: 0xc772ff, sharp: 0x9900ff };
        const color = isSharp ? trackColor.sharp : trackColor.normal;

        return (
          <Graphics
            key={index}
            draw={(g) => {
              g.clear();
              g.beginFill(color, adjustedAlpha);
              g.drawRoundedRect(x, y, width, height, CORNER_RADIUS);
              g.endFill();
            }}
          />
        );
      })}
    </>
  );
};

export default Notes;
