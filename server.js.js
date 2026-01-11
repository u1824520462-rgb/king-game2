const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve i file statici dalla cartella corrente
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestione connessioni Socket.io
io.on('connection', (socket) => {
    console.log('Un guerriero si è connesso:', socket.id);

    socket.on('move', (data) => {
        socket.broadcast.emit('enemyMove', data);
    });

    socket.on('attack', () => {
        socket.broadcast.emit('enemyAttack');
    });

    socket.on('disconnect', () => {
        console.log('Guerriero disconnesso');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server attivo! Apri il browser su http://localhost:${PORT}`);
});