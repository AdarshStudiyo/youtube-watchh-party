// import { Server, Socket } from "socket.io";

// import {
//   getRoom,
//   getParticipant,
//   addParticipant,
//   getParticipants,
//   makeModerator,
//   makeParticipant,
//   removeParticipant,
//   removeHostFromEmptyRoom,
//   updateParticipantSocket,
//   clearParticipantSocket,
//   transferHost,
//   cleanupRoom,
// } from "../rooms/roomManager";

// type SocketUser = {
//   roomId: string;
//   userId: string;
// };

// type JoinRoomData = {
//   roomId?: string;
//   userId?: string;
//   username?: string;
// };

// type VideoData = {
//   roomId?: string;
//   userId?: string;
//   videoId?: string;
// };

// type VideoActionData = {
//   roomId?: string;
//   userId?: string;
//   action?: "play" | "pause" | "seek";
//   currentTime?: number;
// };

// type ParticipantActionData = {
//   roomId?: string;
//   userId?: string;
//   targetUserId?: string;
// };

// type LeaveRoomData = {
//   roomId?: string;
//   userId?: string;
// };

// type MessageData = {
//   roomId?: string;
//   userId?: string;
//   message?: string;
// };

// type ReactionData = {
//   roomId?: string;
//   userId?: string;
//   reaction?: string;
// };

// export class SocketServer {
//   private readonly io: Server;

//   /**
//    * Maps:
//    *
//    * socketId -> {
//    *   roomId,
//    *   userId
//    * }
//    *
//    * This is used to verify that a socket is actually
//    * acting on behalf of the user it claims to be.
//    */
//   private readonly socketUsers = new Map<string, SocketUser>();

//   /**
//    * Allowed emoji reactions.
//    */
//   private readonly allowedReactions = new Set([
//     "👍",
//     "❤️",
//     "😂",
//     "😮",
//     "😢",
//     "🔥",
//     "👏",
//     "🎉",
//   ]);

//   constructor(io: Server) {
//     this.io = io;
//     this.registerConnectionHandler();
//   }

//   // ==================================================
//   // NORMALIZE ROOM ID
//   // ==================================================

//   private normalizeRoomId(roomId: string): string {
//     return roomId.trim().toUpperCase();
//   }

//   // ==================================================
//   // SOCKET OWNERSHIP
//   // ==================================================

//   private isSocketParticipant(
//     roomId: string,
//     userId: string,
//     socketId: string
//   ): boolean {
//     const mapping = this.socketUsers.get(socketId);

//     if (!mapping) {
//       return false;
//     }

//     return (
//       mapping.roomId === roomId &&
//       mapping.userId === userId
//     );
//   }

//   // ==================================================
//   // ERROR HELPER
//   // ==================================================

//   private sendError(
//     socket: Socket,
//     message: string
//   ): void {
//     socket.emit("error_message", {
//       message,
//     });
//   }

//   // ==================================================
//   // GET ROOM
//   // ==================================================

//   private getRoomOrError(
//     socket: Socket,
//     roomId: string
//   ) {
//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const room =
//       getRoom(normalizedRoomId);

//     if (!room) {
//       this.sendError(
//         socket,
//         "Room not found."
//       );

//       return null;
//     }

//     return room;
//   }

//   // ==================================================
//   // VALIDATE SOCKET PARTICIPANT
//   // ==================================================

//   private getAuthorizedParticipant(
//     socket: Socket,
//     roomId: string,
//     userId: string
//   ) {
//     if (
//       !this.isSocketParticipant(
//         roomId,
//         userId,
//         socket.id
//       )
//     ) {
//       this.sendError(
//         socket,
//         "Invalid socket session."
//       );

//       return null;
//     }

//     const room =
//       getRoom(roomId);

//     if (!room) {
//       this.sendError(
//         socket,
//         "Room not found."
//       );

//       return null;
//     }

//     const participant =
//       getParticipant(
//         room,
//         userId
//       );

//     if (!participant) {
//       this.sendError(
//         socket,
//         "You are not a participant in this room."
//       );

//       return null;
//     }

//     return {
//       room,
//       participant,
//     };
//   }

//   // ==================================================
//   // CONNECTION HANDLER
//   // ==================================================

//   private registerConnectionHandler(): void {
//     this.io.on(
//       "connection",
//       (socket: Socket) => {
//         console.log(
//           "User connected:",
//           socket.id
//         );

//         // ----------------------------------------------
//         // SET VIDEO
//         // ----------------------------------------------

//         socket.on(
//           "set_video",
//           (data: VideoData) => {
//             this.handleSetVideo(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // VIDEO ACTION
//         // ----------------------------------------------

//         socket.on(
//           "video_action",
//           (data: VideoActionData) => {
//             this.handleVideoAction(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // MAKE MODERATOR
//         // ----------------------------------------------

//         socket.on(
//           "make_moderator",
//           (data: ParticipantActionData) => {
//             this.handleMakeModerator(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // REMOVE MODERATOR
//         // ----------------------------------------------

//         socket.on(
//           "remove_moderator",
//           (data: ParticipantActionData) => {
//             this.handleRemoveModerator(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // REMOVE PARTICIPANT
//         // ----------------------------------------------

//         socket.on(
//           "remove_participant",
//           (data: ParticipantActionData) => {
//             this.handleRemoveParticipant(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // TRANSFER HOST
//         // ----------------------------------------------

//         socket.on(
//           "transfer_host",
//           (data: ParticipantActionData) => {
//             this.handleTransferHost(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // JOIN ROOM
//         // ----------------------------------------------

