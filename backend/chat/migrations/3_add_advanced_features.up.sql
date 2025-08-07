-- Add theme mode to chat rooms
ALTER TABLE chat_rooms ADD COLUMN theme_mode TEXT DEFAULT 'dark';

-- Add message editing and pinning features
ALTER TABLE messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN original_content TEXT;

-- Create typing indicators table
CREATE TABLE typing_indicators (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_nickname TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for typing indicators
CREATE INDEX idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX idx_typing_indicators_timestamp ON typing_indicators(timestamp);

-- Add index for pinned messages
CREATE INDEX idx_messages_pinned ON messages(is_pinned);
