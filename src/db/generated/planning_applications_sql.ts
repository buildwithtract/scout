import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getPlanningApplicationByUuidQuery = `-- name: GetPlanningApplicationByUuid :one
SELECT
    uuid, lpa, reference, website_reference, url, submitted_date, validated_date, address, description, application_status, application_decision, application_decision_date, appeal_status, appeal_decision, appeal_decision_date, application_type, expected_decision_level, actual_decision_level, case_officer, parish, ward, amenity_society, district_reference, applicant_name, applicant_address, environmental_assessment_requested, is_active, first_imported_at, last_imported_at, case_officer_phone, comments_due_date, committee_date, agent_name, agent_address
FROM
    planning_applications
WHERE
    uuid = $1`;

export interface GetPlanningApplicationByUuidArgs {
    uuid: string;
}

export interface GetPlanningApplicationByUuidRow {
    uuid: string;
    lpa: string;
    reference: string;
    websiteReference: string;
    url: string;
    submittedDate: Date | null;
    validatedDate: Date | null;
    address: string | null;
    description: string | null;
    applicationStatus: string | null;
    applicationDecision: string | null;
    applicationDecisionDate: Date | null;
    appealStatus: string | null;
    appealDecision: string | null;
    appealDecisionDate: Date | null;
    applicationType: string | null;
    expectedDecisionLevel: string | null;
    actualDecisionLevel: string | null;
    caseOfficer: string | null;
    parish: string | null;
    ward: string | null;
    amenitySociety: string | null;
    districtReference: string | null;
    applicantName: string | null;
    applicantAddress: string | null;
    environmentalAssessmentRequested: boolean | null;
    isActive: boolean;
    firstImportedAt: Date;
    lastImportedAt: Date;
    caseOfficerPhone: string | null;
    commentsDueDate: Date | null;
    committeeDate: Date | null;
    agentName: string | null;
    agentAddress: string | null;
}

