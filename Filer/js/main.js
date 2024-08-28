const socket = io();

// Hämta användarnamn och rum från URL-parametrar
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');

// Skicka användarnamn och rum till servern när användaren ansluter
socket.emit('joinRoom', { username, room });

// Hämta formuläret och element
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

// Visa rum
roomName.textContent = room;

// När meddelande tas emot från servern
socket.on('message', message => {
    console.log(message);
    // Visa meddelandet i chatten
    outputMessage(message);
});

// När användarlistan uppdateras
socket.on('updateUsers', users => {
    // Rensa befintlig lista
    usersList.innerHTML = '';

    // Lägg till varje användare i listan
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
});

// När användaren skickar ett meddelande
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Hämta meddelandet
    const msg = msgInput.value;

    // Skicka meddelandet och användarnamnet till servern
    socket.emit('chatMsg', { username, msg });

    // Töm inmatningsfältet
    msgInput.value = '';
    msgInput.focus();
});

// Funktion för att visa meddelandet i chatten
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    
    document.querySelector('.chat-messages').appendChild(div);
}
