async function establishConnection() {
  const senderId = sessionStorage.getItem("user_id");
  const socket = new WebSocket(`ws://${location.host}/api/v1/chat`);

  return new Promise((resolve, reject) => {
    socket.onopen = () => {
          console.log("websoct is open");
      socket.send(JSON.stringify({ sender_id: parseInt(senderId) }));
      resolve(socket);
    
      
    };

    socket.onmessage = async () => {
      
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    socket.onclose = () => {
      console.warn("WebSocket connection closed.");
    };
  });
}
 export { establishConnection}