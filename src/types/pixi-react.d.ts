declare module 'pixi-react' {
    import React from 'react';
  
    export interface StageProps {
      width: number;
      height: number;
      options?: {
        backgroundColor?: number;
      };
      children?: React.ReactNode;
    }
  
    export interface SpriteProps {
      image: string;
      x: number;
      y: number;
      anchor?: { x: number; y: number };
    }
  
    export const Stage: React.FC<StageProps>;
    export const Sprite: React.FC<SpriteProps>;
  }
  