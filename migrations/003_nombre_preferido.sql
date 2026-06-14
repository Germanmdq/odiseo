-- Run this in the Supabase SQL editor
-- Adds nombre_preferido column to profiles table

alter table public.profiles
  add column if not exists nombre_preferido text;
