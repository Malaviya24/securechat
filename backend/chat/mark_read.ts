import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { MarkMessageReadRequest } from "./types";

// Marks a message as read to start the self-destruct timer.
export const markMessageRead = api<MarkMessageReadRequest, void>(
  { expose: true, method: "POST", path: "/chat/messages/:messageId/read" },
  async (req) => {
    if (!req.messageId || req.messageId <= 0) {
      throw APIError.invalidArgument("Valid message ID is required");
    }

    // Check if message exists and is not expired
    const message = await chatDB.queryRow<{ id: number; read_at: Date | null }>`
      SELECT id, read_at FROM messages 
      WHERE id = ${req.messageId} AND expires_at > NOW()
    `;

    if (!message) {
      throw APIError.notFound("Message not found or expired");
    }

    // Only mark as read if not already read
    if (!message.read_at) {
      await chatDB.exec`
        UPDATE messages 
        SET read_at = NOW() 
        WHERE id = ${req.messageId} AND read_at IS NULL
      `;
    }
  }
);
