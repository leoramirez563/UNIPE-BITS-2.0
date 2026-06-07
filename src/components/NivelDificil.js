import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];
const TOTAL_ROUNDS = 15;
const INITIAL_TIME = 90; // 1:30 minutos

const generateTarget = () => Math.floor(Math.random() * 254) + 1;

function JuegoDificil({ volverAOpciones, name, onGuardarPartida }) {
  const [gameState, setGameState] = useState('instructions'); 
  const [bits, setBits] = useState(Array(8).fill(0));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(generateTarget());
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  
  const [errorsCount, setErrorsCount] = useState(0);
  const [showProtocol, setShowProtocol] = useState(false);

  const currentSum = bits.reduce((acc, bit, index) => acc + (bit * POWERS[index]), 0);
  const binaryString = bits.join('');
  const isSuccess = currentSum === target;
  const isError = currentSum > target;

  const audioMal = useRef(null);
  const audioBien = useRef(null);
  const audioSiguiente = useRef(null);
  const audioVictoria = useRef(null);
  const audioDificil = useRef(null); 
  const audioPerdiste = useRef(null);
  const audioPop = useRef(null);
  
  const canvasRef = useRef(null);

  // Guardamos las funciones en refs para que el temporizador use siempre la última versión sin reiniciarse
  const onGuardarPartidaRef = useRef(onGuardarPartida);
  const errorsCountRef = useRef(errorsCount);

  // CANDADO ANTI-DUPLICADOS SÍNCRONO
  const partidaGuardadaRef = useRef(false);

  useEffect(() => {
    onGuardarPartidaRef.current = onGuardarPartida;
    errorsCountRef.current = errorsCount;
  }, [onGuardarPartida, errorsCount]);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio bloqueado"));
    }
  };

  // MATRIX BACKGROUND EFFECT
  useEffect(() => {
    if (showProtocol && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const binario = "01";
      const nombres = "BYTE 128 64 32 16 8 4 2 1 UNIPEBITS 255";
      const fontSize = 16;
      const columnas = canvas.width / fontSize;
      const drops = [];

      for(let x = 0; x < columnas; x++) drops[x] = Math.random() * -100;

      const drawMatrix = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + "px monospace";

        const matrixColor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-green').trim() || "#0F0";

        for(let i = 0; i < drops.length; i++) {
          let texto = Math.random() > 0.98 
            ? nombres[Math.floor(Math.random() * nombres.length)] 
            : binario[Math.floor(Math.random() * binario.length)];
          
          ctx.fillStyle = matrixColor; 
          ctx.fillText(texto, i * fontSize, drops[i] * fontSize);
          if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      };
      const interval = setInterval(drawMatrix, 40);
      return () => clearInterval(interval);
    }
  }, [showProtocol]);

  // =====================================================================
  // CONTROL DE MÚSICA LIMPIO (Sin rebobinar si ya está sonando)
  // =====================================================================
  useEffect(() => {
    const music = audioDificil.current;
    if (!music) return;

    if (gameState === 'playing') {
      music.loop = true;
      music.play().catch(e => console.log("Interacción requerida"));
    } else if (gameState === 'lost' || gameState === 'won' || gameState === 'instructions') {
      music.pause();
      music.currentTime = 0;
    }
  }, [gameState]);

  // =====================================================================
  // TEMPORIZADOR ATÓMICO (100% Sincronizado, 1 ciclo único)
  // =====================================================================
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('lost');
          playSound(audioPerdiste);

          // CANDADO APLICADO AL PERDER (Tiempo Agotado)
          if (!partidaGuardadaRef.current && onGuardarPartidaRef.current) {
            partidaGuardadaRef.current = true; // Cierre inmediato instantáneo
            onGuardarPartidaRef.current({
              nivel: 'Difícil',
              errores: errorsCountRef.current,
              completada: false,
              objetivo_cumplido: false,
              tiempo_tomado: INITIAL_TIME,
              tiempo_restante: 0
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]); // Única dependencia: solo se ejecuta al cambiar el estado del juego

  const toggleBit = (index) => {
    if (gameState !== 'playing') return;
    const newBits = [...bits];
    const isTurningOn = newBits[index] === 0;
    newBits[index] = isTurningOn ? 1 : 0;
    const nextSum = newBits.reduce((acc, b, i) => acc + (b * POWERS[i]), 0);
    if (isTurningOn) {
      if (nextSum > target) {
        setScore(prev => Math.max(0, prev - 20));
        setErrorsCount(prev => prev + 1); 
        playSound(audioMal); 
      } else {
        playSound(audioBien);
      }
    }
    setBits(newBits);
  };

  const handleNext = () => {
    if (isSuccess) {
      setScore(prev => prev + 50);
      if (round >= TOTAL_ROUNDS) {
        setGameState('won');
        playSound(audioVictoria);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

        // CANDADO APLICADO AL GANAR LAS 15 RONDAS
        if (!partidaGuardadaRef.current && onGuardarPartidaRef.current) {
          partidaGuardadaRef.current = true; // Cierre inmediato instantáneo
          onGuardarPartidaRef.current({
            nivel: 'Difícil',
            errores: errorsCount,
            completada: true,
            objetivo_cumplido: true,
            tiempo_tomado: INITIAL_TIME - timeLeft,
            tiempo_restante: timeLeft
          });
        }
      } else {
        playSound(audioSiguiente);
        setRound(prev => prev + 1);
        setTarget(generateTarget());
        setBits(Array(8).fill(0));
      }
    }
  };

  const resetGame = () => {
    setGameState('playing');
    setRound(1);
    setScore(0);
    setErrorsCount(0); 
    setTimeLeft(INITIAL_TIME);
    setTarget(generateTarget());
    setBits(Array(8).fill(0));
    partidaGuardadaRef.current = false; // Liberación del candado para la nueva partida
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="game-wrapper" style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes titilar-rojo {
            0% { opacity: 1; box-shadow: 0 0 15px var(--error-red); }
            50% { opacity: 0.4; box-shadow: 0 0 5px var(--error-red); }
            100% { opacity: 1; box-shadow: 0 0 15px var(--error-red); }
          }
          
          .btn-protocolo-dificil {
            position: absolute; top: 20px; right: 20px;
            background-color: var(--error-red); color: white;
            border: 2px solid white; padding: 10px 20px;
            font-weight: bold; border-radius: 5px; cursor: pointer;
            animation: titilar-rojo 1s infinite; z-index: 9999;
            text-transform: uppercase;
          }

          .protocolo-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 10001; overflow-y: auto; padding: 20px;
            font-family: 'Courier New', monospace;
          }
          .proto-container { max-width: 900px; margin: 0 auto; position: relative; color: white; }
          .proto-header { text-align: center; margin-bottom: 40px; border: 2px solid var(--matrix-green); padding: 20px; background: rgba(0,0,0,0.8); box-shadow: 0 0 15px var(--matrix-green); }
          .lesson-card { background: var(--card-bg); border-left: 5px solid var(--matrix-green); padding: 25px; margin-bottom: 25px; border-radius: 0 8px 8px 0; }
          .math-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 25px 0; }
          @media (min-width: 600px) { .math-grid { grid-template-columns: repeat(8, 1fr); } }
          .math-box { background: #000; border: 1px solid var(--matrix-green); padding: 10px 5px; text-align: center; }
          .pow-text { font-size: 0.9em; color: #fff; display: block; }
          .val-text { font-size: 1.5em; color: var(--matrix-green); font-weight: bold; display: block; }
          .byte-container { display: flex; justify-content: space-between; background: #111; padding: 10px; border: 1px solid #333; margin: 20px 0; overflow-x: auto; }
          .bit-unit { text-align: center; min-width: 45px; flex: 1; border-right: 1px solid #222; }
          .header-val { font-size: 0.8em; color: var(--text-gray); }
          .bit-val { font-size: 2em; color: var(--matrix-green); font-weight: bold; }
          .highlight { color: var(--matrix-green); font-weight: bold; }
          .step { margin-bottom: 8px; padding-left: 20px; position: relative; text-align: left; }
          .step::before { content: ">"; position: absolute; left: 0; color: var(--matrix-green); }
          .proto-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
          .proto-table th, .proto-table td { border: 1px solid #333; padding: 10px; text-align: center; }
          .proto-table th { color: var(--matrix-green); background: #111; }
          .btn-cerrar-proto { display: block; margin: 30px auto; background: #000; color: var(--matrix-green); border: 1px solid var(--matrix-green); padding: 15px 30px; cursor: pointer; font-weight: bold; }
        `}
      </style>

      <audio ref={audioMal} src={process.env.PUBLIC_URL + "/sounds/mal.mp3"} preload="auto" />
      <audio ref={audioBien} src={process.env.PUBLIC_URL + "/sounds/bien.mp3"} preload="auto" />
      <audio ref={audioSiguiente} src={process.env.PUBLIC_URL + "/sounds/siguiente.mp3"} preload="auto" />
      <audio ref={audioVictoria} src={process.env.PUBLIC_URL + "/sounds/victoria.mp3"} preload="auto" />
      <audio ref={audioDificil} src={process.env.PUBLIC_URL + "/sounds/audio_dificil.mp3"} preload="auto" />
      <audio ref={audioPerdiste} src={process.env.PUBLIC_URL + "/sounds/perdiste.mp3"} preload="auto" />
      <audio ref={audioPop} src={process.env.PUBLIC_URL + "/sounds/Pop.mp3"} preload="auto" />

      {showProtocol && (
        <div className="protocolo-overlay">
          <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
          <div className="proto-container">
            <header className="proto-header">
                <h1>PROTOCOLO BYTE: 8-BITS FULL ACCESS</h1>
                <p>Has alcanzado el estándar de la arquitectura moderna. 1 Byte = 8 Bits.</p>
            </header>

            <section className="lesson-card">
                <h2>1. El Mapa del Byte</h2>
                <div className="math-grid">
                    <div className="math-box"><span className="pow-text">2⁷</span><span className="val-text">128</span></div>
                    <div className="math-box"><span className="pow-text">2⁶</span><span className="val-text">64</span></div>
                    <div className="math-box"><span className="pow-text">2⁵</span><span className="val-text">32</span></div>
                    <div className="math-box"><span className="pow-text">2⁴</span><span className="val-text">16</span></div>
                    <div className="math-box"><span className="pow-text">2³</span><span className="val-text">8</span></div>
                    <div className="math-box"><span className="pow-text">2²</span><span className="val-text">4</span></div>
                    <div className="math-box"><span className="pow-text">2¹</span><span className="val-text">2</span></div>
                    <div className="math-box"><span className="pow-text">2⁰</span><span className="val-text">1</span></div>
                </div>
            </section>

            <section className="lesson-card">
                <h2>2. Ejemplo de Red: El número 165</h2>
                <div className="byte-container">
                    <div className="bit-unit"><span className="header-val">128</span><br/><span className="bit-val">1</span></div>
                    <div className="bit-unit"><span className="header-val">64</span><br/><span className="bit-val">0</span></div>
                    <div className="bit-unit"><span className="header-val">32</span><br/><span className="bit-val">1</span></div>
                    <div className="bit-unit"><span className="header-val">16</span><br/><span className="bit-val">0</span></div>
                    <div className="bit-unit"><span className="header-val">8</span><br/><span className="bit-val">0</span></div>
                    <div className="bit-unit"><span className="header-val">4</span><br/><span className="bit-val">1</span></div>
                    <div className="bit-unit"><span className="header-val">2</span><br/><span className="bit-val">0</span></div>
                    <div className="bit-unit"><span className="header-val">1</span><br/><span className="bit-val">1</span></div>
                </div>
                <p style={{textAlign: 'center'}}>Suma: <span className="highlight">128 + 32 + 4 + 1 = 165</span></p>
            </section>

            <section className="lesson-card">
                <h2>3. Algoritmo de Conversión</h2>
                <div className="step">¿128 cabe en 200? <strong>SÍ</strong>. (Resta 72). Bit = 1.</div>
                <div className="step">¿64 cabe en 72? <strong>SÍ</strong>. (Resta 8). Bit = 1.</div>
                <div className="step">¿32 cabe en 8? NO. Bit = 0.</div>
                <div className="step">¿16 cabe en 8? NO. Bit = 0.</div>
                <div className="step">¿8 cabe en 8? <strong>SÍ</strong>. (Resta 0). Bit = 1.</div>
                <p>Resultado: <span className="highlight">1 1 0 0 1 0 0 0</span></p>
            </section>

            <section className="lesson-card">
                <h2>4. Tabla de Referencia Byte</h2>
                <table className="proto-table">
                    <thead>
                        <tr><th>Decimal</th><th>Binario (8 Bits)</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td>00000001</td><td>0 + 0 + 0 + 0 + 0 + 0 + 0 + 1</td></tr>
                        <tr><td>51</td><td>00110011</td><td>0 + 0 + 32 + 16 + 0 + 0 + 2 + 1</td></tr>
                        <tr><td>102</td><td>01100110</td><td>0 + 64 + 32 + 0 + 0 + 4 + 2 + 0</td></tr>
                        <tr><td>153</td><td>10011001</td><td>128 + 0 + 0 + 16 + 8 + 0 + 0 + 1</td></tr>
                        <tr><td>204</td><td>11001100</td><td>128 + 64 + 0 + 0 + 8 + 4 + 0 + 0</td></tr>
                    </tbody>
                </table>
            </section>
            
            <button className="btn-cerrar-proto" onClick={() => { playSound(audioPop); setShowProtocol(false); }}>VOLVER A LA MISIÓN</button>
          </div>
        </div>
      )}

      {gameState === 'instructions' && (
        <>
          <button className="btn-protocolo-dificil" onClick={() => { playSound(audioPop); setShowProtocol(true); }}>Protocolo</button>
          <div className="converter-card instruction-card">
            <h1 className="success-text" style={{color: 'var(--matrix-green)'}}>OBJETIVO DE LA MISIÓN</h1>
            <p>Bienvenido operador <span className="highlight">{name}</span>. Debes estabilizar el núcleo convirtiendo números decimales a binario.</p>
            <ul className="instruction-list" style={{ listStyle: 'none', padding: 0 }}>
              <p style={{ marginBottom: '15px' }}>
                <strong> Niveles:</strong> Debes completar <span className="highlight"> 15 conversiones </span> únicas.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong> Tiempo:</strong> Tienes <span className="highlight"> 1:30 minutos </span> en total.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong> Mecánica:</strong> Haz clic en los bits para sumar sus valores hasta igualar el objetivo.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong> Penalización:</strong> Si te pasas del número, perderás 20 puntos.
              </p>
            </ul>
            <div className="controls-container" style={{justifyContent: 'center', gap: '20px', marginTop: '30px'}}>
              <button className="btn-volver" onClick={volverAOpciones}>atras</button>
              <button className="next-button ready" onClick={() => { playSound(audioPop); setGameState('playing'); }}>¡ENTENDIDO, EMPEZAR!</button>
            </div>
          </div>
        </>
      )}

      {(gameState === 'playing' || gameState === 'lost') && (
        <div className={`game-play-container ${gameState === 'lost' ? 'disintegrate-animation' : ''}`}>
          <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''} ${timeLeft <= 30 ? 'critical-alert' : ''}`}>
            <div className="header-info">
              <h1 className="title-game" style={{color: 'var(--matrix-green)'}}>UNIPEBits - Difícil</h1>
              <div className={`timer ${timeLeft <= 30 ? 'timer-danger' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="target-number-container">
              <p className="subtitle">OBJETIVO DECIMAL</p>
              <h2 className="target-number" style={{color: 'var(--matrix-green)'}}>{target}</h2>
              <small>Reto {round} de {TOTAL_ROUNDS}</small>
            </div>

            <div className="bits-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {bits.map((bit, index) => (
                <div key={index} className={`bit-module ${bit === 1 ? 'on' : 'off'}`}>
                  <div className="bit-toggle" onClick={() => toggleBit(index)}>
                    <div className="toggle-number">{bit}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="results-container">
                Suma: <span className="highlight-value" style={{color: 'var(--matrix-green)'}}>{currentSum}</span> | Binario: <span className="highlight-value" style={{color: 'var(--matrix-green)'}}>{binaryString}</span>
            </div>

            <div className="controls-container">
              <button className="btn-volver" onClick={volverAOpciones}>atras</button>
              <div className="score-board"> PUNTOS: <span className="highlight-value">{score}</span> </div>
              <button className={`next-button ${isSuccess ? 'ready' : ''}`} disabled={!isSuccess} onClick={handleNext}>
                {round === TOTAL_ROUNDS ? '¡FINALIZAR!' : 'SIGUIENTE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="converter-card error-screen final-buttons-show">
          <h1 className="title-huge" style={{color: 'var(--error-red)'}}>¡TIEMPO AGOTADO!</h1>
          <p className="message">El núcleo se ha desintegrado.</p>
          <div className="score-board">Puntuación Final: <span className="highlight-value">{score}</span></div>
          <div className="controls-container mt-20" style={{justifyContent: 'center', gap: '20px'}}>
            <button className="next-button ready" onClick={resetGame}>Reintentar</button>
            <button className="btn-volver" onClick={volverAOpciones}>Menú Principal</button>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="converter-card success-screen">
          <h1 className="title-huge success-text" style={{color: 'var(--matrix-green)'}}>¡SISTEMA ESTABILIZADO!</h1>
          <p className="message">Excelente trabajo, <span className="highlight" style={{ textTransform: 'uppercase' }}>{name}</span>. Has completado las 15 conversiones exitosamente.</p>
          <div className="score-board">Puntuación Final: <span className="highlight-value">{score}</span></div>
          <div className="controls-container mt-20" style={{justifyContent: 'center', gap: '20px'}}>
             <button className="next-button ready" onClick={resetGame}>Jugar de Nuevo</button>
             <button className="btn-volver" onClick={volverAOpciones}>Menú Principal</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JuegoDificil;