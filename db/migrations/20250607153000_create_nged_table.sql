-- +goose Up
-- +goose StatementBegin
-- NGED 11kV overhead lines
CREATE TABLE public.ext_nged_11kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX ext_nged_11kv_overhead_lines_geometry_idx ON public.ext_nged_11kv_overhead_lines USING gist (geometry);

CREATE INDEX ext_nged_11kv_overhead_lines_geometry_3857_idx ON public.ext_nged_11kv_overhead_lines USING gist (geometry_3857);

CREATE INDEX ext_nged_11kv_overhead_lines_geometry_27700_idx ON public.ext_nged_11kv_overhead_lines USING gist (geometry_27700);

CREATE INDEX ext_nged_11kv_overhead_lines_voltage_idx ON public.ext_nged_11kv_overhead_lines USING btree (voltage);

CREATE INDEX ext_nged_11kv_overhead_lines_situation_idx ON public.ext_nged_11kv_overhead_lines USING btree (situation);

CREATE UNIQUE INDEX ext_nged_11kv_overhead_lines_uuid ON public.ext_nged_11kv_overhead_lines USING btree (uuid);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nged_11kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- NGED 33kV overhead lines
CREATE TABLE public.ext_nged_33kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX ext_nged_33kv_overhead_lines_geometry_idx ON public.ext_nged_33kv_overhead_lines USING gist (geometry);

CREATE INDEX ext_nged_33kv_overhead_lines_geometry_3857_idx ON public.ext_nged_33kv_overhead_lines USING gist (geometry_3857);

CREATE INDEX ext_nged_33kv_overhead_lines_geometry_27700_idx ON public.ext_nged_33kv_overhead_lines USING gist (geometry_27700);

CREATE INDEX ext_nged_33kv_overhead_lines_voltage_idx ON public.ext_nged_33kv_overhead_lines USING btree (voltage);

CREATE INDEX ext_nged_33kv_overhead_lines_situation_idx ON public.ext_nged_33kv_overhead_lines USING btree (situation);

CREATE UNIQUE INDEX ext_nged_33kv_overhead_lines_uuid ON public.ext_nged_33kv_overhead_lines USING btree (uuid);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nged_33kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- NGED 66kV overhead lines
CREATE TABLE public.ext_nged_66kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX ext_nged_66kv_overhead_lines_geometry_idx ON public.ext_nged_66kv_overhead_lines USING gist (geometry);

CREATE INDEX ext_nged_66kv_overhead_lines_geometry_3857_idx ON public.ext_nged_66kv_overhead_lines USING gist (geometry_3857);

CREATE INDEX ext_nged_66kv_overhead_lines_geometry_27700_idx ON public.ext_nged_66kv_overhead_lines USING gist (geometry_27700);

CREATE INDEX ext_nged_66kv_overhead_lines_voltage_idx ON public.ext_nged_66kv_overhead_lines USING btree (voltage);

CREATE INDEX ext_nged_66kv_overhead_lines_situation_idx ON public.ext_nged_66kv_overhead_lines USING btree (situation);

CREATE UNIQUE INDEX ext_nged_66kv_overhead_lines_uuid ON public.ext_nged_66kv_overhead_lines USING btree (uuid);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nged_66kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- NGED 132kV overhead lines
CREATE TABLE public.ext_nged_132kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX ext_nged_132kv_overhead_lines_geometry_idx ON public.ext_nged_132kv_overhead_lines USING gist (geometry);

CREATE INDEX ext_nged_132kv_overhead_lines_geometry_3857_idx ON public.ext_nged_132kv_overhead_lines USING gist (geometry_3857);

CREATE INDEX ext_nged_132kv_overhead_lines_geometry_27700_idx ON public.ext_nged_132kv_overhead_lines USING gist (geometry_27700);

CREATE INDEX ext_nged_132kv_overhead_lines_voltage_idx ON public.ext_nged_132kv_overhead_lines USING btree (voltage);

