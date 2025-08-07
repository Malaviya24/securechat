import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";

interface UpdateActivityRequest {
  roomId: string;
  userNickname: string;
}

// Updates participant's last seen timestamp.
export const updateParticipantActivity = api<UpdateActivityRequest, void>(
  { expose: true, method: "POST", path: "/chat/participants/activity" },
  async (req) => {
    if (!req.roomId || !req.userNickname) {
      throw APIError.invalidArgument("Room ID and user nickname are required");
    }

    // Update last seen timestamp
    await chatDB.exec`
      UPDATE room_participants 
      SET last_seen = NOW()
      WHERE room_id = ${req.roomId} AND user_nickname = ${req.userNickname}
    `;

    // Clean up old participants (inactive for more than 5 minutes)
    await chatDB.exec`
      DELETE FROM room_participants 
      WHERE room_id = ${req.roomId} AND last_seen < NOW() - INTERVAL '5 minutes'
    `;
  }
);
