-- +goose Up
-- +goose StatementBegin
CREATE TYPE public.alc_grade AS ENUM(
    '1',
    '2',
    '3a',
    '3b',
    '4',
    '5',
    'Not Surveyed',
    'Other'
);

--
-- Name: dno; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.dno AS ENUM(
    'NPG',
    'SPEN',
    'SSEN',
    'NIEN',
    'ENW',
    'NGED',
    'NGET',
    'UKPN'
);

--
-- Name: situation; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.situation AS ENUM('Overhead', 'Underground');

--
-- Name: transform_geometry(); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION public.transform_geometry () RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_table_oid OID;
    v_geometry_3857_exists BOOLEAN;
    v_geometry_27700_exists BOOLEAN;
BEGIN
    v_table_oid := TG_RELID;
    SELECT EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = v_table_oid
        AND attname = 'geometry_3857'
        AND NOT attisdropped
    ) INTO v_geometry_3857_exists;

    SELECT EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = v_table_oid
        AND attname = 'geometry_27700'
        AND NOT attisdropped
    ) INTO v_geometry_27700_exists;

    IF v_geometry_3857_exists THEN
        NEW.geometry_3857 := ST_Transform(NEW.geometry, 3857);
        IF NOT ST_IsValid(NEW.geometry_3857) THEN
            NEW.geometry_3857 := ST_MakeValid(NEW.geometry_3857);
        END IF;
    END IF;

    IF v_geometry_27700_exists THEN
        NEW.geometry_27700 := ST_Transform(NEW.geometry, 27700);
        IF NOT ST_IsValid(NEW.geometry_27700) THEN
            NEW.geometry_27700 := ST_MakeValid(NEW.geometry_27700);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

