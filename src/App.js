import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// IMPORTACIÓN DE LOS COMPONENTES EXTERNOS
import NivelFacil from './components/NivelFacil'; // <-- Nueva Importación
import NivelMedio from './components/NivelMedio';
import NivelDificil from './components/NivelDificil';

// =====================================================================
// COMPONENTE: EFECTO MÁQUINA DE ESCRIBIR
// =====================================================================
const MaquinaEscribir = ({ texto, alTerminar }) => {
  const [displayTexto, setDisplayTexto] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < texto.length) {
      const timeout = setTimeout(() => {
        setDisplayTexto((prev) => prev + texto[index]);
        setIndex((prev) => prev + 1);
      }, 70); 
      return () => clearTimeout(timeout);
    } else {
      const pausa = setTimeout(alTerminar, 1200);
      return () => clearTimeout(pausa);
    }
  }, [index, texto, alTerminar]);

  return <div className="typing-text">{displayTexto}<span className="cursor"></span></div>;
};

// =====================================================================
// COMPONENTE PRINCIPAL: APP
// =====================================================================
function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const canvasRef = useRef(null);
  
  const audioPop = useRef(null);
  const audioAcceso = useRef(null);

  const playPop = () => {
    if (audioPop.current) {
      audioPop.current.currentTime = 0;
      audioPop.current.play().catch(e => console.log("Audio bloqueado"));
    }
  };

  useEffect(() => {
    if (pantalla === 'acceso' && audioAcceso.current) {
      audioAcceso.current.currentTime = 0;
      audioAcceso.current.play().catch(e => console.log("Audio bloqueado"));
    }
  }, [pantalla]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const binario = "01";
    const nombres = "JUAREZDANIELA SALSESLEONEL";
    const fontSize = 16;
    let columnas = canvas.width / fontSize;
    let drops = Array.from({ length: Math.ceil(columnas) }).fill(0).map(() => Math.random() * -100);

    const drawMatrix = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        let texto = Math.random() > 0.96 ? nombres[Math.floor(Math.random() * nombres.length)] : binario[Math.floor(Math.random() * binario.length)];
        ctx.fillStyle = "#0F0"; 
        ctx.fillText(texto, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const intervalo = setInterval(drawMatrix, 33);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="canvas-matrix"></canvas>

      <audio ref={audioPop} src={process.env.PUBLIC_URL + "/sounds/Pop.mp3"} preload="auto" />
      <audio ref={audioAcceso} src={process.env.PUBLIC_URL + "/sounds/Acceso.mp3"} preload="auto" />

      {/* RENDERIZADO CONDICIONAL DE NIVELES */}
      {pantalla === 'facil' && <NivelFacil volverAOpciones={() => { playPop(); setPantalla('opciones'); }} />}
      {pantalla === 'medio' && <NivelMedio volverAOpciones={() => { playPop(); setPantalla('opciones'); }} />}
      {pantalla === 'dificil' && <NivelDificil volverAOpciones={() => { playPop(); setPantalla('opciones'); }} />}

      {pantalla !== 'facil' && pantalla !== 'medio' && pantalla !== 'dificil' && (
        <div id="ui-container">
          
          {pantalla === 'inicio' && (
            <div>
              <h1>Bienvenido a UNIPEbits 2.0</h1>
              <p>Se ha detectado una anomalía en el flujo de datos.</p>
              <p>Requerimos un protocolo de <span className="highlight">conversión de datos</span> para restaurar el sistema.</p>
              <button className="btn" onClick={() => { playPop(); setPantalla('acceso'); }}>Comenzar Protocolo</button>
              <div className="inner-credits">Realizado por: Juarez Daniela & Salses Leonel</div>
            </div>
          )}

          {pantalla === 'acceso' && (
            <div className="typing-container">
              <MaquinaEscribir texto="ACCEDIENDO AL SISTEMA..." alTerminar={() => setPantalla('info')} />
            </div>
          )}

          {pantalla === 'info' && (
            <div>
              <p>Protocolo Iniciado...</p>
              <p>El sistema central funciona en <span className="highlight">Binario</span>.</p>
              <p>Las computadoras entienden fundamentalmente el lenguaje máquina: o está <span className="highlight">ENCENDIDO (1)</span> o está <span className="highlight">APAGADO (0)</span>.</p>
              <p>Necesitamos convertir <span className="highlight">Binario</span> a <span className="highlight">Decimal</span> para que los humanos podamos entender los datos, y <span className="highlight">Decimal</span> a <span className="highlight">Binario</span> para que la máquina los ejecute. Tú eres ese puente.</p>
              <button className="btn" onClick={() => { playPop(); setPantalla('opciones'); }}>Siguiente Fase</button>
            </div>
          )}

          {pantalla === 'opciones' && (
            <div>
              <h1>Núcleo del Sistema</h1>
              <p>¿Por qué es vital esta conversión?</p>
              <p>El <span className="highlight">hardware</span> físico (los circuitos y transistores) solo sabe procesar pulsos eléctricos. El código <span className="highlight">Binario</span> es la representación matemática directa de ese hardware.</p>
              <p>Por otro lado, la mente humana evolucionó usando el sistema <span className="highlight">Decimal</span> (base 10). La conversión es nuestro traductor universal.</p>
              <p>Sin ella, programar o leer datos sería una pesadilla interminable de ceros y unos. Selecciona un nivel para comenzar el entrenamiento:</p>
              
              <div className="difficulty-container">
                <button className="btn btn-option" onClick={() => { playPop(); setPantalla('facil'); }}>Fácil</button>
                <button className="btn btn-option" onClick={() => { playPop(); setPantalla('medio'); }}>Medio</button>
                <button className="btn btn-option" onClick={() => { playPop(); setPantalla('dificil'); }}>Difícil</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;