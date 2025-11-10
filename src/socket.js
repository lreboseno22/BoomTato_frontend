import { io } from "socket.io-client";

// socket instance
const socket = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket", "polling"],
    path: "/socket.io",
});

export default socket;