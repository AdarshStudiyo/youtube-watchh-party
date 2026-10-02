// import "dotenv/config";

// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { randomUUID } from "node:crypto";
// import { connectDatabase } from "./db/database";

// import {
//   createRoom,
//   getRoom,
// } from "./rooms/roomManager";

// import { SocketServer } from "./socket/socketServer";


// /*
// ==================================================
// EXPRESS APP
// ==================================================
// */

// const app = express();


// /*
// ==================================================
// CORS
// ==================================================
// */

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );

// app.use(
//   express.json()
// );


// /*
// ==================================================
// HTTP SERVER
// ==================================================
// */

// const httpServer =
//   createServer(app);


// /*
// ==================================================
// SOCKET.IO
// ==================================================
// */

// const io =
//   new Server(
//     httpServer,
//     {
//       cors: {
//         origin: "http://localhost:5173",

//         methods: [
//           "GET",
//           "POST",
//         ],
//       },
//     }
//   );


// /*
// ==================================================
// HEALTH CHECK
// ==================================================
// */

// app.get(
//   "/",
//   (_req, res) => {

//     res.json({
//       message:
//         "YouTube Watch Party API is running",
//     });

//   }
// );


// /*
// ==================================================
// CREATE ROOM
// ==================================================
// */

// app.post(
//   "/api/rooms",
//   (req, res) => {

//     console.log(
//       "POST /api/rooms"
//     );

//     console.log(
//       "Request body:",
//       req.body
//     );


//     try {

//       const {
//         username,
//       } = req.body;


//       /*
//       Validate username
//       */

//       if (
//         !username ||
//         typeof username !== "string" ||
//         !username.trim()
//       ) {

//         return res
//           .status(400)
//           .json({
//             message:
//               "Username is required",
//           });

//       }


//       /*
//       Generate user ID
//       */

//       const userId =
//         randomUUID();


//       /*
//       Create room

//       Creator automatically
//       becomes HOST.
//       */

//       const room =
//         createRoom(
//           userId,
//           username.trim(),
//           ""
//         );


//       console.log(
//         "Room created:",
//         room.roomId
//       );


//       return res
//         .status(201)
//         .json({

//           roomId:
//             room.roomId,

//           userId,

//           role:
//             "HOST",

//         });

//     } catch (error) {

//       console.error(
//         "CREATE ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           message:
//             "Failed to create room",
//         });

//     }

//   }
// );


// /*
// ==================================================
// CHECK ROOM
// ==================================================
// */

// app.get(
//   "/api/rooms/:roomId",
//   (req, res) => {

//     try {

//       const roomId =
//         req.params.roomId
//           .trim()
//           .toUpperCase();


//       const room =
//         getRoom(
//           roomId
//         );


//       if (!room) {

//         return res
//           .status(404)
//           .json({
//             message:
//               "Room not found",
//           });

//       }


//       return res.json({

//         roomId:
//           room.roomId,

//         participantCount:
//           room.participants.size,

//       });

//     } catch (error) {

//       console.error(
//         "CHECK ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           message:
//             "Failed to check room",
//         });

//     }

//   }
// );


// /*
// ==================================================
// SOCKET SERVER
// ==================================================

// Bonus 1 OOP architecture.

// All Socket.IO event handling is now
// inside SocketServer.

// server.ts is responsible for:

// - Express
// - HTTP server
// - Socket.IO initialization
// - REST APIs
// - SocketServer initialization

// ==================================================
// */

// new SocketServer(
//   io
// );


// /*
// ==================================================
// UNKNOWN ROUTE
// ==================================================
// */

// app.use(
//   (_req, res) => {

//     res
//       .status(404)
//       .json({
//         message:
//           "API route not found",
//       });

//   }
// );


// /*
// ==================================================
// SERVER ERROR HANDLER
// ==================================================
// */

// app.use(
//   (
//     error: unknown,
//     _req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
//   ) => {

