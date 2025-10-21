import kaboom from "kaboom";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";

export default function KaboomCanvas() {
  const { id } = useParams();
  const gameId = String(id); // ensure gameId is string and not a state obj
  const storedPlayer = JSON.parse(localStorage.getItem("player"));
  const playerId = storedPlayer?._id;
  const kRef = useRef(null); // Ref to store Kaboom instance
  const playerSprites = useRef({}); // Ref to store each player's sprite by their ID
  const nav = useNavigate();

  // Ensure canvas can capture keyboard input
  useEffect(() => {
    const canvas = document.getElementById("kaboomCanvas");
    canvas?.focus(); // focus the canvas for key events/inputs
  }, []);

  // initialize kaboom canvas
  useEffect(() => {
    const k = kaboom({
      width: 800,
      height: 600,
      canvas: document.getElementById("kaboomCanvas"),
      background: [0, 0, 0],
      global: false,
    });

    kRef.current = k;

    // clean up
    return () => {
      if (kRef.current) {
        try {
          kRef.current.paused = true;
          kRef.current.scene = null;
        } catch (e) {
          console.warn("Kaboom cleanup warning:", e);
        }
        kRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!playerId || !gameId) return;
    const k = kRef.current;
    if (!k) return;

    const registerAndJoin = () => {
      if (!socket.connected || !playerId) return;

      socket.emit("registerPlayer", playerId);
      console.log(`[CLIENT] Registered player ${playerId}`);

      socket.emit("joinGameRoom", gameId);
      console.log(`[CLIENT] Joined room: ${gameId}`);

      // Request current game state from server after joining
      socket.emit("requestCurrentState", gameId, (state) => {
        console.log("[CLIENT] Received current state:", state);
        if (!state || !state.players) return;

        Object.entries(state.players).forEach(([id, pos]) => {
          if (!playerSprites.current[id]) {
            playerSprites.current[id] = k.add([
              k.rect(32, 32),
              k.pos(pos.x, pos.y),
              k.color(
                id === playerId ? k.rgb(0, 255, 0) : k.rgb(255, 255, 255)
              ),
            ]);
          } else {
            playerSprites.current[id].moveTo(pos.x, pos.y);
          }
        });
      });
    };

    // Run immediately and also when reconnecting
    registerAndJoin();
    socket.on("connect", registerAndJoin);

    // Movement keys
    const controls = { left: "a", right: "d", up: "w", down: "s" };
    Object.entries(controls).forEach(([dir, key]) => {
      k.onKeyDown(key, () => {
        socket.emit("playerMove", { gameId, playerId, direction: dir });
      });
    });

    // Listen for state updates
    const handleStateUpdate = (newState) => {
      if (!kRef.current) return;

    //     console.log("[CLIENT] State update received:", newState);

      Object.entries(newState.players).forEach(([id, pos]) => {
        let sprite = playerSprites.current[id];

        if (!sprite) {
          sprite = kRef.current.add([
            kRef.current.rect(32, 32),
            kRef.current.pos(pos.x, pos.y),
            kRef.current.color(
              id === playerId
                ? kRef.current.rgb(0, 255, 0)
                : kRef.current.rgb(255, 255, 255)
            ),
          ]);
          playerSprites.current[id] = sprite;
        } else {
            sprite.moveTo(pos.x, pos.y);
        }
      });
    };

    const handleGameEnded = ({ winner, loser }) => {
        alert(`Game ended! Winner: ${winner} and Loser: ${loser}`);
        nav("/lobby");
    }

    socket.on("stateUpdated", handleStateUpdate);
    socket.on("gameEnded", handleGameEnded);

    // Cleanup listeners
    return () => {
      socket.off("connect", registerAndJoin);
      socket.off("stateUpdated", handleStateUpdate);
      socket.off("gameEnded", handleGameEnded);
    };
  }, [gameId, playerId]);

  return (
    <div className="kaboom-page">
      <canvas id="kaboomCanvas" tabIndex="0"></canvas>
    </div>
  );
}