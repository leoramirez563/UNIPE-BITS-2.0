import React, { useState } from 'react';

const Menu = ({ onStartLevel }) => {
    const [screen, setScreen] = useState('START'); 
    const [grantedText, setGrantedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Función para el efecto de máquina de escribir
    const typeWriter = async (text, speed, callback) => {
        let current = "";
        for (let i = 0; i < text.length; i++) {
            current += text.charAt(i);
            callback(current);
            await new Promise(res => setTimeout(res, speed));
        }
    };

    const handleStart = async () => {
        setScreen('GRANTED_ANIM');
        setIsTyping(true);
        // Animación de acceso
        await typeWriter("Acceso Concedido", 100, setGrantedText);
        setIsTyping(false);
        // Pausa dramática
        await new Promise(res => setTimeout(res, 1000));
        setScreen('INFO');
    };

    return (
        <div id="ui-container" style={{ textAlign: 'center', padding: '20px', fontFamily: 'monospace' }}>
            {/* PANTALLA 1: BIENVENIDA */}
            {screen === 'START' && (
                <div className="fade-in">
                    <h1 style={{ color: '#00ff00' }}>Bienvenido a UNIPEbits 2.0</h1>
                    <p>Se ha detectado una anomalía en el flujo de datos.</p>
                    <p>Requerimos un protocolo de <span className="highlight">conversión de datos</span> para restaurar el sistema.</p>
                    <button id="btn-start" onClick={handleStart} style={buttonStyle}>
                        Comenzar Protocolo
                    </button>
                    <div className="inner-credits" style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.7 }}>
                        Realizado por: Juarez Daniela & Salses Leonel
                    </div>
                </div>
            )}

            {/* PANTALLA 2: ANIMACIÓN DE ACCESO */}
            {screen === 'GRANTED_ANIM' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <h1 className={isTyping ? 'typing' : ''} style={{ fontSize: '4rem', color: '#00ff00' }}>
                        {grantedText}
                    </h1>
                </div>
            )}

            {/* PANTALLA 3: INFORMACIÓN TEÓRICA */}
            {screen === 'INFO' && (
                <div className="fade-in">
                    <p style={{ color: '#00ff00' }}>Protocolo Iniciado...</p>
                    <p>El sistema central funciona en <span className="highlight">Binario</span>.</p>
                    <p>Las computadoras entienden fundamentalmente el lenguaje máquina: o está <span className="highlight">ENCENDIDO (1)</span> o está <span className="highlight">APAGADO (0)</span>.</p>
                    <p>Necesitamos convertir <span className="highlight">Binario</span> a <span className="highlight">Decimal</span> para que los humanos podamos entender los datos, y de <span className="highlight">Decimal</span> a <span className="highlight">Binario</span> para que la máquina los ejecute. Tú eres ese puente.</p>
                    <button id="btn-next" onClick={() => setScreen('LEVELS')} style={buttonStyle}>
                        Siguiente Fase
                    </button>
                </div>
            )}

            {/* PANTALLA 4: SELECCIÓN DE NIVELES */}
            {screen === 'LEVELS' && (
                <div className="fade-in">
                    <h1 className="highlight">Núcleo del Sistema</h1>
                    <p>¿Por qué es vital esta conversión?</p>
                    <p>El <span className="highlight">hardware</span> físico solo sabe procesar pulsos eléctricos. El código <span className="highlight">Binario</span> es la representación matemática directa de ese <span className="highlight">hardware</span>.</p>
                    <p>Por otro lado, la mente humana evolucionó usando el sistema <span className="highlight">Decimal</span> (base 10). La conversión es nuestro traductor universal.</p>
                    <p>Selecciona un nivel para comenzar el entrenamiento de traducción:</p>
                    <div className="difficulty-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                        <button className="btn-option" onClick={() => onStartLevel('FACIL')} style={optionButtonStyle}>Fácil</button>
                        <button className="btn-option" onClick={() => onStartLevel('MEDIO')} style={optionButtonStyle}>Medio</button>
                        <button className="btn-option" onClick={() => onStartLevel('DIFICIL')} style={optionButtonStyle}>Difícil</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Estilos rápidos en línea para asegurar que se vea bien sin depender de un CSS externo
const buttonStyle = {
    backgroundColor: 'transparent',
    color: '#00ff00',
    border: '1px solid #00ff00',
    padding: '10px 20px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginTop: '20px',
    fontFamily: 'monospace'
};

const optionButtonStyle = {
    ...buttonStyle,
    fontSize: '1rem',
    borderRadius: '5px'
};

export default Menu;