//         socket.on(
//           "join_room",
//           (data: JoinRoomData) => {
//             this.handleJoinRoom(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // LEAVE ROOM
//         // ----------------------------------------------

//         socket.on(
//           "leave_room",
//           (data: LeaveRoomData) => {
//             this.handleLeaveRoom(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // TEXT CHAT
//         // ----------------------------------------------

//         socket.on(
//           "send_message",
//           (data: MessageData) => {
//             this.handleSendMessage(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // REACTION
//         // ----------------------------------------------

//         socket.on(
//           "send_reaction",
//           (data: ReactionData) => {
//             this.handleSendReaction(
//               socket,
//               data
//             );
//           }
//         );

//         // ----------------------------------------------
//         // DISCONNECT
//         // ----------------------------------------------

//         socket.on(
//           "disconnect",
//           (reason: string) => {
//             this.handleDisconnect(
//               socket,
//               reason
//             );
//           }
//         );
//       }
//     );
//   }

//   // ==================================================
//   // SET VIDEO
//   // ==================================================

//   private handleSetVideo(
//     socket: Socket,
//     data: VideoData
//   ): void {
//     const {
//       roomId,
//       userId,
//       videoId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !videoId
//     ) {
//       this.sendError(
//         socket,
//         "Invalid video information."
//       );

//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant,
//     } = authorized;

//     // Only host and moderator can change video
//     if (
//       participant.role !== "HOST" &&
//       participant.role !== "MODERATOR"
//     ) {
//       this.sendError(
//         socket,
//         "You do not have permission to change the video."
//       );

//       return;
//     }

//     room.videoId = videoId;
//     room.playState = "paused";
//     room.currentTime = 0;
//     room.updatedAt = Date.now();

//     this.io
//       .to(room.roomId)
//       .emit(
//         "video_updated",
//         {
//           videoId: room.videoId,
//           playState: room.playState,
//           currentTime: room.currentTime,
//         }
//       );
//   }

//   // ==================================================
//   // VIDEO ACTION
//   // ==================================================

//   private handleVideoAction(
//     socket: Socket,
//     data: VideoActionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       action,
//       currentTime,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !action
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant,
//     } = authorized;

//     // Only host and moderator can control video
//     if (
//       participant.role !== "HOST" &&
//       participant.role !== "MODERATOR"
//     ) {
//       this.sendError(
//         socket,
//         "Only the host or moderator can control the video."
//       );

//       return;
//     }

//     // Validate action
//     if (
//       action !== "play" &&
//       action !== "pause" &&
//       action !== "seek"
//     ) {
//       return;
//     }

//     // Validate currentTime
//     if (
//       typeof currentTime !== "number" ||
//       !Number.isFinite(currentTime) ||
//       currentTime < 0
//     ) {
//       return;
//     }

//     // ----------------------------------------------
//     // PLAY
//     // ----------------------------------------------

//     if (action === "play") {
//       room.playState = "playing";
//       room.currentTime = currentTime;
//     }

//     // ----------------------------------------------
//     // PAUSE
//     // ----------------------------------------------

//     if (action === "pause") {
//       room.playState = "paused";
//       room.currentTime = currentTime;
//     }

//     // ----------------------------------------------
//     // SEEK
//     // ----------------------------------------------

//     if (action === "seek") {
//       room.currentTime = currentTime;
//     }

//     room.updatedAt = Date.now();

//     socket
//       .to(room.roomId)
//       .emit(
//         "video_action",
//         {
//           action,
//           currentTime:
//             room.currentTime,
//         }
//       );
//   }

//   // ==================================================
//   // MAKE MODERATOR
//   // ==================================================

//   private handleMakeModerator(
//     socket: Socket,
//     data: ParticipantActionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       targetUserId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !targetUserId
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant: requester,
//     } = authorized;

//     // Only host
//     if (
//       requester.role !== "HOST"
//     ) {
//       this.sendError(
//         socket,
//         "Only the host can assign moderators."
//       );

//       return;
//     }

//     const target =
//       getParticipant(
//         room,
//         targetUserId
//       );

//     if (!target) {
//       this.sendError(
//         socket,
//         "Participant not found."
//       );

//       return;
//     }

//     // Host cannot become moderator
//     if (
//       targetUserId ===
//       room.hostUserId
//     ) {
//       this.sendError(
//         socket,
//         "The host is already the host."
//       );

//       return;
//     }

//     makeModerator(
//       room,
//       targetUserId
//     );

//     this.io
//       .to(room.roomId)
//       .emit(
//         "participants_updated",
//         {
//           participants:
//             getParticipants(room),
//         }
//       );
//   }

//   // ==================================================
//   // REMOVE MODERATOR
//   // ==================================================

//   private handleRemoveModerator(
//     socket: Socket,
//     data: ParticipantActionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       targetUserId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !targetUserId
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant: requester,
//     } = authorized;

//     if (
//       requester.role !== "HOST"
//     ) {
//       this.sendError(
//         socket,
//         "Only the host can manage roles."
//       );

//       return;
//     }

//     const target =
//       getParticipant(
//         room,
//         targetUserId
//       );

//     if (!target) {
//       this.sendError(
//         socket,
//         "Participant not found."
//       );

//       return;
//     }

//     if (
//       targetUserId ===
//       room.hostUserId
//     ) {
//       this.sendError(
//         socket,
//         "The host role cannot be removed."
//       );

//       return;
//     }

//     makeParticipant(
//       room,
//       targetUserId
//     );

//     this.io
//       .to(room.roomId)
//       .emit(
//         "participants_updated",
//         {
//           participants:
//             getParticipants(room),
//         }
//       );
//   }

