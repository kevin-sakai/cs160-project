const { Server } = require('socket.io');

let currentNoteText = "";

let notepadSocket;

const initNotepadWebsocket = (httpServer) => {
  if (!notepadSocket) {
    notepadSocket = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"]
            }
    });

    notepadSocket.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.emit('text_update', { text: currentNoteText });

      const handleInput = (data) => {
          const newText = data.text;
          currentNoteText = newText;
          socket.broadcast.emit('text_update', { text: newText });
      }

      socket.on('text_input', handleInput);

      socket.on('disconnect', () => {
          console.log(`Client disconnected: ${socket.id}`);
          socket.off('text_input', handleInput);
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