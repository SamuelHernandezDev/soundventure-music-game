// Columns.tsx
import React from "react";
import { Graphics } from "@pixi/react";

interface ColumnsProps {
  canvasWidth: number;
  canvasHeight: number;
  margin: number;
  totalKeys: number;
  naturalNotes: string[];
  sharps: string[];
}

const Columns: React.FC<ColumnsProps> = ({
  canvasWidth,
  canvasHeight,
  margin,
  totalKeys,
  naturalNotes,
  sharps,
}) => {
  const drawingWidth = canvasWidth - margin * 2;
  const columnWidth = drawingWidth / totalKeys;
  const offsetX = margin;

  const drawColumns = (g: any) => {
    // Limpiar el contexto de gráficos antes de dibujar
    g.clear();
  
    let xPosition = offsetX;
  
    naturalNotes.forEach((note, index) => {
      // Dibujar columnas para teclas naturales
      g.beginFill(0xffffff, 0.01);
      g.drawRect(xPosition, 0, columnWidth, canvasHeight);
      g.endFill();
  
      // Dibujar columnas para sostenidos
      if (index < naturalNotes.length - 1) {
        const sharp = `${note[0]}#${note.slice(1)}`;
        if (sharps.includes(sharp.slice(0, 2))) {
          const sharpX = xPosition + columnWidth * 0.75;
          g.beginFill(0xcccccc, 0.03);
          g.drawRect(sharpX, 0, columnWidth * 0.48, canvasHeight);
          g.endFill();
        }
      }
  
      // Dibujar líneas divisorias
      g.lineStyle(1, 0x000000, 0);
      g.moveTo(xPosition, 0);
      g.lineTo(xPosition, canvasHeight);
  
      xPosition += columnWidth;
    });
  
    // Dibujar la última línea divisoria
    g.lineStyle(1, 0x000000, 0);
    g.moveTo(xPosition, 0);
    g.lineTo(xPosition, canvasHeight);
  };
  

  return <Graphics draw={drawColumns} />;
};

export default React.memo(Columns);
