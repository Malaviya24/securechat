import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import type { UpdateThemeRequest, ChatRoom } from "./types";

// Updates the theme mode for a chat room.
export const updateTheme = api<UpdateThemeRequest, void>(
  { expose: true, method: "PUT", path: "/chat/rooms/:roomId/theme" },
  async (req) => {
    if (!req.roomId) {
      throw APIError.invalidArgument("Room ID is required");
    }

    if (!req.themeMode || !['dark', 'light'].includes(req.themeMode)) {
      throw APIError.invalidArgument("Valid theme mode is required (dark or light)");
    }

    // Verify room exists and is not expired
    const room = await chatDB.queryRow<ChatRoom>`
      SELECT * FROM chat_rooms WHERE id = ${req.roomId} AND expires_at > NOW()
    `;

    if (!room) {
      throw APIError.notFound("Chat room not found or expired");
    }

    await chatDB.exec`
      UPDATE chat_rooms 
      SET theme_mode = ${req.themeMode}
      WHERE id = ${req.roomId}
    `;
  }
);
