const express = require('express');
const { createServer } = require('node:http');
const { join, dirname } = require('node:path');
const { fileURLToPath } = require('node:url');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');

const { open } = require('sqlite');

let db
async function main() {
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        client_offset TEXT UNIQUE,
        content TEXT
        )`
    )

    const app = express();
    const server = createServer(app);
    const io = new Server(server);

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'))
    }) 
        
    io.on('connection',async (socket) => {
        console.log('user connected')
        socket.on('chat message', async (msg) => {
            let result
            try {
                result = await db.run('INSERT INTO messages (content) VALUES (?)', msg)
            } catch (e) {
                return
            }
            io.emit('chat message', msg, result.lastID)
        })

        if(!socket.recovered) {
            try {
                await db.each('SELECT id, content FROM messages WHERE id > ?',
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        socket.emit('chat message', row.content, row.id)
                    }
                )
            } catch (e) {
            }
        } 
    })

    server.listen(3000, () => {
        console.log('listening on http://localhost:3000')
    })

}
main().catch(console.error);


