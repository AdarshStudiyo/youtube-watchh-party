import { createClient } from "redis";

const redisUrl =
  process.env.REDIS_URL ||
  "redis://localhost:6379";


/*
==================================================
REDIS PUBLISHER
==================================================
*/

export const redisClient =
  createClient({
    url: redisUrl,
  });


/*
==================================================
REDIS SUBSCRIBER
==================================================

Socket.IO Redis Adapter needs
a separate subscriber connection.
==================================================
*/

export const redisSubscriber =
  redisClient.duplicate();


/*
==================================================
ERROR HANDLERS
==================================================
*/

redisClient.on(
  "error",
  (error) => {
    console.error(
      "Redis Client Error:",
      error
    );
  }
);


redisSubscriber.on(
  "error",
  (error) => {
    console.error(
      "Redis Subscriber Error:",
      error
    );
  }
);


/*
==================================================
CONNECT REDIS
==================================================
*/

export async function connectRedis(): Promise<void> {

  /*
   * Connect publisher
   */

  if (
    !redisClient.isOpen
  ) {
    await redisClient.connect();
  }


  /*
   * Connect subscriber
   */

  if (
    !redisSubscriber.isOpen
  ) {
    await redisSubscriber.connect();
  }


  console.log(
    "Redis connected successfully"
  );
}