const socket = io('http://localhost:5000');

const user = JSON.parse(localStorage.getItem('user'));
const chatSection = document.getElementById('chat-section');
const msgForm = document.getElementById('message-form');
const msgInput = document.getElementById('message-input');
const messagesArea = document.getElementById('messages-area');
const currentRoomTitle = document.getElementById('current-room');

let currentRoom = 'general';

if (user && chatSection) {
    // Connection Status
    socket.on('connect', () => {
        console.log('Connected to socket server');
        displaySystemMessage('Connected to chat server');
        socket.emit('join_room', currentRoom);
    });

    socket.on('disconnect', () => {
        displaySystemMessage('Disconnected from server');
    });

    socket.on('load_messages', (messages) => {
        console.log('Loading messages for user:', user.username);
        messages.forEach(msg => {
            const isMe = msg.author.trim() === user.username.trim();
            console.log(`Msg from ${msg.author} (Me? ${isMe})`);
            displayMessage(msg, isMe ? 'sent' : 'received');
        });
    });

    // Join default room (handled in connect now to ensure it happens after connection)
    // socket.emit('join_room', currentRoom); 

    // Send Message
    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = msgInput.value;
        if (content.trim()) {
            const messageData = {
                room: currentRoom,
                author: user.username,
                content: content,
                time: new Date().toLocaleTimeString()
            };

            socket.emit('send_message', messageData);
            displayMessage(messageData, 'sent');
            msgInput.value = '';
        }
    });

    // Receive Message
    socket.on('receive_message', (data) => {
        displayMessage(data, 'received');
    });

    // Room Joining
    window.joinRoom = function (room) {
        currentRoom = room;
        currentRoomTitle.innerText = `# ${room.charAt(0).toUpperCase() + room.slice(1)}`;
        messagesArea.innerHTML = ''; // Clear chat
        socket.emit('join_room', room);

        displaySystemMessage(`You joined #${room}`);
    };
}

function getUserColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsla(${h}, 70%, 50%, 0.2)`; // HSLA for glassy effect
}

function displayMessage(data, type) {
    const div = document.createElement('div');
    div.classList.add('message', type);

    if (type === 'received') {
        const color = getUserColor(data.author);
        div.style.background = color;
        div.style.borderColor = color.replace('0.2)', '0.4)'); // Slightly stronger border
    }

    const sender = type === 'received' ? `<small style="opacity:0.8; display:block; font-weight:bold; margin-bottom:4px;">${data.author}</small>` : '';

    div.innerHTML = `
        ${sender}
        ${data.content}
        <span style="font-size:0.7rem; opacity:0.6; float:right; margin-top:5px; margin-left:10px;">${data.time}</span>
    `;

    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function displaySystemMessage(text) {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.opacity = '0.5';
    div.style.fontSize = '0.8rem';
    div.style.margin = '10px 0';
    div.innerText = text;
    messagesArea.appendChild(div);
}