//     console.error(
//       "SERVER ERROR:",
//       error
//     );


//     res
//       .status(500)
//       .json({
//         message:
//           "Internal server error",
//       });

//   }
// );


// /*
// ==================================================
// START SERVER
// ==================================================
// */

// const PORT =
//   5000;


// // httpServer.listen(
// //   PORT,
// //   () => {

// //     console.log(
// //       `Server running on http://localhost:${PORT}`
// //     );

// //   }
// // );

// async function startServer(): Promise<void> {
//   try {
//     await connectDatabase();

//     httpServer.listen(
//       PORT,
//       () => {
//         console.log(
//           `Server running on http://localhost:${PORT}`
//         );
//       }
//     );

//   } catch (error) {

//     console.error(
//       "Failed to start server:",
//       error
//     );

//     process.exit(1);
//   }
// }

// startServer();







//
//
//









// import "dotenv/config";

// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { randomUUID } from "node:crypto";

// import { connectDatabase } from "./db/database";

// import {
//   createRoom,
//   getRoom,
// } from "./rooms/roomManager";

// import { SocketServer } from "./socket/socketServer";


// /*
// ==================================================
// EXPRESS APP
// ==================================================
// */

// const app =
//   express();


// /*
// ==================================================
// CORS
// ==================================================
// */

// app.use(
//   cors({
//     origin:
//       "http://localhost:5173",
//   })
// );


// app.use(
//   express.json()
// );


// /*
// ==================================================
// HTTP SERVER
// ==================================================
// */

// const httpServer =
//   createServer(app);


// /*
// ==================================================
// SOCKET.IO
// ==================================================
// */

// const io =
//   new Server(
//     httpServer,
//     {
//       cors: {
//         origin:
//           "http://localhost:5173",

//         methods: [
//           "GET",
//           "POST",
//         ],
//       },
//     }
//   );


// /*
// ==================================================
// HEALTH CHECK
// ==================================================
// */

// app.get(
//   "/",
//   (_req, res) => {

//     res.json({

//       message:
//         "YouTube Watch Party API is running",

//     });

//   }
// );


// /*
// ==================================================
// CREATE ROOM
// ==================================================
// */

// app.post(
//   "/api/rooms",
//   async (req, res) => {

//     console.log(
//       "POST /api/rooms"
//     );


//     console.log(
//       "Request body:",
//       req.body
//     );


//     try {

//       /*
//       ==================================================
//       GET USERNAME
//       ==================================================
//       */

//       const {
//         username,
//       } = req.body;


//       /*
//       ==================================================
//       VALIDATE USERNAME
//       ==================================================
//       */

//       if (
//         !username ||
//         typeof username !== "string" ||
//         !username.trim()
//       ) {

//         return res
//           .status(400)
//           .json({

//             message:
//               "Username is required",

//           });

//       }


//       /*
//       ==================================================
//       GENERATE USER ID
//       ==================================================
//       */

//       const userId =
//         randomUUID();


//       /*
//       ==================================================
//       CREATE ROOM
//       ==================================================

//       createRoom() is now asynchronous
//       because it also saves the room
//       into MongoDB.

//       Therefore we MUST use await.
//       ==================================================
//       */

//       const room =
//         await createRoom(
//           userId,
//           username.trim(),
//           ""
//         );


//       /*
//       ==================================================
//       LOG ROOM
//       ==================================================
//       */

//       console.log(
//         "Room created:",
//         room.roomId
//       );


//       /*
//       ==================================================
//       SEND RESPONSE
//       ==================================================
//       */

//       return res
//         .status(201)
//         .json({

//           roomId:
//             room.roomId,

//           userId:
//             userId,

//           role:
//             "HOST",

//         });

//     } catch (error) {

//       /*
//       ==================================================
//       CREATE ROOM ERROR
//       ==================================================
//       */

//       console.error(
//         "CREATE ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({

