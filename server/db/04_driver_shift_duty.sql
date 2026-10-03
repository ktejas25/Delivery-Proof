-- Migration: Add duty_status and shift tracking to drivers table
ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS duty_status ENUM('available', 'break', 'off_duty') NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS shift_status ENUM('not_started', 'active', 'ended') NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS shift_started_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shift_ended_at TIMESTAMP NULL DEFAULT NULL;
