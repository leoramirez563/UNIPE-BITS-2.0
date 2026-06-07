const express = require('express');
const mysql = require('mysql2'); // Funciona perfecto con MariaDB
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Tu usuario de MariaDB
    password: '',       // Tu contraseña de MariaDB
    database: 'unipebits2_db'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MariaDB:', err);
    } else {
        console.log('¡Conectado exitosamente a MariaDB!');
    }
});

app.post('/api/guardar-partida', (req, res) => {
    const { nombre_usuario, tiempo_tomado, tiempo_restante } = req.body;

    // 1. Insertar o buscar al usuario para obtener su ID
    const queryUsuario = 'INSERT INTO usuarios (nombre_usuario) VALUES (?) ON DUPLICATE KEY UPDATE id_usuario=LAST_INSERT_ID(id_usuario)';
    
    db.query(queryUsuario, [nombre_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const id_usuario = result.insertId;

        // Insertar la partida con el ID del usuario
        const queryPartida = 'INSERT INTO partidas (id_usuario, tiempo_tomado, tiempo_restante) VALUES (?, ?, ?)';
        db.query(queryPartida, [id_usuario, tiempo_tomado, tiempo_restante], (err, resultPartida) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ mensaje: '¡Partida guardada con éxito!' });
        });
    });
});

app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});