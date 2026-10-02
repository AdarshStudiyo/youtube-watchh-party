// export type Role =
//   | "HOST"
//   | "MODERATOR"
//   | "PARTICIPANT";


// export interface Participant {
//   userId: string;
//   username: string;
//   role: Role;
//   socketId: string;
// }


// export interface Room {
//   roomId: string;
//   hostUserId: string;

//   participants:
//     Map<string, Participant>;

//   videoId:
//     string | null;

//   playState:
//     "playing" | "paused";

//   currentTime:
//     number;

//   updatedAt:
//     number;
// }


// /*
// ==================================================
// IN-MEMORY ROOM STORAGE
// ==================================================
// */

// const rooms =
//   new Map<string, Room>();


// /*
// ==================================================
// GENERATE ROOM ID
// ==================================================
// */

// function generateRoomId(): string {

//   const characters =
//     "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

//   let roomId = "";

//   for (
//     let i = 0;
//     i < 6;
//     i++
//   ) {

//     const randomIndex =
//       Math.floor(
//         Math.random() *
//           characters.length
//       );

//     roomId +=
//       characters[randomIndex];
//   }

//   return roomId;
// }


// /*
// ==================================================
// CREATE ROOM
// ==================================================
// */

// export function createRoom(
//   userId: string,
//   username: string,
//   socketId: string
// ): Room {

//   let roomId =
//     generateRoomId();


//   while (
//     rooms.has(roomId)
//   ) {

//     roomId =
//       generateRoomId();
//   }


//   const participant:
//     Participant = {

//     userId,

//     username,

//     role:
//       "HOST",

//     socketId,
//   };


//   const room:
//     Room = {

//     roomId,

//     hostUserId:
//       userId,

//     participants:
//       new Map([
//         [
//           userId,
//           participant,
//         ],
//       ]),

//     videoId:
//       null,

//     playState:
//       "paused",

//     currentTime:
//       0,

//     updatedAt:
//       Date.now(),
//   };


//   rooms.set(
//     roomId,
//     room
//   );


//   return room;
// }


// /*
// ==================================================
// GET ROOM
// ==================================================
// */

// export function getRoom(
//   roomId: string
// ): Room | undefined {

//   return rooms.get(
//     roomId
//   );
// }


// /*
// ==================================================
// DELETE ROOM
// ==================================================

// Used when a room has no participants
// remaining.

// This keeps the in-memory room store
// clean and prevents abandoned rooms
// from staying forever.
// */

// export function deleteRoom(
//   roomId: string
// ): boolean {

//   return rooms.delete(
//     roomId
//   );
// }


// /*
// ==================================================
// CHECK IF ROOM IS EMPTY
// ==================================================
// */

// export function isRoomEmpty(
//   room: Room
// ): boolean {

//   return (
//     room.participants.size ===
//     0
//   );
// }


// /*
// ==================================================
// CLEANUP EMPTY ROOM
// ==================================================

// Returns true when the room
// was actually deleted.
// */

// export function cleanupRoom(
//   room: Room
// ): boolean {

//   if (
//     !isRoomEmpty(room)
//   ) {

//     return false;
//   }


//   return deleteRoom(
//     room.roomId
//   );
// }


// /*
// ==================================================
// GET PARTICIPANT
// ==================================================
// */

// export function getParticipant(
//   room: Room,
//   userId: string
// ): Participant | undefined {

//   return room.participants.get(
//     userId
//   );
// }


// /*
// ==================================================
// ADD PARTICIPANT
// ==================================================
// */

// export function addParticipant(
//   room: Room,
//   userId: string,
//   username: string,
//   socketId: string
// ): Participant {

//   const participant:
//     Participant = {

//     userId,

//     username,

//     role:
//       "PARTICIPANT",

//     socketId,
//   };


//   room.participants.set(
//     userId,
//     participant
//   );


//   room.updatedAt =
//     Date.now();


//   return participant;
// }


// /*
// ==================================================
// UPDATE PARTICIPANT SOCKET
// ==================================================

// IMPORTANT:

// Used when an existing participant
// reconnects.

// The participant's role is preserved.

// Only the socket ID is replaced.
// */