//   // ==================================================
//   // REMOVE PARTICIPANT
//   // ==================================================

//   private handleRemoveParticipant(
//     socket: Socket,
//     data: ParticipantActionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       targetUserId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !targetUserId
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant: requester,
//     } = authorized;

//     if (
//       requester.role !== "HOST"
//     ) {
//       this.sendError(
//         socket,
//         "Only the host can remove participants."
//       );

//       return;
//     }

//     const target =
//       getParticipant(
//         room,
//         targetUserId
//       );

//     if (!target) {
//       this.sendError(
//         socket,
//         "Participant not found."
//       );

//       return;
//     }

//     // Host cannot remove himself
//     if (
//       targetUserId ===
//       room.hostUserId
//     ) {
//       this.sendError(
//         socket,
//         "The host cannot be removed."
//       );

//       return;
//     }

//     const removed =
//       removeParticipant(
//         room,
//         targetUserId
//       );

//     if (!removed) {
//       return;
//     }

//     // ----------------------------------------------
//     // Notify removed participant
//     // ----------------------------------------------

//     if (target.socketId) {
//       this.io
//         .to(target.socketId)
//         .emit(
//           "removed_from_room",
//           {
//             message:
//               "You have been removed from the room.",
//           }
//         );
//     }

//     // ----------------------------------------------
//     // Remove socket from Socket.IO room
//     // ----------------------------------------------

//     if (target.socketId) {
//       const targetSocket =
//         this.io.sockets.sockets.get(
//           target.socketId
//         );

//       if (targetSocket) {
//         targetSocket.leave(
//           room.roomId
//         );

//         this.socketUsers.delete(
//           target.socketId
//         );
//       }
//     }

//     // ----------------------------------------------
//     // Update everyone
//     // ----------------------------------------------

//     this.io
//       .to(room.roomId)
//       .emit(
//         "participants_updated",
//         {
//           participants:
//             getParticipants(room),
//         }
//       );

//     cleanupRoom(room);
//   }

//   // ==================================================
//   // TRANSFER HOST
//   // ==================================================

//   private handleTransferHost(
//     socket: Socket,
//     data: ParticipantActionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       targetUserId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !targetUserId
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant: requester,
//     } = authorized;

//     if (
//       requester.role !== "HOST"
//     ) {
//       this.sendError(
//         socket,
//         "Only the host can transfer host role."
//       );

//       return;
//     }

//     if (
//       userId === targetUserId
//     ) {
//       this.sendError(
//         socket,
//         "You are already the host."
//       );

//       return;
//     }

//     const target =
//       getParticipant(
//         room,
//         targetUserId
//       );

//     if (!target) {
//       this.sendError(
//         socket,
//         "Participant not found."
//       );

//       return;
//     }

//     const transferred =
//       transferHost(
//         room,
//         targetUserId
//       );

//     if (!transferred) {
//       this.sendError(
//         socket,
//         "Failed to transfer host role."
//       );

//       return;
//     }

//     this.io
//       .to(room.roomId)
//       .emit(
//         "host_transferred",
//         {
//           hostUserId:
//             room.hostUserId,

//           participants:
//             getParticipants(room),
//         }
//       );
//   }

//   // ==================================================
//   // JOIN ROOM
//   // ==================================================

//   private handleJoinRoom(
//     socket: Socket,
//     data: JoinRoomData
//   ): void {
//     const {
//       roomId,
//       userId,
//       username,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       !username
//     ) {
//       this.sendError(
//         socket,
//         "Invalid join information."
//       );

//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const room =
//       getRoom(normalizedRoomId);

//     if (!room) {
//       this.sendError(
//         socket,
//         "Room not found."
//       );

//       return;
//     }

//     const existingParticipant =
//       getParticipant(
//         room,
//         userId
//       );

//     // ==================================================
//     // RECONNECT EXISTING PARTICIPANT
//     // ==================================================

//     if (existingParticipant) {
//       const oldSocketId =
//         existingParticipant.socketId;

//       /*
//        * Important:
//        *
//        * If the same user connects again,
//        * remove authorization from the old socket.
//        *
//        * Otherwise the old socket could still pass
//        * isSocketParticipant().
//        */

//       if (
//         oldSocketId &&
//         oldSocketId !== socket.id
//       ) {
//         this.socketUsers.delete(
//           oldSocketId
//         );

//         const oldSocket =
//           this.io.sockets.sockets.get(
//             oldSocketId
//           );

//         if (oldSocket) {
//           oldSocket.leave(
//             room.roomId
//           );

//           oldSocket.disconnect(
//             true
//           );
//         }
//       }

//       updateParticipantSocket(
//         room,
//         userId,
//         socket.id,
//         username
//       );

//       console.log(
//         `${username} reconnected to ${room.roomId} as ${existingParticipant.role}`
//       );
//     }

//     // ==================================================
//     // NEW PARTICIPANT
//     // ==================================================

//     else {
//       addParticipant(
//         room,
//         userId,
//         username,
//         socket.id
//       );

//       console.log(
//         `${username} joined ${room.roomId}`
//       );
//     }

//     // ==================================================
//     // SOCKET MAPPING
//     // ==================================================

//     this.socketUsers.set(
//       socket.id,
//       {
//         roomId:
//           room.roomId,

//         userId,
//       }
//     );

//     // ==================================================
//     // JOIN SOCKET.IO ROOM
//     // ==================================================

//     socket.join(
//       room.roomId
//     );

//     // ==================================================
//     // SEND CURRENT ROOM STATE
//     // ==================================================

//     socket.emit(
//       "room_state",
//       {
//         roomId:
//           room.roomId,