export async function getPlanningApplicationByUuid(client: Client, args: GetPlanningApplicationByUuidArgs): Promise<GetPlanningApplicationByUuidRow | null> {
    const result = await client.query({
        text: getPlanningApplicationByUuidQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        lpa: row[1],
        reference: row[2],
        websiteReference: row[3],
        url: row[4],
        submittedDate: row[5],
        validatedDate: row[6],
        address: row[7],
        description: row[8],
        applicationStatus: row[9],
        applicationDecision: row[10],
        applicationDecisionDate: row[11],
        appealStatus: row[12],
        appealDecision: row[13],
        appealDecisionDate: row[14],
        applicationType: row[15],
        expectedDecisionLevel: row[16],
        actualDecisionLevel: row[17],
        caseOfficer: row[18],
        parish: row[19],
        ward: row[20],
        amenitySociety: row[21],
        districtReference: row[22],
        applicantName: row[23],
        applicantAddress: row[24],
        environmentalAssessmentRequested: row[25],
        isActive: row[26],
        firstImportedAt: row[27],
        lastImportedAt: row[28],
        caseOfficerPhone: row[29],
        commentsDueDate: row[30],
        committeeDate: row[31],
        agentName: row[32],
        agentAddress: row[33]
    };
}

export const getNearestPlanningApplicationsQuery = `-- name: GetNearestPlanningApplications :many
SELECT
    pa.uuid, pa.lpa, pa.reference, pa.website_reference, pa.url, pa.submitted_date, pa.validated_date, pa.address, pa.description, pa.application_status, pa.application_decision, pa.application_decision_date, pa.appeal_status, pa.appeal_decision, pa.appeal_decision_date, pa.application_type, pa.expected_decision_level, pa.actual_decision_level, pa.case_officer, pa.parish, pa.ward, pa.amenity_society, pa.district_reference, pa.applicant_name, pa.applicant_address, pa.environmental_assessment_requested, pa.is_active, pa.first_imported_at, pa.last_imported_at, pa.case_officer_phone, pa.comments_due_date, pa.committee_date, pa.agent_name, pa.agent_address,
    ST_Distance (
        CASE
            WHEN ST_GeometryType (pag.geometry) = 'ST_Point' THEN ST_Transform (ST_SetSRID (pag.geometry, 4326), 3857)
            ELSE ST_Transform (
                ST_SetSRID (ST_Centroid (pag.geometry), 4326),
                3857
            )
        END,
        ST_Transform (
            ST_SetSRID (ST_GeomFromWKB ($1), 4326),
            3857
        )
    )::float AS distance,
    pag.geometry::geometry AS geometry
FROM
    planning_applications pa
    JOIN planning_application_geometries pag ON pa.uuid = pag.planning_application_uuid
WHERE
    ST_DWithin (
        CASE
            WHEN ST_GeometryType (pag.geometry) = 'ST_Point' THEN ST_Transform (ST_SetSRID (pag.geometry, 4326), 3857)
            ELSE ST_Transform (
                ST_SetSRID (ST_Centroid (pag.geometry), 4326),
                3857
            )
        END,
        ST_Transform (
            ST_SetSRID (ST_GeomFromWKB ($1), 4326),
            3857
        ),
        $2
    )
ORDER BY
    distance ASC`;

export interface GetNearestPlanningApplicationsArgs {
    point: string;
    distanceMetres: string;
}

export interface GetNearestPlanningApplicationsRow {
    uuid: string;
    lpa: string;
    reference: string;
    websiteReference: string;
    url: string;
    submittedDate: Date | null;
    validatedDate: Date | null;
    address: string | null;
    description: string | null;
    applicationStatus: string | null;
    applicationDecision: string | null;
    applicationDecisionDate: Date | null;
    appealStatus: string | null;
    appealDecision: string | null;
    appealDecisionDate: Date | null;
    applicationType: string | null;
    expectedDecisionLevel: string | null;
    actualDecisionLevel: string | null;
    caseOfficer: string | null;
    parish: string | null;
    ward: string | null;
    amenitySociety: string | null;
    districtReference: string | null;
    applicantName: string | null;
    applicantAddress: string | null;
    environmentalAssessmentRequested: boolean | null;
    isActive: boolean;
    firstImportedAt: Date;
    lastImportedAt: Date;
    caseOfficerPhone: string | null;
    commentsDueDate: Date | null;
    committeeDate: Date | null;
    agentName: string | null;
    agentAddress: string | null;
    distance: number;
    geometry: string;
}

export async function getNearestPlanningApplications(client: Client, args: GetNearestPlanningApplicationsArgs): Promise<GetNearestPlanningApplicationsRow[]> {
    const result = await client.query({
        text: getNearestPlanningApplicationsQuery,
        values: [args.point, args.distanceMetres],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            lpa: row[1],
            reference: row[2],
            websiteReference: row[3],
            url: row[4],
            submittedDate: row[5],
            validatedDate: row[6],
            address: row[7],
            description: row[8],
            applicationStatus: row[9],
            applicationDecision: row[10],
            applicationDecisionDate: row[11],
            appealStatus: row[12],
            appealDecision: row[13],
            appealDecisionDate: row[14],
            applicationType: row[15],
            expectedDecisionLevel: row[16],
            actualDecisionLevel: row[17],
            caseOfficer: row[18],
            parish: row[19],
            ward: row[20],
            amenitySociety: row[21],
            districtReference: row[22],
            applicantName: row[23],
            applicantAddress: row[24],
            environmentalAssessmentRequested: row[25],
            isActive: row[26],
            firstImportedAt: row[27],
            lastImportedAt: row[28],
            caseOfficerPhone: row[29],
            commentsDueDate: row[30],
            committeeDate: row[31],
            agentName: row[32],
            agentAddress: row[33],
            distance: row[34],
            geometry: row[35]
        };
    });
}

export const getPlanningApplicationsInMvtQuery = `-- name: GetPlanningApplicationsInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                $1::int,
                $2::int,
                $3::int
            ) as envelope
    ),
    geometry_points AS (
        SELECT
            pa.uuid,
            pa.reference,
            pa.url,
            pa.submitted_date,
            pa.address,
            pa.description,
            pa.application_status,
            pa.application_decision,
            CASE
                WHEN ST_GeometryType (ST_SetSRID (pag.geometry, 4326)) = 'ST_Point' THEN ST_SetSRID (pag.geometry, 4326)
                ELSE ST_Centroid (ST_SetSRID (pag.geometry, 4326))
            END as geometry_point
        FROM
            public.planning_applications pa
            JOIN public.planning_application_geometries pag ON pa.uuid = pag.planning_application_uuid
    ),
    mvtgeom AS (
        SELECT
            uuid,
            reference,
            url,
            submitted_date,
            address,
            description,
            application_status,
            application_decision,
            COALESCE('Planning Application: ' || reference) AS annotation,
            ST_AsMVTGeom (
                ST_Transform (geometry_point, 3857),
                tile.envelope
            )::geometry AS geometry
        FROM
            geometry_points gp,
            tile
        WHERE
            ST_Intersects (
                ST_Transform (gp.geometry_point, 3857),
                tile.envelope
            )
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetPlanningApplicationsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetPlanningApplicationsInMvtRow {
    mvt: Buffer;
}

export async function getPlanningApplicationsInMvt(client: Client, args: GetPlanningApplicationsInMvtArgs): Promise<GetPlanningApplicationsInMvtRow | null> {
    const result = await client.query({
        text: getPlanningApplicationsInMvtQuery,
        values: [args.z, args.x, args.y],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        mvt: row[0]
    };
}

