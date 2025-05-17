--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg110+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger_data;


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: alc_grade; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alc_grade AS ENUM (
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

CREATE TYPE public.dno AS ENUM (
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

CREATE TYPE public.situation AS ENUM (
    'Overhead',
    'Underground'
);


--
-- Name: transform_geometry(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.transform_geometry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ext_datagovuk_ancient_woodland; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_ancient_woodland (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_aonb; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_aonb (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_battlefields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_battlefields (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    entity text NOT NULL,
    document_url text,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_brownfield; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_brownfield (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text,
    organisation_entity text,
    address text,
    notes text,
    ownership_status text,
    minimum_net_dwellings text,
    maximum_net_dwellings text,
    planning_permission_date date,
    planning_permission_type text,
    planning_permission_status text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_built_up_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_built_up_areas (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_conservation_area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_conservation_area (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_educational_establishment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_educational_establishment (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    uprn text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    capacity integer,
    establishment_type text NOT NULL,
    open_date date,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_flood_risk_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_flood_risk_zones (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    type text NOT NULL,
    zone text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_green_belt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_green_belt (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    entity text NOT NULL,
    green_belt_core text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_heritage_at_risk; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_heritage_at_risk (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_heritage_coast; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_heritage_coast (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_historic_park_garden; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_historic_park_garden (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    entry_date date NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_listed_buildings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_listed_buildings (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    reference text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    entity text,
    documentation_url text,
    listed_building_grade character varying(255),
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_local_authorities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_local_authorities (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_local_nature_reserve; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_local_nature_reserve (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_local_planning_authorities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_local_planning_authorities (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    normalised_name text,
    local_planning_authorities_uuid uuid,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_national_nature_reserves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_national_nature_reserves (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_national_parks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_national_parks (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_parishes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_parishes (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_ramsar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_ramsar (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_regions (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_scheduled_monuments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_scheduled_monuments (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    reference text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    entity text,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_special_areas_of_conservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_special_areas_of_conservation (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_special_protection_area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_special_protection_area (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_sssi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_sssi (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_trees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_trees (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    species text,
    name text,
    notes text,
    entry_date date,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_world_heritage_site_buffer_zones (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    world_heritage_site_uuid uuid NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_datagovuk_world_heritage_sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_datagovuk_world_heritage_sites (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    reference text NOT NULL,
    entry_date date NOT NULL,
    start_date date,
    end_date date,
    entity text,
    notes text,
    documentation_url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_environmentagency_alc_grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_environmentagency_alc_grades (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    objectid integer,
    alc_grade public.alc_grade,
    area numeric,
    url text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_environmentagency_provisional_alc_grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_environmentagency_provisional_alc_grades (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    objectid integer,
    alc_grade public.alc_grade,
    area numeric,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp with time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_enw_11kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_enw_11kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_enw_132kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_enw_132kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_enw_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_enw_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255),
    infeed_voltage integer,
    outfeed_voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_naturalengland_nutrient_neutrality_catchments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_naturalengland_nutrient_neutrality_catchments (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    popup_info text,
    n2k_site_name text,
    label text,
    object_id integer,
    date_amended date,
    notes text,
    global_id text,
    oid_1 integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_nged_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_nged_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_nget_overhead_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_nget_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    status text,
    circuit_one text,
    circuit_two text,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_nget_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_nget_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text,
    name text,
    status text,
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_nget_towers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_nget_towers (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    status text NOT NULL,
    tower_height numeric,
    year_installed integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_npg_dnos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_npg_dnos (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_npg_independent_operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_npg_independent_operators (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_npg_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_npg_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_openstreetmap_healthcare; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_openstreetmap_healthcare (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    reference character varying(64) NOT NULL,
    node_type character varying(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_openstreetmap_public_right_of_way; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_openstreetmap_public_right_of_way (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference character varying(64) NOT NULL,
    way_type character varying(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_openstreetmap_public_transport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_openstreetmap_public_transport (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    reference character varying(64) NOT NULL,
    node_type character varying(40) NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_os_contours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_os_contours (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    height_m double precision NOT NULL,
    contour_line_type text NOT NULL,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_spen_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_spen_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_ssen_transmission_overhead_line_grid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ssen_transmission_overhead_line_grid (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer NOT NULL,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_ssen_transmission_overhead_line_supergrid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ssen_transmission_overhead_line_supergrid (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer NOT NULL,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_ssen_transmission_substations_grid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ssen_transmission_substations_grid (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_ssen_transmission_substations_supergrid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ssen_transmission_substations_supergrid (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ext_ukpn_132kv_overhead_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ukpn_132kv_overhead_lines (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
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
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voltage integer,
    situation public.situation,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_ukpn_independent_operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ukpn_independent_operators (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT now() NOT NULL,
    last_imported_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ext_ukpn_substations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ext_ukpn_substations (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255),
    voltage integer,
    geometry public.geometry NOT NULL,
    geometry_3857 public.geometry NOT NULL,
    geometry_27700 public.geometry NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fetches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fetches (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    command text NOT NULL,
    error text,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    finished_at timestamp without time zone
);


--
-- Name: goose_db_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goose_db_version (
    id integer NOT NULL,
    version_id bigint NOT NULL,
    is_applied boolean NOT NULL,
    tstamp timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: goose_db_version_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.goose_db_version ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.goose_db_version_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: int_independent_operators; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.int_independent_operators AS
 SELECT ext_npg_independent_operators.uuid,
    ext_npg_independent_operators.name,
    ext_npg_independent_operators.geometry,
    ext_npg_independent_operators.geometry_3857,
    ext_npg_independent_operators.geometry_27700,
    'NPG'::public.dno AS dno
   FROM public.ext_npg_independent_operators
UNION ALL
 SELECT ext_ukpn_independent_operators.uuid,
    ext_ukpn_independent_operators.name,
    ext_ukpn_independent_operators.geometry,
    ext_ukpn_independent_operators.geometry_3857,
    ext_ukpn_independent_operators.geometry_27700,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_independent_operators
  WITH NO DATA;


--
-- Name: int_powerlines; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.int_powerlines AS
 SELECT ext_enw_132kv_overhead_lines.uuid,
    ext_enw_132kv_overhead_lines.geometry,
    ext_enw_132kv_overhead_lines.geometry_3857,
    ext_enw_132kv_overhead_lines.voltage,
    ext_enw_132kv_overhead_lines.situation,
    ext_enw_132kv_overhead_lines.first_imported_at,
    ext_enw_132kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_132kv_overhead_lines
UNION ALL
 SELECT ext_enw_33kv_overhead_lines.uuid,
    ext_enw_33kv_overhead_lines.geometry,
    ext_enw_33kv_overhead_lines.geometry_3857,
    ext_enw_33kv_overhead_lines.voltage,
    ext_enw_33kv_overhead_lines.situation,
    ext_enw_33kv_overhead_lines.first_imported_at,
    ext_enw_33kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_33kv_overhead_lines
UNION ALL
 SELECT ext_enw_11kv_overhead_lines.uuid,
    ext_enw_11kv_overhead_lines.geometry,
    ext_enw_11kv_overhead_lines.geometry_3857,
    ext_enw_11kv_overhead_lines.voltage,
    ext_enw_11kv_overhead_lines.situation,
    ext_enw_11kv_overhead_lines.first_imported_at,
    ext_enw_11kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_11kv_overhead_lines
UNION ALL
 SELECT ext_enw_6_6kv_overhead_lines.uuid,
    ext_enw_6_6kv_overhead_lines.geometry,
    ext_enw_6_6kv_overhead_lines.geometry_3857,
    ext_enw_6_6kv_overhead_lines.voltage,
    ext_enw_6_6kv_overhead_lines.situation,
    ext_enw_6_6kv_overhead_lines.first_imported_at,
    ext_enw_6_6kv_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_6_6kv_overhead_lines
UNION ALL
 SELECT ext_enw_low_voltage_overhead_lines.uuid,
    ext_enw_low_voltage_overhead_lines.geometry,
    ext_enw_low_voltage_overhead_lines.geometry_3857,
    ext_enw_low_voltage_overhead_lines.voltage,
    ext_enw_low_voltage_overhead_lines.situation,
    ext_enw_low_voltage_overhead_lines.first_imported_at,
    ext_enw_low_voltage_overhead_lines.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_low_voltage_overhead_lines
UNION ALL
 SELECT ext_npg_extra_high_voltage_lines.uuid,
    ext_npg_extra_high_voltage_lines.geometry,
    ext_npg_extra_high_voltage_lines.geometry_3857,
    ext_npg_extra_high_voltage_lines.voltage,
    ext_npg_extra_high_voltage_lines.situation,
    ext_npg_extra_high_voltage_lines.first_imported_at,
    ext_npg_extra_high_voltage_lines.last_imported_at,
    'NPG'::public.dno AS dno
   FROM public.ext_npg_extra_high_voltage_lines
UNION ALL
 SELECT ext_npg_high_voltage_overhead_lines.uuid,
    ext_npg_high_voltage_overhead_lines.geometry,
    ext_npg_high_voltage_overhead_lines.geometry_3857,
    ext_npg_high_voltage_overhead_lines.voltage,
    ext_npg_high_voltage_overhead_lines.situation,
    ext_npg_high_voltage_overhead_lines.first_imported_at,
    ext_npg_high_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
   FROM public.ext_npg_high_voltage_overhead_lines
UNION ALL
 SELECT ext_ssen_transmission_overhead_line_supergrid.uuid,
    ext_ssen_transmission_overhead_line_supergrid.geometry,
    ext_ssen_transmission_overhead_line_supergrid.geometry_3857,
    ext_ssen_transmission_overhead_line_supergrid.voltage,
    ext_ssen_transmission_overhead_line_supergrid.situation,
    ext_ssen_transmission_overhead_line_supergrid.first_imported_at,
    ext_ssen_transmission_overhead_line_supergrid.last_imported_at,
    'SSEN'::public.dno AS dno
   FROM public.ext_ssen_transmission_overhead_line_supergrid
UNION ALL
 SELECT ext_ssen_transmission_overhead_line_grid.uuid,
    ext_ssen_transmission_overhead_line_grid.geometry,
    ext_ssen_transmission_overhead_line_grid.geometry_3857,
    ext_ssen_transmission_overhead_line_grid.voltage,
    ext_ssen_transmission_overhead_line_grid.situation,
    ext_ssen_transmission_overhead_line_grid.first_imported_at,
    ext_ssen_transmission_overhead_line_grid.last_imported_at,
    'SSEN'::public.dno AS dno
   FROM public.ext_ssen_transmission_overhead_line_grid
UNION ALL
 SELECT ext_nget_overhead_lines.uuid,
    ext_nget_overhead_lines.geometry,
    ext_nget_overhead_lines.geometry_3857,
    ext_nget_overhead_lines.voltage,
    ext_nget_overhead_lines.situation,
    ext_nget_overhead_lines.first_imported_at,
    ext_nget_overhead_lines.last_imported_at,
    'NGET'::public.dno AS dno
   FROM public.ext_nget_overhead_lines
UNION ALL
 SELECT ext_npg_low_voltage_overhead_lines.uuid,
    ext_npg_low_voltage_overhead_lines.geometry,
    ext_npg_low_voltage_overhead_lines.geometry_3857,
    ext_npg_low_voltage_overhead_lines.voltage,
    ext_npg_low_voltage_overhead_lines.situation,
    ext_npg_low_voltage_overhead_lines.first_imported_at,
    ext_npg_low_voltage_overhead_lines.last_imported_at,
    'NPG'::public.dno AS dno
   FROM public.ext_npg_low_voltage_overhead_lines
UNION ALL
 SELECT ext_ukpn_132kv_overhead_lines.uuid,
    ext_ukpn_132kv_overhead_lines.geometry,
    ext_ukpn_132kv_overhead_lines.geometry_3857,
    ext_ukpn_132kv_overhead_lines.voltage,
    ext_ukpn_132kv_overhead_lines.situation,
    ext_ukpn_132kv_overhead_lines.first_imported_at,
    ext_ukpn_132kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_132kv_overhead_lines
UNION ALL
 SELECT ext_ukpn_66kv_overhead_lines.uuid,
    ext_ukpn_66kv_overhead_lines.geometry,
    ext_ukpn_66kv_overhead_lines.geometry_3857,
    ext_ukpn_66kv_overhead_lines.voltage,
    ext_ukpn_66kv_overhead_lines.situation,
    ext_ukpn_66kv_overhead_lines.first_imported_at,
    ext_ukpn_66kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_66kv_overhead_lines
UNION ALL
 SELECT ext_ukpn_33kv_overhead_lines.uuid,
    ext_ukpn_33kv_overhead_lines.geometry,
    ext_ukpn_33kv_overhead_lines.geometry_3857,
    ext_ukpn_33kv_overhead_lines.voltage,
    ext_ukpn_33kv_overhead_lines.situation,
    ext_ukpn_33kv_overhead_lines.first_imported_at,
    ext_ukpn_33kv_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_33kv_overhead_lines
UNION ALL
 SELECT ext_ukpn_high_voltage_overhead_lines.uuid,
    ext_ukpn_high_voltage_overhead_lines.geometry,
    ext_ukpn_high_voltage_overhead_lines.geometry_3857,
    ext_ukpn_high_voltage_overhead_lines.voltage,
    ext_ukpn_high_voltage_overhead_lines.situation,
    ext_ukpn_high_voltage_overhead_lines.first_imported_at,
    ext_ukpn_high_voltage_overhead_lines.last_imported_at,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_high_voltage_overhead_lines
  WITH NO DATA;


--
-- Name: int_substations; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.int_substations AS
 SELECT ext_enw_substations.uuid,
    ext_enw_substations.geometry,
    ext_enw_substations.geometry_3857,
    ext_enw_substations.name,
    ext_enw_substations.number,
    ext_enw_substations.outfeed_voltage AS voltage,
    ext_enw_substations.first_imported_at,
    ext_enw_substations.last_imported_at,
    'ENW'::public.dno AS dno
   FROM public.ext_enw_substations
UNION ALL
 SELECT ext_nged_substations.uuid,
    ext_nged_substations.geometry,
    ext_nged_substations.geometry_3857,
    ext_nged_substations.name,
    ext_nged_substations.number,
    ext_nged_substations.voltage,
    ext_nged_substations.first_imported_at,
    ext_nged_substations.last_imported_at,
    'NGED'::public.dno AS dno
   FROM public.ext_nged_substations
UNION ALL
 SELECT ext_npg_substations.uuid,
    ext_npg_substations.geometry,
    ext_npg_substations.geometry_3857,
    ext_npg_substations.name,
    ext_npg_substations.number,
    ext_npg_substations.voltage,
    ext_npg_substations.first_imported_at,
    ext_npg_substations.last_imported_at,
    'NPG'::public.dno AS dno
   FROM public.ext_npg_substations
UNION ALL
 SELECT ext_spen_substations.uuid,
    ext_spen_substations.geometry,
    ext_spen_substations.geometry_3857,
    ext_spen_substations.name,
    ext_spen_substations.number,
    ext_spen_substations.voltage,
    ext_spen_substations.first_imported_at,
    ext_spen_substations.last_imported_at,
    'SPEN'::public.dno AS dno
   FROM public.ext_spen_substations
UNION ALL
 SELECT ext_ssen_transmission_substations_supergrid.uuid,
    ext_ssen_transmission_substations_supergrid.geometry,
    ext_ssen_transmission_substations_supergrid.geometry_3857,
    ext_ssen_transmission_substations_supergrid.name,
    ext_ssen_transmission_substations_supergrid.number,
    ext_ssen_transmission_substations_supergrid.voltage,
    ext_ssen_transmission_substations_supergrid.first_imported_at,
    ext_ssen_transmission_substations_supergrid.last_imported_at,
    'SSEN'::public.dno AS dno
   FROM public.ext_ssen_transmission_substations_supergrid
UNION ALL
 SELECT ext_ssen_transmission_substations_grid.uuid,
    ext_ssen_transmission_substations_grid.geometry,
    ext_ssen_transmission_substations_grid.geometry_3857,
    ext_ssen_transmission_substations_grid.name,
    ext_ssen_transmission_substations_grid.number,
    ext_ssen_transmission_substations_grid.voltage,
    ext_ssen_transmission_substations_grid.first_imported_at,
    ext_ssen_transmission_substations_grid.last_imported_at,
    'SSEN'::public.dno AS dno
   FROM public.ext_ssen_transmission_substations_grid
UNION ALL
 SELECT ext_ukpn_substations.uuid,
    ext_ukpn_substations.geometry,
    ext_ukpn_substations.geometry_3857,
    ext_ukpn_substations.name,
    ext_ukpn_substations.number,
    ext_ukpn_substations.voltage,
    ext_ukpn_substations.first_imported_at,
    ext_ukpn_substations.last_imported_at,
    'UKPN'::public.dno AS dno
   FROM public.ext_ukpn_substations
  WITH NO DATA;


--
-- Name: planning_application_appeals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_application_appeals (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lpa text NOT NULL,
    reference text NOT NULL,
    case_id integer NOT NULL,
    url text NOT NULL,
    appellant_name text,
    agent_name text,
    site_address text,
    case_type text,
    case_officer text,
    procedure text,
    status text,
    decision text,
    start_date date,
    questionnaire_due_date date,
    statement_due_date date,
    interested_party_comments_due_date date,
    final_comments_due_date date,
    inquiry_evidence_due_date date,
    event_date date,
    decision_date date,
    linked_case_ids integer[],
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: planning_application_appeals_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_application_appeals_documents (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    planning_application_appeal_uuid uuid NOT NULL,
    appeal_case_id integer NOT NULL,
    reference text,
    name text,
    url text NOT NULL,
    s3_path text,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: planning_application_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_application_documents (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    planning_application_uuid uuid NOT NULL,
    date_published date NOT NULL,
    document_type character varying(255) NOT NULL,
    description text,
    url text NOT NULL,
    drawing_number character varying(255),
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    s3_path text
);


--
-- Name: planning_application_geometries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_application_geometries (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    planning_application_uuid uuid NOT NULL,
    reference character varying(255) NOT NULL,
    geometry public.geometry,
    geometry_3857 public.geometry,
    geometry_27700 public.geometry,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: planning_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_applications (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lpa character varying(255) NOT NULL,
    reference character varying(255) NOT NULL,
    website_reference character varying(255) NOT NULL,
    url text NOT NULL,
    submitted_date date,
    validated_date date,
    address text,
    description text,
    application_status character varying(255),
    application_decision character varying(255),
    application_decision_date date,
    appeal_status character varying(255),
    appeal_decision character varying(255),
    appeal_decision_date date,
    application_type character varying(255),
    expected_decision_level character varying(255),
    actual_decision_level character varying(255),
    case_officer character varying(255),
    parish character varying(255),
    ward character varying(255),
    amenity_society character varying(255),
    district_reference character varying(255),
    applicant_name character varying(255),
    applicant_address character varying(255),
    environmental_assessment_requested boolean,
    is_active boolean DEFAULT true NOT NULL,
    first_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    case_officer_phone text,
    comments_due_date date,
    committee_date date,
    agent_name text,
    agent_address text,
    CONSTRAINT planning_applications_application_decision_date_appeal_decision CHECK ((application_decision_date <= appeal_decision_date)),
    CONSTRAINT planning_applications_submitted_date_validated_date_check CHECK ((submitted_date <= validated_date)),
    CONSTRAINT planning_applications_validated_date_application_decision_date_ CHECK ((validated_date <= application_decision_date))
);


--
-- Name: scraper_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scraper_runs (
    name text NOT NULL,
    last_finished_at timestamp without time zone,
    last_data_found_at timestamp without time zone,
    last_run_stats jsonb
);


--
-- Name: ext_datagovuk_brownfield ext_datagovuk_brownfield_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ext_datagovuk_brownfield
    ADD CONSTRAINT ext_datagovuk_brownfield_reference_key UNIQUE (reference);


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
    ADD CONSTRAINT ext_environmentagency_alc_grades_object_id_key UNIQUE (objectid);


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
-- Name: ext_datagovuk_flood_risk_zones_geometry_27700_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_27700_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry_27700);


--
-- Name: ext_datagovuk_flood_risk_zones_geometry_3857_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_3857_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry_3857);


--
-- Name: ext_datagovuk_flood_risk_zones_geometry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_geometry_idx ON public.ext_datagovuk_flood_risk_zones USING gist (geometry);


--
-- Name: ext_datagovuk_flood_risk_zones_reference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_reference_idx ON public.ext_datagovuk_flood_risk_zones USING btree (reference);


--
-- Name: ext_datagovuk_flood_risk_zones_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_type_idx ON public.ext_datagovuk_flood_risk_zones USING btree (type);


--
-- Name: ext_datagovuk_flood_risk_zones_uuid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ext_datagovuk_flood_risk_zones_uuid_idx ON public.ext_datagovuk_flood_risk_zones USING btree (uuid);


--
-- Name: ext_datagovuk_flood_risk_zones_zone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ext_datagovuk_flood_risk_zones_zone_idx ON public.ext_datagovuk_flood_risk_zones USING btree (zone);


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
-- Name: ext_datagovuk_ancient_woodland transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_ancient_woodland FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_aonb transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_aonb FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_battlefields transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_battlefields FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_brownfield transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_brownfield FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_built_up_areas transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_built_up_areas FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_conservation_area transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_conservation_area FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_educational_establishment transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_educational_establishment FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_flood_risk_zones transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_flood_risk_zones FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_green_belt transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_green_belt FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_heritage_at_risk transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_heritage_at_risk FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_heritage_coast transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_heritage_coast FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_historic_park_garden transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_historic_park_garden FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_listed_buildings transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_listed_buildings FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_local_authorities transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_local_authorities FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_local_nature_reserve transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_local_nature_reserve FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_local_planning_authorities transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_local_planning_authorities FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_national_nature_reserves transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_national_nature_reserves FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_national_parks transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_national_parks FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_parishes transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_parishes FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_ramsar transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_ramsar FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_regions transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_regions FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_scheduled_monuments transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_scheduled_monuments FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_special_areas_of_conservation transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_special_areas_of_conservation FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_special_protection_area transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_special_protection_area FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_sssi transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_sssi FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_trees transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_trees FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_world_heritage_site_buffer_zones transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_world_heritage_site_buffer_zones FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_datagovuk_world_heritage_sites transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_datagovuk_world_heritage_sites FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_environmentagency_alc_grades transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_environmentagency_alc_grades FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_environmentagency_provisional_alc_grades transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_environmentagency_provisional_alc_grades FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_11kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_11kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_132kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_132kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_33kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_33kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_6_6kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_6_6kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_low_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_low_voltage_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_enw_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_enw_substations FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_naturalengland_nutrient_neutrality_catchments transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_naturalengland_nutrient_neutrality_catchments FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_nget_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_nget_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_nget_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_nget_substations FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_nget_towers transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_nget_towers FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_dnos transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_dnos FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_extra_high_voltage_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_extra_high_voltage_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_high_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_high_voltage_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_independent_operators transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_independent_operators FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_low_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_low_voltage_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_npg_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_npg_substations FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ssen_transmission_overhead_line_grid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ssen_transmission_overhead_line_grid FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ssen_transmission_overhead_line_supergrid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ssen_transmission_overhead_line_supergrid FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ssen_transmission_substations_grid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ssen_transmission_substations_grid FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ssen_transmission_substations_supergrid transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ssen_transmission_substations_supergrid FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_132kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_132kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_33kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_33kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_66kv_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_66kv_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_high_voltage_overhead_lines transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_high_voltage_overhead_lines FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_independent_operators transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_independent_operators FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- Name: ext_ukpn_substations transform_geometry_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transform_geometry_trigger BEFORE INSERT OR UPDATE ON public.ext_ukpn_substations FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg110+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: goose_db_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.goose_db_version ("version_id", "is_applied") VALUES (0, true);
INSERT INTO public.goose_db_version ("version_id", "is_applied") VALUES (20250423092753, true);
INSERT INTO public.goose_db_version ("version_id", "is_applied") VALUES (20250517123430, true);


--
-- Name: goose_db_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--




--
-- PostgreSQL database dump complete
--

