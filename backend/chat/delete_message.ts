import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { DeleteMessageRequest, Message } from "./types";

// Deletes a message within 3 seconds of sending (regret button).
export const deleteMessage = api<DeleteMessageRequest, void>(
  { expose: true, method: "DELETE", path: "/chat/messages/:messageId" },
  async (req) => {
    if (!req.messageId || req.messageId <= 0) {
      throw APIError.invalidArgument("Valid message ID is required");
    }

    if (!req.senderNickname || req.senderNickname.trim().length === 0) {
      throw APIError.invalidArgument("Sender nickname is required");
    }

    // Get the message and check if it can be deleted (within 3 seconds and by sender)
    const message = await chatDB.queryRow<Message>`
      SELECT * FROM messages 
      WHERE id = ${req.messageId} AND expires_at > NOW() AND is_deleted = FALSE
    `;

    if (!message) {
      throw APIError.notFound("Message not found, expired, or already deleted");
    }

    // Check if the message belongs to the sender
    if (message.sender_nickname !== req.senderNickname) {
      throw APIError.permissionDenied("You can only delete your own messages");
    }

    // Check if message is within 3 seconds of creation
    const now = new Date();
    const messageTime = new Date(message.created_at);
    const timeDiff = (now.getTime() - messageTime.getTime()) / 1000; // in seconds

    if (timeDiff > 3) {
      throw APIError.permissionDenied("Message can only be deleted within 3 seconds of sending");
    }

    // Mark message as deleted
    await chatDB.exec`
      UPDATE messages 
      SET is_deleted = TRUE, 
          deleted_at = NOW()
      WHERE id = ${req.messageId}
    `;
  }
);