CREATE INDEX ext_nged_132kv_overhead_lines_situation_idx ON public.ext_nged_132kv_overhead_lines USING btree (situation);

CREATE UNIQUE INDEX ext_nged_132kv_overhead_lines_uuid ON public.ext_nged_132kv_overhead_lines USING btree (uuid);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nged_132kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- Create materialized view for int_powerlines
DROP MATERIALIZED VIEW IF EXISTS public.int_powerlines;

CREATE MATERIALIZED VIEW public.int_powerlines AS
SELECT
    ext_enw_132kv_overhead_lines.uuid,
    ext_enw_132kv_overhead_lines.geometry,
    ext_enw_132kv_overhead_lines.geometry_3857,
    ext_enw_132kv_overhead_lines.voltage,
    ext_enw_132kv_overhead_lines.situation,
    ext_enw_132kv_overhead_lines.first_imported_at,
    ext_enw_132kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_132kv_overhead_lines
UNION ALL
SELECT
    ext_enw_33kv_overhead_lines.uuid,
    ext_enw_33kv_overhead_lines.geometry,
    ext_enw_33kv_overhead_lines.geometry_3857,
    ext_enw_33kv_overhead_lines.voltage,
    ext_enw_33kv_overhead_lines.situation,
    ext_enw_33kv_overhead_lines.first_imported_at,
    ext_enw_33kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_33kv_overhead_lines
UNION ALL
SELECT
    ext_enw_11kv_overhead_lines.uuid,
    ext_enw_11kv_overhead_lines.geometry,
    ext_enw_11kv_overhead_lines.geometry_3857,
    ext_enw_11kv_overhead_lines.voltage,
    ext_enw_11kv_overhead_lines.situation,
    ext_enw_11kv_overhead_lines.first_imported_at,
    ext_enw_11kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_11kv_overhead_lines
UNION ALL
SELECT
    ext_enw_6_6kv_overhead_lines.uuid,
    ext_enw_6_6kv_overhead_lines.geometry,
    ext_enw_6_6kv_overhead_lines.geometry_3857,
    ext_enw_6_6kv_overhead_lines.voltage,
    ext_enw_6_6kv_overhead_lines.situation,
    ext_enw_6_6kv_overhead_lines.first_imported_at,
    ext_enw_6_6kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_6_6kv_overhead_lines
UNION ALL
SELECT
    ext_enw_low_voltage_overhead_lines.uuid,
    ext_enw_low_voltage_overhead_lines.geometry,
    ext_enw_low_voltage_overhead_lines.geometry_3857,
    ext_enw_low_voltage_overhead_lines.voltage,
    ext_enw_low_voltage_overhead_lines.situation,
    ext_enw_low_voltage_overhead_lines.first_imported_at,
    ext_enw_low_voltage_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_low_voltage_overhead_lines
UNION ALL
SELECT
    ext_nged_11kv_overhead_lines.uuid,
    ext_nged_11kv_overhead_lines.geometry,
    ext_nged_11kv_overhead_lines.geometry_3857,
    ext_nged_11kv_overhead_lines.voltage,
    ext_nged_11kv_overhead_lines.situation,
    ext_nged_11kv_overhead_lines.first_imported_at,
    ext_nged_11kv_overhead_lines.last_imported_at,
    'NGED'::public.dno AS dno
FROM
    public.ext_nged_11kv_overhead_lines
UNION ALL
SELECT
    ext_nged_33kv_overhead_lines.uuid,
    ext_nged_33kv_overhead_lines.geometry,
    ext_nged_33kv_overhead_lines.geometry_3857,
    ext_nged_33kv_overhead_lines.voltage,
    ext_nged_33kv_overhead_lines.situation,
    ext_nged_33kv_overhead_lines.first_imported_at,
    ext_nged_33kv_overhead_lines.last_imported_at,
    'NGED'::public.dno AS dno
