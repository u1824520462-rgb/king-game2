const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Un guerriero si è connesso:', socket.id);

    // Gestione dell'entrata nella stanza (Room)
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        socket.currentRoom = roomCode; // Salviamo la stanza in cui si trova il socket
        console.log(`Guerriero ${socket.id} entrato nella stanza: ${roomCode}`);
    });

    // Movimento: invia i dati solo agli altri nella stessa stanza
    socket.on('move', (data) => {
        if (socket.currentRoom) {
            socket.to(socket.currentRoom).emit('enemyMove', data);
        }
    });

    // Attacco: invia i dati dell'attaccante (posizione x, y) per calcolare il danno
    socket.on('attack', (data) => {
        if (socket.currentRoom) {
            // Inviamo la posizione dell'attaccante all'avversario
            socket.to(socket.currentRoom).emit('enemyAttack', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Guerriero disconnesso:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server attivo! Gioca su http://localhost:${PORT}`);
});
