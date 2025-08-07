import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { TypingRequest, GetTypingRequest, GetTypingResponse, TypingIndicator, ChatRoom } from "./types";

// Updates typing indicator for a user in a room.
export const updateTyping = api<TypingRequest, void>(
  { expose: true, method: "POST", path: "/chat/typing" },
  async (req) => {
    if (!req.roomId || !req.userNickname || !req.userAvatar) {
      throw APIError.invalidArgument("Missing required fields");
    }

    // Verify room exists and is not expired
    const room = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId} AND expires_at > NOW()
    `;

    if (!room) {
      throw APIError.notFound("Chat room not found or expired");
    }

    // Clean up old typing indicators (older than 5 seconds)
    await chatDB.exec`
      DELETE FROM typing_indicators 
      WHERE timestamp < NOW() - INTERVAL '5 seconds'
    `;

    // Remove existing typing indicator for this user in this room
    await chatDB.exec`
      DELETE FROM typing_indicators 
      WHERE room_id = ${req.roomId} AND user_nickname = ${req.userNickname}
    `;

    // Add new typing indicator
    await chatDB.exec`
      INSERT INTO typing_indicators (room_id, user_nickname, user_avatar)
      VALUES (${req.roomId}, ${req.userNickname}, ${req.userAvatar})
    `;
  }
);

// Gets current typing indicators for a room.
export const getTyping = api<GetTypingRequest, GetTypingResponse>(
  { expose: true, method: "GET", path: "/chat/rooms/:roomId/typing" },
  async (req) => {
    if (!req.roomId) {
      throw APIError.invalidArgument("Room ID is required");
    }

    // Clean up old typing indicators first
    await chatDB.exec`
      DELETE FROM typing_indicators 
      WHERE timestamp < NOW() - INTERVAL '5 seconds'
    `;

    const typingUsers = await chatDB.queryAll<TypingIndicator>`
      SELECT * FROM typing_indicators 
      WHERE room_id = ${req.roomId}
      ORDER BY timestamp DESC
    `;

    return { typingUsers };
  }
);
