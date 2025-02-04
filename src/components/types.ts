export interface NoteData {
  name: string; // Nombre de la nota (ej. "C4", "D#5")
  startTime: number; // Tiempo de inicio en segundos
  duration: number; // Duración en segundos
  velocity: number; // Intensidad de la nota (0 a 1)
  track: number; // Canal MIDI de la nota
}