// export function updateParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string,
//   username?: string
// ): Participant | undefined {

//   const participant =
//     room.participants.get(
//       userId
//     );


//   if (!participant) {
//     return undefined;
//   }


//   participant.socketId =
//     socketId;


//   if (
//     username &&
//     username.trim()
//   ) {

//     participant.username =
//       username.trim();
//   }


//   room.updatedAt =
//     Date.now();


//   return participant;
// }


// /*
// ==================================================
// CLEAR PARTICIPANT SOCKET
// ==================================================

// IMPORTANT:

// Disconnecting is NOT the same
// as leaving.

// We keep the participant record
// and role.

// Only socket ID is cleared.
// */

// export function clearParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string
// ): boolean {

//   const participant =
//     room.participants.get(
//       userId
//     );


//   if (!participant) {
//     return false;
//   }


//   /*
//     Do not clear a newer socket.
//   */

//   if (
//     participant.socketId !==
//     socketId
//   ) {

//     return false;
//   }


//   participant.socketId =
//     "";


//   room.updatedAt =
//     Date.now();


//   return true;
// }


// /*
// ==================================================
// MAKE MODERATOR
// ==================================================
// */

// export function makeModerator(
//   room: Room,
//   userId: string
// ): Participant | undefined {

//   const participant =
//     room.participants.get(
//       userId
//     );


//   if (!participant) {
//     return undefined;
//   }


//   /*
//     Host cannot become moderator.
//   */

//   if (
//     userId ===
//     room.hostUserId
//   ) {

//     return participant;
//   }


//   participant.role =
//     "MODERATOR";


//   room.updatedAt =
//     Date.now();


//   return participant;
// }


// /*
// ==================================================
// MAKE PARTICIPANT
// ==================================================
// */

// export function makeParticipant(
//   room: Room,
//   userId: string
// ): Participant | undefined {

//   const participant =
//     room.participants.get(
//       userId
//     );


//   if (!participant) {
//     return undefined;
//   }


//   /*
//     Host always remains host.
//   */

//   if (
//     userId ===
//     room.hostUserId
//   ) {

//     return participant;
//   }


//   participant.role =
//     "PARTICIPANT";


//   room.updatedAt =
//     Date.now();


//   return participant;
// }


// /*
// ==================================================
// REMOVE PARTICIPANT
// ==================================================

// Explicit removal.

// Used when:

// - Host removes participant
// - Participant voluntarily leaves

// This permanently removes the
// participant from the room.
// */

// export function removeParticipant(
//   room: Room,
//   userId: string
// ): Participant | undefined {

//   /*
//     Host cannot be removed by
//     this generic function.

//     Host must transfer ownership
//     first OR leave when alone.
//   */

//   if (
//     userId ===
//     room.hostUserId
//   ) {

//     return undefined;
//   }


//   const participant =
//     room.participants.get(
//       userId
//     );


//   if (!participant) {
//     return undefined;
//   }


//   room.participants.delete(
//     userId
//   );


//   room.updatedAt =
//     Date.now();


//   return participant;
// }


// /*
// ==================================================
// REMOVE HOST FROM EMPTY ROOM
// ==================================================

// Special lifecycle operation.

// A host can leave only when
// they are the last remaining
// participant.

// The room is then deleted.

// Returns the removed host.
// */

// export function removeHostFromEmptyRoom(
//   room: Room,
//   userId: string
// ): Participant | undefined {

//   /*
//     Only the actual host
//     can use this operation.
//   */

//   if (
//     userId !==
//     room.hostUserId
//   ) {

//     return undefined;
//   }


//   /*
//     Host can only leave if
//     nobody else remains.
//   */

//   if (
//     room.participants.size !==
//     1
//   ) {

//     return undefined;
//   }


//   const host =
//     room.participants.get(
//       userId
//     );


//   if (!host) {
//     return undefined;
//   }


//   room.participants.delete(
//     userId
//   );


//   room.updatedAt =
//     Date.now();


//   /*
//     Room is now empty.
//     Delete it immediately.
//   */

//   deleteRoom(
//     room.roomId
//   );


//   return host;
// }


// /*
// ==================================================
// TRANSFER HOST
// ==================================================
// */

