-- +goose Up
-- +goose StatementBegin
-- int_independent_operators
CREATE INDEX int_independent_operators_uuid_idx ON public.int_independent_operators USING BTREE (uuid);

CREATE INDEX int_independent_operators_name_idx ON public.int_independent_operators USING BTREE (name);

CREATE INDEX int_independent_operators_dno_idx ON public.int_independent_operators USING BTREE (dno);

CREATE INDEX int_independent_operators_geometry_idx ON public.int_independent_operators USING GIST (geometry);

CREATE INDEX int_independent_operators_geometry_3857_idx ON public.int_independent_operators USING GIST (geometry_3857);

-- int_powerlines
CREATE INDEX int_powerlines_uuid_idx ON public.int_powerlines USING BTREE (uuid);

CREATE INDEX int_powerlines_voltage_idx ON public.int_powerlines USING BTREE (voltage);

CREATE INDEX int_powerlines_dno_idx ON public.int_powerlines USING BTREE (dno);

CREATE INDEX int_powerlines_situation_idx ON public.int_powerlines USING BTREE (situation);

CREATE INDEX int_powerlines_geometry_idx ON public.int_powerlines USING GIST (geometry);

CREATE INDEX int_powerlines_geometry_3857_idx ON public.int_powerlines USING GIST (geometry_3857);

-- int_substations
CREATE INDEX int_substations_uuid_idx ON public.int_substations USING BTREE (uuid);

CREATE INDEX int_substations_name_idx ON public.int_substations USING BTREE (name);

CREATE INDEX int_substations_number_idx ON public.int_substations USING BTREE (number);

CREATE INDEX int_substations_voltage_idx ON public.int_substations USING BTREE (voltage);

CREATE INDEX int_substations_dno_idx ON public.int_substations USING BTREE (dno);

CREATE INDEX int_substations_geometry_idx ON public.int_substations USING GIST (geometry);

CREATE INDEX int_substations_geometry_3857_idx ON public.int_substations USING GIST (geometry_3857);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
-- int_independent_operators
DROP INDEX int_independent_operators_uuid_idx;

DROP INDEX int_independent_operators_name_idx;

DROP INDEX int_independent_operators_dno_idx;

DROP INDEX int_independent_operators_geometry_idx;

DROP INDEX int_independent_operators_geometry_3857_idx;

-- int_powerlines
DROP INDEX int_powerlines_uuid_idx;

DROP INDEX int_powerlines_voltage_idx;

DROP INDEX int_powerlines_dno_idx;

DROP INDEX int_powerlines_situation_idx;

DROP INDEX int_powerlines_geometry_idx;

DROP INDEX int_powerlines_geometry_3857_idx;

-- int_substations
DROP INDEX int_substations_uuid_idx;

DROP INDEX int_substations_name_idx;

DROP INDEX int_substations_number_idx;

DROP INDEX int_substations_voltage_idx;

DROP INDEX int_substations_dno_idx;

DROP INDEX int_substations_geometry_idx;

DROP INDEX int_substations_geometry_3857_idx;

-- +goose StatementEnd
