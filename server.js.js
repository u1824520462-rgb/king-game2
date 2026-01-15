const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configurazione per Render: permette connessioni da qualsiasi origine
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve i file dalla cartella principale
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Un guerriero si è connesso:', socket.id);

    // 1. GESTIONE STANZA: Fondamentale per farli giocare insieme
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        socket.currentRoom = roomCode; 
        console.log(`Guerriero ${socket.id} entrato nella stanza: ${roomCode}`);
    });

    // 2. MOVIMENTO (Sincronizzato con il comando 'sync' del gioco)
    socket.on('sync', (data) => {
        if (socket.currentRoom) {
            // Invia i dati X, Y e Direzione solo all'amico nella stessa stanza
            socket.to(socket.currentRoom).emit('playerUpdate', data);
        }
    });

    // 3. ATTACCO E DANNO (Sincronizzato con 'damage' del gioco)
    socket.on('damage', (data) => {
        if (socket.currentRoom) {
            // Invia il segnale di danno ricevuto all'avversario
            socket.to(socket.currentRoom).emit('takeDamage', data.amount);
        }
    });

    socket.on('disconnect', () => {
        console.log('Guerriero disconnesso:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});
