import { useEffect, useState } from 'react'; 
import './InfoGame.css';
import { MIDIHandler } from '../Midi/Midi';

interface InfoGameProps {
  className?: string; // Propiedad opcional para el className
}

const InfoGame: React.FC<InfoGameProps> = ({ className }) => {
  // Estados para la clave actual, teclas presionadas y la nota o acorde
  const [teclasPresionadas, setTeclasPresionadas] = useState<Set<string>>(new Set());

  // Función que actualiza la clave y nota basándose en las teclas presionadas
  useEffect(() => {
    // Función para manejar la tecla presionada
    const handleKeyDown = (key: string) => {
      setTeclasPresionadas(prev => new Set(prev.add(key)));
    };

    // Función para manejar la tecla liberada
    const handleKeyUp = (key: string) => {
      setTeclasPresionadas(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    // Agregar listeners para MIDI
    MIDIHandler.addListener('keydown', handleKeyDown);
    MIDIHandler.addListener('keyup', handleKeyUp);

    // Conectar con MIDI
    MIDIHandler.connectMIDI();

    // Limpiar los listeners cuando el componente se desmonte
    return () => {
      MIDIHandler.removeListener('keydown', handleKeyDown);
      MIDIHandler.removeListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className={`game-info ${className}`}>
      <div id="clave-actual">
        Clave actual: <span id="clave-display">-</span>
      </div>
      <div id="tecla-display">
        Teclas MIDI presionadas: {Array.from(teclasPresionadas).join(', ') || '-'}
      </div>
      <div id="nota-display">
        Nota o Acorde: -
      </div>
    </div>
  );
};

export default InfoGame;
