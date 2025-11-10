import { io } from "socket.io-client";

// socket instance
const socket = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket", "polling"],
});

export default socket;