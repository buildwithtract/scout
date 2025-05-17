-- +goose Up
-- +goose StatementBegin
DROP TRIGGER IF EXISTS transform_geometry_trigger ON public.ext_datagovuk_flood_risk_zones;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_zone;

DROP TABLE IF EXISTS public.ext_datagovuk_flood_risk_zones;

CREATE TABLE public.ext_datagovuk_flood_risk_zones (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    type text NOT NULL,
    zone text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX ext_datagovuk_flood_risk_zones_uuid_idx ON public.ext_datagovuk_flood_risk_zones USING btree (uuid);

CREATE INDEX ext_datagovuk_flood_risk_zones_reference_idx ON public.ext_datagovuk_flood_risk_zones USING btree (reference);

CREATE INDEX ext_datagovuk_flood_risk_zones_type_idx ON public.ext_datagovuk_flood_risk_zones USING btree (type);

CREATE INDEX ext_datagovuk_flood_risk_zones_zone_idx ON public.ext_datagovuk_flood_risk_zones USING btree (zone);

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry);

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_3857_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry_3857);

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_27700_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry_27700);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_flood_risk_zones FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS transform_geometry_trigger ON public.ext_datagovuk_flood_risk_zones;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_uuid_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_reference_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_type_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_zone_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_geometry_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_geometry_3857_idx;

DROP INDEX IF EXISTS ext_datagovuk_flood_risk_zones_geometry_27700_idx;

DROP TABLE IF EXISTS public.ext_datagovuk_flood_risk_zones;

CREATE TABLE public.ext_datagovuk_flood_risk_zones (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    geometry public.geometry NOT NULL,
    type text NOT NULL,
    zone text NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    reference character varying(255) NOT NULL
);

CREATE INDEX ext_datagovuk_flood_risk_zones_zone ON public.ext_datagovuk_flood_risk_zones USING btree (zone);

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_flood_risk_zones FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- +goose StatementEnd
