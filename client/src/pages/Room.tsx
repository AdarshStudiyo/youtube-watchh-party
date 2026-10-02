import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import YouTube from "react-youtube";
import type { YouTubeEvent } from "react-youtube";
import { socket } from "../services/socket";

interface Participant {
  userId: string;
  username: string;
  role: "HOST" | "MODERATOR" | "PARTICIPANT";
  socketId?: string | null;
}

interface RoomState {
  roomId: string;
  videoId: string | null;
  playState: "playing" | "paused";
  currentTime: number;
  participants: Participant[];
  messages?: ChatMessage[];
}

interface VideoUpdated {
  videoId: string;
  playState: "playing" | "paused";
  currentTime: number;
}

interface VideoAction {
  action: "play" | "pause" | "seek";
  currentTime: number;
}

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

interface ReactionEvent {
  userId: string;
  username: string;
  reaction: string;
  timestamp: number;
}

const REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
  "👏",
  "🎉",
];

function getYouTubeVideoId(value: string): string | null {
  const input = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.hostname.includes("youtube.com")) {
      const queryId = url.searchParams.get("v");

      if (queryId && /^[a-zA-Z0-9_-]{11}$/.test(queryId)) {
        return queryId;
      }

      const parts = url.pathname.split("/").filter(Boolean);

      const embedIndex = parts.indexOf("embed");

      if (
        embedIndex !== -1 &&
        parts[embedIndex + 1] &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[embedIndex + 1])
      ) {
        return parts[embedIndex + 1];
      }

      const shortsIndex = parts.indexOf("shorts");

      if (
        shortsIndex !== -1 &&
        parts[shortsIndex + 1] &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[shortsIndex + 1])
      ) {
        return parts[shortsIndex + 1];
      }
    }

    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];

      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Room() {
  const navigate = useNavigate();

  const { roomId: routeRoomId } =
    useParams<{ roomId: string }>();

  const roomId =
    routeRoomId?.trim().toUpperCase() || "";

  /*
   * IMPORTANT:
   * These are the keys used by the working Home/Create/Join flow.
   */
  const username =
    localStorage.getItem("watchPartyUsername") ||
    "Guest";

  const userId =
    localStorage.getItem("watchPartyUserId") ||
    "";

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [connected, setConnected] =
    useState(false);

  const [youtubeUrl, setYoutubeUrl] =
    useState("");

  const [videoId, setVideoId] =
    useState<string | null>(null);

  const [playState, setPlayState] =
    useState<"playing" | "paused">("paused");

  const [currentTime, setCurrentTime] =
    useState(0);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [messageInput, setMessageInput] =
    useState("");

  const [reactions, setReactions] =
    useState<ReactionEvent[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");

  const playerRef =
    useRef<any>(null);

  const syncingFromServer =
    useRef(false);

  const lastPlayerTime =
    useRef(0);

  const lastSeekTime =
    useRef(0);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const currentParticipant =
    useMemo(
      () =>
        participants.find(
          (participant) =>
            participant.userId === userId
        ),
      [participants, userId]
    );

  const currentRole =
    currentParticipant?.role ||
    "PARTICIPANT";

  const canControlVideo =
    currentRole === "HOST" ||
    currentRole === "MODERATOR";

  /*
   =====================================================
   SOCKET CONNECTION
   =====================================================
  */

  useEffect(() => {
    if (!roomId || !userId || !username) {
      console.log(
        "Missing room information",
        {
          roomId,
          userId,
          username,
        }
      );

      return;
    }

    console.log(
      "Connecting to Socket.IO..."
    );

    const handleConnect = () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      setConnected(true);
      setErrorMessage("");

      socket.emit(
        "join_room",
        {
          roomId,
          userId,
          username,
        }
      );
    };

    const handleDisconnect = () => {
      console.log(
        "Socket disconnected"
      );

      setConnected(false);
    };

    const handleConnectError = (
      error: Error
    ) => {
      console.error(
        "Socket connection error:",
        error
      );

      setConnected(false);

      setErrorMessage(
        "Unable to connect to the watch-party server."
      );
    };

    /*
     ROOM STATE
    */

    const handleRoomState = (
      data: RoomState
    ) => {
      console.log(
        "Room state received:",
        data
      );

      setParticipants(
        Array.isArray(data?.participants)
          ? data.participants
          : []
      );

      setVideoId(
        data?.videoId || null
      );

      setPlayState(
        data?.playState === "playing"
          ? "playing"
          : "paused"
      );

      setCurrentTime(
        typeof data?.currentTime === "number"
          ? data.currentTime
          : 0
      );

      if (Array.isArray(data?.messages)) {
        setMessages(data.messages);
      }

      lastPlayerTime.current =
        typeof data?.currentTime === "number"
          ? data.currentTime
          : 0;
    };

    /*
     PARTICIPANTS
    */

    const handleParticipantsUpdated = (
      data: {
        participants: Participant[];
      }
    ) => {
      setParticipants(
        Array.isArray(data?.participants)
          ? data.participants
          : []
      );
    };

    const handleUserJoined = (
      data: {
        participants: Participant[];
      }
    ) => {
      setParticipants(
        Array.isArray(data?.participants)
          ? data.participants
          : []
      );
    };

    const handleUserLeft = (
      data: {
        participants: Participant[];
      }
    ) => {
      setParticipants(
        Array.isArray(data?.participants)
          ? data.participants
          : []
      );
    };

    const handleHostTransferred = (
      data: {
        participants: Participant[];
      }
    ) => {
      setParticipants(
        Array.isArray(data?.participants)
          ? data.participants
          : []
      );
    };

    /*
     VIDEO
    */

    const handleVideoUpdated = (
      data: VideoUpdated
    ) => {
      syncingFromServer.current = true;

      setVideoId(
        data.videoId || null
      );

      setPlayState(
        data.playState
      );

      setCurrentTime(
        data.currentTime
      );

      lastPlayerTime.current =
        data.currentTime;

      window.setTimeout(() => {
        syncingFromServer.current =
          false;
      }, 1000);
    };

    const handleVideoAction = (
      data: VideoAction
    ) => {
      const player =
        playerRef.current;

      setCurrentTime(
        data.currentTime
      );

      if (
        data.action === "play"
      ) {
        setPlayState("playing");
      }

      if (
        data.action === "pause"
      ) {
        setPlayState("paused");
      }

      if (!player) {
        return;
      }

      syncingFromServer.current =
        true;

      player.seekTo(
        data.currentTime,
        true
      );

      lastPlayerTime.current =
        data.currentTime;

      if (
        data.action === "play"
      ) {
        player.playVideo();
      }

      if (
        data.action === "pause"
      ) {
        player.pauseVideo();
      }

      window.setTimeout(() => {
        syncingFromServer.current =
          false;
      }, 500);
    };

    /*
     CHAT
    */

    const handleNewMessage = (
      data: ChatMessage
    ) => {
      console.log(
        "New message:",
        data
      );

      setMessages(
        (previous) => [
          ...previous,
          data,
        ]
      );
    };

    /*
     REACTIONS
    */

    const handleNewReaction = (
      data: ReactionEvent
    ) => {
      setReactions(
        (previous) => [
          ...previous.slice(-7),
          data,
        ]
      );

      window.setTimeout(() => {
        setReactions(
          (previous) =>
            previous.filter(
              (reaction) =>
                reaction.timestamp !==
                data.timestamp
            )
        );
      }, 4500);
    };

    /*
     ROOM REMOVAL
    */

    const handleRemovedFromRoom = (
      data: { message?: string }
    ) => {
      alert(
        data?.message ||
          "You have been removed from the room."
      );

      navigate("/");
    };

    const handleLeftRoom = () => {
      navigate("/");
    };

    /*
     SERVER ERROR
    */

    const handleError = (
      data: { message?: string }
    ) => {
      const message =
        data?.message ||
        "Something went wrong.";

      console.error(
        "Server error:",
        message
      );

      setErrorMessage(message);
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "room_state",
      handleRoomState
    );

    socket.on(
      "participants_updated",
      handleParticipantsUpdated
    );

    socket.on(
      "user_joined",
      handleUserJoined
    );

    socket.on(
      "user_left",
      handleUserLeft
    );

    socket.on(
      "host_transferred",
      handleHostTransferred
    );

    socket.on(
      "video_updated",
      handleVideoUpdated
    );

    socket.on(
      "video_action",
      handleVideoAction
    );

    socket.on(
      "new_message",
      handleNewMessage
    );

    socket.on(
      "new_reaction",
      handleNewReaction
    );

    socket.on(
      "removed_from_room",
      handleRemovedFromRoom
    );

    socket.on(
      "left_room",
      handleLeftRoom
    );

    socket.on(
      "error_message",
      handleError
    );

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "room_state",
        handleRoomState
      );

      socket.off(
        "participants_updated",
        handleParticipantsUpdated
      );

      socket.off(
        "user_joined",
        handleUserJoined
      );

      socket.off(
        "user_left",
        handleUserLeft
      );

      socket.off(
        "host_transferred",
        handleHostTransferred
      );

      socket.off(
        "video_updated",
        handleVideoUpdated
      );

      socket.off(
        "video_action",
        handleVideoAction
      );

      socket.off(
        "new_message",
        handleNewMessage
      );

      socket.off(
        "new_reaction",
        handleNewReaction
      );

      socket.off(
        "removed_from_room",
        handleRemovedFromRoom
      );

      socket.off(
        "left_room",
        handleLeftRoom
      );

      socket.off(
        "error_message",
        handleError
      );

      socket.disconnect();
    };
  }, [
    roomId,
    userId,
    username,
    navigate,
  ]);

  /*
   =====================================================
   PLAYER SYNC
   =====================================================
  */

  useEffect(() => {
    if (!canControlVideo) {
      return;
    }

    const interval =
      window.setInterval(() => {
        const player =
          playerRef.current;

        if (
          !player ||
          syncingFromServer.current
        ) {
          return;
        }

        const playerState =
          player.getPlayerState();

        if (
          playerState !== 1 &&
          playerState !== 2
        ) {
          return;
        }

        const time =
          player.getCurrentTime();

        const difference =
          Math.abs(
            time -
              lastPlayerTime.current
          );

        setCurrentTime(time);

        if (
          difference > 1.5 &&
          Math.abs(
            time -
              lastSeekTime.current
          ) > 0.5
        ) {
          socket.emit(
            "video_action",
            {
              roomId,
              userId,
              action: "seek",
              currentTime: time,
            }
          );

          lastSeekTime.current =
            time;
        }

        lastPlayerTime.current =
          time;
      }, 300);

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    canControlVideo,
    roomId,
    userId,
  ]);

  /*
   =====================================================
   CHAT AUTO SCROLL
   =====================================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   =====================================================
   VIDEO
   =====================================================
  */

  const handleSetVideo = () => {
    if (!canControlVideo) {
      setErrorMessage(
        "Only the host or moderator can change the video."
      );

      return;
    }

    if (!socket.connected) {
      setErrorMessage(
        "You are not connected to the room."
      );

      return;
    }

    const extractedVideoId =
      getYouTubeVideoId(
        youtubeUrl
      );

    if (!extractedVideoId) {
      setErrorMessage(
        "Please enter a valid YouTube URL or video ID."
      );

      return;
    }

    socket.emit(
      "set_video",
      {
        roomId,
        userId,
        videoId:
          extractedVideoId,
      }
    );

    setYoutubeUrl("");
  };

  const handlePlayerReady = (
    event: YouTubeEvent
  ) => {
    playerRef.current =
      event.target;

    if (currentTime > 0) {
      event.target.seekTo(
        currentTime,
        true
      );
    }

    if (
      playState === "playing"
    ) {
      event.target.playVideo();
    }

    lastPlayerTime.current =
      currentTime;
  };

  const handlePlayerStateChange = (
    event: YouTubeEvent
  ) => {
    if (
      syncingFromServer.current ||
      !canControlVideo ||
      !socket.connected
    ) {
      return;
    }

    const time =
      event.target.getCurrentTime();

    if (event.data === 1) {
      setPlayState("playing");
      setCurrentTime(time);

      lastPlayerTime.current =
        time;

      socket.emit(
        "video_action",
        {
          roomId,
          userId,
          action: "play",
          currentTime: time,
        }
      );
    }

    if (event.data === 2) {
      setPlayState("paused");
      setCurrentTime(time);

      lastPlayerTime.current =
        time;

      socket.emit(
        "video_action",
        {
          roomId,
          userId,
          action: "pause",
          currentTime: time,
        }
      );
    }
  };

  const handleVideoEnd = () => {
    if (
      !canControlVideo ||
      !socket.connected
    ) {
      return;
    }

    socket.emit(
      "video_action",
      {
        roomId,
        userId,
        action: "pause",
        currentTime: 0,
      }
    );

    setPlayState("paused");
    setCurrentTime(0);

    lastPlayerTime.current =
      0;
  };

  /*
   =====================================================
   CHAT
   =====================================================
  */

  const sendMessage = () => {
    const message =
      messageInput.trim();

    if (!message) {
      return;
    }

    if (!socket.connected) {
      setErrorMessage(
        "You are not connected to the room."
      );

      return;
    }

    socket.emit(
      "send_message",
      {
        roomId,
        userId,
        message,
      }
    );

    setMessageInput("");
  };

  const handleMessageKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /*
   =====================================================
   REACTION
   =====================================================
  */

  const sendReaction = (
    reaction: string
  ) => {
    if (!socket.connected) {
      setErrorMessage(
        "You are not connected to the room."
      );

      return;
    }

    socket.emit(
      "send_reaction",
      {
        roomId,
        userId,
        reaction,
      }
    );
  };

  /*
   =====================================================
   HOST ACTIONS
   =====================================================
  */

  const handleMakeModerator = (
    targetUserId: string
  ) => {
    socket.emit(
      "make_moderator",
      {
        roomId,
        userId,
        targetUserId,
      }
    );
  };

  const handleRemoveModerator = (
    targetUserId: string
  ) => {
    socket.emit(
      "remove_moderator",
      {
        roomId,
        userId,
        targetUserId,
      }
    );
  };

  const handleTransferHost = (
    targetUserId: string
  ) => {
    if (
      !window.confirm(
        "Transfer host role to this participant?"
      )
    ) {
      return;
    }

    socket.emit(
      "transfer_host",
      {
        roomId,
        userId,
        targetUserId,
      }
    );
  };

  const handleRemoveParticipant = (
    targetUserId: string
  ) => {
    if (
      !window.confirm(
        "Remove this participant from the room?"
      )
    ) {
      return;
    }

    socket.emit(
      "remove_participant",
      {
        roomId,
        userId,
        targetUserId,
      }
    );
  };

  const handleLeaveRoom = () => {
    if (!socket.connected) {
      navigate("/");
      return;
    }

    socket.emit(
      "leave_room",
      {
        roomId,
        userId,
      }
    );
  };

  /*
   =====================================================
   UI
   =====================================================
  */

  return (
    <main className="room-page">
      {errorMessage && (
        <div className="room-error">
          {errorMessage}

          <button
            onClick={() =>
              setErrorMessage("")
            }
          >
            ×
          </button>
        </div>
      )}

      <section className="room-container">
        <header className="room-header">
          <div className="room-header-top">
            <div>
              <p className="eyebrow">
                WATCH PARTY
              </p>

              <h1>
                Room {roomId}
              </h1>

              <p className="room-welcome">
                Welcome{" "}
                <strong>
                  {username}
                </strong>
              </p>
            </div>

            <div
              className={`connection-status ${
                connected
                  ? "connected"
                  : "disconnected"
              }`}
            >
              <span className="connection-dot" />

              {connected
                ? "Connected"
                : "Disconnected"}
            </div>
          </div>

          <div className="room-role">
            Your role:{" "}
            <strong>
              {currentRole}
            </strong>
          </div>
        </header>

        <div className="room-card">
          <section className="room-share-section">
            <div>
              <p className="section-label">
                ROOM CODE
              </p>

              <h2>
                Invite your friends
              </h2>

              <p className="section-description">
                Share this code so others
                can join your watch party.
              </p>
            </div>

            <div className="room-code-wrapper">
              <div className="room-code">
                {roomId}
              </div>
            </div>
          </section>

          <section className="watch-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  WATCH
                </p>

                <h2>
                  Watch together
                </h2>

                <p className="section-description">
                  Host and moderators can
                  control playback.
                </p>
              </div>

              <div className="play-status">
                <span
                  className={`status-dot ${
                    playState
                  }`}
                />

                {playState === "playing"
                  ? "Playing"
                  : "Paused"}
              </div>
            </div>

            {canControlVideo && (
              <div className="video-control-card">
                <div>
                  <h3>
                    Add YouTube video
                  </h3>

                  <p>
                    Paste a YouTube URL to
                    start watching together.
                  </p>
                </div>

                <div className="youtube-input-row">
                  <input
                    type="text"
                    className="youtube-input"
                    placeholder="Paste YouTube URL"
                    value={youtubeUrl}
                    onChange={(event) =>
                      setYoutubeUrl(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleSetVideo();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleSetVideo
                    }
                    disabled={!connected}
                  >
                    Set Video
                  </button>
                </div>
              </div>
            )}

            <div className="video-player-section">
              {videoId ? (
                <div className="youtube-player">
                  <YouTube
                    videoId={videoId}
                    onReady={
                      handlePlayerReady
                    }
                    onStateChange={
                      handlePlayerStateChange
                    }
                    onEnd={
                      handleVideoEnd
                    }
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 0,
                        controls: 1,
                        rel: 0,
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="youtube-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">
                      ▶
                    </div>

                    <h3>
                      No video selected
                    </h3>

                    <p>
                      {canControlVideo
                        ? "Paste a YouTube URL above to start the watch party."
                        : "Waiting for the host to add a YouTube video."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="chat-section">
            <div className="section-heading chat-heading">
              <div>
                <p className="section-label">
                  LIVE
                </p>

                <h2>
                  💬 Chat
                </h2>

                <p className="section-description">
                  Talk with everyone in the
                  room.
                </p>
              </div>

              <span className="participant-count">
                {messages.length} messages
              </span>
            </div>

            <div className="reaction-bar">
              {REACTIONS.map(
                (reaction) => (
                  <button
                    type="button"
                    className="reaction-button"
                    key={reaction}
                    onClick={() =>
                      sendReaction(
                        reaction
                      )
                    }
                    disabled={!connected}
                    aria-label={`Send ${reaction}`}
                  >
                    {reaction}
                  </button>
                )
              )}
            </div>

            {reactions.length > 0 && (
              <div
                className="reaction-feed"
                aria-live="polite"
              >
                {reactions
                  .slice(-5)
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <span
                        className="reaction-item"
                        key={`${item.timestamp}-${index}`}
                      >
                        <strong>
                          {
                            item.username
                          }
                        </strong>{" "}
                        {
                          item.reaction
                        }
                      </span>
                    )
                  )}
              </div>
            )}

            <div className="chat-messages">
              {messages.length ===
              0 ? (
                <div className="chat-empty">
                  No messages yet.
                  Say hello 👋
                </div>
              ) : (
                messages.map(
                  (
                    message,
                    index
                  ) => (
                    <div
                      className={`chat-message ${
                        message.userId ===
                        userId
                          ? "own-message"
                          : ""
                      }`}
                      key={`${message.timestamp}-${index}`}
                    >
                      <div className="chat-message-meta">
                        <strong>
                          {message.userId ===
                          userId
                            ? "You"
                            : message.username}
                        </strong>

                        <span>
                          {formatTime(
                            message.timestamp
                          )}
                        </span>
                      </div>

                      <div className="chat-message-bubble">
                        {
                          message.message
                        }
                      </div>
                    </div>
                  )
                )
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Write a message..."
                value={
                  messageInput
                }
                maxLength={500}
                onChange={(event) =>
                  setMessageInput(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleMessageKeyDown
                }
              />

              <button
                type="button"
                className="primary-button chat-send-button"
                onClick={
                  sendMessage
                }
                disabled={
                  !connected ||
                  !messageInput.trim()
                }
              >
                Send
              </button>
            </div>

            <p className="chat-character-count">
              {messageInput.length}/500
            </p>
          </section>

          <section className="participants-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  PEOPLE
                </p>

                <h2>
                  Participants
                </h2>

                <p className="section-description">
                  Everyone currently in
                  this room.
                </p>
              </div>

              <span className="participant-count">
                {participants.length}{" "}
                people
              </span>
            </div>

            {participants.length ===
            0 ? (
              <div className="no-participants">
                No participants yet.
              </div>
            ) : (
              <div className="participants-list">
                {participants.map(
                  (
                    participant
                  ) => {
                    const isYou =
                      participant.userId ===
                      userId;

                    const isHost =
                      participant.role ===
                      "HOST";

                    return (
                      <div
                        className="participant"
                        key={
                          participant.userId
                        }
                      >
                        <div className="participant-main">
                          <div className="participant-avatar">
                            {(
                              participant.username ||
                              "?"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div className="participant-info">
                            <div className="participant-name-row">
                              <span className="participant-name">
                                {
                                  participant.username
                                }
                              </span>

                              {isYou && (
                                <span className="you-label">
                                  You
                                </span>
                              )}
                            </div>

                            <span
                              className={`participant-role ${
                                participant.role ===
                                "HOST"
                                  ? "host-badge"
                                  : participant.role ===
                                      "MODERATOR"
                                    ? "moderator-badge"
                                    : "participant-badge"
                              }`}
                            >
                              {
                                participant.role
                              }
                            </span>
                          </div>
                        </div>

                        {currentRole ===
                          "HOST" &&
                          !isYou &&
                          !isHost && (
                            <div className="participant-actions">
                              {participant.role ===
                              "MODERATOR" ? (
                                <button
                                  type="button"
                                  className="role-button"
                                  onClick={() =>
                                    handleRemoveModerator(
                                      participant.userId
                                    )
                                  }
                                >
                                  Remove Moderator
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="role-button"
                                  onClick={() =>
                                    handleMakeModerator(
                                      participant.userId
                                    )
                                  }
                                >
                                  Make Moderator
                                </button>
                              )}

                              <button
                                type="button"
                                className="role-button"
                                onClick={() =>
                                  handleTransferHost(
                                    participant.userId
                                  )
                                }
                              >
                                Transfer Host
                              </button>

                              <button
                                type="button"
                                className="remove-button"
                                onClick={() =>
                                  handleRemoveParticipant(
                                    participant.userId
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <div className="leave-room-section">
            <button
              type="button"
              className="leave-room-button"
              onClick={
                handleLeaveRoom
              }
            >
              Leave Room
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}