// export function transferHost(
//   room: Room,
//   newHostUserId: string
// ): boolean {

//   const newHost =
//     room.participants.get(
//       newHostUserId
//     );


//   if (!newHost) {
//     return false;
//   }


//   /*
//     Cannot transfer to yourself.
//   */

//   if (
//     newHostUserId ===
//     room.hostUserId
//   ) {

//     return false;
//   }


//   const oldHost =
//     room.participants.get(
//       room.hostUserId
//     );


//   /*
//     Old host becomes normal
//     participant.
//   */

//   if (oldHost) {

//     oldHost.role =
//       "PARTICIPANT";
//   }


//   /*
//     New host becomes host.
//   */

//   room.hostUserId =
//     newHostUserId;


//   newHost.role =
//     "HOST";


//   room.updatedAt =
//     Date.now();


//   return true;
// }


// /*
// ==================================================
// GET ALL PARTICIPANTS
// ==================================================
// */

// export function getParticipants(
//   room: Room
// ): Participant[] {

//   return Array.from(
//     room.participants.values()
//   );
// }







//
//





// import { Room } from "./Room";
// import { RoomModel } from "../db/models/RoomModel";

// /*
// ==================================================
// IN-MEMORY ROOM STORAGE
// ==================================================

// RoomManager is responsible only for:

// - Creating rooms
// - Finding rooms
// - Deleting rooms
// - Cleaning up empty rooms

// The actual room/participant business logic
// is handled by the Room and Participant classes.
// ==================================================
// */

// const rooms = new Map<string, Room>();


// /*
// ==================================================
// GENERATE ROOM ID
// ==================================================
// */

// function generateRoomId(): string {

//   const characters =
//     "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

//   let roomId = "";

//   for (let i = 0; i < 6; i++) {

//     const randomIndex =
//       Math.floor(
//         Math.random() *
//         characters.length
//       );

//     roomId +=
//       characters[randomIndex];
//   }

//   return roomId;
// }


// /*
// ==================================================
// CREATE ROOM
// ==================================================
// */

// export function createRoom(
//   userId: string,
//   username: string,
//   socketId: string
// ): Room {

//   let roomId =
//     generateRoomId();


//   /*
//    * Make sure generated room ID
//    * does not already exist.
//    */

//   while (rooms.has(roomId)) {

//     roomId =
//       generateRoomId();
//   }


//   /*
//    * Room class is responsible for
//    * creating the HOST participant.
//    */

//   const room =
//     new Room(
//       roomId,
//       userId,
//       username,
//       socketId
//     );


//   rooms.set(
//     roomId,
//     room
//   );


//   return room;
// }


// /*
// ==================================================
// GET ROOM
// ==================================================
// */

// export function getRoom(
//   roomId: string
// ): Room | undefined {

//   return rooms.get(
//     roomId
//   );
// }


// /*
// ==================================================
// DELETE ROOM
// ==================================================
// */

// export function deleteRoom(
//   roomId: string
// ): boolean {

//   return rooms.delete(
//     roomId
//   );
// }


// /*
// ==================================================
// CHECK IF ROOM IS EMPTY
// ==================================================
// */

// export function isRoomEmpty(
//   room: Room
// ): boolean {

//   return room.isEmpty();
// }


// /*
// ==================================================
// CLEANUP EMPTY ROOM
// ==================================================

// Deletes the room only when it has
// no participants.
// ==================================================
// */

// export function cleanupRoom(
//   room: Room
// ): boolean {

//   if (!room.isEmpty()) {

//     return false;
//   }


//   return deleteRoom(
//     room.roomId
//   );
// }


// /*
// ==================================================
// GET PARTICIPANT
// ==================================================
// */

// export function getParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.getParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// ADD PARTICIPANT
// ==================================================
// */

// export function addParticipant(
//   room: Room,
//   userId: string,
//   username: string,
//   socketId: string
// ) {

//   return room.addParticipant(
//     userId,
//     username,
//     socketId
//   );
// }


// /*
// ==================================================
// UPDATE PARTICIPANT SOCKET
// ==================================================

// Used when an existing participant
// reconnects.

// The Participant object remains the same,
// so their role is preserved.
// ==================================================
// */

