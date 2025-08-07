-- Add deletion support to messages
ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP;

-- Create index for deleted messages
CREATE INDEX idx_messages_deleted ON messages(is_deleted);
