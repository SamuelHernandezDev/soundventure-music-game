// src/layouts/SecondaryLayout.tsx
import React from 'react';
import SecondaryNavbar from '../Layout/ControlReproduccion/ControlsGame'; // Navbar secundario

const SecondaryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="secondary-layout">
      <main>{children}</main> {/* Renderiza el contenido de las páginas */}
      <SecondaryNavbar /> {/* Navbar posicionado al fondo */}
    </div>
  );
};

export default SecondaryLayout;