// export function updateParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string,
//   username?: string
// ) {

//   return room.updateParticipantSocket(
//     userId,
//     socketId,
//     username
//   );
// }


// /*
// ==================================================
// CLEAR PARTICIPANT SOCKET
// ==================================================

// Disconnecting is NOT the same as leaving.

// The participant remains in the room.

// Only the socket ID is cleared.
// ==================================================
// */

// export function clearParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string
// ): boolean {

//   return room.clearParticipantSocket(
//     userId,
//     socketId
//   );
// }


// /*
// ==================================================
// MAKE MODERATOR
// ==================================================
// */

// export function makeModerator(
//   room: Room,
//   userId: string
// ) {

//   return room.makeModerator(
//     userId
//   );
// }


// /*
// ==================================================
// MAKE PARTICIPANT
// ==================================================
// */

// export function makeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.makeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE PARTICIPANT
// ==================================================

// Used when:

// - Host removes participant
// - Participant voluntarily leaves

// The Room class handles the actual
// participant removal logic.
// ==================================================
// */

// export function removeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.removeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE HOST FROM EMPTY ROOM
// ==================================================

// The Room class validates that:

// - User is actually the host
// - Host is the only participant

// After this function removes the host,
// the room manager deletes the empty room.
// ==================================================
// */

// export function removeHostFromEmptyRoom(
//   room: Room,
//   userId: string
// ) {

//   const host =
//     room.removeHostFromEmptyRoom(
//       userId
//     );


//   if (!host) {
//     return undefined;
//   }


//   /*
//    * Room became empty,
//    * so remove it from memory.
//    */

//   deleteRoom(
//     room.roomId
//   );


//   return host;
// }


// /*
// ==================================================
// TRANSFER HOST
// ==================================================
// */

// export function transferHost(
//   room: Room,
//   newHostUserId: string
// ): boolean {

//   return room.transferHost(
//     newHostUserId
//   );
// }


// /*
// ==================================================
// GET ALL PARTICIPANTS
// ==================================================
// */

// export function getParticipants(
//   room: Room
// ) {

//   return room.getParticipants();
// }





//
//
//
//
//






// import { Room } from "./Room";
// import { RoomModel } from "../db/models/RoomModel";


// /*
// ==================================================
// IN-MEMORY ROOM STORAGE
// ==================================================

// RoomManager is responsible for:

// - Creating rooms
// - Finding rooms
// - Deleting rooms
// - Cleaning up empty rooms
// - Persisting rooms to MongoDB

// The actual room/participant business logic
// is handled by the Room and Participant classes.

// MongoDB is used for persistence.

// The Map is still used for fast runtime access.
// ==================================================
// */

// const rooms =
//   new Map<string, Room>();


// /*
// ==================================================
// GENERATE ROOM ID
// ==================================================
// */

// function generateRoomId(): string {

//   const characters =
//     "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

//   let roomId = "";

//   for (
//     let i = 0;
//     i < 6;
//     i++
//   ) {

//     const randomIndex =
//       Math.floor(
//         Math.random() *
//         characters.length
//       );

//     roomId +=
//       characters[randomIndex];
//   }

//   return roomId;
// }


// /*
// ==================================================
// CREATE ROOM
// ==================================================

// Creates a Room object in memory
// AND persists it to MongoDB.
// ==================================================
// */

// export async function createRoom(
//   userId: string,
//   username: string,
//   socketId: string
// ): Promise<Room> {

//   let roomId =
//     generateRoomId();


//   /*
//    * Make sure generated room ID
//    * does not already exist.
//    */

//   while (
//     rooms.has(roomId)
//   ) {

//     roomId =
//       generateRoomId();
//   }


//   /*
//   ==================================================
//   CREATE ROOM OBJECT
//   ==================================================
//   */

//   const room =
//     new Room(
//       roomId,
//       userId,
//       username,
//       socketId
//     );


//   /*
//   ==================================================
//   STORE IN MEMORY
//   ==================================================
//   */

//   rooms.set(
//     roomId,
//     room
//   );


//   /*
//   ==================================================
//   SAVE TO MONGODB
//   ==================================================
//   */

//   await RoomModel.create({

