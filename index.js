const express = require('express');
const { createServer } = require('node:http');
const { join, dirname } = require('node:path');
const { fileURLToPath } = require('node:url');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'))
})

app.get('/', (req, res) => {
    res.sendFile(join('<h1>Halo bro</h1>'))
})

io.on('connection', (socket) => {
    console.log('user connected')
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
})

server.listen(3000, () => {
    console.log('listening on http://localhost:3000')
})