//         videoId:
//           room.videoId,

//         playState:
//           room.playState,

//         currentTime:
//           room.currentTime,

//         participants:
//           getParticipants(room),
//       }
//     );

//     // ==================================================
//     // NOTIFY OTHER USERS
//     // ==================================================

//     socket
//       .to(room.roomId)
//       .emit(
//         "user_joined",
//         {
//           participants:
//             getParticipants(room),
//         }
//       );
//   }

//   // ==================================================
//   // LEAVE ROOM
//   // ==================================================

//   private handleLeaveRoom(
//     socket: Socket,
//     data: LeaveRoomData
//   ): void {
//     const {
//       roomId,
//       userId,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant,
//     } = authorized;

//     // ==================================================
//     // HOST LEAVING
//     // ==================================================

//     if (
//       userId === room.hostUserId
//     ) {
//       /*
//        * Host cannot leave while other participants
//        * are still inside.
//        */

//       if (
//         room.participants.size > 1
//       ) {
//         this.sendError(
//           socket,
//           "Host cannot leave while other participants are in the room. Transfer host role first."
//         );

//         return;
//       }

//       const removedHost =
//         removeHostFromEmptyRoom(
//           room,
//           userId
//         );

//       if (!removedHost) {
//         this.sendError(
//           socket,
//           "Failed to leave the room."
//         );

//         return;
//       }

//       this.socketUsers.delete(
//         socket.id
//       );

//       socket.leave(
//         room.roomId
//       );

//       socket.emit(
//         "left_room",
//         {
//           roomId:
//             room.roomId,

//           roomDeleted:
//             true,
//         }
//       );

//       console.log(
//         `Host ${removedHost.username} left empty room ${room.roomId}. Room deleted.`
//       );

//       return;
//     }

//     // ==================================================
//     // NORMAL PARTICIPANT LEAVING
//     // ==================================================

//     const removed =
//       removeParticipant(
//         room,
//         userId
//       );

//     if (!removed) {
//       this.sendError(
//         socket,
//         "Failed to leave the room."
//       );

//       return;
//     }

//     this.socketUsers.delete(
//       socket.id
//     );

//     socket.leave(
//       room.roomId
//     );

//     // Notify other participants
//     socket
//       .to(room.roomId)
//       .emit(
//         "user_left",
//         {
//           username:
//             removed.username,

//           userId:
//             removed.userId,

//           participants:
//             getParticipants(room),
//         }
//       );

//     // Notify leaving participant
//     socket.emit(
//       "left_room",
//       {
//         roomId:
//           room.roomId,

//         roomDeleted:
//           false,
//       }
//     );

//     cleanupRoom(room);

//     console.log(
//       `${removed.username} left room ${room.roomId}`
//     );
//   }

//   // ==================================================
//   // TEXT CHAT
//   // ==================================================

//   private handleSendMessage(
//     socket: Socket,
//     data: MessageData
//   ): void {
//     const {
//       roomId,
//       userId,
//       message,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       typeof message !== "string"
//     ) {
//       return;
//     }

//     const cleanMessage =
//       message.trim();

//     if (!cleanMessage) {
//       return;
//     }

//     if (
//       cleanMessage.length > 500
//     ) {
//       this.sendError(
//         socket,
//         "Message cannot exceed 500 characters."
//       );

//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant,
//     } = authorized;

//     this.io
//       .to(room.roomId)
//       .emit(
//         "new_message",
//         {
//           userId:
//             participant.userId,

//           username:
//             participant.username,

//           message:
//             cleanMessage,

//           timestamp:
//             Date.now(),
//         }
//       );
//   }

//   // ==================================================
//   // EMOJI REACTION
//   // ==================================================

//   private handleSendReaction(
//     socket: Socket,
//     data: ReactionData
//   ): void {
//     const {
//       roomId,
//       userId,
//       reaction,
//     } = data || {};

//     if (
//       !roomId ||
//       !userId ||
//       typeof reaction !== "string"
//     ) {
//       return;
//     }

//     const normalizedRoomId =
//       this.normalizeRoomId(roomId);

//     const authorized =
//       this.getAuthorizedParticipant(
//         socket,
//         normalizedRoomId,
//         userId
//       );

//     if (!authorized) {
//       return;
//     }

//     const {
//       room,
//       participant,
//     } = authorized;

//     // ==================================================
//     // VALIDATE REACTION
//     // ==================================================

//     if (
//       !this.allowedReactions.has(
//         reaction
//       )
//     ) {
//       this.sendError(
//         socket,
//         "Invalid reaction."
//       );

//       return;
//     }

//     // ==================================================
//     // BROADCAST
//     // ==================================================

//     this.io
//       .to(room.roomId)
//       .emit(
//         "new_reaction",
//         {
//           userId:
//             participant.userId,

//           username:
//             participant.username,

//           reaction,

//           timestamp:
//             Date.now(),
//         }
//       );
//   }

//   // ==================================================
//   // DISCONNECT
//   // ==================================================

//   private handleDisconnect(
//     socket: Socket,
//     reason: string
//   ): void {
//     console.log(
//       "User disconnected:",
//       socket.id,
//       reason
//     );

//     const socketInfo =
//       this.socketUsers.get(
//         socket.id
//       );

//     /*
//      * This can happen when:
//      *
//      * - socket never joined a room
//      * - socket was replaced by a reconnecting socket
//      * - participant was removed
//      */
//     if (!socketInfo) {
//       return;
//     }

//     const {
//       roomId,
//       userId,
//     } = socketInfo;

//     const room =
//       getRoom(roomId);

