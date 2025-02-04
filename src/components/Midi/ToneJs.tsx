import React, { useEffect, useState } from 'react';
import { Midi } from '@tonejs/midi';
import { NoteData } from '../types'; // Importar desde el archivo común
import './ToneJs.css'; // Importar los estilos

const ToneJs: React.FC<{ 
  onNotesProcessed: (notes: NoteData[]) => void;
  onBpmDetected: (bpm: number) => void;
  onDurationDetected: (duration: number) => void;
}> = ({ onNotesProcessed, onBpmDetected, onDurationDetected }) => {
  const [midiFile, setMidiFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(''); // Mensaje de estado
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Indicador de procesamiento

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setMidiFile(file);
    setStatusMessage(`Archivo seleccionado: ${file.name}`);
  };

  const processMidiFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setStatusMessage('Procesando archivo...');
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      // 🔹 Obtener BPM desde el header del MIDI
      const detectedBpm = midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120;
      //console.log("BPM detectado:", detectedBpm);
      onBpmDetected(detectedBpm); // Enviar BPM a SheetGame.tsx

      // 🔹 Obtener duración total del MIDI
      const totalDuration = midi.duration; // Devuelve la duración en segundos
     // console.log("Duración total detectada:", totalDuration);
      onDurationDetected(totalDuration+2); // Enviar duración total a SheetGame.tsx

      const notes: NoteData[] = midi.tracks.flatMap((track, trackIndex) =>
        track.notes.map((note) => {
          const noteData = {
            name: note.name,
            startTime: note.time, // En segundos
            duration: note.duration, // En segundos
            velocity: note.velocity, // Intensidad
            track: trackIndex, // Asignar el índice del track
          };

          // Mostrar en consola cada nota con su track
          /*console.log(
            `Nota procesada: ${noteData.name} | Track: ${noteData.track} | StartTime: ${noteData.startTime}`
          );*/

          return noteData;
        })
      );

      notes.sort((a, b) => a.startTime - b.startTime);
      //console.log('Todas las notas procesadas:', notes);
      onNotesProcessed(notes);

      setStatusMessage('Archivo procesado con éxito.');
    } catch (error) {
      console.error('Error al procesar el archivo MIDI:', error);
      setStatusMessage('Error al procesar el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (midiFile) {
      processMidiFile(midiFile);
    }
  }, [midiFile]);

  return (
    <div className="tonejs-container">
      <label htmlFor="midi-file" className="custom-file-label">
        {isProcessing ? 'Procesando...' : 'Seleccionar Archivo'}
      </label>
      <input
        type="file"
        id="midi-file"
        accept=".mid"
        onChange={handleFileUpload}
        className="file-input"
        disabled={isProcessing}
      />
      <p className={`status-message ${isProcessing ? 'processing' : ''}`}>
        {statusMessage}
      </p>
    </div>
  );
};

export default ToneJs;