//           message:
//             "Failed to create room",

//         });

//     }

//   }
// );


// /*
// ==================================================
// CHECK ROOM
// ==================================================
// */

// app.get(
//   "/api/rooms/:roomId",
//   (req, res) => {

//     try {

//       /*
//       ==================================================
//       NORMALIZE ROOM ID
//       ==================================================
//       */

//       const roomId =
//         req.params.roomId
//           .trim()
//           .toUpperCase();


//       /*
//       ==================================================
//       FIND ROOM
//       ==================================================
//       */

//       const room =
//         getRoom(
//           roomId
//         );


//       /*
//       ==================================================
//       ROOM NOT FOUND
//       ==================================================
//       */

//       if (!room) {

//         return res
//           .status(404)
//           .json({

//             message:
//               "Room not found",

//           });

//       }


//       /*
//       ==================================================
//       RETURN ROOM INFO
//       ==================================================
//       */

//       return res.json({

//         roomId:
//           room.roomId,

//         participantCount:
//           room.participants.size,

//       });

//     } catch (error) {

//       console.error(
//         "CHECK ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({

//           message:
//             "Failed to check room",

//         });

//     }

//   }
// );


// /*
// ==================================================
// SOCKET SERVER
// ==================================================

// SocketServer handles:

// - Socket connections
// - Participants
// - Video synchronization
// - Room events
// - Host/moderator events

// server.ts handles:

// - Express
// - HTTP server
// - Socket.IO initialization
// - REST APIs
// - Database startup
// ==================================================
// */

// new SocketServer(
//   io
// );


// /*
// ==================================================
// UNKNOWN ROUTE
// ==================================================
// */

// app.use(
//   (_req, res) => {

//     res
//       .status(404)
//       .json({

//         message:
//           "API route not found",

//       });

//   }
// );


// /*
// ==================================================
// SERVER ERROR HANDLER
// ==================================================
// */

// app.use(
//   (
//     error: unknown,
//     _req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
//   ) => {

//     console.error(
//       "SERVER ERROR:",
//       error
//     );


//     res
//       .status(500)
//       .json({

//         message:
//           "Internal server error",

//       });

//   }
// );


// /*
// ==================================================
// SERVER PORT
// ==================================================
// */

// const PORT =
//   5000;


// /*
// ==================================================
// START SERVER
// ==================================================

// IMPORTANT:

// Database connection happens BEFORE
// the HTTP server starts accepting requests.

// This prevents requests from reaching
// the application before MongoDB is ready.
// ==================================================
// */

// async function startServer(): Promise<void> {

//   try {

//     /*
//     ==================================================
//     CONNECT TO MONGODB
//     ==================================================
//     */

//     await connectDatabase();


//     /*
//     ==================================================
//     START HTTP SERVER
//     ==================================================
//     */

//     httpServer.listen(
//       PORT,
//       () => {

//         console.log(
//           `Server running on http://localhost:${PORT}`
//         );

//       }
//     );

//   } catch (error) {

//     console.error(
//       "Failed to start server:",
//       error
//     );


//     /*
//     ==================================================
//     STOP APPLICATION
//     ==================================================
//     */

//     process.exit(1);

//   }

// }


// /*
// ==================================================
// BOOT APPLICATION
// ==================================================
// */

// startServer();









//
//
//
//
//
//
//
//





// import "dotenv/config";

// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { randomUUID } from "node:crypto";

// import { connectDatabase } from "./db/database";


// import {
//   createAdapter,
// } from "@socket.io/redis-adapter";

// import {
//   connectRedis,
//   redisClient,
//   redisSubscriber,
// } from "./db/redis";

// import {
//   createRoom,
//   getRoom,
// } from "./rooms/roomManager";

// import { SocketServer } from "./socket/socketServer";


// /*
// ==================================================
// EXPRESS APP
// ==================================================
// */

// const app =
//   express();


// /*
// ==================================================
// CORS
// ==================================================
// */


