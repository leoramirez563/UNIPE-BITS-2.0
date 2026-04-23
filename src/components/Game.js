import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];
// Aquí podrías tener diferentes listas según la dificultad
const OBJETIVOS_EASY = [3, 7, 14, 22, 26];
const OBJETIVOS_HARD = [129, 150, 170, 200, 240];

const Game = ({ difficulty, onBack }) => {
  const lista = difficulty === 'HARD' ? OBJETIVOS_HARD : OBJETIVOS_EASY;
  const [bits, setBits] = useState(Array(8).fill(0));
  const [score, setScore] = useState(0);
  const [indiceTarget, setIndiceTarget] = useState(0);

  const target = lista[indiceTarget];
  const currentSum = bits.reduce((acc, bit, i) => acc + (bit * POWERS[i]), 0);
  const isSuccess = currentSum === target;
  const isError = currentSum > target;

  const audioMal = useRef(null);
  const audioBien = useRef(null);
  const audioSiguiente = useRef(null);
  const audioVictoria = useRef(null);

  const playSound = (ref) => {
    if (ref.current) { ref.current.currentTime = 0; ref.current.play().catch(() => {}); }
  };

  const toggleBit = (index) => {
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
    setScore(score + 20);
    if (indiceTarget === lista.length - 1) {
      playSound(audioVictoria);
      confetti({ particleCount: 150, origin: { y: 0.6 } });
      setTimeout(() => { alert("¡Nivel Completado!"); onBack(); }, 1500);
    } else {
      playSound(audioSiguiente);
      setIndiceTarget(prev => prev + 1);
      setBits(Array(8).fill(0));
    }
  };

  return (
    <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}>
      <audio ref={audioMal} src="/sounds/mal.mp3" />
      <audio ref={audioBien} src="/sounds/bien.mp3" />
      <audio ref={audioSiguiente} src="/sounds/siguiente.mp3" />
      <audio ref={audioVictoria} src="/sounds/victoria.mp3" />
      
      <h1 className="title">UNIPEBits - {difficulty}</h1>
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
// ... (dentro del componente Game)

const [timeLeft, setTimeLeft] = useState(30); // Ejemplo: 30 segundos
const audioPerdiste = useRef(null); // 1. Nueva referencia

// 2. Lógica del temporizador
useEffect(() => {
  if (timeLeft > 0 && !isSuccess) {
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  } else if (timeLeft === 0) {
    playSound(audioPerdiste); // 3. Disparar audio cuando llega a cero
    // Aquí puedes disparar la pantalla de "Game Over"
  }
}, [timeLeft, isSuccess]);

// ... en el return del componente:

return (
  <div className={`converter-card ${timeLeft === 0 ? 'critical-alert' : ''}`}>
    {/* 4. La etiqueta de audio correspondiente */}
    <audio ref={audioPerdiste} src="/sounds/perdiste.mp3" />
    
    {/* Mostrar el tiempo en pantalla */}
    <div className={`timer ${timeLeft < 10 ? 'timer-danger' : ''}`}>
      Tiempo: {timeLeft}s
    </div>

    {/* ... resto del código */}
  </div>
);