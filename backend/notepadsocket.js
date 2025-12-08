const { Server } = require('socket.io');

let currentNoteText = "";
let currentColor = "#373670"

let notepadSocket;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const initNotepadWebsocket = (httpServer) => {
  if (!notepadSocket) {
    notepadSocket = new Server(httpServer, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST"]
            }
    });

    notepadSocket.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.emit('text_update', { text: currentNoteText });
      socket.emit('color_update', {color: currentColor});

      const handleInput = (data) => {
        const newText = data.text;
        currentNoteText = newText;
        socket.broadcast.emit('text_update', { text: newText });
      }

      socket.on('text_input', handleInput);

      const handleColorChange = (data) => {
        const newColor = data.color;
        currentColor = newColor;
        socket.broadcast.emit('color_update', {color: newColor});
      }

      socket.on('color_change', handleColorChange);

      socket.on('disconnect', () => {
          console.log(`Client disconnected: ${socket.id}`);
          socket.off('text_input', handleInput);
          socket.off('color_change', handleColorChange);
      });
    });

    return notepadSocket;
  }
}

const getNotepadWebsocket = () => {
  return notepadSocket;
}

const getNoteText = () => {
  return currentNoteText;
}

module.exports = {
  initNotepadWebsocket,
  getNotepadWebsocket,
  getNoteText,
}