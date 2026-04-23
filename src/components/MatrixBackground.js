import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Tamaño dinámico
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const binario = "01";
        const nombres = "JUAREZDANIELA SALSESLEONEL";
        const fontSize = 16;
        const columnas = Math.floor(canvas.width / fontSize);
        const drops = Array(columnas).fill(1).map(() => Math.random() * -100);

        function draw() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const isName = Math.random() > 0.96;
                ctx.fillStyle = isName ? "#AFA" : "#0F0";
                const text = isName 
                    ? nombres[Math.floor(Math.random() * nombres.length)] 
                    : binario[Math.floor(Math.random() * binario.length)];

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        const interval = setInterval(draw, 33);
        window.addEventListener('resize', resize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, display: 'block' }} />;
};

export default MatrixBackground;