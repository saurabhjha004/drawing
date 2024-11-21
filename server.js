const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' folder
app.use(express.static('public'));

// When a user connects
io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for drawing events and broadcast them to all users
    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
server.listen(5000, () => {
    console.log('Server is running on http://localhost:3000');
});
