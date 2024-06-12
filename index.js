const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const dotenv = require("dotenv");
dotenv.config();
app.use(express.static("public"));

let pollResults = { option1: 0, option2: 0 };
let messages = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("poll results", pollResults);
    messages.forEach((message) => socket.emit("chat message", message));

    socket.on("vote", (option) => {
        pollResults[option]++;
        io.emit("poll results", pollResults);
    });

    socket.on("chat message", (msg) => {
        const id = `${socket.id}-${new Date().getTime()}`;
        const message = { ...msg, id };
        messages.push(message);
        io.emit("chat message", message);
    });

    socket.on("edit message", (updatedMessage) => {
        messages = messages.map((msg) =>
            msg.id === updatedMessage.id
                ? {
                      ...msg,
                      message: updatedMessage.message,
                      timestamp: updatedMessage.timestamp,
                  }
                : msg
        );
        io.emit("edit message", updatedMessage);
    });

    socket.on("delete message", ({ id }) => {
        messages = messages.filter((msg) => msg.id !== id);
        io.emit("delete message", { id });
    });

    socket.on("typing", (isTyping) => {
        socket.broadcast.emit("typing", isTyping);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
