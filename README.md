# YouTube Watch Party

A real-time YouTube Watch Party application where multiple users can join the same room and watch a YouTube video together with synchronized playback, chat, emoji reactions, and host/moderator controls.

## Live Application

- Frontend: https://youtube-watchh-party.vercel.app/
- Backend API: https://youtube-watchh-party.onrender.com/
- GitHub: https://github.com/AdarshStudiyo/youtube-watchh-party

## Features

- Create a watch party room
- Join an existing room
- Real-time room state synchronization
- YouTube video synchronization
  - Play
  - Pause
  - Seek
  - Change video
- Host and moderator roles
- Host can:
  - Assign/remove moderators
  - Remove participants
  - Transfer host role
- Participant reconnect support
- Real-time text chat
- Real-time emoji reactions
- Room cleanup when the room becomes empty
- MongoDB persistence for room information
- Redis-backed Socket.IO adapter
- React/Vite frontend and Node.js/Express/Socket.IO backend

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Socket.IO Client
- Fetch API

### Backend

- Node.js
- TypeScript
- Express.js
- Socket.IO
- CORS

### Database / Infrastructure

- MongoDB
- Mongoose
- Redis
- Socket.IO Redis Adapter

### Deployment

- Vercel — frontend
- Render — backend
- Redis Cloud — Redis
- MongoDB — database

## Project Structure

```text
youtube-watchh-party/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Room.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── models/
│   │   │       └── RoomModel.ts
│   │   ├── rooms/
│   │   │   ├── Participant.ts
│   │   │   ├── Room.ts
│   │   │   └── roomManager.ts
│   │   ├── socket/
│   │   │   └── socketServer.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AdarshStudiyo/youtube-watchh-party.git
cd youtube-watchh-party
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Configure frontend environment variables

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

Create:

```text
server/.env
```

Configure the required MongoDB, Redis, and frontend-origin values.

Example:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_url
```

Do not commit real credentials or `.env` files.

### 5. Start the backend

From `server/`:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 6. Start the frontend

From `client/`:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Production Environment Variables

### Vercel frontend

Set:

```env
VITE_API_URL=https://youtube-watchh-party.onrender.com
VITE_SOCKET_URL=https://youtube-watchh-party.onrender.com
```

### Render backend

Set the corresponding backend variables:

```env
PORT=<provided by Render>
FRONTEND_URL=https://youtube-watchh-party.vercel.app
MONGODB_URI=<your MongoDB connection string>
REDIS_URL=<your Redis connection URL>
```

Keep secrets in the hosting provider's environment-variable settings rather than committing them to Git.

## Architecture Overview

The application uses a React frontend, an Express/Socket.IO backend, MongoDB for persistence, and Redis for Socket.IO's adapter.

```text
                 ┌──────────────────────┐
                 │      React Client    │
                 │       Vercel         │
                 └──────────┬───────────┘
                            │
                 REST + WebSocket
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Node.js + Express    │
                 │      Socket.IO       │
                 │       Render         │
                 └───────┬───────┬──────┘
                         │       │
              persistence│       │pub/sub adapter
                         │       │
                         ▼       ▼
                 ┌──────────┐ ┌──────────┐
                 │ MongoDB  │ │  Redis   │
                 └──────────┘ └──────────┘
```

### WebSocket Flow

1. A user creates a room through the REST API:

```text
POST /api/rooms
```

2. The backend generates a `userId` and a short room ID.

3. The room is stored in the runtime `Map` and its basic information is persisted in MongoDB.

4. The frontend connects to the backend using Socket.IO.

5. The client emits:

```text
join_room
```

with the room ID, user ID, and username.

6. The server validates the socket session and adds the socket to the corresponding Socket.IO room.

7. The server sends the current room state using:

```text
room_state
```

8. When the host or moderator changes the video or playback state, the server updates the `Room` object and broadcasts the change to the other connected users.

Examples:

```text
set_video
video_action
```

9. Chat and reactions are also broadcast through Socket.IO:

