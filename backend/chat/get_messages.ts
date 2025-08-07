import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { GetMessagesRequest, GetMessagesResponse, Message, ChatRoom } from "./types";

// Retrieves all messages for a chat room.
export const getMessages = api<GetMessagesRequest, GetMessagesResponse>(
  { expose: true, method: "GET", path: "/chat/rooms/:roomId/messages" },
  async (req) => {
    if (!req.roomId) {
      throw APIError.invalidArgument("Room ID is required");
    }

    // Verify room exists and is not expired
    const room = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId} AND expires_at > NOW()
    `;

    if (!room) {
      throw APIError.notFound("Chat room not found or expired");
    }

    // Clean up expired messages first
    await chatDB.exec`DELETE FROM messages WHERE expires_at <= NOW()`;

    // Get messages that are not deleted
    const messages = await chatDB.queryAll<Message>`
      SELECT * FROM messages 
      WHERE room_id = ${req.roomId} AND expires_at > NOW() AND is_deleted = FALSE
      ORDER BY created_at ASC
    `;

    return { messages };
  }
);
