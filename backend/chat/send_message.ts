import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { SendMessageRequest, SendMessageResponse, ChatRoom } from "./types";

// Sends a message to a chat room.
export const sendMessage = api<SendMessageRequest, SendMessageResponse>(
  { expose: true, method: "POST", path: "/chat/messages" },
  async (req) => {
    // Validate input
    if (!req.content || req.content.trim().length === 0) {
      throw APIError.invalidArgument("Message content cannot be empty");
    }

    if (req.content.length > 10000) { // Increased limit for encrypted content
      throw APIError.invalidArgument("Message content too long (max 10000 characters)");
    }

    if (!req.roomId || !req.senderNickname || !req.senderAvatar) {
      throw APIError.invalidArgument("Missing required fields");
    }

    // Verify room exists and is not expired
    const room = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId} AND expires_at > NOW()
    `;

    if (!room) {
      throw APIError.notFound("Chat room not found or expired");
    }

    // Messages expire 10 minutes after creation (not after being read)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const isEncrypted = req.isEncrypted || false;

    const result = await chatDB.queryRow<{ id: number }>`
      INSERT INTO messages (room_id, content, sender_nickname, sender_avatar, expires_at, is_encrypted)
      VALUES (${req.roomId}, ${req.content.trim()}, ${req.senderNickname}, ${req.senderAvatar}, ${expiresAt}, ${isEncrypted})
      RETURNING id
    `;

    if (!result) {
      throw APIError.internal("Failed to create message");
    }

    return { messageId: result.id };
  }
);
