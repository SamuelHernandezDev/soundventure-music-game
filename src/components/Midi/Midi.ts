export class MIDIHandler {
  // Almacena los listeners para diferentes tipos de eventos
  static listeners: { [key: string]: Function[] } = {};

  /**
   * Maneja los mensajes MIDI entrantes.
   * @param event - El evento MIDI recibido.
   */
  static onMidiMessage(event: any) {
    const [status, note, velocity] = event.data;
    const noteName = MIDIHandler.midiToNoteName(note);

    if (status === 144 && velocity > 0) {
      // Nota ON (presionada)
      MIDIHandler.notifyListeners('keydown', noteName);
    } else if (status === 128 || (status === 144 && velocity === 0)) {
      // Nota OFF (liberada)
      MIDIHandler.notifyListeners('keyup', noteName);
    }
  }

  /**
   * Convierte un valor de nota MIDI a su representación de nota musical.
   * @param note - Valor de nota MIDI.
   * @returns El nombre de la nota musical (ejemplo: "C4").
   */
  static midiToNoteName(note: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    const noteName = notes[note % 12];
    return `${noteName}${octave}`;
  }

  /**
   * Agrega un listener para un tipo de evento específico.
   * @param eventType - Tipo de evento (ejemplo: 'keydown' o 'keyup').
   * @param callback - Función a ejecutar cuando ocurra el evento.
   */
  static addListener(eventType: string, callback: Function) {
    if (!MIDIHandler.listeners[eventType]) {
      MIDIHandler.listeners[eventType] = [];
    }
    MIDIHandler.listeners[eventType].push(callback);
  }

  /**
   * Elimina un listener de un tipo de evento específico.
   * @param eventType - Tipo de evento.
   * @param callback - La función que se desea eliminar.
   */
  static removeListener(eventType: string, callback: Function) {
    const listeners = MIDIHandler.listeners[eventType];
    if (listeners) {
      MIDIHandler.listeners[eventType] = listeners.filter(listener => listener !== callback);
    }
  }

  /**
   * Notifica a todos los listeners registrados para un tipo de evento.
   * @param eventType - Tipo de evento.
   * @param key - Información adicional que se pasa al listener (ejemplo: nombre de la nota).
   */
  static notifyListeners(eventType: string, key: string) {
    const listeners = MIDIHandler.listeners[eventType];
    if (listeners) {
      listeners.forEach(callback => callback(key));
    }
  }

  /**
   * Conecta el dispositivo MIDI y escucha eventos MIDI.
   */
  static connectMIDI() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false }) // Asegura que no se solicite sysex
        .then(midiAccess => {
          const inputs = midiAccess.inputs;
          inputs.forEach(input => {
            input.onmidimessage = MIDIHandler.onMidiMessage;
          });
          console.log("MIDI connected.");
        })
        .catch(err => {
          console.error("Failed to connect MIDI", err);
        });
    } else {
      console.log("MIDI not supported in this browser.");
    }
  }
  
}
