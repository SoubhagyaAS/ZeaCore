-- Add api_key field to apps table
ALTER TABLE apps ADD COLUMN api_key TEXT;

-- Add feature_code field to app_features table
ALTER TABLE app_features ADD COLUMN feature_code TEXT;

-- Add comment to explain the purpose of these fields
COMMENT ON COLUMN apps.api_key IS 'API key for third-party app integration to fetch features and their codes';
COMMENT ON COLUMN app_features.feature_code IS 'Feature code from the source API that maps to this feature'; 