FROM
    public.ext_nged_33kv_overhead_lines
UNION ALL
SELECT
    ext_nged_66kv_overhead_lines.uuid,
    ext_nged_66kv_overhead_lines.geometry,
    ext_nged_66kv_overhead_lines.geometry_3857,
    ext_nged_66kv_overhead_lines.voltage,
    ext_nged_66kv_overhead_lines.situation,
    ext_nged_66kv_overhead_lines.first_imported_at,
    ext_nged_66kv_overhead_lines.last_imported_at,
    'NGED'::public.dno AS dno
FROM
    public.ext_nged_66kv_overhead_lines
UNION ALL
SELECT
    ext_nged_132kv_overhead_lines.uuid,
    ext_nged_132kv_overhead_lines.geometry,
    ext_nged_132kv_overhead_lines.geometry_3857,
    ext_nged_132kv_overhead_lines.voltage,
    ext_nged_132kv_overhead_lines.situation,
    ext_nged_132kv_overhead_lines.first_imported_at,
    ext_nged_132kv_overhead_lines.last_imported_at,
    'NGED'::public.dno AS dno
FROM
    public.ext_nged_132kv_overhead_lines
UNION ALL
SELECT
    ext_nget_overhead_lines.uuid,
    ext_nget_overhead_lines.geometry,
    ext_nget_overhead_lines.geometry_3857,
    ext_nget_overhead_lines.voltage,
    ext_nget_overhead_lines.situation,
    ext_nget_overhead_lines.first_imported_at,
    ext_nget_overhead_lines.last_imported_at,
    'NGET'::public.dno AS dno
FROM
    public.ext_nget_overhead_lines
UNION ALL
SELECT
    ext_npg_extra_high_voltage_lines.uuid,
    ext_npg_extra_high_voltage_lines.geometry,
    ext_npg_extra_high_voltage_lines.geometry_3857,
    ext_npg_extra_high_voltage_lines.voltage,
    ext_npg_extra_high_voltage_lines.situation,
    ext_npg_extra_high_voltage_lines.first_imported_at,
    ext_npg_extra_high_voltage_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_extra_high_voltage_lines
UNION ALL
SELECT
    ext_npg_high_voltage_overhead_lines.uuid,
    ext_npg_high_voltage_overhead_lines.geometry,
    ext_npg_high_voltage_overhead_lines.geometry_3857,
    ext_npg_high_voltage_overhead_lines.voltage,
    ext_npg_high_voltage_overhead_lines.situation,
    ext_npg_high_voltage_overhead_lines.first_imported_at,
    ext_npg_high_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_high_voltage_overhead_lines
UNION ALL
SELECT
    ext_npg_low_voltage_overhead_lines.uuid,
    ext_npg_low_voltage_overhead_lines.geometry,
    ext_npg_low_voltage_overhead_lines.geometry_3857,
    ext_npg_low_voltage_overhead_lines.voltage,
    ext_npg_low_voltage_overhead_lines.situation,
    ext_npg_low_voltage_overhead_lines.first_imported_at,
    ext_npg_low_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_low_voltage_overhead_lines
UNION ALL
SELECT
    ext_ssen_transmission_overhead_line_supergrid.uuid,
    ext_ssen_transmission_overhead_line_supergrid.geometry,
    ext_ssen_transmission_overhead_line_supergrid.geometry_3857,
    ext_ssen_transmission_overhead_line_supergrid.voltage,
    ext_ssen_transmission_overhead_line_supergrid.situation,
    ext_ssen_transmission_overhead_line_supergrid.first_imported_at,
    ext_ssen_transmission_overhead_line_supergrid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_overhead_line_supergrid
