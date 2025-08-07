import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { LeaveRoomRequest } from "./types";

// Removes a participant from a chat room.
export const leaveRoom = api<LeaveRoomRequest, void>(
  { expose: true, method: "POST", path: "/chat/rooms/leave" },
  async (req) => {
    if (!req.roomId || !req.userNickname) {
      throw APIError.invalidArgument("Room ID and user nickname are required");
    }

    // Remove participant from room
    await chatDB.exec`
      DELETE FROM room_participants 
      WHERE room_id = ${req.roomId} AND user_nickname = ${req.userNickname}
    `;
  }
);