//     roomId:
//       room.roomId,

//     hostUserId:
//       room.hostUserId,

//     participants:
//       room
//         .getParticipants()
//         .map(
//           (participant) => ({

//             userId:
//               participant.userId,

//             username:
//               participant.username,

//             role:
//               participant.role,

//             socketId:
//               participant.socketId,
//           })
//         ),

//     videoId:
//       room.videoId,

//     playState:
//       room.playState,

//     currentTime:
//       room.currentTime,

//     updatedAt:
//       room.updatedAt,
//   });


//   /*
//   ==================================================
//   RETURN ROOM
//   ==================================================
//   */

//   return room;
// }


// /*
// ==================================================
// GET ROOM
// ==================================================
// */

// export function getRoom(
//   roomId: string
// ): Room | undefined {

//   return rooms.get(
//     roomId
//   );
// }


// /*
// ==================================================
// DELETE ROOM
// ==================================================
// */

// export function deleteRoom(
//   roomId: string
// ): boolean {

//   return rooms.delete(
//     roomId
//   );
// }


// /*
// ==================================================
// CHECK IF ROOM IS EMPTY
// ==================================================
// */

// export function isRoomEmpty(
//   room: Room
// ): boolean {

//   return room.isEmpty();
// }


// /*
// ==================================================
// CLEANUP EMPTY ROOM
// ==================================================

// Deletes the room from memory only
// when it has no participants.
// ==================================================
// */

// export function cleanupRoom(
//   room: Room
// ): boolean {

//   if (
//     !room.isEmpty()
//   ) {

//     return false;
//   }


//   return deleteRoom(
//     room.roomId
//   );
// }


// /*
// ==================================================
// GET PARTICIPANT
// ==================================================
// */

// export function getParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.getParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// ADD PARTICIPANT
// ==================================================
// */

// export function addParticipant(
//   room: Room,
//   userId: string,
//   username: string,
//   socketId: string
// ) {

//   return room.addParticipant(
//     userId,
//     username,
//     socketId
//   );
// }


// /*
// ==================================================
// UPDATE PARTICIPANT SOCKET
// ==================================================

// Used when an existing participant
// reconnects.

// The Participant object remains the same.

// Their role is preserved.

// Only the socket ID is replaced.
// ==================================================
// */

// export function updateParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string,
//   username?: string
// ) {

//   return room.updateParticipantSocket(
//     userId,
//     socketId,
//     username
//   );
// }


// /*
// ==================================================
// CLEAR PARTICIPANT SOCKET
// ==================================================

// Disconnecting is NOT the same as leaving.

// The participant remains in the room.

// Only the socket ID is cleared.
// ==================================================
// */

// export function clearParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string
// ): boolean {

//   return room.clearParticipantSocket(
//     userId,
//     socketId
//   );
// }


// /*
// ==================================================
// MAKE MODERATOR
// ==================================================
// */

// export function makeModerator(
//   room: Room,
//   userId: string
// ) {

//   return room.makeModerator(
//     userId
//   );
// }


// /*
// ==================================================
// MAKE PARTICIPANT
// ==================================================
// */

// export function makeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.makeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE PARTICIPANT
// ==================================================

// Used when:

// - Host removes participant
// - Participant voluntarily leaves

// The Room class handles the actual
// participant removal logic.
// ==================================================
// */

// export function removeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.removeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE HOST FROM EMPTY ROOM
// ==================================================

// The Room class validates that:

// - User is actually the host
// - Host is the only participant

// After this function removes the host,
// the room manager deletes the empty room.
// ==================================================
// */

// export function removeHostFromEmptyRoom(
//   room: Room,
//   userId: string
// ) {

//   const host =
//     room.removeHostFromEmptyRoom(
//       userId
//     );


//   if (!host) {
//     return undefined;
//   }


//   /*
//    * Room became empty,
//    * so remove it from memory.
//    */

//   deleteRoom(
//     room.roomId
//   );


//   return host;
// }


// /*
// ==================================================
// TRANSFER HOST
// ==================================================
// */

// export function transferHost(
//   room: Room,
//   newHostUserId: string
// ): boolean {

//   return room.transferHost(
//     newHostUserId
//   );
// }