UNION ALL
SELECT
    ext_ssen_transmission_overhead_line_grid.uuid,
    ext_ssen_transmission_overhead_line_grid.geometry,
    ext_ssen_transmission_overhead_line_grid.geometry_3857,
    ext_ssen_transmission_overhead_line_grid.voltage,
    ext_ssen_transmission_overhead_line_grid.situation,
    ext_ssen_transmission_overhead_line_grid.first_imported_at,
    ext_ssen_transmission_overhead_line_grid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_overhead_line_grid
UNION ALL
SELECT
    ext_ukpn_132kv_overhead_lines.uuid,
    ext_ukpn_132kv_overhead_lines.geometry,
    ext_ukpn_132kv_overhead_lines.geometry_3857,
    ext_ukpn_132kv_overhead_lines.voltage,
    ext_ukpn_132kv_overhead_lines.situation,
    ext_ukpn_132kv_overhead_lines.first_imported_at,
    ext_ukpn_132kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_132kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_66kv_overhead_lines.uuid,
    ext_ukpn_66kv_overhead_lines.geometry,
    ext_ukpn_66kv_overhead_lines.geometry_3857,
    ext_ukpn_66kv_overhead_lines.voltage,
    ext_ukpn_66kv_overhead_lines.situation,
    ext_ukpn_66kv_overhead_lines.first_imported_at,
    ext_ukpn_66kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_66kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_33kv_overhead_lines.uuid,
    ext_ukpn_33kv_overhead_lines.geometry,
    ext_ukpn_33kv_overhead_lines.geometry_3857,
    ext_ukpn_33kv_overhead_lines.voltage,
    ext_ukpn_33kv_overhead_lines.situation,
    ext_ukpn_33kv_overhead_lines.first_imported_at,
    ext_ukpn_33kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_33kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_high_voltage_overhead_lines.uuid,
    ext_ukpn_high_voltage_overhead_lines.geometry,
    ext_ukpn_high_voltage_overhead_lines.geometry_3857,
    ext_ukpn_high_voltage_overhead_lines.voltage,
    ext_ukpn_high_voltage_overhead_lines.situation,
    ext_ukpn_high_voltage_overhead_lines.first_imported_at,
    ext_ukpn_high_voltage_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_high_voltage_overhead_lines
WITH
    NO DATA;

-- Create indexes for int_powerlines materialized view
CREATE INDEX int_powerlines_dno_idx ON public.int_powerlines USING btree (dno);

CREATE INDEX int_powerlines_geometry_3857_idx ON public.int_powerlines USING gist (geometry_3857);

CREATE INDEX int_powerlines_geometry_idx ON public.int_powerlines USING gist (geometry);

CREATE INDEX int_powerlines_situation_idx ON public.int_powerlines USING btree (situation);

CREATE INDEX int_powerlines_uuid_idx ON public.int_powerlines USING btree (uuid);

CREATE INDEX int_powerlines_voltage_idx ON public.int_powerlines USING btree (voltage);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
-- Drop indexes from int_powerlines materialized view
DROP INDEX IF EXISTS int_powerlines_dno_idx;

DROP INDEX IF EXISTS int_powerlines_geometry_3857_idx;

DROP INDEX IF EXISTS int_powerlines_geometry_idx;

DROP INDEX IF EXISTS int_powerlines_situation_idx;

DROP INDEX IF EXISTS int_powerlines_uuid_idx;

DROP INDEX IF EXISTS int_powerlines_voltage_idx;

-- Drop tables in reverse order of creation
DROP MATERIALIZED VIEW IF EXISTS public.int_powerlines;

DROP TABLE IF EXISTS public.ext_nged_132kv_overhead_lines;

DROP TABLE IF EXISTS public.ext_nged_66kv_overhead_lines;

DROP TABLE IF EXISTS public.ext_nged_33kv_overhead_lines;

DROP TABLE IF EXISTS public.ext_nged_11kv_overhead_lines;

