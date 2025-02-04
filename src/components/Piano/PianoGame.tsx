import { useRef, useEffect, useState } from 'react'; 
import './PianoGame.css';
import { MIDIHandler } from '/Users/samue/ProyectoReact-SoundVenture/src/components/Midi/Midi'; // Importar la lógica MIDI

interface PianoGameProps {
  className?: string; // Propiedad opcional para el className
}

const PianoGame: React.FC<PianoGameProps> = ({ className }) => {
  const pianoKeysRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const keys = [
    //------ZERO OCTAVA-------// 
    { key: 'A0', type: 'white' },
    { key: 'A#0', type: 'black' },
    { key: 'B0', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------ONE OCTAVA-------// 
    { key: 'C1', type: 'white' },
    { key: 'C#1', type: 'black' },
    { key: 'D1', type: 'white' },
    { key: 'D#1', type: 'black' },
    { key: 'E1', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------ONE OCTAVA-------// 
    { key: 'F1', type: 'white' },
    { key: 'F#1', type: 'black' },
    { key: 'G1', type: 'white' },
    { key: 'G#1', type: 'black' },
    { key: 'A1', type: 'white' },
    { key: 'A#1', type: 'black' },
    { key: 'B1', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------TWO OCTAVA-------// 
    { key: 'C2', type: 'white' },
    { key: 'C#2', type: 'black' },
    { key: 'D2', type: 'white' },
    { key: 'D#2', type: 'black' },
    { key: 'E2', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F2', type: 'white' },
    { key: 'F#2', type: 'black' },
    { key: 'G2', type: 'white' },
    { key: 'G#2', type: 'black' },
    { key: 'A2', type: 'white' },
    { key: 'A#2', type: 'black' },
    { key: 'B2', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' }, 
    //------THREE OCTAVA-------//
    { key: 'C3', type: 'white' },
    { key: 'C#3', type: 'black' },
    { key: 'D3', type: 'white' },
    { key: 'D#3', type: 'black' },
    { key: 'E3', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F3', type: 'white' },
    { key: 'F#3', type: 'black' },
    { key: 'G3', type: 'white' },
    { key: 'G#3', type: 'black' },
    { key: 'A3', type: 'white' },
    { key: 'A#3', type: 'black' },
    { key: 'B3', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------FOUR OCTAVA-------//
    { key: 'C4', type: 'white' },
    { key: 'C#4', type: 'black' },
    { key: 'D4', type: 'white' },
    { key: 'D#4', type: 'black' },
    { key: 'E4', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F4', type: 'white' },
    { key: 'F#4', type: 'black' },
    { key: 'G4', type: 'white' },
    { key: 'G#4', type: 'black' },
    { key: 'A4', type: 'white' },
    { key: 'A#4', type: 'black' },
    { key: 'B4', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------FIVE OCTAVA-------//
    { key: 'C5', type: 'white' },
    { key: 'C#5', type: 'black' },
    { key: 'D5', type: 'white' },
    { key: 'D#5', type: 'black' },
    { key: 'E5', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F5', type: 'white' },
    { key: 'F#5', type: 'black' },
    { key: 'G5', type: 'white' },
    { key: 'G#5', type: 'black' },
    { key: 'A5', type: 'white' },
    { key: 'A#5', type: 'black' },
    { key: 'B5', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------SIX OCTAVA-------//
    { key: 'C6', type: 'white' },
    { key: 'C#6', type: 'black' },
    { key: 'D6', type: 'white' },
    { key: 'D#6', type: 'black' },
    { key: 'E6', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F6', type: 'white' },
    { key: 'F#6', type: 'black' },
    { key: 'G6', type: 'white' },
    { key: 'G#6', type: 'black' },
    { key: 'A6', type: 'white' },
    { key: 'A#6', type: 'black' },
    { key: 'B6', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------SEVEN OCTAVA-------//
    { key: 'C7', type: 'white' },
    { key: 'C#7', type: 'black' },
    { key: 'D7', type: 'white' },
    { key: 'D#7', type: 'black' },
    { key: 'E7', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    { key: 'F7', type: 'white' },
    { key: 'F#7', type: 'black' },
    { key: 'G7', type: 'white' },
    { key: 'G#7', type: 'black' },
    { key: 'A7', type: 'white' },
    { key: 'A#7', type: 'black' },
    { key: 'B7', type: 'white' },
    //--------SEPARATOR-------//
    { key: 'Null', type: 'Edge' },
    //------EIGHT OCTAVA-------// 
    { key: 'C8', type: 'white' }
  ];

  useEffect(() => {
    // Suscribirse a los eventos de MIDI
    MIDIHandler.addListener('keydown', (key: string) => {
      setPressedKeys(prev => new Set(prev.add(key)));
    });

    MIDIHandler.addListener('keyup', (key: string) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    });

    // Conectar con los dispositivos MIDI
    MIDIHandler.connectMIDI();

    return () => {
      // Limpiar la suscripción a los eventos de MIDI cuando el componente se desmonte
      MIDIHandler.listeners = {};
    };
  }, []);

  return (
    <div className={`piano-container ${className}`}>
      <ul className="piano-keys-list">
        {keys.map(({ key, type }, index) => (
          <li key={key === 'Null' ? `Edge-${index}` : key} // Usa un valor único solo para Edge
            className={`piano-keys ${type}-key ${pressedKeys.has(key) ? 'pressed' : ''}`}
            data-key={key}
            ref={(el) => { pianoKeysRef.current[key] = el }}>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PianoGame;
