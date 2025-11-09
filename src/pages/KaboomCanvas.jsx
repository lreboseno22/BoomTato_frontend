import kaboom from "kaboom";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import styles from "../styles/Kaboom.module.css";

/**
 * KaboomCanvas.jsx
 * Core gameplay renderer for BOOMTATO
 * Uses Kaboom.js for rendering, Socket.io for real-time state sync, and React for lifecycle management.
 * Players move, pass the bomb (potato), and trigger explosion animations in real-time.
 */

export default function KaboomCanvas() {
  const { id } = useParams();
  const gameId = String(id); // Ensure `gameId` is always a string
  const storedPlayer = JSON.parse(localStorage.getItem("player"));
  const playerId = storedPlayer?._id;
  const kRef = useRef(null); // Stores Kaboom instance to avoid reinitialization
  const playerSprites = useRef({}); // Keeps track of player sprites by their IDs
  const timerRef = useRef(null); // Reference to the on-screen timer UI element
  const handleGameEndedPendingRef = useRef(null); // Used to defer the end-game screen display (so explosion animation can play fully)
  const nav = useNavigate();

  // Initilize Kaboom (only once) loads background and explosion sprites. Also sets up the canvas and game scene.
  useEffect(() => {
    // Prevent reinitializing Kaboom on re-renders or strict mode double calls
    if(kRef.current){
        console.log("[CLIENT] Kaboom already initialized")
        return;
    }
    const canvas = document.getElementById("kaboomCanvas");
    canvas?.focus(); // Focus canvas to capture keyboard input

    const k = kaboom({
      width: 800,
      height: 600,
      canvas: document.getElementById("kaboomCanvas"),
      background: [0, 0, 0],
      global: false,
    });

    kRef.current = k;
    console.log("[CLIENT] Kaboom initialized");

    // Load assets
    k.loadSprite("background", "/assets/otherbgimg.jpg");
    k.loadSprite("explosion", "/assets/explosionsheet.png", {
      sliceX: 7,
      sliceY: 1,
      anims: {
        boom: { from: 0, to: 6, speed: 0.05, loop: false }
      }
    });

    // Add background image to scene
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

  /**
   * Handles core game loop events and socket connections
   * Registers player and joins socket room
   * Syncs real-time positions, timer and game state.
   */
  useEffect(() => {
    const k = kRef.current;
    if (!playerId || !gameId || !kRef.current) return;

    // Create timer UI once
    if(!timerRef.current){
      timerRef.current = k.add([
        k.text("💣 10s", { size: 32 }),
        k.pos(k.width() / 2, 20),
        k.anchor("top"),
        k.z(50),
      ]);
    }

    // Renders all players and updates their positions
    const renderPlayers = (state) => {
      if (!state || !state.players) return;
      // console.log("[CLIENT] Rendering players:", state.players);

      Object.entries(state.players).forEach(([id, pos]) => {
        // Create a new sprite if it doesn't exist
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

        // Keep bomb icon aligned above player sprite
        if(playerSprites.current[id].bombIcon){
          playerSprites.current[id].bombIcon.pos = k.vec2(pos.x, pos.y - 40)
        }
      });
    }

    // Registers player and joins their game room on connect
    const registerAndJoin = () => {
      if (!socket.connected || !playerId) return;

      socket.emit("registerPlayer", playerId);
      console.log(`[CLIENT] Registered player ${playerId}`);

      socket.emit("joinGameRoom", gameId);
      console.log(`[CLIENT] Joined room: ${gameId}`);

      // Get current game state from server immediately after joining
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

    // Server Event Listeners

    // Update player positions
    const handleStateUpdate = (newState) => renderPlayers(newState);

    // Update potato bomb timer and visuals
    const handleTimerUpdate = ({ potatoTimer, potatoHolder }) => {
      const POTATO_LIMIT = 10000;
      const remaining = Math.max(0, POTATO_LIMIT - potatoTimer);
      const secondsLeft = Math.ceil(remaining / 1000);

      // Change timer color based on time left
      if(secondsLeft <= 3){
        timerRef.current.color = k.rgb(255, 50, 50);
      } else if (secondsLeft <= 6){
        timerRef.current.color = k.rgb(255, 165, 0)
      } else {
        timerRef.current.color = k.rgb(255, 255, 255)
      }

      timerRef.current.text = `💣 ${secondsLeft}s`

      // Remove old bomb icons
      Object.values(playerSprites.current).forEach(sprite => {
        if(sprite.bombIcon){
          sprite.bombIcon.destroy();
          sprite.bombIcon = null;
        }
      });

      // Add bomb icon above current holder
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

    // Handles explosion animaion when player loses / timer runs out
    const handlePlayerExploded = ({ loserId }) => {
      console.log("[CLIENT] Player exploded:", loserId);

      const k = kRef.current;
      if(!k) return;

      const loserSprite = playerSprites.current[loserId];

      if(!loserSprite) return;

      const spriteDef = k.getSprite("explosion")
      if (!spriteDef) {
        console.warn("[CLIENT] Explosion sprite not loaded yet. Skipping animation");
        loserSprite.destroy();
        delete playerSprites.current[loserId];
        if (handleGameEndedPendingRef.current) {
          handleGameEndedPendingRef.current();
          handleGameEndedPendingRef.current = null;
        }
        return;
      }

      // Add explosion animation at loser's position
      const explosion = k.add([
        k.sprite("explosion", { anim: "boom" }),
        k.pos(loserSprite.pos.x, loserSprite.pos.y),
        k.scale(1),
        k.anchor("center"),
        k.z(150),
      ])

      if(explosion.play) explosion.play("boom");

      // Animate the explosion and make explosion less choppy (by growing in size)
      k.tween(
        explosion.scale, //starting value
        k.vec2(1.4, 1.4), // end value
        0.35, // duration
        (val) => (explosion.scale = val), // on each frame we want to update the explosions scale
        k.easings.easeOutQuad // ease method to start fast but slow down at the end = smooth
      );

      // Animating the explosion as it fades out
      k.tween(
        1,  // opacity at the start
        0,  // opacity at the end
        0.35, 
        (val) => (explosion.opacity = val),
        k.easings.linear // ease evenly
      );

      loserSprite.destroy();
      delete playerSprites.current[loserId];

      let animInfo = spriteDef?.anims?.boom || spriteDef?.anims?.explode || null;
      const frames = 7; // sheet sliceX
      const fps = (animInfo && animInfo.speed) ? animInfo.speed : 0.1;
      const duration = frames * fps; // seconds

      k.wait(duration, () => {
        try {
          explosion.destroy();
        } catch (err) {
          
        }
        if(handleGameEndedPendingRef.current){
          handleGameEndedPendingRef.current();
          handleGameEndedPendingRef.current = null;
        }
      })

    }

    // Triggered when game ends, showing winner/loser on screen
    const handleGameStarted = ({ gameId, gameState }) => {
        console.log("[CLIENT] Game started event received");
        renderPlayers(gameState);
    }

    const handleGameEnded = async ({ winner, loser, gameId }) => {
      const k = kRef.current;
      if(!k) return;

      const storedPlayer = JSON.parse(localStorage.getItem("player"));
      const playerId = storedPlayer?._id;

      const isWinner = playerId === winner;

      // Dim background
      k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0),
        k.opacity(0.5),
        k.z(150),
      ]);

      // Display win/lost text
      k.add([
        k.text(isWinner ? "YOU WIN!" : "YOU LOSE!", {
          size:36,
          align: "center",
        }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(200),
      ])

      // Return to Lobby button
      const button = k.add([
        k.rect(220, 60, { radius: 12 }),
        k.pos(k.width() / 2, k.height() / 2 + 80),
        k.color(0, 120, 255),
        k.area(),
        k.anchor("center"),
        k.outline(4, k.rgb(255, 255, 255)),
        k.z(200),
      ])

      k.add([
        k.text("Return to Lobby", { size: 24 }),
        k.pos(k.width() / 2, k.height() / 2 + 80),
        k.anchor("center"),
        k.z(201),
      ]);

      button.onHover(() => (button.color = k.rgb(100, 180, 255)));
      button.onHoverEnd(() => (button.color = k.rgb(0, 120, 255)));

      button.onClick(async () => {
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
      })
    }

    // Register all socket event listeners
    socket.on("stateUpdated", handleStateUpdate);
    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("playerExploded", handlePlayerExploded);
    socket.on("gameStarted", handleGameStarted);
    socket.on("gameEnded", ({ winner, loser, gameId }) => {
      handleGameEndedPendingRef.current = () => handleGameEnded({ winner, loser, gameId });
    });

    // Sync again shortly after start to ensure proper rendering
    setTimeout(() => {
      socket.emit("requestCurrentState", gameId, (state) => {
        console.log("[CLIENT] Post-start sync:", state);
        renderPlayers(state);
      });
    }, 1000);

    // Cleanup listeners on unmount
    return () => {
      socket.off("connect", registerAndJoin);
      socket.off("stateUpdated", handleStateUpdate);
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("playerExploded", handlePlayerExploded);
      socket.off("gameStarted", handleGameStarted)
      socket.off("gameEnded");
    };
  }, [gameId, playerId]);

  return (
    <div className={styles.kaboomPage}>
      <canvas id="kaboomCanvas" tabIndex="0"></canvas>
    </div>
  );
}