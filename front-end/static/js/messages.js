import { routeTo } from "./main.js";

   
let socket = null;

 async function establishConnection() {
  if (socket && socket.readyState <= 1) {
    // ✅ Already connecting or open
    return socket;
  }

  const senderId = parseInt(sessionStorage.getItem("user_id"));
  socket = new WebSocket(`/api/v1/chat`);

  return new Promise((resolve, reject) => {
    socket.onopen = () => {
      socket.send(JSON.stringify({ sender_id: senderId }));
      resolve(socket);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    };

    socket.onclose = () => {
      console.warn("WebSocket closed.");
      // Optional: clear socket to force new instance on next call
      socket = null;
    };
  });
}

function getsocket(){
  return socket
}




async function showChatWindow(receiverId, nickname) {
  const chatContainer = document.querySelector(".main-container");
  if (!chatContainer) return;

  const senderId = parseInt(sessionStorage.getItem("user_id"));
  const offset = 0;
  const limit = 10;

  // Clear previous chat
  chatContainer.innerHTML = "";

  // Create chat window
  const chatWindow = document.createElement("div");
  chatWindow.className = "chat-window";
  chatWindow.id = "chat_window";
  chatWindow.innerHTML = `
    <div class="chat-header">
      <div class="chat-user-info">
        <img src="/front-end/static/assets/avatar.png" class="user-avatar small-avatar" alt="Avatar of ${nickname}" />
        <span class="user-nickname">${nickname}</span>
      </div>
      <button id="close_chat" class="close-btn">X</button>
    </div>
    <div class="chat-messages" style="height: 300px; overflow-y: auto;"></div>
    <div class="chat-input-area">
      <input type="text" id="message" placeholder="Type a message..." />
      <button id="sent-message">Send</button>
    </div>
    <span user-id="${receiverId}" class="hidden" style="display:none;"></span>
  `;
  chatContainer.appendChild(chatWindow);

  const messagesContainer = chatWindow.querySelector(".chat-messages");

  // Close chat
  document.getElementById("close_chat").addEventListener("click", () => {
    chatContainer.innerHTML = "";
    routeTo("posts");
  });

  // Fetch initial chat history
  try {
    const response = await fetch("/api/v1/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        offset,
        limit,
      }),
    });

    const messages = await response.json();
    messages.forEach((msg) => {
      const p = document.createElement("p");
      p.textContent = `${msg.sender_nickname}: ${msg.message_content}`;
      messagesContainer.appendChild(p);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (err) {
    console.error("Failed to fetch history:", err);
  }

  // Setup WebSocket
  const socket = getsocket() || await establishConnection();

  // Send message
  document.getElementById("sent-message").addEventListener("click", () => {
    const input = document.getElementById("message");
    const message = input.value.trim();
    if (!message) return;

    const msgData = {
      sender_id: senderId,
      receiver_id: receiverId,
      message_content: message,
      timestamp: new Date().toISOString(),
      message_type: "message",
    };

    socket.send(JSON.stringify(msgData));
    input.value = "";
  });

  // Handle real-time incoming messages
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.message_type === "message") {
      // Only display messages relevant to this open chat
      if (
        (msg.sender_id === receiverId && msg.receiver_id === senderId) ||
        (msg.sender_id === senderId && msg.receiver_id === receiverId)
      ) {
        const p = document.createElement("p");
        p.textContent = `${msg.sender_nickname}: ${msg.message_content}`;
        messagesContainer.appendChild(p);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        // Optionally notify user that a message was received from someone else
        showMessage(`New message from ${msg.sender_nickname}`);
      }
    }
  };
}





 export {
   establishConnection,
   showChatWindow,
   getsocket
   

 }