-- Recreate old materialized view for int_powerlines
CREATE MATERIALIZED VIEW public.int_powerlines AS
SELECT
    ext_enw_132kv_overhead_lines.uuid,
    ext_enw_132kv_overhead_lines.geometry,
    ext_enw_132kv_overhead_lines.geometry_3857,
    ext_enw_132kv_overhead_lines.voltage,
    ext_enw_132kv_overhead_lines.situation,
    ext_enw_132kv_overhead_lines.first_imported_at,
    ext_enw_132kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_132kv_overhead_lines
UNION ALL
SELECT
    ext_enw_33kv_overhead_lines.uuid,
    ext_enw_33kv_overhead_lines.geometry,
    ext_enw_33kv_overhead_lines.geometry_3857,
    ext_enw_33kv_overhead_lines.voltage,
    ext_enw_33kv_overhead_lines.situation,
    ext_enw_33kv_overhead_lines.first_imported_at,
    ext_enw_33kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_33kv_overhead_lines
UNION ALL
SELECT
    ext_enw_11kv_overhead_lines.uuid,
    ext_enw_11kv_overhead_lines.geometry,
    ext_enw_11kv_overhead_lines.geometry_3857,
    ext_enw_11kv_overhead_lines.voltage,
    ext_enw_11kv_overhead_lines.situation,
    ext_enw_11kv_overhead_lines.first_imported_at,
    ext_enw_11kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_11kv_overhead_lines
UNION ALL
SELECT
    ext_enw_6_6kv_overhead_lines.uuid,
    ext_enw_6_6kv_overhead_lines.geometry,
    ext_enw_6_6kv_overhead_lines.geometry_3857,
    ext_enw_6_6kv_overhead_lines.voltage,
    ext_enw_6_6kv_overhead_lines.situation,
    ext_enw_6_6kv_overhead_lines.first_imported_at,
    ext_enw_6_6kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_6_6kv_overhead_lines
UNION ALL
SELECT
    ext_enw_low_voltage_overhead_lines.uuid,
    ext_enw_low_voltage_overhead_lines.geometry,
    ext_enw_low_voltage_overhead_lines.geometry_3857,
    ext_enw_low_voltage_overhead_lines.voltage,
    ext_enw_low_voltage_overhead_lines.situation,
    ext_enw_low_voltage_overhead_lines.first_imported_at,
    ext_enw_low_voltage_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_low_voltage_overhead_lines
UNION ALL
SELECT
    ext_npg_extra_high_voltage_lines.uuid,
    ext_npg_extra_high_voltage_lines.geometry,
    ext_npg_extra_high_voltage_lines.geometry_3857,
    ext_npg_extra_high_voltage_lines.voltage,
    ext_npg_extra_high_voltage_lines.situation,
    ext_npg_extra_high_voltage_lines.first_imported_at,
    ext_npg_extra_high_voltage_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_extra_high_voltage_lines
UNION ALL
SELECT
    ext_npg_high_voltage_overhead_lines.uuid,
    ext_npg_high_voltage_overhead_lines.geometry,
    ext_npg_high_voltage_overhead_lines.geometry_3857,
    ext_npg_high_voltage_overhead_lines.voltage,
    ext_npg_high_voltage_overhead_lines.situation,
    ext_npg_high_voltage_overhead_lines.first_imported_at,
    ext_npg_high_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_high_voltage_overhead_lines
UNION ALL
SELECT
    ext_ssen_transmission_overhead_line_supergrid.uuid,
    ext_ssen_transmission_overhead_line_supergrid.geometry,
    ext_ssen_transmission_overhead_line_supergrid.geometry_3857,
    ext_ssen_transmission_overhead_line_supergrid.voltage,
    ext_ssen_transmission_overhead_line_supergrid.situation,
    ext_ssen_transmission_overhead_line_supergrid.first_imported_at,
    ext_ssen_transmission_overhead_line_supergrid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_overhead_line_supergrid
