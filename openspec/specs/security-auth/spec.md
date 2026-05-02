# Security Authentication & Authorization Specification

## Purpose
Define los requisitos de seguridad para Call Master AI, incluyendo autenticación de usuarios (Platform Owner y Tenants), autorización basada en roles, gestión de API Keys y ciclo de vida de credenciales.

## Requirements

### Requirement: User Authentication

The system MUST authenticate users using email and password. Upon successful authentication, the system SHALL issue:
1. A short-lived **Access Token** (JWT).
2. A long-lived **Refresh Token**.

#### Scenario: Successful Login with Token Issuance
- GIVEN a registered user with valid credentials
- WHEN the user attempts to log in with correct email and password
- THEN the system MUST return a valid Access Token with a short expiration time (e.g., 15 minutes)
- AND MUST provide a Refresh Token with a longer expiration (e.g., 7 days)
- AND access to the corresponding dashboard MUST be granted

#### Scenario: Token Refresh
- GIVEN a user with an expired Access Token but a valid Refresh Token
- WHEN the user requests a new Access Token using the Refresh Token
- THEN the system MUST issue a new Access Token
- AND SHOULD rotate the Refresh Token (issue a new one and invalidate the old one)

#### Scenario: Expired Refresh Token
- GIVEN a user with an expired Refresh Token
- WHEN the user attempts to refresh the Access Token
- THEN the system MUST reject the request
- AND the user MUST be forced to log in again with credentials

#### Scenario: Failed Login
- GIVEN a registered user
- WHEN the user attempts to log in with an incorrect password
- THEN the system MUST return an authentication error
- AND NO tokens MUST be issued

### Requirement: User Logout

The system MUST allow users to terminate their session. Upon logout, the system SHALL invalidate BOTH the Access Token and the Refresh Token.

#### Scenario: Successful Logout
- GIVEN an authenticated user with valid tokens
- WHEN the user triggers the logout action
- THEN the system MUST invalidate the tokens
- AND subsequent requests with those tokens MUST be rejected with a "Unauthorized" (401) error

### Requirement: Password Recovery

The system MUST provide a mechanism for users to recover access if they forget their password via a secure token sent to their registered email.

#### Scenario: Request Password Reset
- GIVEN a registered user
- WHEN the user submits their registered email in the "Forgot Password" view
- THEN the system MUST generate a temporary, one-time-use recovery token
- AND MUST send an email with instructions and the recovery link

#### Scenario: Reset Password with Token
- GIVEN a user with a valid recovery token
- WHEN the user provides a new password using the recovery link
- THEN the system MUST update the password
- AND MUST invalidate the recovery token immediately

### Requirement: Password Change (Internal)

The system MUST allow authenticated users to change their password from within the platform.

#### Scenario: Successful Password Change
- GIVEN an authenticated user
- WHEN the user provides the current password and a new valid password
- THEN the system MUST update the password
- AND MUST invalidate all other active sessions for that user

### Requirement: Role-Based Access Control (RBAC)

The system MUST distinguish between Platform Owner and Tenant users. Certain actions SHALL be restricted based on the user's role.

#### Scenario: Tenant accessing Platform Owner view
- GIVEN a user logged in with a Tenant role
- WHEN the user attempts to access the "Tenant Management" dashboard
- THEN the system MUST return a "Forbidden" (403) error

### Requirement: API Key Management for Tenants

The system MUST allow Tenants to generate and manage API Keys for programmatic access. Keys MUST be associated with a specific environment: **Sandbox** or **Production**.

#### Scenario: API Key Generation with Environment Scope
- GIVEN a logged-in Tenant user
- WHEN the user requests a new API Key and selects "Sandbox" scope
- THEN the system MUST generate a key that can ONLY access sandbox resources
- AND requests made with this key MUST NOT trigger real costs or production calls

#### Scenario: API Key Isolation
- GIVEN a request made with a "Sandbox" API Key to a "Production" campaign
- WHEN the system validates the request
- THEN the system MUST reject the action with a "Forbidden" (403) error

#### Scenario: API Key Rotation
- GIVEN a Tenant with an existing API Key
- WHEN the Tenant requests to rotate the key
- THEN the system MUST generate a new API Key
- AND SHOULD allow a short grace period where both keys are valid (optional)
- AND MUST eventually invalidate the old key

#### Scenario: API Key Authentication
- GIVEN a request to a protected API endpoint
- WHEN the request includes a valid API Key in the headers
- THEN the system MUST identify the associated Tenant
- AND MUST allow the action if the Tenant is active and has sufficient permissions
