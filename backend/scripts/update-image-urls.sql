-- Rewrite an image/file URL base across every text column in the DB.
-- Works on any Postgres (local or Neon) via psql — no ORM needed.
--
-- Preview (rolls back, just prints counts):
--   psql "$DATABASE_URL" \
--     -v old='http://localhost:8080/uploads/' \
--     -v new='https://sit-backend.ttu.edu.vn/uploads/' \
--     -v dry=1 -f scripts/update-image-urls.sql
--
-- Apply for real:
--   psql "$DATABASE_URL" \
--     -v old='http://localhost:8080/uploads/' \
--     -v new='https://sit-backend.ttu.edu.vn/uploads/' \
--     -v dry=0 -f scripts/update-image-urls.sql

\if :{?dry} \else \set dry 0 \endif

BEGIN;
-- Pass psql vars into the PL/pgSQL block (psql does not substitute inside $$...$$).
SELECT set_config('img.old', :'old', true);
SELECT set_config('img.new', :'new', true);

DO $$
DECLARE
  r   RECORD;
  o   TEXT := current_setting('img.old');
  n   TEXT := current_setting('img.new');
  c   BIGINT;
  tot BIGINT := 0;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character')
  LOOP
    EXECUTE format(
      'UPDATE %I SET %I = replace(%I, $1, $2) WHERE %I LIKE $3',
      r.table_name, r.column_name, r.column_name, r.column_name)
      USING o, n, '%' || o || '%';
    GET DIAGNOSTICS c = ROW_COUNT;
    IF c > 0 THEN
      RAISE NOTICE '  %.% : % rows', r.table_name, r.column_name, c;
      tot := tot + c;
    END IF;
  END LOOP;
  RAISE NOTICE 'Total rows rewritten: %', tot;
END $$;

-- dry=1 -> preview only (undo); dry=0 -> commit.
\if :dry
  \echo '>>> DRY RUN: rolling back, no changes saved.'
  ROLLBACK;
\else
  COMMIT;
  \echo '>>> Committed.'
\endif