UNION ALL
SELECT
    ext_ssen_transmission_overhead_line_grid.uuid,
    ext_ssen_transmission_overhead_line_grid.geometry,
    ext_ssen_transmission_overhead_line_grid.geometry_3857,
    ext_ssen_transmission_overhead_line_grid.voltage,
    ext_ssen_transmission_overhead_line_grid.situation,
    ext_ssen_transmission_overhead_line_grid.first_imported_at,
    ext_ssen_transmission_overhead_line_grid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_overhead_line_grid
UNION ALL
SELECT
    ext_nget_overhead_lines.uuid,
    ext_nget_overhead_lines.geometry,
    ext_nget_overhead_lines.geometry_3857,
    ext_nget_overhead_lines.voltage,
    ext_nget_overhead_lines.situation,
    ext_nget_overhead_lines.first_imported_at,
    ext_nget_overhead_lines.last_imported_at,
    'NGET'::public.dno AS dno
FROM
    public.ext_nget_overhead_lines
UNION ALL
SELECT
    ext_npg_low_voltage_overhead_lines.uuid,
    ext_npg_low_voltage_overhead_lines.geometry,
    ext_npg_low_voltage_overhead_lines.geometry_3857,
    ext_npg_low_voltage_overhead_lines.voltage,
    ext_npg_low_voltage_overhead_lines.situation,
    ext_npg_low_voltage_overhead_lines.first_imported_at,
    ext_npg_low_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_low_voltage_overhead_lines
UNION ALL
SELECT
    ext_ukpn_132kv_overhead_lines.uuid,
    ext_ukpn_132kv_overhead_lines.geometry,
    ext_ukpn_132kv_overhead_lines.geometry_3857,
    ext_ukpn_132kv_overhead_lines.voltage,
    ext_ukpn_132kv_overhead_lines.situation,
    ext_ukpn_132kv_overhead_lines.first_imported_at,
    ext_ukpn_132kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_132kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_66kv_overhead_lines.uuid,
    ext_ukpn_66kv_overhead_lines.geometry,
    ext_ukpn_66kv_overhead_lines.geometry_3857,
    ext_ukpn_66kv_overhead_lines.voltage,
    ext_ukpn_66kv_overhead_lines.situation,
    ext_ukpn_66kv_overhead_lines.first_imported_at,
    ext_ukpn_66kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_66kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_33kv_overhead_lines.uuid,
    ext_ukpn_33kv_overhead_lines.geometry,
    ext_ukpn_33kv_overhead_lines.geometry_3857,
    ext_ukpn_33kv_overhead_lines.voltage,
    ext_ukpn_33kv_overhead_lines.situation,
    ext_ukpn_33kv_overhead_lines.first_imported_at,
    ext_ukpn_33kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_33kv_overhead_lines
UNION ALL
SELECT
    ext_ukpn_high_voltage_overhead_lines.uuid,
    ext_ukpn_high_voltage_overhead_lines.geometry,
    ext_ukpn_high_voltage_overhead_lines.geometry_3857,
    ext_ukpn_high_voltage_overhead_lines.voltage,
    ext_ukpn_high_voltage_overhead_lines.situation,
    ext_ukpn_high_voltage_overhead_lines.first_imported_at,
    ext_ukpn_high_voltage_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_high_voltage_overhead_lines
WITH
    NO DATA;

-- Recreate indexes
CREATE INDEX int_powerlines_dno_idx ON public.int_powerlines USING btree (dno);

CREATE INDEX int_powerlines_geometry_3857_idx ON public.int_powerlines USING gist (geometry_3857);

CREATE INDEX int_powerlines_geometry_idx ON public.int_powerlines USING gist (geometry);

CREATE INDEX int_powerlines_situation_idx ON public.int_powerlines USING btree (situation);

CREATE INDEX int_powerlines_uuid_idx ON public.int_powerlines USING btree (uuid);

CREATE INDEX int_powerlines_voltage_idx ON public.int_powerlines USING btree (voltage);

-- +goose StatementEnd