// /*
// ==================================================
// GET ALL PARTICIPANTS
// ==================================================
// */

// export function getParticipants(
//   room: Room
// ) {

//   return room.getParticipants();
// }









//
//
//
//
//
//
//





// import { Room } from "./Room";
// import { RoomModel } from "../db/models/RoomModel";


// /*
// ==================================================
// IN-MEMORY ROOM STORAGE
// ==================================================

// RoomManager is responsible for:

// - Creating rooms
// - Finding rooms
// - Deleting rooms
// - Cleaning up empty rooms
// - Persisting rooms to MongoDB

// The Room class handles the actual
// room/participant business logic.

// The Map provides fast runtime access.

// MongoDB provides persistence.
// ==================================================
// */

// const rooms =
//   new Map<string, Room>();


// /*
// ==================================================
// GENERATE ROOM ID
// ==================================================
// */

// function generateRoomId(): string {

//   const characters =
//     "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

//   let roomId = "";

//   for (
//     let i = 0;
//     i < 6;
//     i++
//   ) {

//     const randomIndex =
//       Math.floor(
//         Math.random() *
//         characters.length
//       );

//     roomId +=
//       characters[randomIndex];
//   }

//   return roomId;
// }


// /*
// ==================================================
// CREATE ROOM
// ==================================================

// Creates the room:

// 1. Generate unique room ID
// 2. Create Room object
// 3. Store in memory
// 4. Save to MongoDB
// ==================================================
// */

// export async function createRoom(
//   userId: string,
//   username: string,
//   socketId: string
// ): Promise<Room> {

//   let roomId =
//     generateRoomId();


//   /*
//   ==================================================
//   MAKE SURE ROOM ID IS UNIQUE
//   ==================================================
//   */

//   while (
//     rooms.has(roomId)
//   ) {

//     roomId =
//       generateRoomId();
//   }


//   /*
//   ==================================================
//   CREATE ROOM OBJECT
//   ==================================================
//   */

//   const room =
//     new Room(
//       roomId,
//       userId,
//       username,
//       socketId
//     );


//   /*
//   ==================================================
//   STORE ROOM IN MEMORY
//   ==================================================
//   */

//   rooms.set(
//     roomId,
//     room
//   );


//   /*
//   ==================================================
//   SAVE ROOM TO MONGODB
//   ==================================================
//   */

//   await RoomModel.create({

//     roomId:
//       room.roomId,

//     hostUserId:
//       room.hostUserId,

//     participants:
//       room
//         .getParticipants()
//         .map(
//           (participant) => ({

//             userId:
//               participant.userId,

//             username:
//               participant.username,

//             role:
//               participant.role,

//             socketId:
//               participant.socketId,

//           })
//         ),

//     videoId:
//       room.videoId,

//     playState:
//       room.playState,

//     currentTime:
//       room.currentTime,

//     updatedAt:
//       room.updatedAt,

//   });


//   console.log(
//     `Room ${room.roomId} persisted to MongoDB`
//   );


//   return room;
// }


// /*
// ==================================================
// GET ROOM
// ==================================================
// */

// export function getRoom(
//   roomId: string
// ): Room | undefined {

//   return rooms.get(
//     roomId
//   );
// }


// /*
// ==================================================
// DELETE ROOM
// ==================================================
// */

// export function deleteRoom(
//   roomId: string
// ): boolean {

//   return rooms.delete(
//     roomId
//   );
// }


// /*
// ==================================================
// CHECK IF ROOM IS EMPTY
// ==================================================
// */

// export function isRoomEmpty(
//   room: Room
// ): boolean {

//   return room.isEmpty();
// }


// /*
// ==================================================
// CLEANUP EMPTY ROOM
// ==================================================

// Deletes the room from memory when
// there are no participants.

// ==================================================
// */

// export function cleanupRoom(
//   room: Room
// ): boolean {

//   if (
//     !room.isEmpty()
//   ) {

//     return false;
//   }


//   return deleteRoom(
//     room.roomId
//   );
// }


// /*
// ==================================================
// GET PARTICIPANT
// ==================================================
// */

// export function getParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.getParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// ADD PARTICIPANT
// ==================================================
// */

