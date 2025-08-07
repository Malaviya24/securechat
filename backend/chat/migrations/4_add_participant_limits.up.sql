-- Add participant limits to chat rooms
ALTER TABLE chat_rooms ADD COLUMN max_participants INTEGER;
ALTER TABLE chat_rooms ADD COLUMN current_participants INTEGER DEFAULT 0;

-- Create room participants table
CREATE TABLE room_participants (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_nickname TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_nickname)
);

-- Create indexes for room participants
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_last_seen ON room_participants(last_seen);

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_rooms 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_rooms 
    SET current_participants = GREATEST(0, current_participants - 1) 
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for participant count
CREATE TRIGGER participant_count_trigger
  AFTER INSERT OR DELETE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION update_participant_count();
