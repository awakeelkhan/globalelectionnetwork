ALTER TABLE result_entries
  ALTER COLUMN candidate_id DROP NOT NULL,
  ALTER COLUMN party_id DROP NOT NULL,
  ALTER COLUMN polling_station_id DROP NOT NULL,
  ALTER COLUMN constituency_id DROP NOT NULL,
  ALTER COLUMN submitted_by SET DEFAULT 'admin';

-- Add district_name column if it doesn't exist
ALTER TABLE result_entries ADD COLUMN IF NOT EXISTS district_name text;
ALTER TABLE result_entries ADD COLUMN IF NOT EXISTS total_cast_votes integer;
ALTER TABLE result_entries ADD COLUMN IF NOT EXISTS is_winner boolean DEFAULT false;
ALTER TABLE result_entries ADD COLUMN IF NOT EXISTS is_runner_up boolean DEFAULT false;
