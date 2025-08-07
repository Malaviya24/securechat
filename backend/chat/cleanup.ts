import { api } from "encore.dev/api";
import { chatDB } from "./db";

// Cleans up expired messages and rooms.
export const cleanup = api<void, void>(
  { expose: true, method: "POST", path: "/chat/cleanup" },
  async () => {
    // Delete expired messages
    await chatDB.exec`DELETE FROM messages WHERE expires_at <= NOW()`;
    
    // Delete expired rooms
    await chatDB.exec`DELETE FROM chat_rooms WHERE expires_at <= NOW()`;
  }
);