//     if (!room) {
//       this.socketUsers.delete(
//         socket.id
//       );

//       return;
//     }

//     const participant =
//       getParticipant(
//         room,
//         userId
//       );

//     if (!participant) {
//       this.socketUsers.delete(
//         socket.id
//       );

//       return;
//     }

//     /*
//      * clearParticipantSocket() should only clear
//      * the participant's socket if the socket being
//      * disconnected is still the active socket.
//      *
//      * This prevents an old socket disconnecting
//      * from clearing a newly connected socket.
//      */

//     const cleared =
//       clearParticipantSocket(
//         room,
//         userId,
//         socket.id
//       );

//     if (cleared) {
//       this.io
//         .to(room.roomId)
//         .emit(
//           "participants_updated",
//           {
//             participants:
//               getParticipants(room),
//           }
//         );

//       console.log(
//         `${participant.username} disconnected from ${room.roomId}; role preserved as ${participant.role}`
//       );
//     }

//     this.socketUsers.delete(
//       socket.id
//     );

//     /*
//      * Do NOT remove the participant here.
//      *
//      * This allows the same user to reconnect
//      * and retain their role.
//      */

//     cleanupRoom(room);
//   }
// }









import { Server, Socket } from "socket.io";

import {
  getRoom,
  getParticipant,
  addParticipant,
  getParticipants,
  makeModerator,
  makeParticipant,
  removeParticipant,
  removeHostFromEmptyRoom,
  updateParticipantSocket,
  clearParticipantSocket,
  transferHost,
  cleanupRoom,
} from "../rooms/roomManager";


type SocketUser = {
  roomId: string;
  userId: string;
};


type JoinRoomData = {
  roomId?: string;
  userId?: string;
  username?: string;
};


type VideoData = {
  roomId?: string;
  userId?: string;
  videoId?: string;
};


type VideoActionData = {
  roomId?: string;
  userId?: string;
  action?: "play" | "pause" | "seek";
  currentTime?: number;
};


type ParticipantActionData = {
  roomId?: string;
  userId?: string;
  targetUserId?: string;
};


type LeaveRoomData = {
  roomId?: string;
  userId?: string;
};


type MessageData = {
  roomId?: string;
  userId?: string;
  message?: string;
};


type ReactionData = {
  roomId?: string;
  userId?: string;
  reaction?: string;
};


export class SocketServer {

  private readonly io: Server;


  /**
   * Maps:
   *
   * socketId -> {
   *   roomId,
   *   userId
   * }
   *
   * Used to verify that a socket is actually
   * acting on behalf of the user it claims to be.
   */
  private readonly socketUsers =
    new Map<string, SocketUser>();


  /**
   * Allowed emoji reactions.
   */
  private readonly allowedReactions =
    new Set([
      "👍",
      "❤️",
      "😂",
      "😮",
      "😢",
      "🔥",
      "👏",
      "🎉",
    ]);


  constructor(
    io: Server
  ) {

    this.io =
      io;

    this.registerConnectionHandler();
  }


  // ==================================================
  // NORMALIZE ROOM ID
  // ==================================================

  private normalizeRoomId(
    roomId: string
  ): string {

    return roomId
      .trim()
      .toUpperCase();
  }


  // ==================================================
  // SOCKET OWNERSHIP
  // ==================================================

  private isSocketParticipant(
    roomId: string,
    userId: string,
    socketId: string
  ): boolean {

    const mapping =
      this.socketUsers.get(
        socketId
      );

    if (!mapping) {
      return false;
    }

    return (
      mapping.roomId === roomId &&
      mapping.userId === userId
    );
  }


  // ==================================================
  // ERROR HELPER
  // ==================================================

  private sendError(
    socket: Socket,
    message: string
  ): void {

    socket.emit(
      "error_message",
      {
        message,
      }
    );
  }


  // ==================================================
  // GET ROOM
  // ==================================================

  private getRoomOrError(
    socket: Socket,
    roomId: string
  ) {

    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );

    const room =
      getRoom(
        normalizedRoomId
      );

    if (!room) {

      this.sendError(
        socket,
        "Room not found."
      );

      return null;
    }