// //Change 1

// app.use(
//   cors({
//     origin:
//       "http://localhost:5173",
//   })
// );


// app.use(
//   express.json()
// );


// /*
// ==================================================
// HTTP SERVER
// ==================================================
// */

// const httpServer =
//   createServer(app);


// /*
// ==================================================
// SOCKET.IO
// ==================================================
// */

// const io =
//   new Server(
//     httpServer,
//     {
//       cors: {
//         origin:
//           "http://localhost:5173",

//         methods: [
//           "GET",
//           "POST",
//         ],
//       },
//     }
//   );

//   /*
// ==================================================
// SOCKET.IO REDIS ADAPTER
// ==================================================
// */

// io.adapter(
//   createAdapter(
//     redisClient,
//     redisSubscriber
//   )
// );


// /*
// ==================================================
// HEALTH CHECK
// ==================================================
// */

// app.get("/", (_req, res) => {
//   res.json({
//     message: "YouTube Watch Party API is running",
//     server: `Server running on port ${PORT}`,
//     processId: process.pid,
//   });
// });


// /*
// ==================================================
// CREATE ROOM
// ==================================================
// */

// app.post(
//   "/api/rooms",
//   async (req, res) => {

//     console.log(
//       "POST /api/rooms"
//     );


//     console.log(
//       "Request body:",
//       req.body
//     );


//     try {

//       /*
//       ==================================================
//       GET USERNAME
//       ==================================================
//       */

//       const {
//         username,
//       } = req.body;


//       /*
//       ==================================================
//       VALIDATE USERNAME
//       ==================================================
//       */

//       if (
//         !username ||
//         typeof username !== "string" ||
//         !username.trim()
//       ) {

//         return res
//           .status(400)
//           .json({

//             message:
//               "Username is required",

//           });

//       }


//       /*
//       ==================================================
//       GENERATE USER ID
//       ==================================================
//       */

//       const userId =
//         randomUUID();


//       /*
//       ==================================================
//       CREATE ROOM
//       ==================================================

//       createRoom() is asynchronous
//       because the room is also saved
//       into MongoDB.

//       Therefore we MUST use await.
//       ==================================================
//       */

//       const room =
//         await createRoom(
//           userId,
//           username.trim(),
//           ""
//         );


//       /*
//       ==================================================
//       LOG ROOM
//       ==================================================
//       */

//       console.log(
//         "Room created:",
//         room.roomId
//       );


//       /*
//       ==================================================
//       SEND RESPONSE
//       ==================================================
//       */

//       return res
//         .status(201)
//         .json({

//           roomId:
//             room.roomId,

//           userId:
//             userId,

//           role:
//             "HOST",

//         });

//     } catch (error) {

//       /*
//       ==================================================
//       CREATE ROOM ERROR
//       ==================================================
//       */

//       console.error(
//         "CREATE ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({

//           message:
//             "Failed to create room",

//         });

//     }

//   }
// );


// /*
// ==================================================
// CHECK ROOM
// ==================================================
// */

// app.get(
//   "/api/rooms/:roomId",
//   (req, res) => {

//     try {

//       /*
//       ==================================================
//       NORMALIZE ROOM ID
//       ==================================================
//       */

//       const roomId =
//         req.params.roomId
//           .trim()
//           .toUpperCase();


//       /*
//       ==================================================
//       FIND ROOM
//       ==================================================
//       */

//       const room =
//         getRoom(
//           roomId
//         );


//       /*
//       ==================================================
//       ROOM NOT FOUND
//       ==================================================
//       */

//       if (!room) {

//         return res
//           .status(404)
//           .json({

//             message:
//               "Room not found",

//           });

//       }


//       /*
//       ==================================================
//       RETURN ROOM INFO
//       ==================================================
//       */

//       return res.json({

//         roomId:
//           room.roomId,

//         participantCount:
//           room.participants.size,

//       });

