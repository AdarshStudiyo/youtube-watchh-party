import { useState } from "react";
import {
  createRoom as createRoomApi,
  checkRoom,
} from "../services/api";

function Home() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      setLoading(true);

      const data = await createRoomApi(username.trim());

      localStorage.setItem(
        "watchPartyUserId",
        data.userId
      );

      localStorage.setItem(
        "watchPartyUsername",
        username.trim()
      );

      localStorage.setItem(
        "watchPartyRole",
        data.role
      );

      localStorage.setItem(
        "watchPartyRoomId",
        data.roomId
      );

      window.location.href = `/room/${data.roomId}`;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    try {
      setLoading(true);

      const room = await checkRoom(
        roomCode.trim().toUpperCase()
      );

      // Generate a unique ID for this participant
      const userId = crypto.randomUUID();

      localStorage.setItem(
        "watchPartyUserId",
        userId
      );

      localStorage.setItem(
        "watchPartyUsername",
        username.trim()
      );

      localStorage.setItem(
        "watchPartyRole",
        "PARTICIPANT"
      );

      localStorage.setItem(
        "watchPartyRoomId",
        room.roomId
      );

      window.location.href =
        `/room/${room.roomId}`;

    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Room not found"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-page">
      <section className="hero">

        <p className="eyebrow">
          WATCH TOGETHER
        </p>

        <h1>
          Your video.
          <br />
          Your people.
          <br />
          <span>One watch party.</span>
        </h1>

        <p className="subtitle">
          Create a room, invite your friends,
          and watch YouTube together in real time.
        </p>

        <div className="actions">

          {/* Name */}
          <input
            type="text"
            className="name-input"
            placeholder="Enter your name"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          {/* Create Room */}
          <button
            className="primary-button"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Watch Party"}
          </button>

          {/* Join Room */}
          <div className="join-section">

            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(
                  e.target.value.toUpperCase()
                )
              }
            />

            <button
              className="secondary-button"
              onClick={handleJoinRoom}
              disabled={loading}
            >
              {loading
                ? "Joining..."
                : "Join Room"}
            </button>

          </div>

        </div>
      </section>
    </main>
  );
}

export default Home;