const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000;
server.listen(PORT, () => console.log(`Servern är igång på port ${PORT}`));

// För att lagra användare i olika rum
let users = {};

// Komma åt filer mappen
app.use(express.static(path.join(__dirname, 'Filer')));

// Hantera anslutningar
io.on('connection', (socket) => {
    let currentUser;
    let currentRoom;

    // Lyssna på joinRoom-eventet
    socket.on('joinRoom', ({ username, room }) => {
        currentUser = username;
        currentRoom = room;

        // Lägg till användaren i rätt rum
        socket.join(currentRoom);

        // Lägg till användaren i listan för det rummet
        if (!users[currentRoom]) {
            users[currentRoom] = [];
        }
        users[currentRoom].push(username);

        // Skicka användarlistan till alla i rummet
        io.to(currentRoom).emit('updateUsers', users[currentRoom]);

        // Välkomstmeddelande till den anslutna användaren
        socket.emit('message', {
            username: 'ChatBot',
            text: 'Ansluten till ChatApp',
            time: new Date().toLocaleTimeString()
        });

        // Meddela alla andra användare i rummet att en ny användare har anslutit
        socket.broadcast.to(currentRoom).emit('message', {
            username: 'ChatBot',
            text: `${currentUser} har anslutit till rummet`,
            time: new Date().toLocaleTimeString()
        });
    });

    // Hantera inkommande meddelanden
    socket.on('chatMsg', ({ username, msg }) => {
        io.to(currentRoom).emit('message', {
            username: username,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    // När en användare kopplar bort
    socket.on('disconnect', () => {
        if (currentUser && currentRoom) {
            // Ta bort användaren från listan för det rummet
            users[currentRoom] = users[currentRoom].filter(user => user !== currentUser);

            // Skicka uppdaterad användarlista till alla i rummet
            io.to(currentRoom).emit('updateUsers', users[currentRoom]);

            io.to(currentRoom).emit('message', {
                username: 'ChatBot',
                text: `${currentUser} har lämnat rummet`,
                time: new Date().toLocaleTimeString()
            });
        }
    });
});
