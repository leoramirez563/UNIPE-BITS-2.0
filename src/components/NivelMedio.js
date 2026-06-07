import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti'; 

const POWERS = [32, 16, 8, 4, 2, 1];
const TOTAL_ROUNDS = 20;
const INITIAL_TIME = 180; 

const generateShuffledTargets = (count) => {
  const allNumbers = Array.from({ length: 63 }, (_, i) => i + 1);
  return allNumbers.sort(() => Math.random() - 0.5).slice(0, count);
};

function NivelMedio({ volverAOpciones, name, onGuardarPartida }) {
  const [gameState, setGameState] = useState('instructions'); 
  const [showProtocol, setShowProtocol] = useState(false); 
  const [bits, setBits] = useState(Array(6).fill(0));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [targetList, setTargetList] = useState([]);
  const [target, setTarget] = useState(0);
  
  const [errorsCount, setErrorsCount] = useState(0);

  const currentSum = bits.reduce((acc, bit, index) => acc + (bit * POWERS[index]), 0);
  const binaryString = bits.join('');
  const isError = currentSum > target;
  const isSuccess = currentSum === target;

  const audioFondo = useRef(null); 
  const canvasRef = useRef(null);

  // Mantenemos referencias estables actualizadas para el hilo aislado del temporizador
  const onGuardarPartidaRef = useRef(onGuardarPartida);
  const errorsCountRef = useRef(errorsCount);

  // CANDADO ANTI-DUPLICADOS (Evita el doble disparo por StrictMode o renders simultáneos)
  const partidaGuardadaRef = useRef(false);

  useEffect(() => {
    onGuardarPartidaRef.current = onGuardarPartida;
    errorsCountRef.current = errorsCount;
  }, [onGuardarPartida, errorsCount]);

  const playEfecto = (rutaJson) => {
    const audio = new Audio(process.env.PUBLIC_URL + rutaJson);
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio de efecto bloqueado:", e));
  };

  useEffect(() => {
    const newList = generateShuffledTargets(TOTAL_ROUNDS);
    setTargetList(newList);
    setTarget(newList[0]);
  }, []);

  // MATRIX BACKGROUND EFFECT
  useEffect(() => {
    if (showProtocol && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const binario = "01";
      const nombres = "JUAREZDANIELA SALSESLEONEL 32 16 8 4 2 1 010101";
      const fontSize = 16;
      const columnas = canvas.width / fontSize;
      const drops = [];
      for(let x = 0; x < columnas; x++) drops[x] = Math.random() * -100;

      const drawMatrix = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + "px monospace";
        for(let i = 0; i < drops.length; i++) {
          let texto;
          if (Math.random() > 0.97) {
            texto = nombres[Math.floor(Math.random() * nombres.length)];
            ctx.fillStyle = "#FFF"; 
          } else {
            texto = binario[Math.floor(Math.random() * binario.length)];
            ctx.fillStyle = "#0F0"; 
          }
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
  // CONTROL DE MÚSICA EN LAZO (Sin rebobinados accidentales)
  // =====================================================================
  useEffect(() => {
    const music = audioFondo.current;
    if (!music) return;

    if (gameState === 'playing') {
      music.loop = true;
      music.play().catch(e => console.log("Interaction required"));
    } else if (gameState === 'lost' || gameState === 'won' || gameState === 'instructions') {
      music.pause();
      music.currentTime = 0;
    }
  }, [gameState]);

  // =====================================================================
  // TEMPORIZADOR ATÓMICO (100% Sincronizado, 1 bucle único por partida)
  // =====================================================================
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('lost');
          playEfecto("/sounds/perdiste.mp3"); 

          // CANDADO APLICADO AL PERDER (Tiempo Agotado)
          if (!partidaGuardadaRef.current && onGuardarPartidaRef.current) {
            partidaGuardadaRef.current = true; // Cierre inmediato síncrono
            onGuardarPartidaRef.current({
              nivel: 'Medio',
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
  }, [gameState]); // Reducido estrictamente a la inicialización del gameplay

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
        playEfecto("/sounds/mal.mp3"); 
      } else {
        playEfecto("/sounds/bien.mp3");
      }
    }
    setBits(newBits);
  };

  const handleNext = () => {
    if (isSuccess) {
      setScore(prev => prev + 20);
      if (round >= TOTAL_ROUNDS) {
        setGameState('won');
        playEfecto("/sounds/victoria.mp3");
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

        // CANDADO APLICADO AL GANAR LAS 20 RONDAS
        if (!partidaGuardadaRef.current && onGuardarPartidaRef.current) {
          partidaGuardadaRef.current = true; // Cierre inmediato síncrono
          onGuardarPartidaRef.current({
            nivel: 'Medio',
            errores: errorsCount,
            completada: true,
            objetivo_cumplido: true,
            tiempo_tomado: INITIAL_TIME - timeLeft,
            tiempo_restante: timeLeft
          });
        }

      } else {
        playEfecto("/sounds/siguiente.mp3");
        setRound(prev => prev + 1);
        setTarget(targetList[round]); 
        setBits(Array(6).fill(0));
      }
    }
  };

  const resetGame = () => {
    const newList = generateShuffledTargets(TOTAL_ROUNDS);
    setTargetList(newList);
    setTarget(newList[0]);
    setGameState('playing');
    setRound(1);
    setScore(0);
    setErrorsCount(0);
    setTimeLeft(INITIAL_TIME);
    setBits(Array(6).fill(0));
    partidaGuardadaRef.current = false; // Liberamos el candado para permitir guardar la nueva partida
  };

  return (
    <div className="game-wrapper" style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes titilar-medio {
            0% { opacity: 1; box-shadow: 0 0 15px rgba(255, 0, 0, 0.7); }
            50% { opacity: 0.4; box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); }
            100% { opacity: 1; box-shadow: 0 0 15px rgba(255, 0, 0, 0.7); }
          }
          .btn-protocolo {
            position: absolute; top: 20px; right: 20px;
            background-color: #ff0000; color: white;
            border: 2px solid white; padding: 10px 20px;
            font-weight: bold; border-radius: 5px; cursor: pointer;
            animation: titilar-medio 1s infinite; z-index: 1000;
            text-transform: uppercase;
          }

          :root { --neon-green: #00ff41; --dark-bg: #0a0a0a; --text-gray: #b0b0b0; }
          .proto-body { background-color: #000; color: white; font-family: 'Courier New', Courier, monospace; line-height: 1.6; padding: 20px; }
          .canvas-matrix-proto { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
          .container-proto { max-width: 850px; margin: 0 auto; position: relative; }
          .header-proto { text-align: center; margin-bottom: 40px; border: 2px solid var(--neon-green); padding: 20px; background: rgba(0,0,0,0.8); box-shadow: 0 0 15px var(--neon-green); }
          
          .lesson-card-proto { 
            background: rgba(0, 255, 65, 0.15); 
            border: 1px solid rgba(0, 255, 65, 0.3);
            border-left: 5px solid var(--neon-green); 
            padding: 25px; 
            margin-bottom: 25px; 
            border-radius: 0 8px 8px 0; 
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.2); 
            backdrop-filter: blur(2px); 
          }

          .math-grid-proto { display: flex; justify-content: center; gap: 10px; margin: 25px 0; flex-wrap: wrap; }
          .math-box-proto { background: #000; border: 2px solid var(--neon-green); padding: 10px; text-align: center; min-width: 80px; flex: 1; }
          .pow-text-proto { font-size: 1.1em; color: #fff; display: block; margin-bottom: 5px; }
          .val-text-proto { font-size: 1.8em; color: var(--neon-green); font-weight: bold; display: block; }
          .desc-text-proto { font-size: 0.7em; color: var(--text-gray); text-transform: uppercase; }
          .user-grid-proto { display: flex; justify-content: center; margin: 20px 0; border-bottom: 2px solid var(--neon-green); padding-bottom: 10px; }
          .user-col-proto { border-left: 2px solid white; padding: 0 15px; text-align: center; flex: 1; }
          .user-col-proto:last-child { border-right: 2px solid white; }
          .header-val-proto { font-size: 1.2em; font-weight: bold; display: block; color: var(--text-gray); }
          .bit-val-proto { font-size: 2.2em; color: var(--neon-green); display: block; margin-top: 10px; }
          .highlight-proto { color: var(--neon-green); font-weight: bold; }
          .direction-alert-proto { background: #000; color: #fff; border: 1px solid red; padding: 10px; text-align: center; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
          .proto-table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #000; }
          .proto-table th, .proto-table td { border: 1px solid #333; padding: 12px; text-align: center; }
          .proto-table th { background: #111; color: var(--neon-green); }
          .step-proto { margin-bottom: 10px; padding-left: 20px; position: relative; text-align: left; }
          .step-proto::before { content: ">"; position: absolute; left: 0; color: var(--neon-green); }
          .btn-cerrar-proto { display: block; margin: 20px auto; background: #000; color: #00ff41; border: 1px solid #00ff41; padding: 15px 30px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
        `}
      </style>

      <audio ref={audioFondo} src={process.env.PUBLIC_URL + "/sounds/ultimo_minuto.mp3"} />

      {showProtocol ? (
        <div className="proto-body" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, overflowY: 'auto' }}>
          <canvas ref={canvasRef} className="canvas-matrix-proto"></canvas>
          <div className="container-proto">
            <header className="header-proto">
              <h1>PROTOCOLO DE ENCRIPTACIÓN: 6-BITS ACTIVATED</h1>
              <p>Has expandido tu capacidad. Ahora controlas valores de 0 a 63.</p>
            </header>
            <section className="lesson-card-proto">
              <h2 style={{color: 'var(--neon-green)'}}>1. El Sistema de 6 Posiciones</h2>
              <p>En un sistema de 6 bits, cada posición representa una potencia de 2, desde 2⁰ hasta 2⁵:</p>
              <div className="math-grid-proto">
                <div className="math-box-proto"><span className="pow-text-proto">2⁵</span><span className="val-text-proto">32</span><span className="desc-text-proto">Bit 6</span></div>
                <div className="math-box-proto"><span className="pow-text-proto">2⁴</span><span className="val-text-proto">16</span><span className="desc-text-proto">Bit 5</span></div>
                <div className="math-box-proto"><span className="pow-text-proto">2³</span><span className="val-text-proto">8</span><span className="desc-text-proto">Bit 4</span></div>
                <div className="math-box-proto"><span className="pow-text-proto">2²</span><span className="val-text-proto">4</span><span className="desc-text-proto">Bit 3</span></div>
                <div className="math-box-proto"><span className="pow-text-proto">2¹</span><span className="val-text-proto">2</span><span className="desc-text-proto">Bit 2</span></div>
                <div className="math-box-proto"><span className="pow-text-proto">2⁰</span><span className="val-text-proto">1</span><span className="desc-text-proto">Bit 1</span></div>
              </div>
            </section>
            <section className="lesson-card-proto">
              <h2 style={{color: 'var(--neon-green)'}}>2. Ejemplo de Traducción Visual</h2>
              <p>Para representar el número <strong>42</strong>, encendemos los interruptores necesarios:</p>
              <div className="user-grid-proto">
                <div className="user-col-proto"><span className="header-val-proto">32</span><span className="bit-val-proto">1</span></div>
                <div className="user-col-proto"><span className="header-val-proto">16</span><span className="bit-val-proto">0</span></div>
                <div className="user-col-proto"><span className="header-val-proto">8</span><span className="bit-val-proto">1</span></div>
                <div className="user-col-proto"><span className="header-val-proto">4</span><span className="bit-val-proto">0</span></div>
                <div className="user-col-proto"><span className="header-val-proto">2</span><span className="bit-val-proto">1</span></div>
                <div className="user-col-proto"><span className="header-val-proto">1</span><span className="bit-val-proto">0</span></div>
              </div>
              <p style={{textAlign: 'center'}}>Suma: <span className="highlight-proto">32 + 8 + 2 = 42</span></p>
            </section>
            <section className="lesson-card-proto">
              <h2 style={{color: 'var(--neon-green)'}}>3. Cómo resolver números grandes</h2>
              <p>Si el systema te pide el número <span className="highlight-proto">55</span>:</p>
              <div className="step-proto">¿Cabe el 32? <strong>SÍ</strong>. (Restan 23). Ponemos un 1.</div>
              <div className="step-proto">¿Cabe el 16? <strong>SÍ</strong>. (Restan 7). Ponemos un 1.</div>
              <div className="step-proto">¿Cabe el 8? NO. Ponemos un 0.</div>
              <div className="step-proto">¿Cabe el 4? <strong>SÍ</strong>. (Restan 3). Ponemos un 1.</div>
              <div className="step-proto">¿Cabe el 2? <strong>SÍ</strong>. (Resta 1). Ponemos un 1.</div>
              <div className="step-proto">¿Cabe el 1? <strong>SÍ</strong>. Ponemos un 1.</div>
              <p>Binario resultante: <span className="highlight-proto">1 1 0 1 1 1</span></p>
            </section>
            <section className="lesson-card-proto">
              <h2 style={{color: 'var(--neon-green)'}}>4. Tabla de Referencia Rápida</h2>
              <table className="proto-table">
                <thead>
                  <tr><th>Decimal</th><th>Binario (6 Bits)</th><th>Suma</th></tr>
                </thead>
                <tbody>
                  <tr><td>10</td><td>0 0 1 0 1 0</td><td>0 + 0 + 8 + 0 + 2 + 0</td></tr>
                  <tr><td>21</td><td>0 1 0 1 0 1</td><td>0 + 16 + 0 + 4 + 0 + 1</td></tr>
                  <tr><td>33</td><td>1 0 0 0 0 1</td><td>32 + 0 + 0 + 0 + 0 + 1</td></tr>
                  <tr><td>63</td><td>1 1 1 1 1 1</td><td>32 + 16 + 8 + 4 + 2 + 1</td></tr>
                </tbody>
              </table>
            </section>
            <button className="btn-cerrar-proto" onClick={() => { playEfecto("/sounds/Pop.mp3"); setShowProtocol(false); }}>VOLVER AL JUEGO</button>
          </div>
        </div>
      ) : (
        <>
          {gameState === 'instructions' && (
            <>
              <button className="btn-protocolo" onClick={() => { playEfecto("/sounds/Pop.mp3"); setShowProtocol(true); }}>Protocolo</button>
              <div className="converter-card instruction-card">
                <h1 className="success-text">OBJETIVO DE LA MISIÓN</h1>
                <p>Bienvenido operador <span className="highlight-proto">{name}</span>. Debes estabilizar el núcleo convirtiendo números decimales a binario.</p>
                <ul className="instruction-list" style={{ listStyle: 'none', padding: 0 }}>
                  <p style={{ marginBottom: '15px' }}>
                    <strong> Niveles:</strong> Debes completar <span className="highlight"> 20 conversiones </span> únicas.
                  </p>
                  <p style={{ marginBottom: '15px' }}>
                    <strong> Tiempo:</strong> Tienes <span className="highlight"> 3 minutos </span> en total.
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
                  <button className="next-button ready" onClick={() => { playEfecto("/sounds/Pop.mp3"); setGameState('playing'); }}>¡ENTENDIDO, EMPEZAR!</button>
                </div>
              </div>
            </>
          )}

          {(gameState === 'playing' || gameState === 'lost') && (
            <div className={`game-play-container ${gameState === 'lost' ? 'disintegrate-animation' : ''}`}>
              <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''} ${timeLeft <= 30 ? 'critical-alert' : ''}`}>
                <div className="header-info">
                  <h1 className="title-game">UNIPEBits - Medio</h1>
                  <div className={`timer ${timeLeft <= 30 ? 'timer-danger' : ''}`}>{formatTime(timeLeft)}</div>
                </div>

                <div className="target-container">
                  <p className="subtitle">OBJETIVO DECIMAL</p>
                  <h2 className="target-number">{target}</h2>
                  <small>Reto {round} de {TOTAL_ROUNDS}</small>
                </div>

                <div className="bits-container">
                  {POWERS.map((power, index) => (
                    <div key={index} className={`bit-module ${bits[index] === 1 ? 'on' : 'off'}`}>
                      <div className="bit-power">2<sup>{5 - index}</sup></div>
                      <div className="bit-toggle" onClick={() => toggleBit(index)}>
                        <div className="toggle-number">{bits[index]}</div>
                      </div>
                      <div className="bit-decimal">+{power}</div>
                    </div>
                  ))}
                </div>

                <div className="results-container">
                  Suma: <span className="highlight-value">{currentSum}</span> | Binario: <span className="highlight-value">{binaryString}</span>
                </div>

                <div className="controls-container">
                  <button className="btn-volver" onClick={volverAOpciones}>salir</button>
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
              <h1 className="title-huge" style={{color: '#ff4444'}}>¡TIEMPO AGOTADO!</h1>
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
              <h1 className="title-huge success-text">¡SISTEMA ESTABILIZADO!</h1>
              <p className="message">Excelente trabajo, <span className="highlight-proto" style={{ textTransform: 'uppercase' }}>{name}</span>. Has completado las 20 conversiones exitosamente.</p>
              <div className="score-board">Puntuación Final: <span className="highlight-value">{score}</span></div>
              <p className="message">Tiempo Sobrante: {formatTime(timeLeft)}</p>
              <div className="controls-container mt-20" style={{justifyContent: 'center', gap: '20px'}}>
                  <button className="next-button ready" onClick={resetGame}>Jugar de Nuevo</button>
                  <button className="btn-volver" onClick={volverAOpciones}>Menú Principal</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NivelMedio;