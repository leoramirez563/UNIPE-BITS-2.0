import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { API_URL } from './config.js'; // <-- Importamos la URL de Ngrok

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];
const OBJETIVOS_EASY = [3, 7, 14, 22, 26];
const OBJETIVOS_HARD = [129, 150, 170, 200, 240];

// RECIBE 'nombre_usuario' DESDE EL INICIO (Donde sea que lo tengas guardado)
const Game = ({ difficulty, onBack, nombre_usuario = 'Jugador Anonimo' }) => {
  const lista = difficulty === 'HARD' ? OBJETIVOS_HARD : OBJETIVOS_EASY;
  const [bits, setBits] = useState(Array(8).fill(0));
  const [score, setScore] = useState(0);
  const [indiceTarget, setIndiceTarget] = useState(0);
  
  // Estados para el tiempo
  const TIEMPO_INICIAL = 30; 
  const [timeLeft, setTimeLeft] = useState(TIEMPO_INICIAL); 
  const [tiempoTomadoTotal, setTiempoTomadoTotal] = useState(0);

  const target = lista[indiceTarget];
  const currentSum = bits.reduce((acc, bit, i) => acc + (bit * POWERS[i]), 0);
  const isSuccess = currentSum === target;
  const isError = currentSum > target;

  const audioMal = useRef(null);
  const audioBien = useRef(null);
  const audioSiguiente = useRef(null);
  const audioVictoria = useRef(null);
  const audioPerdiste = useRef(null); 

  const playSound = (ref) => {
    if (ref.current) { ref.current.currentTime = 0; ref.current.play().catch(() => {}); }
  };

  // ==========================================
  // FUNCIÓN AUTOMÁTICA PARA GUARDAR EN MARIADB
  // ==========================================
  const enviarPartidaAlServidor = async (tiempoRestanteFinal) => {
    const datosPartida = {
      nombre_usuario: nombre_usuario, // Usa el nombre que vino desde el inicio
      tiempo_tomado: tiempoTomadoTotal + (TIEMPO_INICIAL - timeLeft), 
      tiempo_restante: tiempoRestanteFinal
    };

    try {
      console.log("Enviando datos a MariaDB...", datosPartida);
      await fetch(`${API_URL}/api/guardar-partida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Evita que Ngrok bloquee la petición
        },
        body: JSON.stringify(datosPartida)
      });
    } catch (error) {
      console.error("Error al conectar con Ngrok/MariaDB:", error);
    }
  };

  // ==========================================
  // LÓGICA DEL TEMPORIZADOR INTEGRADA
  // ==========================================
  useEffect(() => {
    if (timeLeft > 0 && !isSuccess) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      playSound(audioPerdiste);
      alert("¡Se agotó el tiempo! Game Over.");
      
      // Guarda la partida de forma silenciosa e instantánea
      enviarPartidaAlServidor(0); 
      onBack();
    }
  }, [timeLeft, isSuccess]);

  const toggleBit = (index) => {
    if (timeLeft === 0) return; 
    const newBits = [...bits];
    newBits[index] = newBits[index] === 0 ? 1 : 0;
    if (newBits[index] === 1) {
       const nextSum = newBits.reduce((acc, b, i) => acc + (b * POWERS[i]), 0);
       nextSum > target ? playSound(audioMal) : playSound(audioBien);
    }
    setBits(newBits);
  };

  const handleNext = () => {
    if (!isSuccess) return;
    
    const tiempoUsadoEnEsteReto = TIEMPO_INICIAL - timeLeft;
    setTiempoTomadoTotal(prev => prev + tiempoUsadoEnEsteReto);
    setScore(score + 20);

    if (indiceTarget === lista.length - 1) {
      // ¡GANÓ EL JUEGO COMPLETO!
      playSound(audioVictoria);
      confetti({ particleCount: 150, origin: { y: 0.6 } });
      
      setTimeout(async () => {
        // Guarda automáticamente con el tiempo restante
        await enviarPartidaAlServidor(timeLeft);
        onBack();
      }, 1500);

    } else {
      playSound(audioSiguiente);
      setIndiceTarget(prev => prev + 1);
      setBits(Array(8).fill(0));
      setTimeLeft(TIEMPO_INICIAL); 
    }
  };

  return (
    <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''} ${timeLeft === 0 ? 'critical-alert' : ''}`}>
      <audio ref={audioMal} src="/sounds/mal.mp3" />
      <audio ref={audioBien} src="/sounds/bien.mp3" />
      <audio ref={audioSiguiente} src="/sounds/siguiente.mp3" />
      <audio ref={audioVictoria} src="/sounds/victoria.mp3" />
      <audio ref={audioPerdiste} src="/sounds/perdiste.mp3" />
      
      <h1 className="title">UNIPEBits - {difficulty}</h1>
      
      {/* Temporizador en pantalla */}
      <div className={`timer ${timeLeft < 10 ? 'timer-danger' : ''}`}>
        Tiempo: {timeLeft}s
      </div>

      <div className="target-container">
        <h2>{target}</h2>
        <small>Reto {indiceTarget + 1} de {lista.length}</small>
      </div>

      <div className="bits-container">
        {POWERS.map((p, i) => (
          <div key={i} className={`bit-module ${bits[i] ? 'on' : 'off'}`}>
            <div className="bit-toggle" onClick={() => toggleBit(i)}>{bits[i]}</div>
            <div className="bit-decimal">+{p}</div>
          </div>
        ))}
      </div>

      <div className="controls-container">
        <button className="next-button" disabled={!isSuccess} onClick={handleNext}>SIGUIENTE</button>
        <button className="btn-volver" onClick={onBack}>SALIR</button>
      </div>
    </div>
  );
};

export default Game;