// export function addParticipant(
//   room: Room,
//   userId: string,
//   username: string,
//   socketId: string
// ) {

//   return room.addParticipant(
//     userId,
//     username,
//     socketId
//   );
// }


// /*
// ==================================================
// UPDATE PARTICIPANT SOCKET
// ==================================================

// Used when an existing participant
// reconnects.

// The Participant object remains the same.

// The role is preserved.

// Only the socket ID is replaced.
// ==================================================
// */

// export function updateParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string,
//   username?: string
// ) {

//   return room.updateParticipantSocket(
//     userId,
//     socketId,
//     username
//   );
// }


// /*
// ==================================================
// CLEAR PARTICIPANT SOCKET
// ==================================================

// Disconnecting is NOT the same as leaving.

// The participant remains in the room.

// Only the socket ID is cleared.
// ==================================================
// */

// export function clearParticipantSocket(
//   room: Room,
//   userId: string,
//   socketId: string
// ): boolean {

//   return room.clearParticipantSocket(
//     userId,
//     socketId
//   );
// }


// /*
// ==================================================
// MAKE MODERATOR
// ==================================================
// */

// export function makeModerator(
//   room: Room,
//   userId: string
// ) {

//   return room.makeModerator(
//     userId
//   );
// }


// /*
// ==================================================
// MAKE PARTICIPANT
// ==================================================
// */

// export function makeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.makeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE PARTICIPANT
// ==================================================
// */

// export function removeParticipant(
//   room: Room,
//   userId: string
// ) {

//   return room.removeParticipant(
//     userId
//   );
// }


// /*
// ==================================================
// REMOVE HOST FROM EMPTY ROOM
// ==================================================

// The Room class validates:

// - User is the actual host
// - Host is the only participant

// After removal, the room is deleted
// from the in-memory Map.
// ==================================================
// */

// export function removeHostFromEmptyRoom(
//   room: Room,
//   userId: string
// ) {

//   const host =
//     room.removeHostFromEmptyRoom(
//       userId
//     );


//   if (!host) {
//     return undefined;
//   }


//   /*
//   ==================================================
//   DELETE EMPTY ROOM FROM MEMORY
//   ==================================================
//   */

//   deleteRoom(
//     room.roomId
//   );


//   return host;
// }


// /*
// ==================================================
// TRANSFER HOST
// ==================================================
// */

// export function transferHost(
//   room: Room,
//   newHostUserId: string
// ): boolean {

//   return room.transferHost(
//     newHostUserId
//   );
// }


// /*
// ==================================================
// GET ALL PARTICIPANTS
// ==================================================
// */

// export function getParticipants(
//   room: Room
// ) {

//   return room.getParticipants();
// }











import { randomUUID } from "node:crypto";

import { Room } from "./Room";
import { RoomModel } from "../db/models/RoomModel";


// ==================================================
// ROOM STORE
// ==================================================

/*
 * Runtime room storage.
 *
 * MongoDB is used for basic persistence.
 * During runtime, we use this Map because
 * Socket.IO operations need fast access.
 */

const rooms =
  new Map<string, Room>();


// ==================================================
// NORMALIZE ROOM ID
// ==================================================

function normalizeRoomId(
  roomId: string
): string {

  return roomId
    .trim()
    .toUpperCase();
}


// ==================================================
// GENERATE ROOM ID
// ==================================================

function generateRoomId(): string {

  /*
   * Example:
   *
   * 9U7C2V
   */

  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}


// ==================================================
// CREATE ROOM
// ==================================================