--
-- Name: ext_datagovuk_ancient_woodland; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_ancient_woodland (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_aonb; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_aonb (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_battlefields; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_battlefields (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    entity text NOT NULL,
    document_url text,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_brownfield; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_brownfield (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL UNIQUE,
    name text,
    organisation_entity text,
    address text,
    notes text,
    ownership_status text,
    minimum_net_dwellings text,
    maximum_net_dwellings text,
    planning_permission_date DATE,
    planning_permission_type text,
    planning_permission_status text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_built_up_areas; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_built_up_areas (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_conservation_area; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_conservation_area (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_educational_establishment; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_educational_establishment (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    uprn text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    capacity INTEGER,
    establishment_type text NOT NULL,
    open_date DATE,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_flood_risk_zones; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_flood_risk_zones (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    geometry public.geometry NOT NULL,
    type text NOT NULL,
    zone text NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    reference CHARACTER VARYING(255) NOT NULL
);

--
-- Name: ext_datagovuk_green_belt; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_green_belt (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    entity text NOT NULL,
    green_belt_core text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_heritage_at_risk; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_heritage_at_risk (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_heritage_coast; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_heritage_coast (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_historic_park_garden; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_historic_park_garden (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    entry_date DATE NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_listed_buildings; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_listed_buildings (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    reference text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    entity text,
    documentation_url text,
    listed_building_grade CHARACTER VARYING(255),
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_local_authorities; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_local_authorities (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_local_nature_reserve; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_local_nature_reserve (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_local_planning_authorities; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_local_planning_authorities (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    normalised_name text,
    local_planning_authorities_uuid uuid,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_national_nature_reserves; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_national_nature_reserves (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_national_parks; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_national_parks (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_parishes; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_parishes (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_ramsar; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_ramsar (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_regions; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_regions (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_scheduled_monuments; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_scheduled_monuments (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    reference text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    entity text,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_special_areas_of_conservation; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_special_areas_of_conservation (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_special_protection_area; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_special_protection_area (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_sssi; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_sssi (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_trees; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_trees (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    species text,
    name text,
    notes text,
    entry_date DATE,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_world_heritage_site_buffer_zones (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    world_heritage_site_uuid uuid NOT NULL,
    reference TEXT NOT NULL,
    name TEXT NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_datagovuk_world_heritage_sites; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_datagovuk_world_heritage_sites (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    reference text NOT NULL,
    entry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    entity TEXT,
    notes TEXT,
    documentation_url TEXT,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_environmentagency_alc_grades; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_environmentagency_alc_grades (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    objectId INTEGER,
    alc_grade public.alc_grade,
    area DECIMAL,
    url TEXT,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_environmentagency_provisional_alc_grades; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_environmentagency_provisional_alc_grades (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    objectid INTEGER,
    alc_grade public.alc_grade,
    area DECIMAL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITH TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_enw_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    number CHARACTER VARYING(255),
    infeed_voltage INTEGER,
    outfeed_voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_nget_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_nget_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    status text,
    circuit_one text,
    circuit_two text,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_nget_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_nget_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text,
    name text,
    status text,
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_nget_towers; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_nget_towers (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    status text NOT NULL,
    tower_height DECIMAL,
    year_installed INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_naturalengland_nutrient_neutrality_catchments; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_naturalengland_nutrient_neutrality_catchments (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    popup_info text,
    n2k_site_name text,
    label text,
    object_id INTEGER,
    date_amended DATE,
    notes text,
    global_id text,
    oid_1 INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_nged_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_nged_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_npg_dnos; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_dnos (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_npg_independent_operators; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_independent_operators (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_npg_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_openstreetmap_healthcare; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_openstreetmap_healthcare (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text NOT NULL,
    reference CHARACTER VARYING(64) NOT NULL,
    node_type CHARACTER VARYING(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_openstreetmap_public_right_of_way; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_openstreetmap_public_right_of_way (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference CHARACTER VARYING(64) NOT NULL,
    way_type CHARACTER VARYING(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_openstreetmap_public_transport; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_openstreetmap_public_transport (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text NOT NULL,
    reference CHARACTER VARYING(64) NOT NULL,
    node_type CHARACTER VARYING(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_os_contours; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_os_contours (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    reference text NOT NULL,
    height_m DOUBLE PRECISION NOT NULL,
    contour_line_type text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_spen_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_spen_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_ssen_transmission_overhead_line_supergrid; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ssen_transmission_overhead_line_supergrid (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER NOT NULL,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_ssen_transmission_overhead_line_grid; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ssen_transmission_overhead_line_grid (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER NOT NULL,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_ssen_transmission_substations_supergrid; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ssen_transmission_substations_supergrid (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255),
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_ssen_transmission_substations_grid; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ssen_transmission_substations_grid (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255),
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_ukpn_independent_operators; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_independent_operators (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

--
-- Name: ext_ukpn_substations; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_substations (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    number CHARACTER VARYING(255),
    voltage INTEGER,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: ext_enw_132kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_132kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_enw_33kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_33kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_enw_11kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_11kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_enw_6_6kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_6_6kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_enw_low_voltage_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_enw_low_voltage_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_npg_extra_high_voltage_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_extra_high_voltage_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_npg_high_voltage_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_high_voltage_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_npg_low_voltage_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_npg_low_voltage_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_ukpn_132kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_132kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_ukpn_33kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_33kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_ukpn_66kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_66kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: ext_ukpn_high_voltage_overhead_lines; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.ext_ukpn_high_voltage_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    voltage INTEGER,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: fetches; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.fetches (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    name text NOT NULL,
    command text NOT NULL,
    error text,
    started_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    finished_at TIMESTAMP WITHOUT TIME zone
);

--
-- Name: planning_application_appeals; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.planning_application_appeals (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    lpa text NOT NULL,
    reference text NOT NULL,
    case_id INTEGER NOT NULL,
    url text NOT NULL,
    appellant_name text,
    agent_name text,
    site_address text,
    case_type text,
    case_officer text,
    PROCEDURE text,
    status text,
    decision text,
    start_date DATE,
    questionnaire_due_date DATE,
    statement_due_date DATE,
    interested_party_comments_due_date DATE,
    final_comments_due_date DATE,
    inquiry_evidence_due_date DATE,
    event_date DATE,
    decision_date DATE,
    linked_case_ids INTEGER[],
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: planning_application_appeals_documents; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.planning_application_appeals_documents (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    planning_application_appeal_uuid uuid NOT NULL,
    appeal_case_id INTEGER NOT NULL,
    reference text,
    name text,
    url text NOT NULL,
    s3_path text,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: planning_application_documents; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.planning_application_documents (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    planning_application_uuid uuid NOT NULL,
    date_published DATE NOT NULL,
    document_type CHARACTER VARYING(255) NOT NULL,
    description text,
    url text NOT NULL,
    drawing_number CHARACTER VARYING(255),
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    s3_path text
);

--
-- Name: planning_application_geometries; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.planning_application_geometries (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    planning_application_uuid uuid NOT NULL,
    reference CHARACTER VARYING(255) NOT NULL,
    geometry public.geometry,
    geometry_3857 public.geometry,
    geometry_27700 public.geometry,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: planning_applications; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.planning_applications (
    uuid uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    lpa CHARACTER VARYING(255) NOT NULL,
    reference CHARACTER VARYING(255) NOT NULL,
    website_reference CHARACTER VARYING(255) NOT NULL,
    url text NOT NULL,
    submitted_date DATE,
    validated_date DATE,
    address text,
    description text,
    application_status CHARACTER VARYING(255),
    application_decision CHARACTER VARYING(255),
    application_decision_date DATE,
    appeal_status CHARACTER VARYING(255),
    appeal_decision CHARACTER VARYING(255),
    appeal_decision_date DATE,
    application_type CHARACTER VARYING(255),
    expected_decision_level CHARACTER VARYING(255),
    actual_decision_level CHARACTER VARYING(255),
    case_officer CHARACTER VARYING(255),
    parish CHARACTER VARYING(255),
    ward CHARACTER VARYING(255),
    amenity_society CHARACTER VARYING(255),
    district_reference CHARACTER VARYING(255),
    applicant_name CHARACTER VARYING(255),
    applicant_address CHARACTER VARYING(255),
    environmental_assessment_requested BOOLEAN,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    first_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at TIMESTAMP WITHOUT TIME zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    case_officer_phone text,
    comments_due_date DATE,
    committee_date DATE,
    agent_name text,
    agent_address text,
    CONSTRAINT planning_applications_application_decision_date_appeal_decision CHECK (
        (application_decision_date <= appeal_decision_date)
    ),
    CONSTRAINT planning_applications_submitted_date_validated_date_check CHECK ((submitted_date <= validated_date)),
    CONSTRAINT planning_applications_validated_date_application_decision_date_ CHECK ((validated_date <= application_decision_date))
);

--
-- Name: scraper_runs; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.scraper_runs (
    name text NOT NULL,
    last_finished_at TIMESTAMP WITHOUT TIME zone,
    last_data_found_at TIMESTAMP WITHOUT TIME zone,
    last_run_stats jsonb
);

--
-- Name: int_powerlines; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--
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

--
-- Name: int_substations; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--
CREATE MATERIALIZED VIEW public.int_substations AS
SELECT
    ext_enw_substations.uuid,
    ext_enw_substations.geometry,
    ext_enw_substations.geometry_3857,
    ext_enw_substations.name,
    ext_enw_substations.number,
    ext_enw_substations.outfeed_voltage AS voltage,
    ext_enw_substations.first_imported_at,
    ext_enw_substations.last_imported_at,
    'ENW'::public.dno AS dno
FROM
    public.ext_enw_substations
UNION ALL
SELECT
    ext_nged_substations.uuid,
    ext_nged_substations.geometry,
    ext_nged_substations.geometry_3857,
    ext_nged_substations.name,
    ext_nged_substations.number,
    ext_nged_substations.voltage,
    ext_nged_substations.first_imported_at,
    ext_nged_substations.last_imported_at,
    'NGED'::public.dno AS dno
FROM
    public.ext_nged_substations
UNION ALL
SELECT
    ext_npg_substations.uuid,
    ext_npg_substations.geometry,
    ext_npg_substations.geometry_3857,
    ext_npg_substations.name,
    ext_npg_substations.number,
    ext_npg_substations.voltage,
    ext_npg_substations.first_imported_at,
    ext_npg_substations.last_imported_at,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_substations
UNION ALL
SELECT
    ext_spen_substations.uuid,
    ext_spen_substations.geometry,
    ext_spen_substations.geometry_3857,
    ext_spen_substations.name,
    ext_spen_substations.number,
    ext_spen_substations.voltage,
    ext_spen_substations.first_imported_at,
    ext_spen_substations.last_imported_at,
    'SPEN'::public.dno AS dno
FROM
    public.ext_spen_substations
UNION ALL
SELECT
    ext_ssen_transmission_substations_supergrid.uuid,
    ext_ssen_transmission_substations_supergrid.geometry,
    ext_ssen_transmission_substations_supergrid.geometry_3857,
    ext_ssen_transmission_substations_supergrid.name,
    ext_ssen_transmission_substations_supergrid.number,
    ext_ssen_transmission_substations_supergrid.voltage,
    ext_ssen_transmission_substations_supergrid.first_imported_at,
    ext_ssen_transmission_substations_supergrid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_substations_supergrid
UNION ALL
SELECT
    ext_ssen_transmission_substations_grid.uuid,
    ext_ssen_transmission_substations_grid.geometry,
    ext_ssen_transmission_substations_grid.geometry_3857,
    ext_ssen_transmission_substations_grid.name,
    ext_ssen_transmission_substations_grid.number,
    ext_ssen_transmission_substations_grid.voltage,
    ext_ssen_transmission_substations_grid.first_imported_at,
    ext_ssen_transmission_substations_grid.last_imported_at,
    'SSEN'::public.dno AS dno
FROM
    public.ext_ssen_transmission_substations_grid
UNION ALL
SELECT
    ext_ukpn_substations.uuid,
    ext_ukpn_substations.geometry,
    ext_ukpn_substations.geometry_3857,
    ext_ukpn_substations.name,
    ext_ukpn_substations.number,
    ext_ukpn_substations.voltage,
    ext_ukpn_substations.first_imported_at,
    ext_ukpn_substations.last_imported_at,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_substations
WITH
    NO DATA;

CREATE MATERIALIZED VIEW public.int_independent_operators AS
SELECT
    uuid,
    name,
    geometry,
    geometry_3857,
    geometry_27700,
    'NPG'::public.dno AS dno
FROM
    public.ext_npg_independent_operators
UNION ALL
SELECT
    uuid,
    name,
    geometry,
    geometry_3857,
    geometry_27700,
    'UKPN'::public.dno AS dno
FROM
    public.ext_ukpn_independent_operators
WITH
    NO DATA;

--
-- Name: ext_datagouk_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagouk_geometry_3857_idx ON public.ext_datagovuk_ramsar USING gist (geometry_3857);

--
-- Name: ext_datagouk_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagouk_geometry_idx ON public.ext_datagovuk_ramsar USING gist (geometry);

--
-- Name: ext_datagouk_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagouk_reference_idx ON public.ext_datagovuk_ramsar USING btree (reference);

--
-- Name: ext_datagouk_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagouk_uuid_idx ON public.ext_datagovuk_ramsar USING btree (uuid);

--
-- Name: ext_datagovuk_ancient_woodland_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_ancient_woodland_geometry_27700_idx ON public.ext_datagovuk_ancient_woodland USING gist (geometry_27700);

--
-- Name: ext_datagovuk_ancient_woodland_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_ancient_woodland_geometry_3857_idx ON public.ext_datagovuk_ancient_woodland USING gist (geometry_3857);

--
-- Name: ext_datagovuk_ancient_woodland_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_ancient_woodland_geometry_idx ON public.ext_datagovuk_ancient_woodland USING gist (geometry);

--
-- Name: ext_datagovuk_ancient_woodland_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_ancient_woodland_reference_idx ON public.ext_datagovuk_ancient_woodland USING btree (reference);

--
-- Name: ext_datagovuk_ancient_woodland_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_ancient_woodland_uuid_idx ON public.ext_datagovuk_ancient_woodland USING btree (uuid);

--
-- Name: ext_datagovuk_aonb_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_aonb_geometry_idx ON public.ext_datagovuk_aonb USING gist (geometry);

--
-- Name: ext_datagovuk_aonb_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_aonb_reference_idx ON public.ext_datagovuk_aonb USING btree (reference);

--
-- Name: ext_datagovuk_aonb_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_aonb_uuid_idx ON public.ext_datagovuk_aonb USING btree (uuid);

--
-- Name: ext_datagovuk_battlefields_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_battlefields_geometry_3857_idx ON public.ext_datagovuk_battlefields USING gist (geometry_3857);

--
-- Name: ext_datagovuk_battlefields_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_battlefields_geometry_idx ON public.ext_datagovuk_battlefields USING gist (geometry);

--
-- Name: ext_datagovuk_battlefields_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_battlefields_reference_idx ON public.ext_datagovuk_battlefields USING btree (reference);

--
-- Name: ext_datagovuk_battlefields_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_battlefields_uuid_idx ON public.ext_datagovuk_battlefields USING btree (uuid);

--
-- Name: ext_datagovuk_brownfield_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_brownfield_geometry_27700_idx ON public.ext_datagovuk_brownfield USING gist (geometry_27700);

--
-- Name: ext_datagovuk_brownfield_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_brownfield_geometry_3857_idx ON public.ext_datagovuk_brownfield USING gist (geometry_3857);

--
-- Name: ext_datagovuk_brownfield_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_brownfield_geometry_idx ON public.ext_datagovuk_brownfield USING gist (geometry);

--
-- Name: ext_datagovuk_brownfield_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_brownfield_reference_idx ON public.ext_datagovuk_brownfield USING btree (reference);

--
-- Name: ext_datagovuk_brownfield_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_brownfield_uuid_idx ON public.ext_datagovuk_brownfield USING btree (uuid);

--
-- Name: ext_datagovuk_built_up_areas_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_built_up_areas_geometry_3857_idx ON public.ext_datagovuk_built_up_areas USING gist (geometry_3857);

--
-- Name: ext_datagovuk_built_up_areas_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_built_up_areas_geometry_idx ON public.ext_datagovuk_built_up_areas USING gist (geometry);

--
-- Name: ext_datagovuk_built_up_areas_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_built_up_areas_reference_idx ON public.ext_datagovuk_built_up_areas USING btree (reference);

--
-- Name: ext_datagovuk_built_up_areas_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_built_up_areas_uuid_idx ON public.ext_datagovuk_built_up_areas USING btree (uuid);

--
-- Name: ext_datagovuk_flood_risk_zones_zone; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_flood_risk_zones_zone ON public.ext_datagovuk_flood_risk_zones USING btree (zone);

--
-- Name: ext_datagovuk_green_belt_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_green_belt_geometry_idx ON public.ext_datagovuk_green_belt USING gist (geometry);

--
-- Name: ext_datagovuk_green_belt_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_green_belt_reference_idx ON public.ext_datagovuk_green_belt USING btree (reference);

--
-- Name: ext_datagovuk_green_belt_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_green_belt_uuid_idx ON public.ext_datagovuk_green_belt USING btree (uuid);

--
-- Name: ext_datagovuk_heritage_at_risk_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_at_risk_geometry_27700_idx ON public.ext_datagovuk_heritage_at_risk USING gist (geometry_27700);

--
-- Name: ext_datagovuk_heritage_at_risk_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_at_risk_geometry_3857_idx ON public.ext_datagovuk_heritage_at_risk USING gist (geometry_3857);

--
-- Name: ext_datagovuk_heritage_at_risk_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_at_risk_geometry_idx ON public.ext_datagovuk_heritage_at_risk USING gist (geometry);

--
-- Name: ext_datagovuk_heritage_at_risk_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_at_risk_reference_idx ON public.ext_datagovuk_heritage_at_risk USING btree (reference);

--
-- Name: ext_datagovuk_heritage_at_risk_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_heritage_at_risk_uuid_idx ON public.ext_datagovuk_heritage_at_risk USING btree (uuid);

--
-- Name: ext_datagovuk_heritage_coast_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_coast_geometry_27700_idx ON public.ext_datagovuk_heritage_coast USING gist (geometry_27700);

--
-- Name: ext_datagovuk_heritage_coast_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_coast_geometry_3857_idx ON public.ext_datagovuk_heritage_coast USING gist (geometry_3857);

--
-- Name: ext_datagovuk_heritage_coast_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_coast_geometry_idx ON public.ext_datagovuk_heritage_coast USING gist (geometry);

--
-- Name: ext_datagovuk_heritage_coast_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_coast_reference_idx ON public.ext_datagovuk_heritage_coast USING btree (reference);

--
-- Name: ext_datagovuk_heritage_coast_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_heritage_coast_uuid_idx ON public.ext_datagovuk_heritage_coast USING btree (uuid);

--
-- Name: ext_datagovuk_heritage_world_sites_entity_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_heritage_world_sites_entity_idx ON public.ext_datagovuk_world_heritage_sites USING btree (entity);

--
-- Name: ext_datagovuk_listed_buildings_entity_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_listed_buildings_entity_idx ON public.ext_datagovuk_listed_buildings USING btree (entity);

--
-- Name: ext_datagovuk_listed_buildings_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_listed_buildings_geometry_3857_idx ON public.ext_datagovuk_listed_buildings USING gist (geometry_3857);

--
-- Name: ext_datagovuk_listed_buildings_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_listed_buildings_geometry_idx ON public.ext_datagovuk_listed_buildings USING gist (geometry);

--
-- Name: ext_datagovuk_listed_buildings_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_listed_buildings_reference_idx ON public.ext_datagovuk_listed_buildings USING btree (reference);

--
-- Name: ext_datagovuk_listed_buildings_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_listed_buildings_uuid_idx ON public.ext_datagovuk_listed_buildings USING btree (uuid);

--
-- Name: ext_datagovuk_local_authorities_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_local_authorities_geometry_idx ON public.ext_datagovuk_local_authorities USING gist (geometry);

--
-- Name: ext_datagovuk_local_authorities_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_local_authorities_reference_idx ON public.ext_datagovuk_local_authorities USING btree (reference);

--
-- Name: ext_datagovuk_local_authorities_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_local_authorities_uuid_idx ON public.ext_datagovuk_local_authorities USING btree (uuid);

--
-- Name: ext_datagovuk_local_planning_authorities_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_local_planning_authorities_geometry_idx ON public.ext_datagovuk_local_planning_authorities USING gist (geometry);

--
-- Name: ext_datagovuk_local_planning_authorities_normalised_name_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_local_planning_authorities_normalised_name_idx ON public.ext_datagovuk_local_planning_authorities USING btree (normalised_name);

--
-- Name: ext_datagovuk_local_planning_authorities_reference; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_local_planning_authorities_reference ON public.ext_datagovuk_local_planning_authorities USING btree (reference);

--
-- Name: ext_datagovuk_local_planning_authorities_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_local_planning_authorities_uuid_idx ON public.ext_datagovuk_local_planning_authorities USING btree (uuid);

--
-- Name: ext_datagovuk_national_parks_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_national_parks_geometry_idx ON public.ext_datagovuk_national_parks USING gist (geometry);

--
-- Name: ext_datagovuk_national_parks_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_national_parks_reference_idx ON public.ext_datagovuk_national_parks USING btree (reference);

--
-- Name: ext_datagovuk_national_parks_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_national_parks_uuid_idx ON public.ext_datagovuk_national_parks USING btree (uuid);

--
-- Name: ext_datagovuk_parishes_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_parishes_geometry_idx ON public.ext_datagovuk_parishes USING gist (geometry);

--
-- Name: ext_datagovuk_parishes_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_parishes_reference_idx ON public.ext_datagovuk_parishes USING btree (reference);

--
-- Name: ext_datagovuk_parishes_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_parishes_uuid_idx ON public.ext_datagovuk_parishes USING btree (uuid);

--
-- Name: ext_datagovuk_regions_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_regions_geometry_idx ON public.ext_datagovuk_regions USING gist (geometry);

--
-- Name: ext_datagovuk_regions_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_regions_reference_idx ON public.ext_datagovuk_regions USING btree (reference);

--
-- Name: ext_datagovuk_regions_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_regions_uuid_idx ON public.ext_datagovuk_regions USING btree (uuid);

--
-- Name: ext_datagovuk_scheduled_monuments_entity_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_scheduled_monuments_entity_idx ON public.ext_datagovuk_scheduled_monuments USING btree (entity);

--
-- Name: ext_datagovuk_scheduled_monuments_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_scheduled_monuments_geometry_3857_idx ON public.ext_datagovuk_scheduled_monuments USING gist (geometry_3857);

--
-- Name: ext_datagovuk_scheduled_monuments_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_scheduled_monuments_geometry_idx ON public.ext_datagovuk_scheduled_monuments USING gist (geometry);

--
-- Name: ext_datagovuk_scheduled_monuments_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_scheduled_monuments_reference_idx ON public.ext_datagovuk_scheduled_monuments USING btree (reference);

--
-- Name: ext_datagovuk_scheduled_monuments_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_scheduled_monuments_uuid_idx ON public.ext_datagovuk_scheduled_monuments USING btree (uuid);

--
-- Name: ext_datagovuk_special_areas_of_conservation_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_areas_of_conservation_geometry_27700_idx ON public.ext_datagovuk_special_areas_of_conservation USING gist (geometry_27700);

--
-- Name: ext_datagovuk_special_areas_of_conservation_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_areas_of_conservation_geometry_3857_idx ON public.ext_datagovuk_special_areas_of_conservation USING gist (geometry_3857);

--
-- Name: ext_datagovuk_special_areas_of_conservation_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_areas_of_conservation_geometry_idx ON public.ext_datagovuk_special_areas_of_conservation USING gist (geometry);

--
-- Name: ext_datagovuk_special_areas_of_conservation_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_areas_of_conservation_reference_idx ON public.ext_datagovuk_special_areas_of_conservation USING btree (reference);

--
-- Name: ext_datagovuk_special_areas_of_conservation_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_special_areas_of_conservation_uuid_idx ON public.ext_datagovuk_special_areas_of_conservation USING btree (uuid);

--
-- Name: ext_datagovuk_special_protection_area_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_protection_area_geometry_27700_idx ON public.ext_datagovuk_special_protection_area USING gist (geometry_27700);

--
-- Name: ext_datagovuk_special_protection_area_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_protection_area_geometry_3857_idx ON public.ext_datagovuk_special_protection_area USING gist (geometry_3857);

--
-- Name: ext_datagovuk_special_protection_area_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_protection_area_geometry_idx ON public.ext_datagovuk_special_protection_area USING gist (geometry);

--
-- Name: ext_datagovuk_special_protection_area_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_special_protection_area_reference_idx ON public.ext_datagovuk_special_protection_area USING btree (reference);

--
-- Name: ext_datagovuk_special_protection_area_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_special_protection_area_uuid_idx ON public.ext_datagovuk_special_protection_area USING btree (uuid);

--
-- Name: ext_datagovuk_sssi_geom_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_sssi_geom_3857_idx ON public.ext_datagovuk_sssi USING gist (geometry_3857);

--
-- Name: ext_datagovuk_sssi_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_sssi_geometry_idx ON public.ext_datagovuk_sssi USING gist (geometry);

--
-- Name: ext_datagovuk_sssi_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_sssi_reference_idx ON public.ext_datagovuk_sssi USING btree (reference);

--
-- Name: ext_datagovuk_sssi_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_sssi_uuid_idx ON public.ext_datagovuk_sssi USING btree (uuid);

--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones_geometry_id; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_world_heritage_site_buffer_zones_geometry_id ON public.ext_datagovuk_world_heritage_site_buffer_zones USING gist (geometry);

--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones_reference_i; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_world_heritage_site_buffer_zones_reference_i ON public.ext_datagovuk_world_heritage_site_buffer_zones USING btree (reference);

--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_world_heritage_site_buffer_zones_uuid_idx ON public.ext_datagovuk_world_heritage_site_buffer_zones USING btree (uuid);

--
-- Name: ext_datagovuk_world_heritage_sites_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_world_heritage_sites_geometry_3857_idx ON public.ext_datagovuk_world_heritage_sites USING gist (geometry_3857);

--
-- Name: ext_datagovuk_world_heritage_sites_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_world_heritage_sites_geometry_idx ON public.ext_datagovuk_world_heritage_sites USING gist (geometry);

--
-- Name: ext_datagovuk_world_heritage_sites_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_datagovuk_world_heritage_sites_reference_idx ON public.ext_datagovuk_world_heritage_sites USING btree (reference);

--
-- Name: ext_datagovuk_world_heritage_sites_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_datagovuk_world_heritage_sites_uuid_idx ON public.ext_datagovuk_world_heritage_sites USING btree (uuid);

--
-- Name: ext_environmentagency_alc_grades_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_environmentagency_alc_grades_geometry_idx ON public.ext_environmentagency_alc_grades USING gist (geometry);

--
-- Name: ext_environmentagency_alc_grades_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_environmentagency_alc_grades_uuid_idx ON public.ext_environmentagency_alc_grades USING btree (uuid);

--
-- Name: ext_environmentagency_provisional_alc_grades_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_environmentagency_provisional_alc_grades_geometry_idx ON public.ext_environmentagency_provisional_alc_grades USING gist (geometry);

--
-- Name: ext_environmentagency_provisional_alc_grades_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_environmentagency_provisional_alc_grades_uuid_idx ON public.ext_environmentagency_provisional_alc_grades USING btree (uuid);

--
-- Name: ext_enw_11kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_11kv_overhead_lines_uuid ON public.ext_enw_11kv_overhead_lines USING btree (uuid);

--
-- Name: ext_enw_132kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_132kv_overhead_lines_uuid ON public.ext_enw_132kv_overhead_lines USING btree (uuid);

--
-- Name: ext_enw_33kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_33kv_overhead_lines_uuid ON public.ext_enw_33kv_overhead_lines USING btree (uuid);

--
-- Name: ext_enw_6_6kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_6_6kv_overhead_lines_uuid ON public.ext_enw_6_6kv_overhead_lines USING btree (uuid);

--
-- Name: ext_enw_low_voltage_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_low_voltage_overhead_lines_uuid ON public.ext_enw_low_voltage_overhead_lines USING btree (uuid);

--
-- Name: ext_enw_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_enw_substations_geometry_3857_idx ON public.ext_enw_substations USING gist (geometry_3857);

--
-- Name: ext_enw_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_enw_substations_geometry_idx ON public.ext_enw_substations USING gist (geometry);

--
-- Name: ext_enw_substations_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_substations_name ON public.ext_enw_substations USING btree (name);

--
-- Name: ext_enw_substations_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_enw_substations_uuid ON public.ext_enw_substations USING btree (uuid);

--
-- Name: ext_nget_overhead_lines_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_overhead_lines_geometry_3857_idx ON public.ext_nget_overhead_lines USING gist (geometry_3857);

--
-- Name: ext_nget_overhead_lines_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_overhead_lines_geometry_idx ON public.ext_nget_overhead_lines USING gist (geometry);

--
-- Name: ext_nget_overhead_lines_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_overhead_lines_reference_idx ON public.ext_nget_overhead_lines USING btree (reference);

--
-- Name: ext_nget_overhead_lines_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_nget_overhead_lines_uuid_idx ON public.ext_nget_overhead_lines USING btree (uuid);

--
-- Name: ext_nget_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_substations_geometry_3857_idx ON public.ext_nget_substations USING gist (geometry_3857);

--
-- Name: ext_nget_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_substations_geometry_idx ON public.ext_nget_substations USING gist (geometry);

--
-- Name: ext_nget_substations_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_substations_reference_idx ON public.ext_nget_substations USING btree (reference);

--
-- Name: ext_nget_substations_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_nget_substations_uuid_idx ON public.ext_nget_substations USING btree (uuid);

--
-- Name: ext_nget_towers_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_towers_geometry_3857_idx ON public.ext_nget_towers USING gist (geometry_3857);

--
-- Name: ext_nget_towers_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_towers_geometry_idx ON public.ext_nget_towers USING gist (geometry);

--
-- Name: ext_nget_towers_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nget_towers_reference_idx ON public.ext_nget_towers USING btree (reference);

--
-- Name: ext_nget_towers_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_nget_towers_uuid_idx ON public.ext_nget_towers USING btree (uuid);

--
-- Name: ext_nged_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nged_substations_geometry_3857_idx ON public.ext_nged_substations USING gist (geometry_3857);

--
-- Name: ext_nged_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_nged_substations_geometry_idx ON public.ext_nged_substations USING gist (geometry);

--
-- Name: ext_nged_substations_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_nged_substations_name ON public.ext_nged_substations USING btree (name);

--
-- Name: ext_nged_substations_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_nged_substations_uuid ON public.ext_nged_substations USING btree (uuid);

--
-- Name: ext_npg_dnos_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_dnos_name ON public.ext_npg_dnos USING btree (name);

--
-- Name: ext_npg_dnos_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_dnos_uuid ON public.ext_npg_dnos USING btree (uuid);

--
-- Name: ext_npg_extra_high_voltage_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_extra_high_voltage_lines_uuid ON public.ext_npg_extra_high_voltage_lines USING btree (uuid);

--
-- Name: ext_npg_high_voltage_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_high_voltage_overhead_lines_uuid ON public.ext_npg_high_voltage_overhead_lines USING btree (uuid);

--
-- Name: ext_npg_independent_operators_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_independent_operators_uuid ON public.ext_npg_independent_operators USING btree (uuid);

--
-- Name: ext_npg_low_voltage_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_low_voltage_overhead_lines_uuid ON public.ext_npg_low_voltage_overhead_lines USING btree (uuid);

--
-- Name: ext_npg_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_npg_substations_geometry_3857_idx ON public.ext_npg_substations USING gist (geometry_3857);

--
-- Name: ext_npg_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_npg_substations_geometry_idx ON public.ext_npg_substations USING gist (geometry);

--
-- Name: ext_npg_substations_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_substations_name ON public.ext_npg_substations USING btree (name);

--
-- Name: ext_npg_substations_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_npg_substations_uuid ON public.ext_npg_substations USING btree (uuid);

--
-- Name: ext_os_contours_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_os_contours_geometry_idx ON public.ext_os_contours USING gist (geometry);

--
-- Name: ext_os_contours_reference_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_os_contours_reference_idx ON public.ext_os_contours USING btree (reference);

--
-- Name: ext_os_contours_uuid_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_os_contours_uuid_idx ON public.ext_os_contours USING btree (uuid);

--
-- Name: ext_spen_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_spen_substations_geometry_3857_idx ON public.ext_spen_substations USING gist (geometry_3857);

--
-- Name: ext_spen_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_spen_substations_geometry_idx ON public.ext_spen_substations USING gist (geometry);

--
-- Name: ext_spen_substations_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_spen_substations_name ON public.ext_spen_substations USING btree (name);

--
-- Name: ext_spen_substations_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_spen_substations_uuid ON public.ext_spen_substations USING btree (uuid);

--
-- Name: ext_ssen_transmission_overhead_line_supergrid_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_overhead_line_supergrid_geometry_3857_idx ON public.ext_ssen_transmission_overhead_line_supergrid USING gist (geometry_3857);

--
-- Name: ext_ssen_transmission_overhead_line_supergrid_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_overhead_line_supergrid_geometry_idx ON public.ext_ssen_transmission_overhead_line_supergrid USING gist (geometry);

--
-- Name: ext_ssen_transmission_overhead_line_supergrid_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_overhead_line_supergrid_uuid ON public.ext_ssen_transmission_overhead_line_supergrid USING btree (uuid);

--
-- Name: ext_ssen_transmission_overhead_line_grid_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_overhead_line_grid_geometry_3857_idx ON public.ext_ssen_transmission_overhead_line_grid USING gist (geometry_3857);

--
-- Name: ext_ssen_transmission_overhead_line_grid_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_overhead_line_grid_geometry_idx ON public.ext_ssen_transmission_overhead_line_grid USING gist (geometry);

--
-- Name: ext_ssen_transmission_overhead_line_grid_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_overhead_line_grid_uuid ON public.ext_ssen_transmission_overhead_line_grid USING btree (uuid);

--
-- Name: ext_ssen_transmission_substations_grid_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_substations_grid_geometry_3857_idx ON public.ext_ssen_transmission_substations_grid USING gist (geometry_3857);

--
-- Name: ext_ssen_transmission_substations_grid_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_substations_grid_geometry_idx ON public.ext_ssen_transmission_substations_grid USING gist (geometry);

--
-- Name: ext_ssen_transmission_substations_grid_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_substations_grid_name ON public.ext_ssen_transmission_substations_grid USING btree (name);

--
-- Name: ext_ssen_transmission_substations_grid_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_substations_grid_uuid ON public.ext_ssen_transmission_substations_grid USING btree (uuid);

--
-- Name: ext_ssen_transmission_substations_supergrid_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_substations_supergrid_geometry_3857_idx ON public.ext_ssen_transmission_substations_supergrid USING gist (geometry_3857);

--
-- Name: ext_ssen_transmission_substations_supergrid_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ssen_transmission_substations_supergrid_geometry_idx ON public.ext_ssen_transmission_substations_supergrid USING gist (geometry);

--
-- Name: ext_ssen_transmission_substations_supergrid_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_substations_supergrid_name ON public.ext_ssen_transmission_substations_supergrid USING btree (name);

--
-- Name: ext_ssen_transmission_substations_supergrid_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ssen_transmission_substations_supergrid_uuid ON public.ext_ssen_transmission_substations_supergrid USING btree (uuid);

--
-- Name: ext_ukpn_132kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_132kv_overhead_lines_uuid ON public.ext_ukpn_132kv_overhead_lines USING btree (uuid);

--
-- Name: ext_ukpn_33kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_33kv_overhead_lines_uuid ON public.ext_ukpn_33kv_overhead_lines USING btree (uuid);

--
-- Name: ext_ukpn_66kv_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_66kv_overhead_lines_uuid ON public.ext_ukpn_66kv_overhead_lines USING btree (uuid);

--
-- Name: ext_ukpn_high_voltage_overhead_lines_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_high_voltage_overhead_lines_uuid ON public.ext_ukpn_high_voltage_overhead_lines USING btree (uuid);

--
-- Name: ext_ukpn_independent_operators_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_independent_operators_uuid ON public.ext_ukpn_independent_operators USING btree (uuid);

--
-- Name: ext_ukpn_substations_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ukpn_substations_geometry_3857_idx ON public.ext_ukpn_substations USING gist (geometry_3857);

--
-- Name: ext_ukpn_substations_geometry_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX ext_ukpn_substations_geometry_idx ON public.ext_ukpn_substations USING gist (geometry);

--
-- Name: ext_ukpn_substations_name; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_substations_name ON public.ext_ukpn_substations USING btree (name);

--
-- Name: ext_ukpn_substations_uuid; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX ext_ukpn_substations_uuid ON public.ext_ukpn_substations USING btree (uuid);

--
-- Name: ext_datagovuk_educational_establishment ext_datagovuk_educational_establishment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_educational_establishment
ADD CONSTRAINT ext_datagovuk_educational_establishment_pkey PRIMARY KEY (uuid);

--
-- Name: ext_datagovuk_educational_establishment ext_datagovuk_educational_establishment_reference_unique; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_educational_establishment
ADD CONSTRAINT ext_datagovuk_educational_establishment_reference_unique UNIQUE (reference);

--
-- Name: ext_datagovuk_national_nature_reserves ext_datagovuk_national_nature_reserves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_national_nature_reserves
ADD CONSTRAINT ext_datagovuk_national_nature_reserves_pkey PRIMARY KEY (uuid);

--
-- Name: ext_datagovuk_national_nature_reserves ext_datagovuk_national_nature_reserves_reference_unique; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_national_nature_reserves
ADD CONSTRAINT ext_datagovuk_national_nature_reserves_reference_unique UNIQUE (reference);

--
-- Name: ext_datagovuk_trees ext_datagovuk_trees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_trees
ADD CONSTRAINT ext_datagovuk_trees_pkey PRIMARY KEY (uuid);

--
-- Name: ext_datagovuk_trees ext_datagovuk_trees_reference_unique; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_datagovuk_trees
ADD CONSTRAINT ext_datagovuk_trees_reference_unique UNIQUE (reference);

--
-- Name: ext_environmentagency_alc_grades ext_environmentagency_alc_grades_object_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_environmentagency_alc_grades
ADD CONSTRAINT ext_environmentagency_alc_grades_object_id_key UNIQUE (objectId);

--
-- Name: ext_nget_overhead_lines ext_nget_overhead_lines_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_nget_overhead_lines
ADD CONSTRAINT ext_nget_overhead_lines_reference_key UNIQUE (reference);

--
-- Name: ext_nget_substations ext_nget_substations_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_nget_substations
ADD CONSTRAINT ext_nget_substations_reference_key UNIQUE (reference);

--
-- Name: ext_nget_towers ext_nget_towers_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_nget_towers
ADD CONSTRAINT ext_nget_towers_reference_key UNIQUE (reference);

--
-- Name: ext_naturalengland_nutrient_neutrality_catchments ext_naturalengland_nutrient_neutrality_catchments_object_id_uni; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_naturalengland_nutrient_neutrality_catchments
ADD CONSTRAINT ext_naturalengland_nutrient_neutrality_catchments_object_id_uni UNIQUE (object_id);

--
-- Name: ext_naturalengland_nutrient_neutrality_catchments ext_naturalengland_nutrient_neutrality_catchments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_naturalengland_nutrient_neutrality_catchments
ADD CONSTRAINT ext_naturalengland_nutrient_neutrality_catchments_pkey PRIMARY KEY (uuid);

--
-- Name: ext_os_contours ext_os_contours_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_os_contours
ADD CONSTRAINT ext_os_contours_reference_key UNIQUE (reference);

--
-- Name: ext_environmentagency_provisional_alc_grades objectid_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.ext_environmentagency_provisional_alc_grades
ADD CONSTRAINT objectid_key UNIQUE (objectid);

--
-- Name: ext_datagovuk_ancient_woodland transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_ancient_woodland FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_aonb transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_aonb FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_battlefields transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_battlefields FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_brownfield transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_brownfield FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_built_up_areas transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_built_up_areas FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_conservation_area transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_conservation_area FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_educational_establishment transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_educational_establishment FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_flood_risk_zones transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_flood_risk_zones FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_green_belt transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_green_belt FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_heritage_at_risk transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_heritage_at_risk FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_heritage_coast transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_heritage_coast FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_historic_park_garden transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_historic_park_garden FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_listed_buildings transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_listed_buildings FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_local_authorities transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_local_authorities FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_local_nature_reserve transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_local_nature_reserve FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_local_planning_authorities transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_local_planning_authorities FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_national_nature_reserves transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_national_nature_reserves FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_national_parks transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_national_parks FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_parishes transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_parishes FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_ramsar transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_ramsar FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_regions transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_regions FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_scheduled_monuments transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_scheduled_monuments FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_special_areas_of_conservation transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_special_areas_of_conservation FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_special_protection_area transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_special_protection_area FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_sssi transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_sssi FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_trees transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_trees FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_world_heritage_site_buffer_zones FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_datagovuk_world_heritage_sites transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_datagovuk_world_heritage_sites FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_environmentagency_alc_grades transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_environmentagency_alc_grades FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_environmentagency_provisional_alc_grades transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_environmentagency_provisional_alc_grades FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_6_6kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_6_6kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_11kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_11kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_33kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_33kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_132kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_132kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_low_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_low_voltage_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_enw_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_enw_substations FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_nget_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nget_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_nget_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nget_substations FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_nget_towers transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_nget_towers FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_naturalengland_nutrient_neutrality_catchments transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_naturalengland_nutrient_neutrality_catchments FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_dnos transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_dnos FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_extra_high_voltage_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_extra_high_voltage_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_high_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_high_voltage_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_independent_operators transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_independent_operators FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_low_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_low_voltage_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_npg_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_npg_substations FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ssen_transmission_overhead_line_supergrid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ssen_transmission_overhead_line_supergrid FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ssen_transmission_overhead_line_grid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ssen_transmission_overhead_line_grid FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ssen_transmission_substations_supergrid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ssen_transmission_substations_supergrid FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ssen_transmission_substations_grid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ssen_transmission_substations_grid FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_33kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_33kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_66kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_66kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_132kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_132kv_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_high_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_high_voltage_overhead_lines FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_independent_operators transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_independent_operators FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

--
-- Name: ext_ukpn_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--
CREATE TRIGGER transform_geometry_trigger BEFORE INSERT
OR
UPDATE ON public.ext_ukpn_substations FOR EACH ROW
EXECUTE FUNCTION public.transform_geometry ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
-- +goose StatementEnd