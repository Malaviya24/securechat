export interface ChatRoom {
  id: string;
  password_hash: string;
  created_at: Date;
  expires_at: Date;
  theme_mode?: 'dark' | 'light';
  max_participants?: number;
  current_participants: number;
  encryption_enabled: boolean;
}

export interface Message {
  id: number;
  room_id: string;
  content: string;
  sender_nickname: string;
  sender_avatar: string;
  created_at: Date;
  expires_at: Date;
  read_at?: Date;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at?: Date;
  original_content?: string;
  is_encrypted: boolean;
  is_deleted: boolean;
  deleted_at?: Date;
}

export interface TypingIndicator {
  room_id: string;
  user_nickname: string;
  user_avatar: string;
  timestamp: Date;
}

export interface RoomParticipant {
  id: number;
  room_id: string;
  user_nickname: string;
  user_avatar: string;
  joined_at: Date;
  last_seen: Date;
}

export interface CreateRoomRequest {
  password: string;
  theme_mode?: 'dark' | 'light';
  max_participants?: number;
  enable_encryption?: boolean;
}

export interface CreateRoomResponse {
  roomId: string;
  encryptionEnabled: boolean;
}

export interface JoinRoomRequest {
  roomId: string;
  password: string;
}

export interface JoinRoomResponse {
  success: boolean;
  nickname: string;
  avatar: string;
  theme_mode?: 'dark' | 'light';
  current_participants: number;
  max_participants?: number;
  encryption_enabled: boolean;
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  senderNickname: string;
  senderAvatar: string;
  isEncrypted?: boolean;
}

export interface SendMessageResponse {
  messageId: number;
}

export interface GetMessagesRequest {
  roomId: string;
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface MarkMessageReadRequest {
  messageId: number;
}

export interface EditMessageRequest {
  messageId: number;
  newContent: string;
  isEncrypted?: boolean;
}

export interface PinMessageRequest {
  messageId: number;
  isPinned: boolean;
}

export interface DeleteMessageRequest {
  messageId: number;
  senderNickname: string;
}

export interface TypingRequest {
  roomId: string;
  userNickname: string;
  userAvatar: string;
}

export interface GetTypingRequest {
  roomId: string;
}

export interface GetTypingResponse {
  typingUsers: TypingIndicator[];
}

export interface UpdateThemeRequest {
  roomId: string;
  themeMode: 'dark' | 'light';
}

export interface LeaveRoomRequest {
  roomId: string;
  userNickname: string;
}
