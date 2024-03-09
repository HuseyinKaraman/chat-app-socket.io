import path from "path";
const __dirname = path.resolve();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { formatMessage } from "./utils/message.js";
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from "./utils/user.js";

const app = express();
const server = createServer(app);
global.io = new Server(server);

const PORT = process.env.PORT || 3000;
const botName = "Chat-Bot";

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// run when client connects
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        // join user to a room
        socket.join(user.room);
        // welcome current user
        socket.emit("message", formatMessage(botName, `Welcome To ChatCord, ${user.username}`));
        // broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

        // send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // run when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
            // send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
