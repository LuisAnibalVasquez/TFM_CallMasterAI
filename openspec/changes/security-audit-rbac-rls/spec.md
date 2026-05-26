# Security Architecture Improvements Specification

## Purpose
This specification defines the functional requirements for hardening the platform's security through strict input validation, native database tenant isolation, and enhanced Role-Based Access Control (RBAC) with emergency override capabilities.

---

# Domain: Input Validation & Sanitization (NEW)

## Requirements

### Requirement: API Payload Whitelisting
The system MUST enforce strict payload whitelisting for all incoming API requests. Any field present in the request body that is not explicitly defined in the corresponding Data Transfer Object (DTO) MUST be rejected.

#### Scenario: Request with non-whitelisted fields
- GIVEN a DTO that only allows `name` and `environment`
- WHEN a client sends a POST request with `name`, `environment`, and an extra field `isAdmin: true`
- THEN the system MUST return a `400 Bad Request` error
- AND the error message SHOULD indicate that the property `isAdmin` is not allowed

#### Scenario: Valid request with whitelisted fields
- GIVEN a DTO that allows `name` and `environment`
- WHEN a client sends a POST request with only `name` and `environment`
- THEN the system MUST process the request successfully

### Requirement: Payload Transformation
The system SHALL automatically transform incoming payload data into the types specified in the DTOs (e.g., converting a numeric string from a query parameter into a number).

#### Scenario: Automatic type conversion
- GIVEN a DTO where `page` is defined as a `number`
- WHEN a client sends a request with `?page=5` (string)
- THEN the system MUST treat the `page` value as the number `5` in the application logic

### Requirement: Frontend Input Sanitization
The frontend MUST validate and sanitize all user inputs using Zod schemas before attempting any network requests.

#### Scenario: Invalid email format on frontend
- GIVEN a login form with a Zod schema requiring a valid email
- WHEN the user enters "invalid-email" and attempts to submit
- THEN the frontend MUST block the request
- AND MUST display a validation error message without hitting the backend

---

# Domain: Tenant Data Isolation (NEW)

## Requirements

### Requirement: Multi-tenant Data Separation (RLS)
The database MUST natively enforce tenant isolation using Row Level Security (RLS). Every query executed by a tenant-scoped session SHALL only return or modify rows where the `tenant_id` matches the `tenant_id` claim in the user's JWT.

#### Scenario: Tenant attempts to access other tenant's data
- GIVEN Tenant A with `tenant_id: "uuid-a"` and Tenant B with `tenant_id: "uuid-b"`
- WHEN Tenant A attempts to fetch a campaign belonging to Tenant B via the API
- THEN the database MUST return no results (or a permission error)
- AND the API MUST return a `404 Not Found` or `403 Forbidden`

### Requirement: Platform Owner Emergency Override
The system SHALL provide a mechanism to allow `PlatformOwner` users to access tenant data ONLY when an explicit "Emergency Session" is active. By default, `PlatformOwner` users MUST NOT have access to tenant data.

#### Scenario: PlatformOwner accessing tenant data without emergency session
- GIVEN an authenticated `PlatformOwner`
- WHEN the user attempts to view a list of campaigns for a specific tenant
- THEN the system MUST reject the request with a `403 Forbidden`

#### Scenario: PlatformOwner accessing tenant data with emergency session
- GIVEN an authenticated `PlatformOwner` in an active "Emergency Session" (verified via DB function)
- WHEN the user attempts to view a list of campaigns
- THEN the system MUST allow access to the requested data

---

# Domain: Security Authentication & Authorization (MODIFIED)

## MODIFIED Requirements

### Requirement: Role-Based Access Control (RBAC)
The system MUST distinguish between Platform Owner and Tenant users. Certain actions SHALL be restricted based on the user's role. Additionally, certain endpoints MAY allow access to `PlatformOwner` even if they are tenant-specific, provided they are marked with an `@AllowOverride()` decorator and the user is in an emergency session.
(Previously: The system MUST distinguish between Platform Owner and Tenant users. Certain actions SHALL be restricted based on the user's role.)

#### Scenario: Tenant accessing Platform Owner view
- GIVEN a user logged in with a Tenant role
- WHEN the user attempts to access the "Tenant Management" dashboard
- THEN the system MUST return a "Forbidden" (403) error

#### Scenario: Explicit TenantAdmin role requirement
- GIVEN a user logged in with a `PlatformOwner` role
- WHEN the user attempts to access the "Campaigns" list (which requires `TenantAdmin` role)
- THEN the system MUST return a "Forbidden" (403) error (unless override applies)

#### Scenario: PlatformOwner override on protected endpoint
- GIVEN a `PlatformOwner` user and an endpoint decorated with `@Roles(UserRole.TenantAdmin)` and `@AllowOverride()`
- WHEN the user accesses the endpoint while in an emergency session
- THEN the system MUST grant access

---

## Summary
- **Status**: Draft
- **Executive Summary**: This spec defines the multi-layered security approach: (1) Edge validation with Zod and NestJS pipes, (2) RBAC hardening with explicit role requirements and override logic, and (3) Database-level tenant isolation via RLS.
- **Artifacts**: `openspec/changes/security-audit-rbac-rls/spec.md`
- **Next Recommended**: Proceed to technical design (sdd-design) to define the RLS policy SQL and the NestJS guard implementation.
- **Risks**: Potential for breaking existing integrations if DTOs are missing fields (strict whitelisting); performance impact of RLS on complex queries (mitigated by indexing).
