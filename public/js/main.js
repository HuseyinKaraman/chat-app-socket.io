const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// get username and room from URL
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

// join chatroom
socket.emit("joinRoom", { username, room });

// message from server
socket.on("message", (message) => {
    outputMessage(message);
    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;
    // emit message to server
    socket.emit("chatMessage", msg);
    // Clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();  
});

// get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


// output messages to DOM
const outputMessage = (message) => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    chatMessages.appendChild(div);
};

// add room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room;
};

// add users to DOM
const outputUsers = (users) => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}