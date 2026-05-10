-- Migration 009: Change residence duration columns to text
-- Residence date ranges are researcher-entered free text (e.g. "1930", "abt 1920"),
-- not ISO dates. Changing from date to text to match the platform's date philosophy.
-- Run after sql/008-add-timeline-addresses.sql
-- TIMESTAMP: 2026-05-11 00:45 UTC

alter table timeline_events
  alter column residence_date_from type text using residence_date_from::text;

alter table timeline_events
  alter column residence_date_to type text using residence_date_to::text;

alter table timeline_events
  alter column residence_from_qualifier type text;

alter table timeline_events
  alter column residence_to_qualifier type text;