//     } catch (error) {

//       console.error(
//         "CHECK ROOM ERROR:",
//         error
//       );


//       return res
//         .status(500)
//         .json({

//           message:
//             "Failed to check room",

//         });

//     }

//   }
// );


// /*
// ==================================================
// SOCKET SERVER
// ==================================================

// SocketServer handles:

// - Socket connections
// - Participants
// - Video synchronization
// - Room events
// - Host/moderator events

// server.ts handles:

// - Express
// - HTTP server
// - Socket.IO initialization
// - REST APIs
// - Database startup

// ==================================================
// */

// new SocketServer(
//   io
// );


// /*
// ==================================================
// UNKNOWN ROUTE
// ==================================================
// */

// app.use(
//   (_req, res) => {

//     res
//       .status(404)
//       .json({

//         message:
//           "API route not found",

//       });

//   }
// );


// /*
// ==================================================
// SERVER ERROR HANDLER
// ==================================================
// */

// app.use(
//   (
//     error: unknown,
//     _req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
//   ) => {

//     console.error(
//       "SERVER ERROR:",
//       error
//     );


//     res
//       .status(500)
//       .json({

//         message:
//           "Internal server error",

//       });

//   }
// );


// /*
// ==================================================
// SERVER PORT
// ==================================================
// */

// const PORT =
//   Number(process.env.PORT) || 5000;


// /*
// ==================================================
// START SERVER
// ==================================================

// IMPORTANT:

// Database connection happens BEFORE
// the HTTP server starts accepting requests.

// This prevents requests from reaching
// the application before MongoDB is ready.
// ==================================================
// */

// async function startServer(): Promise<void> {
//   try {

//     await connectDatabase();

//     await connectRedis();

//     httpServer.listen(
//       PORT,
//       () => {
//         console.log(
//           `Server running on http://localhost:${PORT}`
//         );
//       }
//     );

//   } catch (error) {

//     console.error(
//       "Failed to start server:",
//       error
//     );

//     process.exit(1);
//   }
// }


// /*
// ==================================================
// BOOT APPLICATION
// ==================================================
// */

// startServer();






import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

import { connectDatabase } from "./db/database";

import {
  createAdapter,
} from "@socket.io/redis-adapter";

import {
  connectRedis,
  redisClient,
  redisSubscriber,
} from "./db/redis";

import {
  createRoom,
  getRoom,
} from "./rooms/roomManager";

import { SocketServer } from "./socket/socketServer";


/*
==================================================
ENVIRONMENT CONFIGURATION
==================================================
*/

const PORT =
  Number(process.env.PORT) || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";


/*
==================================================
EXPRESS APP
==================================================
*/

const app =
  express();


/*
==================================================
CORS
==================================================
*/

app.use(
  cors({
    origin:
      FRONTEND_URL,
  })
);


app.use(
  express.json()
);


/*
==================================================
HTTP SERVER
==================================================
*/

const httpServer =
  createServer(app);


/*
==================================================
SOCKET.IO
==================================================
*/

const io =
  new Server(
    httpServer,
    {
      cors: {
        origin:
          FRONTEND_URL,

        methods: [
          "GET",
          "POST",
        ],
      },
    }
  );


/*
==================================================
SOCKET.IO REDIS ADAPTER
==================================================
*/

io.adapter(
  createAdapter(
    redisClient,
    redisSubscriber
  )
);


/*
==================================================
HEALTH CHECK
==================================================
*/

app.get(
  "/",
  (_req, res) => {

    res.json({
      message:
        "YouTube Watch Party API is running",

      server:
        `Server running on port ${PORT}`,

      processId:
        process.pid,
    });

  }
);


/*
==================================================
CREATE ROOM
==================================================
*/

