import {
  Participant,
} from "./Participant";


export class Room {
  public readonly roomId: string;

  public hostUserId: string;

  public participants:
    Map<string, Participant>;

  public videoId:
    string | null;

  public playState:
    "playing" | "paused";

  public currentTime: number;

  public updatedAt: number;


  constructor(
    roomId: string,
    hostUserId: string,
    hostUsername: string,
    hostSocketId: string
  ) {

    this.roomId =
      roomId;

    this.hostUserId =
      hostUserId;

    this.participants =
      new Map();

    this.videoId =
      null;

    this.playState =
      "paused";

    this.currentTime =
      0;

    this.updatedAt =
      Date.now();


    const host =
      new Participant(
        hostUserId,
        hostUsername,
        "HOST",
        hostSocketId
      );


    this.participants.set(
      hostUserId,
      host
    );
  }


  // ==================================================
  // PARTICIPANTS
  // ==================================================

  getParticipant(
    userId: string
  ): Participant | undefined {

    return this.participants.get(
      userId
    );
  }


  addParticipant(
    userId: string,
    username: string,
    socketId: string
  ): Participant {

    const participant =
      new Participant(
        userId,
        username,
        "PARTICIPANT",
        socketId
      );

    this.participants.set(
      userId,
      participant
    );

    this.touch();

    return participant;
  }


  removeParticipant(
    userId: string
  ): Participant | undefined {

    /*
     * Host cannot be removed
     * through this method.
     */

    if (
      userId ===
      this.hostUserId
    ) {
      return undefined;
    }

    const participant =
      this.participants.get(
        userId
      );

    if (!participant) {
      return undefined;
    }

    this.participants.delete(
      userId
    );

    this.touch();

    return participant;
  }


  getParticipants():
    Participant[] {

    return Array.from(
      this.participants.values()
    );
  }


  // ==================================================
  // SOCKET
  // ==================================================

  updateParticipantSocket(
    userId: string,
    socketId: string,
    username?: string
  ): Participant | undefined {

    const participant =
      this.getParticipant(
        userId
      );

    if (!participant) {
      return undefined;
    }

    participant.updateSocket(
      socketId
    );

    if (
      username &&
      username.trim()
    ) {
      participant.updateUsername(
        username
      );
    }

    this.touch();

    return participant;
  }


  clearParticipantSocket(
    userId: string,
    socketId: string
  ): boolean {

    const participant =
      this.getParticipant(
        userId
      );

    if (!participant) {
      return false;
    }

    const cleared =
      participant.clearSocket(
        socketId
      );

    if (cleared) {
      this.touch();
    }

    return cleared;
  }


  // ==================================================
  // ROLES
  // ==================================================

  makeModerator(
    userId: string
  ): Participant | undefined {

    const participant =
      this.getParticipant(
        userId
      );

    if (!participant) {
      return undefined;
    }

    /*
     * Host cannot become moderator.
     */

    if (
      userId ===
      this.hostUserId
    ) {
      return participant;
    }

    participant.makeModerator();

    this.touch();

    return participant;
  }


  makeParticipant(
    userId: string
  ): Participant | undefined {

    const participant =
      this.getParticipant(
        userId
      );

    if (!participant) {
      return undefined;
    }

    /*
     * Host always remains host.
     */

    if (
      userId ===
      this.hostUserId
    ) {
      return participant;
    }

    participant.makeParticipant();

    this.touch();

    return participant;
  }


  transferHost(
    newHostUserId: string
  ): boolean {

    const newHost =
      this.getParticipant(
        newHostUserId
      );

    if (!newHost) {
      return false;
    }

    /*
     * Cannot transfer to yourself.
     */

    if (
      newHostUserId ===
      this.hostUserId
    ) {
      return false;
    }

    const oldHost =
      this.getParticipant(
        this.hostUserId
      );

    if (oldHost) {
      oldHost.makeParticipant();
    }

    this.hostUserId =
      newHostUserId;

    newHost.makeHost();

    this.touch();

    return true;
  }


  // ==================================================
  // VIDEO
  // ==================================================

  setVideo(
    videoId: string
  ): void {

    this.videoId =
      videoId;

    this.playState =
      "paused";

    this.currentTime =
      0;

    this.touch();
  }


  updateVideo(
    action:
      "play" |
      "pause" |
      "seek",
    currentTime: number
  ): void {

    if (
      action === "play"
    ) {
      this.playState =
        "playing";

      this.currentTime =
        currentTime;
    }

    if (
      action === "pause"
    ) {
      this.playState =
        "paused";

      this.currentTime =
        currentTime;
    }

    if (
      action === "seek"
    ) {
      this.currentTime =
        currentTime;
    }

    this.touch();
  }


  // ==================================================
  // ROOM LIFECYCLE
  // ==================================================

  isEmpty(): boolean {

    return (
      this.participants.size ===
      0
    );
  }


  removeHostFromEmptyRoom(
    userId: string
  ): Participant | undefined {

    /*
     * Only actual host.
     */

    if (
      userId !==
      this.hostUserId
    ) {
      return undefined;
    }

    /*
     * Host can only leave
     * when alone.
     */

    if (
      this.participants.size !==
      1
    ) {
      return undefined;
    }

    const host =
      this.getParticipant(
        userId
      );

    if (!host) {
      return undefined;
    }

    this.participants.delete(
      userId
    );

    this.touch();

    return host;
  }


  // ==================================================
  // TIMESTAMP
  // ==================================================

  private touch(): void {

    this.updatedAt =
      Date.now();
  }
}