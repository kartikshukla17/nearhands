-- Migration script to allow NULL values in provider_id column
-- Run this in your PostgreSQL database

ALTER TABLE "ServiceRequests" ALTER COLUMN "provider_id" DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'ServiceRequests' AND column_name = 'provider_id';