```text
send_message → new_message
send_reaction → new_reaction
```

10. Participant and role changes are broadcast using events such as:

```text
participants_updated
user_joined
user_left
host_transferred
removed_from_room
```

## Backend Design

### `server.ts`

Responsible for:

- Express application
- CORS
- HTTP server
- Socket.IO initialization
- Redis adapter configuration
- REST APIs
- MongoDB and Redis startup
- Health check endpoint

### `socketServer.ts`

Contains the WebSocket event handling logic.

It handles:

- Joining and leaving rooms
- Reconnection
- Video synchronization
- Chat
- Reactions
- Host transfer
- Moderator management
- Participant removal
- Socket authorization
- Disconnect handling

### `Room.ts`

Represents the runtime state of a watch party.

It stores:

- Room ID
- Host user ID
- Participants
- Current YouTube video
- Playback state
- Current playback time
- Updated timestamp

The class also contains room-level operations such as:

- Adding/removing participants
- Changing roles
- Transferring host
- Setting a video
- Updating playback state
- Room lifecycle management

### `Participant.ts`

Represents a user inside a room and stores participant information such as:

- User ID
- Username
- Role
- Socket ID

### `roomManager.ts`

Acts as the room-management layer.

It provides functions for:

- Creating rooms
- Finding rooms
- Managing participants
- Updating socket connections
- Managing roles
- Transferring host
- Cleaning up empty rooms

Runtime room state is kept in a `Map` for fast access while basic room persistence uses MongoDB.

## Socket Authorization

The backend keeps a mapping:

```text
socketId → roomId + userId
```

Before performing protected actions, the server verifies that:

1. The socket is registered.
2. The socket belongs to the claimed room.
3. The socket belongs to the claimed user.
4. The user exists as a participant in the room.
5. The user has the required role for the requested action.

For example, only the host or moderator can control the video, while only the host can assign moderators, remove participants, or transfer host ownership.

## Reconnection Handling

When a participant reconnects, the server checks whether the user already exists in the room.

If the participant exists:

- The old socket mapping is removed.
- The new socket ID is stored.
- The participant keeps their existing role.

This allows a temporary network disconnect to reconnect without losing the participant's room role.

The disconnect handler intentionally does not immediately remove the participant. Instead, it clears the active socket while preserving the participant in the room.

## Room Lifecycle

A room is deleted when it becomes empty.

When the last participant leaves:

1. The participant is removed from the runtime room.
2. The room is removed from the in-memory `Map`.
3. The corresponding MongoDB room record is deleted.

The host cannot leave while other participants remain in the room. The host must first transfer the host role.

## API Endpoints

### Health Check

```http
GET /
```

Returns the backend status.

### Create Room

```http
POST /api/rooms
```

Request:

```json
{
  "username": "Adarsh"
}
```

Response contains:

```json
{
  "roomId": "ABC123",
  "userId": "generated-user-id",
  "role": "HOST"
}
```

### Check Room

```http
GET /api/rooms/:roomId
```

Returns basic room information including the participant count.

## Important Socket Events

### Client → Server

```text
join_room
leave_room
set_video
video_action
send_message
send_reaction
make_moderator
remove_moderator
remove_participant
transfer_host
```

### Server → Client

```text
room_state
video_updated
video_action
participants_updated
user_joined
user_left
new_message
new_reaction
host_transferred
removed_from_room
left_room
error_message
```

## Build

### Frontend

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm run build
```

## Deployment

The frontend is deployed on Vercel and the backend is deployed on Render.

The frontend uses the Render backend URL for both REST API requests and Socket.IO connections.

The backend allows the Vercel frontend origin through CORS and Socket.IO CORS configuration.

## Demo

Live demo:

https://youtube-watchh-party.vercel.app/

The application can be tested by opening the frontend, entering a username, creating a watch party, and joining the generated room from another browser/session.

## Notes

- Do not commit `.env` files containing real credentials.
- Use `.env.example` files as templates for local configuration.
- Render free instances may spin down after inactivity, so the first request after inactivity can take longer.
