# Supabase

This folder holds everything related to the Supabase backend for the
MMMUT Hockey Sports Platform:

- `schema.sql` — table definitions, relationships, and RLS policies
  (added incrementally as each data-driven module is built, starting
  in Phase 3).
- `seed.sql` — optional local seed data for development.
- `policies/` — Row Level Security policy definitions, one file per table.

The frontend never talks to Supabase directly from components — all
access goes through `src/services/`, which wraps the client defined in
`src/config/supabaseClient.js`.

No tables have been created yet. This folder is scaffolded now so the
architecture is in place per MASTER_PROMPT.md's Supabase Configuration
requirement for Phase 1.
