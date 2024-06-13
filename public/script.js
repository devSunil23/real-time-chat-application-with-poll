var socket = io();

var username = "";
var typingTimeout;

function setUsername(event) {
    if (event.key === "Enter") {
        username = event.target.value;
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "flex";
    }
}

function vote(option) {
    socket.emit("vote", option);
}

function sendMessage(event) {
    if (event.key === "Enter") {
        const messageInput = document.getElementById("message-input");
        const message = messageInput.value;
        if (message.trim() !== "") {
            const timestamp = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            socket.emit("chat message", { username, message, timestamp });
            messageInput.value = "";
            socket.emit("typing", false);
        }
    } else {
        socket.emit("typing", true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("typing", false);
        }, 3000);
    }
}

socket.on("poll results", (results) => {
    const pollOptions = document.getElementById("poll-options");
    pollOptions.innerHTML = `
    <p>Option 1: ${results.option1}</p>
    <p>Option 2: ${results.option2}</p>
  `;
});

socket.on("chat message", ({ username: sender, message, timestamp }) => {
    const messages = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.classList.add(sender === username ? "sender" : "receiver");
    console.log("timestamp", timestamp);
    messageElement.innerHTML = `
    <div class="message-info">
      <strong>${sender}</strong>
    </div>
    <div>${message}</div>
  `;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("typing", (isTyping) => {
    const typingIndicator = document.getElementById("typing-indicator");
    typingIndicator.textContent = isTyping ? "Someone is typing..." : "";
});