    return room;
  }


  // ==================================================
  // VALIDATE SOCKET PARTICIPANT
  // ==================================================

  private getAuthorizedParticipant(
    socket: Socket,
    roomId: string,
    userId: string
  ) {

    if (
      !this.isSocketParticipant(
        roomId,
        userId,
        socket.id
      )
    ) {

      this.sendError(
        socket,
        "Invalid socket session."
      );

      return null;
    }


    const room =
      getRoom(
        roomId
      );


    if (!room) {

      this.sendError(
        socket,
        "Room not found."
      );

      return null;
    }


    const participant =
      getParticipant(
        room,
        userId
      );


    if (!participant) {

      this.sendError(
        socket,
        "You are not a participant in this room."
      );

      return null;
    }


    return {
      room,
      participant,
    };
  }


  // ==================================================
  // CONNECTION HANDLER
  // ==================================================

  private registerConnectionHandler(): void {

    this.io.on(
      "connection",
      (socket: Socket) => {

        console.log(
          "User connected:",
          socket.id
        );


        // ==================================================
        // SET VIDEO
        // ==================================================

        socket.on(
          "set_video",
          (data: VideoData) => {

            this.handleSetVideo(
              socket,
              data
            );

          }
        );


        // ==================================================
        // VIDEO ACTION
        // ==================================================

        socket.on(
          "video_action",
          (data: VideoActionData) => {

            this.handleVideoAction(
              socket,
              data
            );

          }
        );


        // ==================================================
        // MAKE MODERATOR
        // ==================================================

        socket.on(
          "make_moderator",
          (data: ParticipantActionData) => {

            this.handleMakeModerator(
              socket,
              data
            );

          }
        );


        // ==================================================
        // REMOVE MODERATOR
        // ==================================================

        socket.on(
          "remove_moderator",
          (data: ParticipantActionData) => {

            this.handleRemoveModerator(
              socket,
              data
            );

          }
        );


        // ==================================================
        // REMOVE PARTICIPANT
        // ==================================================

        socket.on(
          "remove_participant",
          (data: ParticipantActionData) => {

            this.handleRemoveParticipant(
              socket,
              data
            );

          }
        );


        // ==================================================
        // TRANSFER HOST
        // ==================================================

        socket.on(
          "transfer_host",
          (data: ParticipantActionData) => {

            this.handleTransferHost(
              socket,
              data
            );

          }
        );


        // ==================================================
        // JOIN ROOM
        // ==================================================

        socket.on(
          "join_room",
          (data: JoinRoomData) => {

            this.handleJoinRoom(
              socket,
              data
            );

          }
        );


        // ==================================================
        // LEAVE ROOM
        // ==================================================

        socket.on(
          "leave_room",
          (data: LeaveRoomData) => {

            this.handleLeaveRoom(
              socket,
              data
            );

          }
        );


        // ==================================================
        // TEXT CHAT
        // ==================================================

        socket.on(
          "send_message",
          (data: MessageData) => {

            this.handleSendMessage(
              socket,
              data
            );

          }
        );


        // ==================================================
        // REACTION
        // ==================================================

        socket.on(
          "send_reaction",
          (data: ReactionData) => {

            this.handleSendReaction(
              socket,
              data
            );

          }
        );


        // ==================================================
        // DISCONNECT
        // ==================================================

        socket.on(
          "disconnect",
          (reason: string) => {

            this.handleDisconnect(
              socket,
              reason
            );

          }
        );

      }
    );
  }


  // ==================================================
  // SET VIDEO
  // ==================================================

  private handleSetVideo(
    socket: Socket,
    data: VideoData
  ): void {

    const {
      roomId,
      userId,
      videoId,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !videoId
    ) {

      this.sendError(
        socket,
        "Invalid video information."
      );

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant,
    } = authorized;


    // Only host and moderator can change video

    if (
      participant.role !== "HOST" &&
      participant.role !== "MODERATOR"
    ) {

      this.sendError(
        socket,
        "You do not have permission to change the video."
      );

      return;
    }


    room.setVideo(
      videoId
    );


    this.io
      .to(room.roomId)
      .emit(
        "video_updated",
        {
          videoId:
            room.videoId,

          playState:
            room.playState,

          currentTime:
            room.currentTime,
        }
      );
  }


  // ==================================================
  // VIDEO ACTION
  // ==================================================

  private handleVideoAction(
    socket: Socket,
    data: VideoActionData
  ): void {

    const {
      roomId,
      userId,
      action,
      currentTime,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !action
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant,
    } = authorized;


    // Only host and moderator can control video

    if (
      participant.role !== "HOST" &&
      participant.role !== "MODERATOR"
    ) {

      this.sendError(
        socket,
        "Only the host or moderator can control the video."
      );

      return;
    }


    // Validate action

    if (
      action !== "play" &&
      action !== "pause" &&
      action !== "seek"
    ) {

      return;
    }


    // Validate currentTime

    if (
      typeof currentTime !== "number" ||
      !Number.isFinite(currentTime) ||
      currentTime < 0
    ) {

      return;
    }


    room.updateVideo(
      action,
      currentTime
    );


    socket
      .to(room.roomId)
      .emit(
        "video_action",
        {
          action,

          currentTime:
            room.currentTime,
        }
      );
  }


  // ==================================================
  // MAKE MODERATOR
  // ==================================================

  private handleMakeModerator(
    socket: Socket,
    data: ParticipantActionData
  ): void {

    const {
      roomId,
      userId,
      targetUserId,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !targetUserId
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant: requester,
    } = authorized;


    // Only host

    if (
      requester.role !== "HOST"
    ) {

      this.sendError(
        socket,
        "Only the host can assign moderators."
      );

      return;
    }


    const target =
      getParticipant(
        room,
        targetUserId
      );


    if (!target) {

      this.sendError(
        socket,
        "Participant not found."
      );

      return;
    }


    // Host cannot become moderator

    if (
      targetUserId ===
      room.hostUserId
    ) {

      this.sendError(
        socket,
        "The host is already the host."
      );

      return;
    }


    makeModerator(
      room,
      targetUserId
    );


    this.io
      .to(room.roomId)
      .emit(
        "participants_updated",
        {
          participants:
            getParticipants(room),
        }
      );
  }


  // ==================================================
  // REMOVE MODERATOR
  // ==================================================

  private handleRemoveModerator(
    socket: Socket,
    data: ParticipantActionData
  ): void {

    const {
      roomId,
      userId,
      targetUserId,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !targetUserId
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant: requester,
    } = authorized;


    if (
      requester.role !== "HOST"
    ) {

      this.sendError(
        socket,
        "Only the host can manage roles."
      );

      return;
    }


    const target =
      getParticipant(
        room,
        targetUserId
      );


    if (!target) {

      this.sendError(
        socket,
        "Participant not found."
      );

      return;
    }


    if (
      targetUserId ===
      room.hostUserId
    ) {

      this.sendError(
        socket,
        "The host role cannot be removed."
      );

      return;
    }


    makeParticipant(
      room,
      targetUserId
    );


    this.io
      .to(room.roomId)
      .emit(
        "participants_updated",
        {
          participants:
            getParticipants(room),
        }
      );
  }


  // ==================================================
  // REMOVE PARTICIPANT
  // ==================================================

  private handleRemoveParticipant(
    socket: Socket,
    data: ParticipantActionData
  ): void {

    const {
      roomId,
      userId,
      targetUserId,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !targetUserId
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant: requester,
    } = authorized;


    if (
      requester.role !== "HOST"
    ) {

      this.sendError(
        socket,
        "Only the host can remove participants."
      );

      return;
    }


    const target =
      getParticipant(
        room,
        targetUserId
      );


    if (!target) {

      this.sendError(
        socket,
        "Participant not found."
      );

      return;
    }


    // Host cannot remove himself

    if (
      targetUserId ===
      room.hostUserId
    ) {

      this.sendError(
        socket,
        "The host cannot be removed."
      );

      return;
    }


    const removed =
      removeParticipant(
        room,
        targetUserId
      );


    if (!removed) {
      return;
    }


    // ----------------------------------------------
    // Notify removed participant
    // ----------------------------------------------

    if (target.socketId) {

      this.io
        .to(target.socketId)
        .emit(
          "removed_from_room",
          {
            message:
              "You have been removed from the room.",
          }
        );
    }


    // ----------------------------------------------
    // Remove socket from Socket.IO room
    // ----------------------------------------------

    if (target.socketId) {

      const targetSocket =
        this.io.sockets.sockets.get(
          target.socketId
        );


      if (targetSocket) {

        targetSocket.leave(
          room.roomId
        );


        this.socketUsers.delete(
          target.socketId
        );
      }
    }


    // ----------------------------------------------
    // Update everyone
    // ----------------------------------------------

    this.io
      .to(room.roomId)
      .emit(
        "participants_updated",
        {
          participants:
            getParticipants(room),
        }
      );


    cleanupRoom(
      room
    );
  }


  // ==================================================
  // TRANSFER HOST
  // ==================================================

  private handleTransferHost(
    socket: Socket,
    data: ParticipantActionData
  ): void {

    const {
      roomId,
      userId,
      targetUserId,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !targetUserId
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant: requester,
    } = authorized;


    if (
      requester.role !== "HOST"
    ) {

      this.sendError(
        socket,
        "Only the host can transfer host role."
      );

      return;
    }


    if (
      userId === targetUserId
    ) {

      this.sendError(
        socket,
        "You are already the host."
      );

      return;
    }


    const target =
      getParticipant(
        room,
        targetUserId
      );


    if (!target) {

      this.sendError(
        socket,
        "Participant not found."
      );

      return;
    }


    const transferred =
      transferHost(
        room,
        targetUserId
      );


    if (!transferred) {

      this.sendError(
        socket,
        "Failed to transfer host role."
      );

      return;
    }


    this.io
      .to(room.roomId)
      .emit(
        "host_transferred",
        {
          hostUserId:
            room.hostUserId,

          participants:
            getParticipants(room),
        }
      );
  }


  // ==================================================
  // JOIN ROOM
  // ==================================================

  private handleJoinRoom(
    socket: Socket,
    data: JoinRoomData
  ): void {

    const {
      roomId,
      userId,
      username,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      !username
    ) {

      this.sendError(
        socket,
        "Invalid join information."
      );

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const room =
      getRoom(
        normalizedRoomId
      );


    if (!room) {

      this.sendError(
        socket,
        "Room not found."
      );

      return;
    }


    const existingParticipant =
      getParticipant(
        room,
        userId
      );


    // ==================================================
    // RECONNECT EXISTING PARTICIPANT
    // ==================================================

    if (existingParticipant) {

      const oldSocketId =
        existingParticipant.socketId;


      /*
       * If the same user connects again,
       * remove authorization from the old socket.
       */

      if (
        oldSocketId &&
        oldSocketId !== socket.id
      ) {

        this.socketUsers.delete(
          oldSocketId
        );


        const oldSocket =
          this.io.sockets.sockets.get(
            oldSocketId
          );


        if (oldSocket) {

          oldSocket.leave(
            room.roomId
          );

          oldSocket.disconnect(
            true
          );
        }
      }


      updateParticipantSocket(
        room,
        userId,
        socket.id,
        username
      );


      console.log(
        `${username} reconnected to ${room.roomId} as ${existingParticipant.role}`
      );
    }


    // ==================================================
    // NEW PARTICIPANT
    // ==================================================

    else {

      addParticipant(
        room,
        userId,
        username,
        socket.id
      );


      console.log(
        `${username} joined ${room.roomId}`
      );
    }


    // ==================================================
    // SOCKET MAPPING
    // ==================================================

    this.socketUsers.set(
      socket.id,
      {
        roomId:
          room.roomId,

        userId,
      }
    );


    // ==================================================
    // JOIN SOCKET.IO ROOM
    // ==================================================

    socket.join(
      room.roomId
    );


    // ==================================================
    // SEND CURRENT ROOM STATE
    // ==================================================

    socket.emit(
      "room_state",
      {
        roomId:
          room.roomId,

        videoId:
          room.videoId,

        playState:
          room.playState,

        currentTime:
          room.currentTime,

        participants:
          getParticipants(room),
      }
    );


    // ==================================================
    // NOTIFY OTHER USERS
    // ==================================================

    socket
      .to(room.roomId)
      .emit(
        "user_joined",
        {
          participants:
            getParticipants(room),
        }
      );
  }


  // ==================================================
  // LEAVE ROOM
  // ==================================================

  private handleLeaveRoom(
    socket: Socket,
    data: LeaveRoomData
  ): void {

    const {
      roomId,
      userId,
    } = data || {};


    if (
      !roomId ||
      !userId
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
    } = authorized;


    // ==================================================
    // HOST LEAVING
    // ==================================================

    if (
      userId ===
      room.hostUserId
    ) {

      /*
       * Host cannot leave while other participants
       * are still inside.
       */

      if (
        room.participants.size > 1
      ) {

        this.sendError(
          socket,
          "Host cannot leave while other participants are in the room. Transfer host role first."
        );

        return;
      }


      const removedHost =
        removeHostFromEmptyRoom(
          room,
          userId
        );


      if (!removedHost) {

        this.sendError(
          socket,
          "Failed to leave the room."
        );

        return;
      }


      this.socketUsers.delete(
        socket.id
      );


      socket.leave(
        room.roomId
      );


      socket.emit(
        "left_room",
        {
          roomId:
            room.roomId,

          roomDeleted:
            true,
        }
      );


      console.log(
        `Host ${removedHost.username} left empty room ${room.roomId}. Room deleted.`
      );


      cleanupRoom(
        room
      );


      return;
    }


    // ==================================================
    // NORMAL PARTICIPANT LEAVING
    // ==================================================

    const removed =
      removeParticipant(
        room,
        userId
      );


    if (!removed) {

      this.sendError(
        socket,
        "Failed to leave the room."
      );

      return;
    }


    this.socketUsers.delete(
      socket.id
    );


    socket.leave(
      room.roomId
    );


    // Notify other participants

    socket
      .to(room.roomId)
      .emit(
        "user_left",
        {
          username:
            removed.username,

          userId:
            removed.userId,

          participants:
            getParticipants(room),
        }
      );


    // Notify leaving participant

    socket.emit(
      "left_room",
      {
        roomId:
          room.roomId,

        roomDeleted:
          false,
      }
    );


    cleanupRoom(
      room
    );


    console.log(
      `${removed.username} left room ${room.roomId}`
    );
  }


  // ==================================================
  // TEXT CHAT
  // ==================================================

  private handleSendMessage(
    socket: Socket,
    data: MessageData
  ): void {

    const {
      roomId,
      userId,
      message,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      typeof message !== "string"
    ) {

      return;
    }


    const cleanMessage =
      message.trim();


    if (!cleanMessage) {
      return;
    }


    if (
      cleanMessage.length > 500
    ) {

      this.sendError(
        socket,
        "Message cannot exceed 500 characters."
      );

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant,
    } = authorized;


    this.io
      .to(room.roomId)
      .emit(
        "new_message",
        {
          userId:
            participant.userId,

          username:
            participant.username,

          message:
            cleanMessage,

          timestamp:
            Date.now(),
        }
      );
  }


  // ==================================================
  // EMOJI REACTION
  // ==================================================

  private handleSendReaction(
    socket: Socket,
    data: ReactionData
  ): void {

    const {
      roomId,
      userId,
      reaction,
    } = data || {};


    if (
      !roomId ||
      !userId ||
      typeof reaction !== "string"
    ) {

      return;
    }


    const normalizedRoomId =
      this.normalizeRoomId(
        roomId
      );


    const authorized =
      this.getAuthorizedParticipant(
        socket,
        normalizedRoomId,
        userId
      );


    if (!authorized) {
      return;
    }


    const {
      room,
      participant,
    } = authorized;


    // ==================================================
    // VALIDATE REACTION
    // ==================================================

    if (
      !this.allowedReactions.has(
        reaction
      )
    ) {

      this.sendError(
        socket,
        "Invalid reaction."
      );

      return;
    }


    // ==================================================
    // BROADCAST
    // ==================================================

    this.io
      .to(room.roomId)
      .emit(
        "new_reaction",
        {
          userId:
            participant.userId,

          username:
            participant.username,

          reaction,

          timestamp:
            Date.now(),
        }
      );
  }


  // ==================================================
  // DISCONNECT
  // ==================================================

  private handleDisconnect(
    socket: Socket,
    reason: string
  ): void {

    console.log(
      "User disconnected:",
      socket.id,
      reason
    );


    const socketInfo =
      this.socketUsers.get(
        socket.id
      );


    /*
     * This can happen when:
     *
     * - socket never joined a room
     * - socket was replaced by a reconnecting socket
     * - participant was removed
     */

    if (!socketInfo) {
      return;
    }


    const {
      roomId,
      userId,
    } = socketInfo;


    const room =
      getRoom(
        roomId
      );


    if (!room) {

      this.socketUsers.delete(
        socket.id
      );

      return;
    }


    const participant =
      getParticipant(
        room,
        userId
      );


    if (!participant) {

      this.socketUsers.delete(
        socket.id
      );

      return;
    }


    /*
     * clearParticipantSocket() only clears
     * the participant's socket if the socket
     * being disconnected is still the active socket.
     *
     * This prevents an old socket disconnecting
     * from clearing a newly connected socket.
     */

    const cleared =
      clearParticipantSocket(
        room,
        userId,
        socket.id
      );


    if (cleared) {

      this.io
        .to(room.roomId)
        .emit(
          "participants_updated",
          {
            participants:
              getParticipants(room),
          }
        );


      console.log(
        `${participant.username} disconnected from ${room.roomId}; role preserved as ${participant.role}`
      );
    }


    this.socketUsers.delete(
      socket.id
    );


    /*
     * Do NOT remove the participant here.
     *
     * This allows the same user to reconnect
     * and retain their role.
     */

    cleanupRoom(
      room
    );
  }

}