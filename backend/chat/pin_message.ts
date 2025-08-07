import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { PinMessageRequest, Message } from "./types";

// Pins or unpins a message in the chat room.
export const pinMessage = api<PinMessageRequest, void>(
  { expose: true, method: "POST", path: "/chat/messages/:messageId/pin" },
  async (req) => {
    if (!req.messageId || req.messageId <= 0) {
      throw APIError.invalidArgument("Valid message ID is required");
    }

    // Check if message exists and is not expired
    const message = await chatDB.queryRow<Message>`
      SELECT * FROM messages 
      WHERE id = ${req.messageId} AND expires_at > NOW()
    `;

    if (!message) {
      throw APIError.notFound("Message not found or expired");
    }

    await chatDB.exec`
      UPDATE messages 
      SET is_pinned = ${req.isPinned}
      WHERE id = ${req.messageId}
    `;
  }
);
