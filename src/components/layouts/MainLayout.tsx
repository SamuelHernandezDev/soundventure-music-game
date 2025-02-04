// src/layouts/MainLayout.tsx
import React from 'react';
import MainNavbar from '../Layout/MainNavbar/Navbar'; // Navbar principal
//import './MainLayout.css'; // Opcional, estilos específicos del layout principal

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <MainNavbar />
      <main>{children}</main> {/* Renderiza el contenido de las páginas */}
    </>
  );
};

export default MainLayout;
