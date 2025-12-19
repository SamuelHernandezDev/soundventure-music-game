import React, { useEffect, useRef, useState } from "react";
import { Graphics } from "@pixi/react";
import { MIDIHandler } from "/Users/samue/ProyectoReact-SoundVenture/src/components/Midi/Midi";

/** 
 * 🎼 Definición de la estructura de una nota en la interpretación
 * Cada nota tiene su nombre, tiempo de inicio, duración, 
 * velocidad de presión (intensidad) y el track al que pertenece.
 */
interface Note {
  name: string;
  startTime: number;
  duration: number;
  velocity: number;
  track: number;
}

/** 
 * 🎹 Props que recibe el componente Notes para manejar la visualización de las notas
 */
interface NotesProps {
  canvasWidth: number;        // 📏 Ancho del lienzo donde se dibujan las notas
  margin: number;             // 📏 Margen alrededor del lienzo
  totalKeys: number;          // 🎹 Cantidad total de teclas en la vista del piano
  naturalNotes: string[];     // 🎼 Lista de notas naturales
  sharps: string[];           // #️⃣ Lista de notas sostenidas
  notes: Note[];              // 🎶 Lista de notas a representar en el lienzo
  bpm: number;                // 🎵 Velocidad de la interpretación en beats por minuto
  isPlaying: boolean;         // ▶️ Estado de reproducción (en marcha o pausado)
  setIsPlaying: (value: boolean) => void; // ⏯ Función para cambiar el estado de reproducción
  currentTime: number;        // ⏳ Tiempo actual de la interpretación
  totalDuration: number;      // ⏳ Duración total de la interpretación
}

