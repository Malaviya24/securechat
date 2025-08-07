-- Add encryption support to chat rooms
ALTER TABLE chat_rooms ADD COLUMN encryption_enabled BOOLEAN DEFAULT TRUE;

-- Add encryption flag to messages
ALTER TABLE messages ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE;

-- Create index for encrypted messages
CREATE INDEX idx_messages_encrypted ON messages(is_encrypted);
