import kaboom from "kaboom";
import { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import socket from "../socket";

export default function KaboomCanvas(){
    const { id: gameId } = useParams();
    const location = useLocation();
    const initialState = location.state?.initialState;
    const storedPlayer = JSON.parse(localStorage.getItem("player"));
    const playerId = storedPlayer?._id;
    const kRef = useRef(null); // Ref to store Kaboom instance
    const playerSprites = useRef({}); // Ref to store each player's sprite by their ID

    // Ensure canvas can capture keyboard input
    useEffect(() => {
        const canvas = document.getElementById("kaboomCanvas");
        canvas?.focus(); // focus the canvas for key events/inputs
    }, []);

    useEffect(() => {
        // initialize kaboom canvas
        const k = kaboom({
            width: 800,
            height: 600,
            canvas: document.getElementById("kaboomCanvas"),
            background: [0, 0, 0],
        });

        kRef.current = k; // store the kaboom instance for later

        // Spawn player sprites based on the initial game state
        if(initialState?.players){
            Object.entries(initialState.players).forEach(([id, pos]) => {
                // create a basic rectangle for each player green for self, white for other players
                playerSprites.current[id] = k.add([
                    k.rect(32, 32), // size of sprite
                    k.pos(pos.x, pos.y), // starting postition
                    k.color(id === playerId ? k.rgb(0, 255, 0) : k.rgb(255, 255, 255)),
                ])
            })
        }

        const controls = {
            left: "a",
            right: "d",
            up: "w",
            down: "s",
        };

        // Listen for key presses for movement
        Object.entries(controls).forEach(([dir, key]) => {
            k.onKeyDown(key, () => {
                console.log(`Pressed ${dir}`);
                socket.emit("playerMove", { gameId, playerId, direction: dir }); // emit movement to server
            })
        })

        // Listen for server state updates
        socket.on("stateUpdate", (newState) => {
            // Update the position of all player sprites based on the latest state
            Object.entries(newState.players).forEach(([id, pos]) => {
                const sprite = playerSprites.current[id];
                if(sprite) sprite.pos = k.vec2(pos.x, pos.y); // move sprite to new position
            })
        })
        
        return () => {
            socket.off("stateUpdated");
            document.getElementById("kaboomCanvas")?.remove();
        }  
    }, [gameId, initialState, playerId]);

    return (
        <div className="kaboom-page">
            <canvas id="kaboomCanvas" tabIndex="0"></canvas>
        </div>
    )
}