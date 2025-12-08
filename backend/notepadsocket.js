const { Server } = require('socket.io');

let currentNoteText = "";

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});

const notepadSocket = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.get("/api/notepad", (req, res) => {
    console.log("GET request for text");
    res.json({ text: currentNoteText });
});

notepadSocket.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('text_update', { text: currentNoteText });

    socket.on('text_input', (data) => {
        const newText = data.text;
        currentNoteText = newText;
        socket.broadcast.emit('text_update', { text: newText });
        socket.emit('confirm_input', { message: 'Text update received.' });
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

function getNotepadSocket() {
  return notepadSocket;
}

module.exports = {
  getNotepadSocket,
}