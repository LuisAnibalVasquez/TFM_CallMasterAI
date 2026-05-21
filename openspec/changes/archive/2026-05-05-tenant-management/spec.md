# Tenant Management Specification

## Purpose
Define la gestión del ciclo de vida de los Tenants y sus usuarios por parte del Platform Owner, incluyendo la configuración de proveedores de IA.

## Requirements

### Requirement: Tenant Creation & Initial Setup

The Platform Owner MUST be able to create new Tenants. Upon creation, the system SHALL store:
1. Company name, phone, contact person, contact email, and company logo.
2. **Sandbox AI Agent Configuration**: API Base URL and API Key for the development/limited agent.
3. **Production AI Agent Configuration**: API Base URL and API Key for the full-featured production agent.
4. Initial Admin User credentials (email as username, secure temporary password).

### Requirement: Sensitive Data Protection

The system MUST protect ALL sensitive Tenant configuration data (both Sandbox and Production API Keys) using strong encryption standards.

#### Scenario: Secure Storage of AI Provider Credentials
- GIVEN a Tenant configuration with Sandbox and Production API Keys
- WHEN the system saves the configuration to the database
- THEN BOTH API Keys MUST be encrypted using a strong encryption algorithm (e.g., AES-256)
- AND the keys MUST ONLY be decrypted at the moment of making the API invocation to the corresponding provider environment
- AND the decryption key MUST be managed securely.

#### Scenario: Successful Tenant Creation
- GIVEN a logged-in Platform Owner
- WHEN the Platform Owner submits a new Tenant with all required data (including Voiceflow config)
- THEN the system MUST create the Tenant and the Admin user
- AND MUST display the temporary password ONLY ONCE to the Platform Owner
- AND MUST NOT store the temporary password in plain text

### Requirement: Tenant Deletion Constraints

The system MUST NOT allow the deletion of a Tenant if it has at least one campaign (regardless of status).

#### Scenario: Attempt to delete Tenant with campaigns
- GIVEN a Tenant that has previously created campaigns
- WHEN the Platform Owner attempts to delete the Tenant
- THEN the system MUST reject the deletion
- AND MUST inform the user that Tenants with campaign history cannot be removed

#### Scenario: Successful Tenant deletion
- GIVEN a Tenant with NO campaign history
- WHEN the Platform Owner deletes the Tenant
- THEN the system MUST remove the Tenant and all associated users

### Requirement: Tenant Status Management

The Platform Owner SHALL be able to activate or suspend a Tenant.

#### Scenario: Suspend a Tenant
- GIVEN an active Tenant
- WHEN the Platform Owner suspends the Tenant
- THEN the Tenant's users MUST NOT be able to log in
- AND the Tenant's API Key MUST be rejected by the system
