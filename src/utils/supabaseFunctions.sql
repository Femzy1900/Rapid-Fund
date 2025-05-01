
-- This file is for reference only. These functions need to be created in the Supabase SQL editor.

-- Function to update campaign stats when a donation is made
CREATE OR REPLACE FUNCTION update_campaign_stats(campaign_id UUID, donation_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE campaigns
  SET 
    raised_amount = raised_amount + donation_amount,
    donors_count = donors_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user donation stats
CREATE OR REPLACE FUNCTION update_user_donation_stats(user_id UUID, donation_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET total_donated = total_donated + donation_amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign count for a user when they create a campaign
CREATE OR REPLACE FUNCTION increment_user_campaign_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET campaigns_created = campaigns_created + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically increment campaign count when a new campaign is created
CREATE OR REPLACE FUNCTION handle_new_campaign()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_user_campaign_count(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new campaign creation
CREATE TRIGGER on_campaign_created
  AFTER INSERT ON campaigns
  FOR EACH ROW EXECUTE FUNCTION handle_new_campaign();
