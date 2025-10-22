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
  const timerRef = useRef(null);
  const nav = useNavigate();

  // Ensure canvas can capture keyboard input
  useEffect(() => {
    if(kRef.current){
        console.log("[CLIENT] Kaboom already initialized")
        return;
    }
    const canvas = document.getElementById("kaboomCanvas");
    canvas?.focus(); // focus the canvas for key events/inputs

    const k = kaboom({
      width: 800,
      height: 600,
      canvas: document.getElementById("kaboomCanvas"),
      background: [0, 0, 0],
      global: false,
    });

    kRef.current = k;
    console.log("[CLIENT] Kaboom initialized");

    k.loadSprite("background", "/assets/otherbgimg.jpg");
    k.add([
      k.sprite("background"),
      k.pos(0, 0),
      k.scale(940 / 1000, 600 / 1000),
      k.z(-1),
    ]);

    return () => {
        console.log("[CLIENT] Kaboom cleanup skipped (StrictMode safe)");
    };

  }, []);

  useEffect(() => {
    const k = kRef.current;
    if (!playerId || !gameId || !kRef.current) return;

    if(!timerRef.current){
      timerRef.current = k.add([
        k.text("💣 10s", { size: 32 }),
        k.pos(k.width() / 2, 20),
        k.anchor("top"),
        k.z(50),
      ]);
    }

    const renderPlayers = (state) => {
        if (!state || !state.players) return;
      console.log("[CLIENT] Rendering players:", state.players);

      Object.entries(state.players).forEach(([id, pos]) => {
        if (!playerSprites.current[id]) {
          playerSprites.current[id] = k.add([
            k.rect(32, 32),
            k.pos(pos.x, pos.y),
            k.color(id === playerId ? k.rgb(0, 255, 0) : k.rgb(255, 255, 255)),
          ]);
          
          playerSprites.current[id].bombIcon = null;
        } else {
          playerSprites.current[id].moveTo(pos.x, pos.y);
        }

        if(playerSprites.current[id].bombIcon){
          playerSprites.current[id].bombIcon.pos = k.vec2(pos.x, pos.y - 40)
        }
      });
    }

    const registerAndJoin = () => {
      if (!socket.connected || !playerId) return;

      socket.emit("registerPlayer", playerId);
      console.log(`[CLIENT] Registered player ${playerId}`);

      socket.emit("joinGameRoom", gameId);
      console.log(`[CLIENT] Joined room: ${gameId}`);

      // Request current game state from server after joining
      socket.emit("requestCurrentState", gameId, (state) => {
        console.log("[CLIENT] Received current state:", state);
        renderPlayers(state);
      });
    };

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
    const handleStateUpdate = (newState) => renderPlayers(newState);

    const handleTimerUpdate = ({ potatoTimer, potatoHolder }) => {
      const POTATO_LIMIT = 10000;
      const remaining = Math.max(0, POTATO_LIMIT - potatoTimer);
      const secondsLeft = Math.ceil(remaining / 1000);

      if(secondsLeft <= 3){
        timerRef.current.color = k.rgb(255, 50, 50);
      } else if (secondsLeft <= 6){
        timerRef.current.color = k.rgb(255, 165, 0)
      } else {
        timerRef.current.color = k.rgb(255, 255, 255)
      }

      timerRef.current.text = `💣 ${secondsLeft}s`

      Object.values(playerSprites.current).forEach(sprite => {
        if(sprite.bombIcon){
          sprite.bombIcon.destroy();
          sprite.bombIcon = null;
        }
      });

      const holderSprite = playerSprites.current[potatoHolder];
      if(holderSprite){
        holderSprite.bombIcon = k.add([
          k.text("🥔", { size: 24 }),
          k.pos(holderSprite.pos.x, holderSprite.pos.y - 40),
          k.anchor("center"),
          k.z(100),
        ]);
      }

    }

    const handleGameStarted = ({ gameId, gameState }) => {
        console.log("[CLIENT] Game started event received");
        renderPlayers(gameState);
    }

    const handleGameEnded = async ({ winner, loser, gameId }) => {
        alert(`Game ended! Winner: ${winner} and Loser: ${loser}`);

        try {
        // Update MongoDB status
        const res = await fetch(`http://localhost:3000/api/games/${gameId}/end`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to update game status");

        console.log(`[CLIENT] Game ${gameId} status updated to finished`);
        } catch (err) {
            console.error(err)
        } finally {
            nav("/lobby");
        }
    }

    socket.on("stateUpdated", handleStateUpdate);
    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("gameStarted", handleGameStarted);
    socket.on("gameEnded", handleGameEnded);

    setTimeout(() => {
      socket.emit("requestCurrentState", gameId, (state) => {
        console.log("[CLIENT] Post-start sync:", state);
        renderPlayers(state);
      });
    }, 1000);

    // Cleanup listeners
    return () => {
      socket.off("connect", registerAndJoin);
      socket.off("stateUpdated", handleStateUpdate);
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("gameStarted", handleGameStarted)
      socket.off("gameEnded", handleGameEnded);
    };
  }, [gameId, playerId]);

  return (
    <div className="kaboom-page">
      <canvas id="kaboomCanvas" tabIndex="0"></canvas>
    </div>
  );
}