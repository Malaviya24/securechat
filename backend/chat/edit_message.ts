import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { EditMessageRequest, Message } from "./types";

// Edits a message within 30 seconds of sending.
export const editMessage = api<EditMessageRequest, void>(
  { expose: true, method: "PUT", path: "/chat/messages/:messageId" },
  async (req) => {
    if (!req.messageId || req.messageId <= 0) {
      throw APIError.invalidArgument("Valid message ID is required");
    }

    if (!req.newContent || req.newContent.trim().length === 0) {
      throw APIError.invalidArgument("Message content cannot be empty");
    }

    if (req.newContent.length > 10000) { // Increased limit for encrypted content
      throw APIError.invalidArgument("Message content too long (max 10000 characters)");
    }

    // Get the message and check if it can be edited (within 30 seconds)
    const message = await chatDB.queryRow<Message>`
      SELECT * FROM messages 
      WHERE id = ${req.messageId} AND expires_at > NOW()
    `;

    if (!message) {
      throw APIError.notFound("Message not found or expired");
    }

    // Check if message is within 30 seconds of creation
    const now = new Date();
    const messageTime = new Date(message.created_at);
    const timeDiff = (now.getTime() - messageTime.getTime()) / 1000; // in seconds

    if (timeDiff > 30) {
      throw APIError.permissionDenied("Message can only be edited within 30 seconds of sending");
    }

    // Store original content if this is the first edit
    const originalContent = message.is_edited ? message.original_content : message.content;
    const isEncrypted = req.isEncrypted || message.is_encrypted;

    await chatDB.exec`
      UPDATE messages 
      SET content = ${req.newContent.trim()}, 
          is_edited = TRUE, 
          edited_at = NOW(),
          original_content = ${originalContent},
          is_encrypted = ${isEncrypted}
      WHERE id = ${req.messageId}
    `;
  }
);
