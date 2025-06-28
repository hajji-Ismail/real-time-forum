import { routeTo } from "./main.js";


let socket = null;

async function establishConnection() {
  if (socket && socket.readyState <= 1) {
    return socket;
  }

  const senderId = parseInt(sessionStorage.getItem("user_id"));
  socket = new WebSocket(`/api/v1/chat`);

  return new Promise((resolve, reject) => {
    socket.onopen = () => {
      socket.send(JSON.stringify({ sender_id: senderId }));
      resolve(socket);
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.message_type === "Online") {
        updateUserStatus(message.sender_id, true);
      }

      if (message.message_type === "Offline") {
        updateUserStatus(message.sender_id, false);
      }

      // handle other message types like "message" here...
    };


    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    };

    socket.onclose = () => {
      console.warn("WebSocket closed.");
      socket = null;
    };
  });
}

function getsocket() {
  return socket
}

async function showChatWindow(receiverId, nickname) {
  const chatContainer = document.querySelector(".main-container");
  if (!chatContainer) return;

  const senderId = parseInt(sessionStorage.getItem("user_id"));
  let offset = 0;
  const limit = 10;
  let loading = false;

  // Clear previous chat
  chatContainer.innerHTML = "";
  chatContainer.appendChild(createChatWindow(receiverId, nickname));

  const messagesContainer = document.querySelector(".chat-messages");
  const input = document.getElementById("message");

  // Close handler
  document.getElementById("close_chat").addEventListener("click", () => {
    chatContainer.innerHTML = "";
    routeTo("posts");
  });

  // Load initial messages
  await loadMessages(senderId, receiverId, offset, limit, messagesContainer);
  offset += limit;

  // Debounced scroll for history
  messagesContainer.addEventListener("scroll", debounce(async () => {
    if (messagesContainer.scrollTop === 0 && !loading) {
      loading = true;
      const prevHeight = messagesContainer.scrollHeight;
      const loaded = await loadMessages(senderId, receiverId, offset, limit, messagesContainer, true);
      if (loaded) offset += limit;
      messagesContainer.scrollTop = messagesContainer.scrollHeight - prevHeight;
      loading = false;
    }
  }, 1000));

  // WebSocket setup
  const socket = getsocket() || await establishConnection();

  // Send message
  document.getElementById("sent-message").addEventListener("click", () => {
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
    offset++;
    routeTo('users')
  });

  // Handle incoming messages
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg, 'message');


    if (msg.message_type === "message") {
      console.log('hi');

      const isChattingWithSender =
        (msg.sender_id === receiverId && msg.receiver_id === senderId) ||
        (msg.sender_id === senderId && msg.receiver_id === receiverId);

      if (isChattingWithSender) {
        const messageElement = createStyledMessage(msg, senderId);
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        console.log('sdfsdfsdfvdddddddddddddddddddddddddddddddddddddddddd');

        showMessage(`New message from ${msg.sender_nickname}`);
      }
    }
    if (msg.message_type === "Online" || msg.message_type === "Offline") {
      console.log('hi');

      updateUserStatus(msg.sender_id, msg.message_type);
    }

  };
}


function updateUserStatus(userId, isOnline) {
  // Find the user's status dot using data-user-id
  const userItem = document.querySelector(`li[data-user-id="${userId}"]`);
  if (!userItem) return;

  const statusDot = userItem.querySelector(".status-dot");
  if (!statusDot) return;

  statusDot.classList.remove("online", "offline");
  statusDot.classList.add(isOnline ? "online" : "offline");
}


function showMessage(message) {
  const popup = document.createElement("div");
  popup.setAttribute("id", "message_popup");
  popup.innerHTML = `<h2>${message}</h2>`;
  document.body.appendChild(popup);

  // Automatically hide after 3 seconds
  setTimeout(() => {
    popup.remove();
  }, 3000);
}

function createStyledMessage(msg, currentUserId) {
  const wrapper = document.createElement("div");
  const isMine = msg.sender_id === currentUserId;

  wrapper.className = isMine ? "outgoing-message" : "incoming-message";
  wrapper.innerHTML = `
    <div class="message-meta">
      <span class="message-user">${msg.sender_nickname}</span>
      <span class="message-time">${new Date(msg.timestamp || Date.now()).toLocaleTimeString()}</span>
    </div>
    <div class="message-content">
      <p>${msg.message_content}</p>
    </div>
  `;
  return wrapper;
}
async function loadMessages(senderId, receiverId, offset, limit, container, prepend = false) {
  try {
    const res = await fetch("/api/v1/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, offset, limit }),
    });

    let messages = await res.json();
    if (!Array.isArray(messages) || messages.length === 0) return false;

    // 🔁 Sort messages by timestamp (asc)

    const holder = document.createDocumentFragment();
    messages.forEach(msg => {
      const msgEl = createStyledMessage(msg, senderId);
      holder.append(msgEl)

    });
    if (prepend) {
      container.prepend(holder);
    } else {
      container.appendChild(holder);
    }

    return true;
  } catch (err) {
    console.error("Failed to load messages:", err);
    return false;
  }
}

function createChatWindow(receiverId, nickname) {
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
  return chatWindow;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}


export {
  establishConnection,
  showChatWindow,
  getsocket,
  showMessage


}