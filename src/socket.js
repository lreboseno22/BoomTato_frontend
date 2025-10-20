import { io } from "socket.io-client";

// socket instance
const socket = io("http://localhost:3000");

export default socket;