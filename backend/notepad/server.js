const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');

const app = express();
const HTTP_PORT = 3001;

let currentText = "";

app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

const notepadSocket = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.get("/api/notepad", (req, res) => {
    console.log("GET request for text");
    res.json({ text: currentText });
});

notepadSocket.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('text_update', { text: currentText });

    socket.on('text_input', (data) => {
        const newText = data.text;
        currentText = newText;
        socket.broadcast.emit('text_update', { text: newText });
        socket.emit('confirm_input', { message: 'Text update received.' });
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`Notepad websocket server running on port ${HTTP_PORT}`);
});