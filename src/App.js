import React, { useState, useEffect, useRef, useCallback } from 'react'; // <-- Importamos useCallback
import './index.css';

// IMPORTACIÓN DE LOS COMPONENTES EXTERNOS
import NivelFacil from './components/NivelFacil.js'; 
import NivelMedio from './components/NivelMedio.js';
import NivelDificil from './components/NivelDificil.js';

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
  const [nombreUsuario, setNombreUsuario] = useState(''); // Estado para almacenar el nombre del alumno
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

  // =====================================================================
  // FUNCIÓN OPTIMIZADA CON useCallback PARA EVITAR RE-RENDERIZADOS Y CORTES DE AUDIO
  // =====================================================================
  const guardarPartidaEnBaseDeDatos = useCallback(async (datosPartida) => {
    try {
      console.log("Intentando guardar partida con nivel y errores...", datosPartida);

      let nivelCalculado = datosPartida.nivel;
      if (!nivelCalculado) {
        if (pantalla === 'facil') nivelCalculado = 'Fácil';
        else if (pantalla === 'medio') nivelCalculado = 'Medio';
        else if (pantalla === 'dificil') nivelCalculado = 'Difícil';
        else nivelCalculado = 'Fácil';
      }

      const respuesta = await fetch('http://localhost:3000/api/guardar-partida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_usuario: nombreUsuario, 
          completada: datosPartida.completada,
          objetivo_cumplido: datosPartida.objetivo_cumplido,
          tiempo_tomado: datosPartida.tiempo_tomado,
          tiempo_restante: datosPartida.tiempo_restante,
          nivel: nivelCalculado, 
          errores: datosPartida.errores !== undefined ? datosPartida.errores : 0 
        })
      });

      const resultado = await respuesta.json();
      console.log("Respuesta del servidor:", resultado.mensaje);
    } catch (error) {
      console.error("Error al conectar con el servidor de guardado:", error);
    }
  }, [nombreUsuario, pantalla]); // Solo se recrea si cambia el usuario o el nivel

  // Función para validar el avance si el usuario escribió un nombre
  const handleComenzar = () => {
    playPop();
    if (nombreUsuario.trim() === "") {
      alert("Por favor, ingresa tu nombre de operador para continuar.");
      return;
    }
    setPantalla('acceso');
  };

  return (
    <>
      <canvas ref={canvasRef} id="canvas-matrix"></canvas>

      <audio ref={audioPop} src={process.env.PUBLIC_URL + "/sounds/Pop.mp3"} preload="auto" />
      <audio ref={audioAcceso} src={process.env.PUBLIC_URL + "/sounds/Acceso.mp3"} preload="auto" />

      {/* RENDERIZADO CONDICIONAL DE NIVELES CON LA FUNCIÓN DE GUARDADO INYECTADA */}
      {pantalla === 'facil' && (
        <NivelFacil 
          volverAOpciones={() => { playPop(); setPantalla('opciones'); }} 
          name={nombreUsuario} 
          onGuardarPartida={guardarPartidaEnBaseDeDatos} 
        />
      )}
      {pantalla === 'medio' && (
        <NivelMedio 
          volverAOpciones={() => { playPop(); setPantalla('opciones'); }} 
          name={nombreUsuario} 
          onGuardarPartida={guardarPartidaEnBaseDeDatos} 
        />
      )}
      {pantalla === 'dificil' && (
        <NivelDificil 
          volverAOpciones={() => { playPop(); setPantalla('opciones'); }} 
          name={nombreUsuario} 
          onGuardarPartida={guardarPartidaEnBaseDeDatos} 
        />
      )}

      {pantalla !== 'facil' && pantalla !== 'medio' && pantalla !== 'dificil' && (
        <div id="ui-container">
          
          {pantalla === 'inicio' && (
            <div>
              <h1>Bienvenido a UNIPEbits 2.0</h1>
              <p>Se ha detectado una anomalía en el flujo de datos.</p>
              <p>Requerimos un protocolo de <span className="highlight">conversión de datos</span> para restaurar el sistema.</p>
              
              <div className="input-container">
                <label className="input-label">
                  IDENTIFICACIÓN DEL OPERADOR:
                </label>
                <input 
                  type="text" 
                  className="input-operador"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="Escribe tu nombre..."
                  maxLength="30"
                />
              </div>

              <button className="btn" onClick={handleComenzar}>Comenzar Protocolo</button>
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
              <p>¿Por qué es vital esta conversión, <span className="highlight" style={{ textTransform: 'uppercase' }}>{nombreUsuario}</span>?</p>
              <p>El <span className="highlight">hardware</span> físico (los circuitos y transistores) solo sabe procesar pulsos eléctricos. El código <span className="highlight">Binario</span> es la representation matemática directa de ese hardware.</p>
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