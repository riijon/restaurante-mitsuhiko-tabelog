-- Migration: Add user_icon column to reviews table
ALTER TABLE reviews ADD COLUMN user_icon TEXT DEFAULT '👤';
