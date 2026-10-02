export type Role =
  | "HOST"
  | "MODERATOR"
  | "PARTICIPANT";


export class Participant {
  public userId: string;
  public username: string;
  public role: Role;
  public socketId: string;

  constructor(
    userId: string,
    username: string,
    role: Role,
    socketId: string
  ) {
    this.userId = userId;
    this.username = username;
    this.role = role;
    this.socketId = socketId;
  }

  updateSocket(
    socketId: string
  ): void {
    this.socketId = socketId;
  }

  updateUsername(
    username: string
  ): void {
    if (username.trim()) {
      this.username = username.trim();
    }
  }

  clearSocket(
    socketId: string
  ): boolean {

    /*
     * Only clear the socket if
     * this is still the active socket.
     */

    if (
      this.socketId !== socketId
    ) {
      return false;
    }

    this.socketId = "";

    return true;
  }

  makeModerator(): void {
    if (
      this.role !== "HOST"
    ) {
      this.role = "MODERATOR";
    }
  }

  makeParticipant(): void {
    if (
      this.role !== "HOST"
    ) {
      this.role = "PARTICIPANT";
    }
  }

  makeHost(): void {
    this.role = "HOST";
  }
}