import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import { verifyPassword, generateRandomNickname, generateRandomAvatar } from "./utils";
import type { JoinRoomRequest, JoinRoomResponse, ChatRoom } from "./types";

// Joins a chat room with password verification.
export const joinRoom = api<JoinRoomRequest, JoinRoomResponse>(
  { expose: true, method: "POST", path: "/chat/rooms/join" },
  async (req) => {
    // Validate input
    if (!req.roomId || req.roomId.trim().length === 0) {
      throw APIError.invalidArgument("Room ID is required");
    }

    if (!req.password || req.password.trim().length === 0) {
      throw APIError.invalidArgument("Password is required");
    }

    // Clean up expired rooms first
    await chatDB.exec`DELETE FROM chat_rooms WHERE expires_at <= NOW()`;

    const room = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId.trim()} AND expires_at > NOW()
    `;

    if (!room) {
      throw APIError.notFound("Chat room not found or expired");
    }

    if (!verifyPassword(req.password, room.password_hash)) {
      throw APIError.permissionDenied("Invalid password");
    }

    // Check participant limit
    if (room.max_participants && room.current_participants >= room.max_participants) {
      throw APIError.resourceExhausted("Room has reached maximum participant limit");
    }

    const nickname = generateRandomNickname();
    const avatar = generateRandomAvatar();

    // Clean up old participants (inactive for more than 5 minutes)
    await chatDB.exec`
      DELETE FROM room_participants 
      WHERE room_id = ${req.roomId} AND last_seen < NOW() - INTERVAL '5 minutes'
    `;

    // Add or update participant
    await chatDB.exec`
      INSERT INTO room_participants (room_id, user_nickname, user_avatar, last_seen)
      VALUES (${req.roomId}, ${nickname}, ${avatar}, NOW())
      ON CONFLICT (room_id, user_nickname) 
      DO UPDATE SET last_seen = NOW(), user_avatar = ${avatar}
    `;

    // Get updated participant count
    const updatedRoom = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId}
    `;

    return {
      success: true,
      nickname: nickname,
      avatar: avatar,
      theme_mode: room.theme_mode || 'dark',
      current_participants: updatedRoom?.current_participants || 0,
      max_participants: room.max_participants,
      encryption_enabled: room.encryption_enabled
    };
  }
);