/** 
 * 🎹 Componente Notes para visualizar la interpretación de notas en tiempo real.
 */
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
  // ⏳ Estado para manejar el tiempo transcurrido en la interpretación
  const [elapsedTime, setElapsedTime] = useState(0);

  // 🎯 Estado para rastrear qué notas han llegado al final de la pantalla
  const [notesAtBottom, setNotesAtBottom] = useState<Set<string>>(new Set());

  // 🎹 Estado para rastrear las notas activas presionadas en el teclado MIDI
  const [activeNotes, setActiveNotes] = useState(new Set<string>());

  // 🔄 Referencias para optimizar el rendimiento y evitar renders innecesarios
  const lastUpdateRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const elapsedOffsetRef = useRef<number>(0);

  const lastPausedNote = useRef<string | null>(null); // 🚀 Guarda la última nota que pausó
  const pausedNotes = useRef<Set<string>>(new Set()); // 🚀 Rastrea qué notas específicas ya pausaron

  // 🔥 Referencia a un timeout para evitar pausas inmediatas
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null); 

  // 🎹 Variables de control para evitar la repetición de notas
  const lastPressedNote = useRef<string | null>(null);
  const lastReleasedNote = useRef<string | null>(null);
  const requiredNoteToRelease = useRef<string | null>(null);

  // 🔥 Margen de detección para evitar errores en la detección de colisiones
  const MARGIN_BEFORE_DETECTION = 1;

  // 📏 Configuración de dimensiones y velocidad de desplazamiento de las notas
  const canvasHeight = 500;
  const baseSpeed = 0.2;
  const speed = (bpm / 120) * baseSpeed;

  // 🎨 Configuración de colores y visualización de las notas
  const MIN_ALPHA = 1.0;   // Transparencia mínima
  const MAX_ALPHA = 1.0;   // Transparencia máxima
  const CORNER_RADIUS = 5; // Bordes redondeados para las notas
  const MIN_HEIGHT = 0;   // Altura mínima de las notas

  /** 
   * 🎨 Definición de los colores según el track de la nota.
   * Cada track tiene un color específico para diferenciarse visualmente.
   */
  const trackColors: Record<number, { normal: number; sharp: number }> = {
    0: { normal: 0xb500ff, sharp: 0x530076 }, // Track 0 (Morado)
    1: { normal: 0xff00d2, sharp: 0x7a0164 }, // Track 1 (Rosa)
  };

  /**
   * 🎼 Obtiene la primera nota de la lista de interpretación.
   * Si no hay notas, retorna `null`.
   */
  const getFirstNote = () => {
    if (notes.length === 0) return null;
    return notes.reduce((earliest, note) =>
      note.startTime < earliest.startTime ? note : earliest,
      notes[0]
    );
  };

  /**
   * 🎯 Calcula la posición Y de la nota en el lienzo, 
   * basado en el tiempo transcurrido y la velocidad.
   */
  const calculateYPosition = (startTime: number, duration: number) => {
    const elapsed = elapsedTime - startTime;
    return elapsed * speed - calculateHeight(duration);
  };

  /**
   * 📏 Calcula la altura de la nota en el lienzo según su duración.
   * Se garantiza un tamaño mínimo para evitar que sean demasiado pequeñas.
   */
  const calculateHeight = (duration: number) => {
    const scaledHeight = duration * speed;
    return Math.max(scaledHeight, MIN_HEIGHT);
  };

  /**
   * 🎨 Escala la opacidad de la nota según su velocidad de ejecución.
   */
  const scaleVelocity = (velocity: number) => {
    return MIN_ALPHA + velocity * (MAX_ALPHA - MIN_ALPHA);
  };

  /**
   * 🎹 Obtiene las propiedades de dibujo para una nota en el lienzo.
   * Calcula su posición, ancho, altura y si es sostenida o no.
   */
  const getNoteProperties = (noteName: string, duration: number) => {
    const drawingWidth = canvasWidth - margin * 2;
    const columnWidth = drawingWidth / totalKeys;
    const isSharp = sharps.includes(noteName.slice(0, 2));

    if (isSharp) {
      // 🔹 Si la nota es sostenida, ajustamos su posición respecto a la nota base
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
      // 🔹 Si la nota es natural, se usa su índice normal en la lista de notas
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

  /**
   * 👀 Verifica si una nota sigue visible en el lienzo o si ya salió de la pantalla.
   */

  const MARGIN_BEFORE_DETECTION2 = 5; // Aumentamos el margen de detección

  const isNoteStillVisible = (note: Note) => {
    const y = Math.round(calculateYPosition(note.startTime, note.duration));
    const height = Math.round(calculateHeight(note.duration));
  
    const detectionThreshold = Math.round(canvasHeight - MARGIN_BEFORE_DETECTION2);
  
    // 🔥 Nueva lógica: Evitamos ignorar notas que aún están a punto de salir
    return y + height >= detectionThreshold;
  };
  
    
   //MANEJO DE EVENTOS MIDI
  
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
        //console.log(`⚠️ Debes liberar ${noteName} antes de tocarla de nuevo.`);
        return;
      }
  
      setActiveNotes((prev) => new Set(prev).add(noteName));
      lastPressedNote.current = noteName; // Guardar la nota como la última presionada
      //console.log(`🎹 Nota presionada: ${noteName}`);
  
      // 🟢 Si la interpretación estaba pausada y la nota es correcta, reanudar
      if (!isPlaying && notesAtBottom.has(noteName)) {
       // console.log("✅ Nota correcta tocada, reanudando interpretación...");
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
     // console.log(`🛑 Nota liberada: ${noteName}`);
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
  
  //MANEJO DE PAUSAS Y SINCRONIZACION CON LAS NOTAS EN EL BORDE

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
     // console.log("✅ No hay notas bloqueando la interpretación, continuando...");
      setIsPlaying(true);
      return;
    }
  
    // ✅ Si el usuario toca todas las notas requeridas, reanuda la interpretación
    const allNotesMatched = requiredNotesFiltered.every((note) => playedNotes.includes(note));
  
    if (allNotesMatched && !isPlaying) {
      //console.log("✅ Nota correcta tocada, reanudando interpretación...");
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
          //console.log("⏸️ Pausando interpretación tras detección de liberación...");
          setIsPlaying(false);
          pauseTimeoutRef.current = null;
        }, 200); // 🔥 Esperamos 200ms antes de pausar
      }
    }
  
  }, [activeNotes, notesAtBottom, isPlaying]);
  
  //SINCRONIZACION DEL TIEMPO DE INTERPRETACION
  
  useEffect(() => {
    // 🎼 Obtener la primera nota para calcular la sincronización inicial
    const firstNote = getFirstNote();
    if (!firstNote) return;
  
    // 📏 Cálculo de la posición inicial de la primera nota
    const firstNoteHeight = calculateHeight(firstNote.duration);
    const initialY = canvasHeight - firstNoteHeight + ((bpm / 200) * (totalDuration / 400));
  
    // ⏳ Ajuste del tiempo transcurrido basado en la posición inicial
    const requiredElapsedTime = ((initialY + firstNoteHeight - (canvasHeight * 0.005)) / speed) + firstNote.startTime;
    const timeAdjustmentFactor = (Math.log(totalDuration + 1) / bpm) * -0.0095;
  
    elapsedOffsetRef.current = ((requiredElapsedTime + 0.1) * timeAdjustmentFactor * 1000);
    setElapsedTime((currentTime * 1000) - elapsedOffsetRef.current);
  
    lastUpdateRef.current = null;
  }, [currentTime, totalDuration]);
  
  //ANIMACION DE LAS NOTAS USANDO "requestAnimationFrame"

  useEffect(() => {
    if (isPlaying) {
      const update = (timestamp: number) => {
        if (lastUpdateRef.current !== null) {
          // ⏳ Calcular el delta de tiempo entre cuadros
          let delta = (timestamp - lastUpdateRef.current) / 1000;
          delta = Math.min(Math.max(delta, 1 / 120), 1 / 30); // 🔥 Limitar delta para suavizar la animación
  
          // 🎥 Actualizar el tiempo transcurrido
          setElapsedTime((prevTime) => prevTime + delta * 1000);
        }
        lastUpdateRef.current = timestamp;
        requestRef.current = requestAnimationFrame(update);
      };
  
      // 🎬 Iniciar el ciclo de animación
      requestRef.current = requestAnimationFrame(update);
    } else {
      // ⏸️ Detener la animación si está pausado
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        lastUpdateRef.current = null;
      }
    }
  
    return () => {
      // 🛑 Limpiar la animación cuando el componente se desmonte
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        lastUpdateRef.current = null;
      }
    };
  }, [isPlaying]);
  
  
  //REINICIO DE REGISTROS CUANDO LA INTERPRETACION COMIENZA DESDE CERO
  
  useEffect(() => {
    if (currentTime === 0) {
      console.log("🔄 Reiniciando registros...");
      pausedNotes.current.clear(); // 🧹 Limpiar todas las notas pausadas
      lastPausedNote.current = null; // 🚀 Permitir futuras pausas
      setNotesAtBottom(new Set()); // 🚀 Resetear las notas en el borde
    }
  }, [currentTime]);

