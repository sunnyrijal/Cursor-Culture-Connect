-- Drop the database with hyphen if it exists
DROP DATABASE IF EXISTS "culture-connect";

-- Create the database with underscore
CREATE DATABASE culture_connect;

-- Grant all privileges on the correct database
GRANT ALL PRIVILEGES ON DATABASE culture_connect TO postgres; 