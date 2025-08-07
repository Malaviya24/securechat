-- Add automatic cleanup for expired messages and rooms
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired messages
  DELETE FROM messages WHERE expires_at <= NOW();
  
  -- Delete expired rooms
  DELETE FROM chat_rooms WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to be called periodically (this would be handled by a cron job in production)
-- For now, we'll rely on manual cleanup calls