//DETECCION DE COLISIONES CON EL BORDE INFERIOR Y CONTROL DE PAUSAS

useEffect(() => {
  if (!isPlaying) return; // 🚀 Si la reproducción está pausada, no se detectan colisiones.

  const updatedNotesAtBottom = new Set(notesAtBottom); // 📌 Conjunto para almacenar notas que tocan el borde.
  let shouldPause = false; // 🛑 Indica si la reproducción debe pausarse.
  let newPausedNote: string | null = null; // 🎹 Última nota que causó una pausa.

  let hasVisibleNotes = false; // 🚀 Variable para detectar si hay notas aún visibles en el lienzo.
  let hasActiveNotesAtBottom = false; // 🚀 Detectar si hay notas activas tocando el borde.

  // 🔄 Iterar sobre todas las notas visibles en la pantalla
  notes.forEach((note) => {
    const noteId = `${note.name}-${note.startTime}`; // 🔥 Identificador único de la nota basado en su nombre y tiempo de inicio.
    const y = Math.round(calculateYPosition(note.startTime, note.duration)); // 📍 Posición actual de la nota en Y.
    const height = Math.round(calculateHeight(note.duration)); // 📏 Altura de la nota.

    // 🧾 Detección con margen ajustado para evitar falsos positivos
    const detectionThreshold = Math.round(canvasHeight - MARGIN_BEFORE_DETECTION);
    const isTouchingBottom = y + height >= detectionThreshold; // 🟡 La nota toca el borde inferior.
    const isCompletelyOut = y > canvasHeight; // 🔴 La nota ya salió completamente de la pantalla.

    if (!isCompletelyOut) {
      hasVisibleNotes = true; // 🚀 Si hay al menos una nota visible, la interpretación no debe detenerse.
    }

    if (isTouchingBottom && !isCompletelyOut) {
      hasActiveNotesAtBottom = true; // 🚀 Hay notas tocando el borde.
      
      // ✅ Si la nota toca el borde pero aún no ha sido detectada antes, la añadimos.
      if (!notesAtBottom.has(noteId)) {
        updatedNotesAtBottom.add(noteId);

        // ⏸️ Si esta nota no ha pausado antes y no es la misma última pausa registrada, pausar
        if (!pausedNotes.current.has(noteId) && lastPausedNote.current !== noteId) {
          shouldPause = true;
          newPausedNote = noteId;
          pausedNotes.current.add(noteId);
        }
      }
    } else if (notesAtBottom.has(noteId) && isCompletelyOut) {
      // 🟢 Si la nota ya salió completamente de la pantalla, la eliminamos del conjunto
      updatedNotesAtBottom.delete(noteId);

      // 🚀 Si ya no hay notas en el borde, limpiamos la última nota pausada.
      if (updatedNotesAtBottom.size === 0) {
        lastPausedNote.current = null;
      }
    }
  });

  setNotesAtBottom(updatedNotesAtBottom); // 🔄 Actualizar el estado con las notas que siguen en el borde.

  // 🔥 🔥 🔥 Nueva lógica: Si NO hay notas visibles NI notas en el borde, continuar automáticamente
  if (!hasVisibleNotes && !hasActiveNotesAtBottom && !isPlaying) {
    console.log("▶️ No hay notas visibles ni activas en el borde, reanudando automáticamente...");
    setIsPlaying(true);
  }

  // ⏸️ Si hay notas activas en el borde, aplicar la pausa si es necesario
  if (shouldPause && isPlaying) {
    lastPausedNote.current = newPausedNote;
    setIsPlaying(false);
  }
}, [elapsedTime, notes, isPlaying]);

  
  //RENDERIZACION DE LAS NOTAS EN EL LIENZO
  return (
    <>
      {notes.map((note, index) => {
        const noteProps = getNoteProperties(note.name, note.duration);
        if (!noteProps) return null; // 🛑 Si no se pudieron calcular las propiedades de la nota, omitirla.
  
        const y = calculateYPosition(note.startTime, note.duration); // 📍 Posición Y calculada para la animación.
        if (y > canvasHeight) return null; // 🛑 Si la nota ya está fuera del lienzo, omitirla.
  
        const { x, width, height, isSharp } = noteProps; // 📏 Extraer propiedades de tamaño y posición.
        const adjustedAlpha = scaleVelocity(note.velocity); // 🎼 Ajustar opacidad basado en la velocidad de la nota.
  
        // 🎨 **Asignación de color según el track y si es sostenida o no**
        const trackColor = trackColors[note.track] || { normal: 0xc772ff, sharp: 0x9900ff };
        const color = isSharp ? trackColor.sharp : trackColor.normal;
  
        return (
          <Graphics
            key={index}
            draw={(g) => {
              g.clear(); // 🧹 Limpiar cualquier dibujo previo
              g.beginFill(color, adjustedAlpha); // 🎨 Aplicar color con opacidad
              g.drawRoundedRect(x, y, width, height, CORNER_RADIUS); // 🔲 Dibujar la nota con bordes redondeados
              g.endFill(); // 🎨 Finalizar el dibujo
            }}
          />
        );
      })}
    </>
  );  
};

export default Notes;
