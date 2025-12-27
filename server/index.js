const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./utils/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('../client'));

// Routes
app.use('/api/auth', authRoutes);

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        // Load History
        const messages = db.getMessages().filter(m => m.room === room);
        socket.emit('load_messages', messages);
    });

    socket.on('send_message', (data) => {
        console.log(`Message from ${data.author} in ${data.room}: ${data.content}`);

        // Save to DB
        db.addMessage(data);

        // Broadcast to room (including sender if we want, but usually sender adds it optimistically. 
        // Original code used socket.to(room) which excludes sender. Sender adds it manually. 
        // We will keep it that way.)
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
