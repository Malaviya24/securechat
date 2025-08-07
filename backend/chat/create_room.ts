import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";
import { generateRoomId, hashPassword } from "./utils";
import type { CreateRoomRequest, CreateRoomResponse } from "./types";

// Creates a new password-protected chat room.
export const createRoom = api<CreateRoomRequest, CreateRoomResponse>(
  { expose: true, method: "POST", path: "/chat/rooms" },
  async (req) => {
    // Validate input
    if (!req.password || req.password.trim().length === 0) {
      throw APIError.invalidArgument("Password is required");
    }

    if (req.password.length < 4) {
      throw APIError.invalidArgument("Password must be at least 4 characters long");
    }

    if (req.password.length > 100) {
      throw APIError.invalidArgument("Password too long (max 100 characters)");
    }

    const themeMode = req.theme_mode || 'dark';
    if (!['dark', 'light'].includes(themeMode)) {
      throw APIError.invalidArgument("Invalid theme mode");
    }

    // Validate max participants
    let maxParticipants = req.max_participants;
    if (maxParticipants !== undefined) {
      if (maxParticipants < 2) {
        throw APIError.invalidArgument("Maximum participants must be at least 2");
      }
      if (maxParticipants > 50) {
        throw APIError.invalidArgument("Maximum participants cannot exceed 50");
      }
    }

    // Encryption is enabled by default
    const encryptionEnabled = req.enable_encryption !== false;

    // Clean up expired rooms first
    await chatDB.exec`DELETE FROM chat_rooms WHERE expires_at <= NOW()`;

    const roomId = generateRoomId();
    const passwordHash = hashPassword(req.password);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      await chatDB.exec`
        INSERT INTO chat_rooms (id, password_hash, expires_at, theme_mode, max_participants, current_participants, encryption_enabled)
        VALUES (${roomId}, ${passwordHash}, ${expiresAt}, ${themeMode}, ${maxParticipants}, 0, ${encryptionEnabled})
      `;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw APIError.internal("Failed to create chat room");
    }

    return { 
      roomId,
      encryptionEnabled
    };
  }
);
