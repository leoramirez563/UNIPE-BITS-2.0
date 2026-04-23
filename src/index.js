import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Esto es lo que conecta el diseño con el programa
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);