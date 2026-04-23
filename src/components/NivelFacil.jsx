import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const POWERS = [4, 2, 1]; // 3 bits: 2^2, 2^1, 2^0
const TOTAL_ROUNDS = 7;

const generateShuffledTargets = (count) => {
  const allNumbers = Array.from({ length: 7 }, (_, i) => i + 1);
  return [...allNumbers].sort(() => Math.random() - 0.5)
    .concat([...allNumbers].sort(() => Math.random() - 0.5))
    .slice(0, count);
};

function NivelFacil({ volverAOpciones }) {
  const [gameState, setGameState] = useState('instructions'); 
  const [showProtocol, setShowProtocol] = useState(false);
  const [bits, setBits] = useState(Array(3).fill(0));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [targetList, setTargetList] = useState([]);
  const [target, setTarget] = useState(0);

  const currentSum = bits.reduce((acc, bit, index) => acc + (bit * POWERS[index]), 0);
  const binaryString = bits.join('');
  const isError = currentSum > target;
  const isSuccess = currentSum === target;

  const audioMal = useRef(null);
  const audioBien = useRef(null);
  const audioSiguiente = useRef(null);
  const audioVictoria = useRef(null);
  const audioFondoFacil = useRef(null);
  const audioPop = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const newList = generateShuffledTargets(TOTAL_ROUNDS);
    setTargetList(newList);
    setTarget(newList[0]);
  }, []);

  // MATRIX SCRIPT (ORIGINAL)
  useEffect(() => {
    if (showProtocol && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const binario = "01";
      const nombres = "JUAREZDANIELA SALSESLEONEL UNIPEBITS v2.0 32 16 8 4 2 1";
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

  useEffect(() => {
    if (gameState === 'playing') {
      if (audioFondoFacil.current) {
        audioFondoFacil.current.volume = 0.3;
        audioFondoFacil.current.play().catch(e => console.log("Audio de fondo esperando interacción"));
      }
    } else {
      if (audioFondoFacil.current) {
        audioFondoFacil.current.pause();
        audioFondoFacil.current.currentTime = 0;
      }
    }
  }, [gameState]);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio bloqueado"));
    }
  };

  const toggleBit = (index) => {
    if (gameState !== 'playing') return;
    playSound(audioPop);
    const newBits = [...bits];
    const isTurningOn = newBits[index] === 0;
    newBits[index] = isTurningOn ? 1 : 0;
    const nextSum = newBits.reduce((acc, b, i) => acc + (b * POWERS[i]), 0);
    if (isTurningOn) {
      if (nextSum > target) {
        setScore(prev => Math.max(0, prev - 10));
        playSound(audioMal); 
      } else {
        playSound(audioBien);
      }
    }
    setBits(newBits);
  };

  const handleNext = () => {
    if (isSuccess) {
      setScore(prev => prev + 25);
      if (round >= TOTAL_ROUNDS) {
        setGameState('won');
        playSound(audioVictoria);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        playSound(audioSiguiente);
        setRound(prev => prev + 1);
        setTarget(targetList[round]); 
        setBits(Array(3).fill(0));
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
    setBits(Array(3).fill(0));
  };

  return (
    <div className="game-wrapper" style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes titilar-medio {
            0% { opacity: 1; box-shadow: 0 0 15px var(--error-red); }
            50% { opacity: 0.4; box-shadow: 0 0 5px var(--error-red); }
            100% { opacity: 1; box-shadow: 0 0 15px var(--error-red); }
          }
          .btn-protocolo { position: absolute; top: 20px; right: 20px; background-color: var(--error-red); color: white; border: 2px solid white; padding: 10px 20px; font-weight: bold; border-radius: 5px; cursor: pointer; animation: titilar-medio 1s infinite; z-index: 1000; text-transform: uppercase; }
          
          .converter-card {
            background-color: var(--card-bg) !important;
            backdrop-filter: blur(4px);
            border: 2px solid var(--matrix-green);
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
          }

          .proto-body { font-family: 'Courier New', Courier, monospace; line-height: 1.6; padding: 20px; color: white; background-color: transparent; }
          .container-proto { max-width: 850px; margin: 0 auto; position: relative; }
          .header-proto { text-align: center; margin-bottom: 40px; border: 2px solid var(--matrix-green); padding: 20px; background: rgba(0,0,0,0.92); box-shadow: 0 0 15px var(--matrix-green); }
          .lesson-card { background: var(--card-bg); border: 1px solid var(--matrix-green); padding: 25px; margin-bottom: 25px; border-radius: 8px; box-shadow: 0 0 20px rgba(0,255,0,0.1); text-align: left; }
          .math-grid { display: flex; justify-content: center; gap: 15px; margin: 25px 0; }
          .math-box { background: #000; border: 1px solid var(--matrix-green); padding: 15px; text-align: center; flex: 1; border-radius: 4px; }
          .pow-text { font-size: 1.3em; color: #fff; display: block; margin-bottom: 5px; }
          .val-text { font-size: 2em; color: var(--matrix-green); font-weight: bold; display: block; }
          .desc-text { font-size: 0.75em; color: #ccc; text-transform: uppercase; }
          .user-grid-container { display: flex; justify-content: flex-end; margin: 20px 0; border-bottom: 2px solid var(--matrix-green); padding-bottom: 10px; }
          .user-col { border-left: 2px solid white; padding: 0 15px; text-align: center; }
          .user-col:last-child { border-right: 2px solid white; }
          .header-val { font-size: 1.5em; font-weight: bold; display: block; }
          .bit-val { font-size: 2.5em; color: var(--matrix-green); display: block; margin-top: 10px; }
          .highlight { color: var(--matrix-green); font-weight: bold; }
          .formula-box { background: rgba(0, 255, 0, 0.08); border: 1px solid rgba(0,255,0,0.3); padding: 15px; margin: 15px 0; font-size: 1.1em; border-radius: 4px; }
          .direction-alert { background: #000; color: #fff; border: 1px solid var(--error-red); padding: 10px; text-align: center; font-weight: bold; margin: 10px 0; text-transform: uppercase; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #000; border-radius: 4px; overflow: hidden; }
          th, td { border: 1px solid #222; padding: 12px; text-align: center; }
          th { background: #111; color: var(--matrix-green); }
          .step { margin-bottom: 10px; padding-left: 20px; position: relative; }
          .step::before { content: ">"; position: absolute; left: 0; color: var(--matrix-green); }
          .btn-cerrar { display: block; margin: 20px auto; background: rgba(0,0,0,0.5); color: var(--matrix-green); border: 1px solid var(--matrix-green); padding: 15px 30px; font-weight: bold; cursor: pointer; border-radius: 5px; text-transform: uppercase; transition: all 0.3s ease; }
          .btn-cerrar:hover { background: var(--matrix-green); color: #000; box-shadow: 0 0 20px var(--matrix-green); }
        `}
      </style>

      <audio ref={audioMal} src={process.env.PUBLIC_URL + "/sounds/mal.mp3"} />
      <audio ref={audioBien} src={process.env.PUBLIC_URL + "/sounds/bien.mp3"} />
      <audio ref={audioSiguiente} src={process.env.PUBLIC_URL + "/sounds/siguiente.mp3"} />
      <audio ref={audioVictoria} src={process.env.PUBLIC_URL + "/sounds/victoria.mp3"} />
      <audio ref={audioFondoFacil} src={process.env.PUBLIC_URL + "/sounds/audio_facil.mp3"} loop />
      <audio ref={audioPop} src={process.env.PUBLIC_URL + "/sounds/Pop.mp3"} />

      {showProtocol ? (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.8)', overflowY: 'auto' }}>
          <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
          <div className="proto-body">
            <div className="container-proto">
              <header className="header-proto">
                <h1 style={{color: 'var(--matrix-green)', margin: 0, fontSize: '1.8em', textTransform: 'uppercase'}}>PROTOCOLO DE ENCRIPTACIÓN: UNIPEBits v2.0</h1>
                <p>Domina las potencias para controlar el sistema.</p>
              </header>

              <section className="lesson-card">
                <h2 style={{color: 'var(--matrix-green)', fontSize: '1.4em'}}>1. La Base: Potencias de 2</h2>
                <p>En binario, cada posición no es al azar. Cada lugar hacia la izquierda vale <strong>el doble</strong> que el anterior. Esto se calcula usando potencias de base 2:</p>
                <div className="math-grid">
                  <div className="math-box"><span className="pow-text">2²</span><span className="val-text">4</span><span className="desc-text">(2x2)</span></div>
                  <div className="math-box"><span className="pow-text">2¹</span><span className="val-text">2</span><span className="desc-text">(2x1)</span></div>
                  <div className="math-box"><span className="pow-text">2⁰</span><span className="val-text">1</span><span className="desc-text">(Base)</span></div>
                </div>
                <p>Si el interruptor está en <span className="highlight">1</span>, sumas ese valor. Si está en <span className="highlight">0</span>, sumas cero.</p>
              </section>

              <section className="lesson-card">
                <h2 style={{color: 'var(--matrix-green)', fontSize: '1.4em'}}>2. Regla de Oro: Derecha a Izquierda</h2>
                <p>Para construir cualquier número, siempre empezamos de derecha a izquierda. Ubicamos el 1 según el valor que necesitamos sumar y completamos el resto con cero.</p>
                <div className="direction-alert">IMPORTANTE: SE RELLENA DE DERECHA (1) → A IZQUIERDA (EXPANSIÓN)</div>
                <div className="user-grid-container">
                  <div className="user-col"><span className="header-val">32</span><span className="bit-val">1</span></div>
                  <div className="user-col"><span className="header-val">16</span><span className="bit-val">1</span></div>
                  <div className="user-col"><span className="header-val">8</span><span className="bit-val">0</span></div>
                  <div className="user-col"><span className="header-val">4</span><span className="bit-val">0</span></div>
                  <div className="user-col"><span className="header-val">2</span><span className="bit-val">1</span></div>
                  <div className="user-col"><span className="header-val">1</span><span className="bit-val">0</span></div>
                </div>
                <p style={{textAlign: 'right', fontSize: '0.8em'}}>(Ejemplo: Binario <code>110010</code> = Decimal 50)</p>
              </section>

              <section className="lesson-card">
                <h2 style={{color: 'var(--matrix-green)', fontSize: '1.4em'}}>3. La Lógica de la Suma</h2>
                <p>Para convertir de binario a decimal, simplemente hacemos una suma de los valores "encendidos":</p>
                <div className="formula-box">
                  <strong>Ejemplo: Binario <code>1 0 1</code></strong><br/>
                  - Bit de la izquierda (4): <span className="highlight">ON</span> → 4<br/>
                  - Bit del centro (2): OFF → 0<br/>
                  - Bit de la derecha (1): <span className="highlight">ON</span> → 1<br/>
                  <hr style={{border: '0.5px solid var(--matrix-green)'}} />
                  <strong>Resultado: 4 + 0 + 1 = 5</strong>
                </div>
              </section>

              <section className="lesson-card">
                <h2 style={{color: 'var(--matrix-green)', fontSize: '1.4em'}}>4. Cómo resolver el Juego</h2>
                <p>Si el sistema te pide el número <span className="highlight">7</span>:</p>
                <div className="step">Ubicamos de derecha a izquierda.</div>
                <div className="step">¿Necesito el 4? <strong>SÍ</strong>. Ponemos un 1.</div>
                <div className="step">¿Necesito el 2? <strong>SÍ</strong>. Ponemos un 1.</div>
                <div className="step">¿Necesito el 1? <strong>SÍ</strong>. Ponemos un 1.</div>
                <div className="step">Si quedaran espacios a la izquierda sin usar, se ponen en <strong>0</strong>.</div>
                <p>Respuesta: <span className="highlight">1 1 1</span> (Suma: 4 + 2 + 1 = 7).</p>
              </section>

              <section className="lesson-card">
                <h2 style={{color: 'var(--matrix-green)', fontSize: '1.4em'}}>5. Tabla de Traducción Rápida</h2>
                <table>
                  <thead>
                    <tr><th>Decimal</th><th>Binario</th><th>Suma</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>0 0 1</td><td>0 + 0 + 1</td></tr>
                    <tr><td>3</td><td>0 1 1</td><td>0 + 2 + 1</td></tr>
                    <tr><td>7</td><td>1 1 1</td><td>4 + 2 + 1</td></tr>
                  </tbody>
                </table>
              </section>

              <button className="btn-cerrar" onClick={() => { playSound(audioPop); setShowProtocol(false); }}>VOLVER AL JUEGO</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {gameState === 'instructions' && (
            <>
              <button className="btn-protocolo" onClick={() => { playSound(audioPop); setShowProtocol(true); }}>Protocolo</button>
              <div className="converter-card instruction-card">
                <h1 className="success-text">MODO APRENDIZ</h1>
                <p>Bienvenido al simulador básico. Aquí aprenderás los fundamentos sin presión.</p>
                <ul className="instruction-list" style={{ listStyle: 'none', padding: 0 }}>
                  <p style={{ marginBottom: '15px' }}><strong> Bits:</strong> Usaremos solo <span className="highlight">3 interruptores</span> (4, 2, 1).</p>
                  <p style={{ marginBottom: '15px' }}><strong> Tiempo:</strong> No hay cronómetro.</p>
                  <p style={{ marginBottom: '15px' }}><strong> Objetivo:</strong> Supera <span className="highlight">7 desafíos</span> para completar el entrenamiento.</p>
                </ul>
                <div className="controls-container" style={{justifyContent: 'center', gap: '20px', marginTop: '30px'}}>
                  <button className="btn-volver" onClick={volverAOpciones}>atras</button>
                  <button className="next-button ready" onClick={() => { playSound(audioPop); setGameState('playing'); }}>¡INICIAR APRENDIZAJE!</button>
                </div>
              </div>
            </>
          )}

          {gameState === 'playing' && (
            <div className="game-play-container">
              <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}>
                <div className="header-info">
                  <h1 className="title-game">UNIPEBits - Fácil</h1>
                  <div className="timer">MODO PRÁCTICA</div>
                </div>

                <div className="target-container">
                  <p className="subtitle">OBJETIVO DECIMAL</p>
                  <h2 className="target-number">{target}</h2>
                  <small>Reto {round} de {TOTAL_ROUNDS}</small>
                </div>

                <div className="bits-container" style={{justifyContent: 'center', gap: '20px'}}>
                  {POWERS.map((power, index) => (
                    <div key={index} className={`bit-module ${bits[index] === 1 ? 'on' : 'off'}`}>
                      <div className="bit-power">2<sup>{2 - index}</sup></div>
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
                  <button className="btn-volver" onClick={volverAOpciones}>Salir</button>
                  <div className="score-board"> PUNTOS: <span className="highlight-value">{score}</span> </div>
                  <button className={`next-button ${isSuccess ? 'ready' : ''}`} disabled={!isSuccess} onClick={handleNext}>
                    {round === TOTAL_ROUNDS ? '¡FINALIZAR!' : 'SIGUIENTE'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="converter-card success-screen">
              <h1 className="title-huge success-text">¡ENTRENAMIENTO COMPLETADO!</h1>
              <p className="message">Has dominado la base del sistema binario.</p>
              <div className="score-board">Puntuación Final: <span className="highlight-value">{score}</span></div>
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

export default NivelFacil;