app.post(
  "/api/rooms",
  async (req, res) => {

    console.log(
      "POST /api/rooms"
    );


    console.log(
      "Request body:",
      req.body
    );


    try {

      /*
      ==================================================
      GET USERNAME
      ==================================================
      */

      const {
        username,
      } = req.body;


      /*
      ==================================================
      VALIDATE USERNAME
      ==================================================
      */

      if (
        !username ||
        typeof username !== "string" ||
        !username.trim()
      ) {

        return res
          .status(400)
          .json({

            message:
              "Username is required",

          });

      }


      /*
      ==================================================
      GENERATE USER ID
      ==================================================
      */

      const userId =
        randomUUID();


      /*
      ==================================================
      CREATE ROOM
      ==================================================

      createRoom() is asynchronous
      because the room is also saved
      into MongoDB.

      Therefore we MUST use await.
      ==================================================
      */

      const room =
        await createRoom(
          userId,
          username.trim(),
          ""
        );


      /*
      ==================================================
      LOG ROOM
      ==================================================
      */

      console.log(
        "Room created:",
        room.roomId
      );


      /*
      ==================================================
      SEND RESPONSE
      ==================================================
      */

      return res
        .status(201)
        .json({

          roomId:
            room.roomId,

          userId:
            userId,

          role:
            "HOST",

        });

    } catch (error) {

      /*
      ==================================================
      CREATE ROOM ERROR
      ==================================================
      */

      console.error(
        "CREATE ROOM ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          message:
            "Failed to create room",

        });

    }

  }
);


/*
==================================================
CHECK ROOM
==================================================
*/

app.get(
  "/api/rooms/:roomId",
  (req, res) => {

    try {

      /*
      ==================================================
      NORMALIZE ROOM ID
      ==================================================
      */

      const roomId =
        req.params.roomId
          .trim()
          .toUpperCase();


      /*
      ==================================================
      FIND ROOM
      ==================================================
      */

      const room =
        getRoom(
          roomId
        );


      /*
      ==================================================
      ROOM NOT FOUND
      ==================================================
      */

      if (!room) {

        return res
          .status(404)
          .json({

            message:
              "Room not found",

          });

      }


      /*
      ==================================================
      RETURN ROOM INFO
      ==================================================
      */

      return res.json({

        roomId:
          room.roomId,

        participantCount:
          room.participants.size,

      });

    } catch (error) {

      console.error(
        "CHECK ROOM ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          message:
            "Failed to check room",

        });

    }

  }
);


/*
==================================================
SOCKET SERVER
==================================================

SocketServer handles:

- Socket connections
- Participants
- Video synchronization
- Room events
- Host/moderator events

server.ts handles:

- Express
- HTTP server
- Socket.IO initialization
- REST APIs
- Database startup

==================================================
*/

new SocketServer(
  io
);


/*
==================================================
UNKNOWN ROUTE
==================================================
*/

app.use(
  (_req, res) => {

    res
      .status(404)
      .json({

        message:
          "API route not found",

      });

  }
);


/*
==================================================
SERVER ERROR HANDLER
==================================================
*/

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

    console.error(
      "SERVER ERROR:",
      error
    );


    res
      .status(500)
      .json({

        message:
          "Internal server error",

      });

  }
);


/*
==================================================
START SERVER
==================================================

IMPORTANT:

Database connection happens BEFORE
the HTTP server starts accepting requests.

Redis connection also happens BEFORE
the HTTP server starts.

==================================================
*/

async function startServer(): Promise<void> {

  try {

    /*
    ==================================================
    CONNECT TO MONGODB
    ==================================================
    */

    await connectDatabase();


    /*
    ==================================================
    CONNECT TO REDIS
    ==================================================
    */

    await connectRedis();


    /*
    ==================================================
    START HTTP SERVER
    ==================================================
    */

    httpServer.listen(
      PORT,
      () => {

        console.log(
          `Server running on http://localhost:${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Failed to start server:",
      error
    );


    process.exit(1);

  }

}


/*
==================================================
BOOT APPLICATION
==================================================
*/

startServer();