export async function createRoom(
  hostUserId: string,
  hostUsername: string,
  hostSocketId: string
): Promise<Room> {

  let roomId: string;

  /*
   * Generate a unique room ID.
   */

  do {

    roomId =
      generateRoomId();

  } while (
    rooms.has(roomId)
  );


  /*
   * Create runtime Room object.
   */

  const room =
    new Room(
      roomId,
      hostUserId,
      hostUsername,
      hostSocketId
    );


  /*
   * Store room in memory.
   */

  rooms.set(
    roomId,
    room
  );


  // ==================================================
  // SAVE BASIC ROOM TO MONGODB
  // ==================================================

  try {

    await RoomModel.create({

      roomId:
        room.roomId,

      hostUserId:
        room.hostUserId,

      participants:
        room.getParticipants().map(
          (participant) => ({

            userId:
              participant.userId,

            username:
              participant.username,

            role:
              participant.role,

            /*
             * Socket IDs are runtime information.
             *
             * We don't really need to persist them.
             * Therefore store empty string.
             */

            socketId:
              "",
          })
        ),

      videoId:
        room.videoId,

      playState:
        room.playState,

      currentTime:
        room.currentTime,

      updatedAt:
        room.updatedAt,

    });


    console.log(
      `Room ${room.roomId} persisted to MongoDB`
    );

  } catch (error) {

    /*
     * If MongoDB save fails, remove the
     * runtime room as well.
     *
     * This prevents the application from
     * returning a room that wasn't persisted.
     */

    rooms.delete(
      roomId
    );

    console.error(
      "Failed to persist room:",
      error
    );

    throw error;
  }


  return room;
}


// ==================================================
// GET ROOM
// ==================================================

export function getRoom(
  roomId: string
): Room | undefined {

  const normalizedRoomId =
    normalizeRoomId(
      roomId
    );

  return rooms.get(
    normalizedRoomId
  );
}


// ==================================================
// GET PARTICIPANT
// ==================================================

export function getParticipant(
  room: Room,
  userId: string
) {

  return room.getParticipant(
    userId
  );
}


// ==================================================
// ADD PARTICIPANT
// ==================================================

export function addParticipant(
  room: Room,
  userId: string,
  username: string,
  socketId: string
) {

  return room.addParticipant(
    userId,
    username,
    socketId
  );
}


// ==================================================
// GET PARTICIPANTS
// ==================================================

export function getParticipants(
  room: Room
) {

  return room.getParticipants();
}


// ==================================================
// UPDATE PARTICIPANT SOCKET
// ==================================================

export function updateParticipantSocket(
  room: Room,
  userId: string,
  socketId: string,
  username?: string
) {

  return room.updateParticipantSocket(
    userId,
    socketId,
    username
  );
}


// ==================================================
// CLEAR PARTICIPANT SOCKET
// ==================================================

export function clearParticipantSocket(
  room: Room,
  userId: string,
  socketId: string
): boolean {

  return room.clearParticipantSocket(
    userId,
    socketId
  );
}


// ==================================================
// MAKE MODERATOR
// ==================================================

export function makeModerator(
  room: Room,
  userId: string
) {

  return room.makeModerator(
    userId
  );
}


// ==================================================
// MAKE PARTICIPANT
// ==================================================

export function makeParticipant(
  room: Room,
  userId: string
) {

  return room.makeParticipant(
    userId
  );
}


// ==================================================
// REMOVE PARTICIPANT
// ==================================================

export function removeParticipant(
  room: Room,
  userId: string
) {

  return room.removeParticipant(
    userId
  );
}


// ==================================================
// REMOVE HOST FROM EMPTY ROOM
// ==================================================

export function removeHostFromEmptyRoom(
  room: Room,
  userId: string
) {

  return room.removeHostFromEmptyRoom(
    userId
  );
}


// ==================================================
// TRANSFER HOST
// ==================================================

export function transferHost(
  room: Room,
  newHostUserId: string
): boolean {

  return room.transferHost(
    newHostUserId
  );
}


// ==================================================
// CLEANUP ROOM
// ==================================================

export async function cleanupRoom(
  room: Room
): Promise<void> {

  /*
   * Don't delete a room that still has
   * participants.
   */

  if (
    !room.isEmpty()
  ) {
    return;
  }


  /*
   * Remove from runtime memory.
   */

  rooms.delete(
    room.roomId
  );


  /*
   * Remove basic room record from MongoDB.
   */

  try {

    await RoomModel.deleteOne({

      roomId:
        room.roomId,

    });

    console.log(
      `Room ${room.roomId} deleted from MongoDB`
    );

  } catch (error) {

    /*
     * For this basic project we simply log
     * the error.
     */

    console.error(
      `Failed to delete room ${room.roomId} from MongoDB:`,
      error
    );
  }
}