import React, { useEffect, useRef, useState } from "react";
import { Graphics } from "@pixi/react";
import { MIDIHandler } from "/Users/samue/ProyectoReact-SoundVenture/src/components/Midi/Midi";

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
  const [activeNotes, setActiveNotes] = useState(new Set<string>()); // 🎹 Notas activas del MIDI

  const lastUpdateRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const elapsedOffsetRef = useRef<number>(0);
  const lastPressedNote = useRef<string | null>(null); // 🚀 Última nota presionada
  const lastReleasedNote = useRef<string | null>(null); // 🚀 Última nota liberada
  const requiredNoteToRelease = useRef<string | null>(null); // 🚀 Control de repetición de notas
  const MARGIN_BEFORE_DETECTION = 1; // 🔥 Ajustamos el margen para que sea más preciso

  const canvasHeight = 500;
  const baseSpeed = 0.3;
  const speed = (bpm / 120) * baseSpeed;

  const MIN_ALPHA = 1.0;
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

  const isNoteStillVisible = (note: Note) => {
    const y = Math.round(calculateYPosition(note.startTime, note.duration));
    const height = Math.round(calculateHeight(note.duration));
  
    const detectionThreshold = Math.round(canvasHeight - MARGIN_BEFORE_DETECTION);
  
    // 🔥 Se ignoran notas solo si están a punto de salir pero no todas
    if (y + height < detectionThreshold) {
      return false;
    }
  
    return true; // ✅ Si la nota aún está en el índice, es válida
  };
    
  useEffect(() => {
    // Conectar el MIDI cuando Notes.tsx se monte
    MIDIHandler.connectMIDI();
  
    return () => {
      // No es necesario desconectar explícitamente ya que MIDIHandler maneja los eventos
    };
  }, []);
  
  useEffect(() => {
    // Función para manejar las notas presionadas
    const handleKeyDown = (noteName: string) => {
      // 🛑 Si la nota es la misma que la última presionada y no se ha liberado, ignorarla
      if (lastPressedNote.current === noteName && lastReleasedNote.current !== noteName) {
        return;
      }
  
      // 🛑 Si la nota es la repetitiva en el índice pero aún no se ha liberado, no permitir avanzar
      if (requiredNoteToRelease.current === noteName) {
        console.log(`⚠️ Debes liberar ${noteName} antes de tocarla de nuevo.`);
        return;
      }
  
      setActiveNotes((prev) => new Set(prev).add(noteName));
      lastPressedNote.current = noteName; // Guardar la nota como la última presionada
      console.log(`🎹 Nota presionada: ${noteName}`);
  
      // 🟢 Si la interpretación estaba pausada y la nota es correcta, reanudar
      if (!isPlaying && notesAtBottom.has(noteName)) {
        console.log("✅ Nota correcta tocada, reanudando interpretación...");
        setIsPlaying(true);
      }
    };
  
    // Función para manejar las notas liberadas
    const handleKeyUp = (noteName: string) => {
      setActiveNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noteName);
        return newSet;
      });
  
      lastReleasedNote.current = noteName; // Marcar como nota liberada
      requiredNoteToRelease.current = null; // 🚀 Permitir volver a tocar la nota repetida
      console.log(`🛑 Nota liberada: ${noteName}`);
    };
  
    // Agregar los listeners a MIDIHandler
    MIDIHandler.addListener("keydown", handleKeyDown);
    MIDIHandler.addListener("keyup", handleKeyUp);
  
    return () => {
      // Remover los listeners cuando el componente se desmonte
      MIDIHandler.removeListener("keydown", handleKeyDown);
      MIDIHandler.removeListener("keyup", handleKeyUp);
    };
  }, []);
  
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 🔥 Referencia a un timeout para evitar pausas inmediatas

  useEffect(() => {
    if (notesAtBottom.size === 0) return; // 🚀 No hay notas en el borde, salir
  
    const requiredNotes = Array.from(notesAtBottom).map((noteId) => noteId.split("-")[0]);
    const playedNotes = Array.from(activeNotes);
  
    // 🚀 Filtrar solo las notas que están realmente en el índice
    const requiredNotesFiltered = requiredNotes.filter((noteName) => {
      const noteData = notes.find((n) => n.name === noteName);
      return noteData ? isNoteStillVisible(noteData) : true; // ✅ Si aún está en el índice, se mantiene
    });
  
    // 🛑 Si ya no hay notas válidas en el índice, permitimos continuar sin bloqueo
    if (requiredNotesFiltered.length === 0) {
      console.log("✅ No hay notas bloqueando la interpretación, continuando...");
      setIsPlaying(true);
      return;
    }
  
    // ✅ Si el usuario toca todas las notas requeridas, reanuda la interpretación
    const allNotesMatched = requiredNotesFiltered.every((note) => playedNotes.includes(note));
  
    if (allNotesMatched && !isPlaying) {
      console.log("✅ Nota correcta tocada, reanudando interpretación...");
      setIsPlaying(true);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    }
  
    // ⏸️ Pausar solo si TODAS las notas requeridas han sido liberadas y siguen visibles
    if (!allNotesMatched && isPlaying) {
      if (!pauseTimeoutRef.current) {
        pauseTimeoutRef.current = setTimeout(() => {
          console.log("⏸️ Pausando interpretación tras detección de liberación...");
          setIsPlaying(false);
          pauseTimeoutRef.current = null;
        }, 200); // 🔥 Esperamos 200ms antes de pausar
      }
    }
  
  }, [activeNotes, notesAtBottom, isPlaying]);
  
  
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
          delta = Math.min(Math.max(delta, 1 / 120), 1 / 30); // 🔥 Limita el delta para evitar saltos raros
  
          setElapsedTime((prevTime) => prevTime + delta * 1000); // 🔥 Incremento suave del tiempo
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
          console.log(`🔴 La nota ${noteId} TOCÓ el borde`);
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
  
    if (shouldPause && isPlaying) { // 🔥 Evita pausar si ya está pausado
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
