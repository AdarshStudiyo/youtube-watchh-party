import mongoose from "mongoose";


/*
==================================================
PARTICIPANT SCHEMA
==================================================
*/

const ParticipantSchema =
  new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
      },

      username: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          "HOST",
          "MODERATOR",
          "PARTICIPANT",
        ],
        required: true,
      },

      socketId: {
        type: String,
        default: "",
      },
    },

    {
      _id: false,
    }
  );


/*
==================================================
ROOM SCHEMA
==================================================
*/

const RoomSchema =
  new mongoose.Schema(
    {
      roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      hostUserId: {
        type: String,
        required: true,
      },

      participants: {
        type: [
          ParticipantSchema,
        ],
        default: [],
      },

      videoId: {
        type: String,
        default: null,
      },

      playState: {
        type: String,
        enum: [
          "playing",
          "paused",
        ],
        default: "paused",
      },

      currentTime: {
        type: Number,
        default: 0,
      },

      updatedAt: {
        type: Number,
        required: true,
      },
    }
  );


/*
==================================================
ROOM MODEL
==================================================
*/

export const RoomModel =
  mongoose.model(
    "Room",
    RoomSchema
  );