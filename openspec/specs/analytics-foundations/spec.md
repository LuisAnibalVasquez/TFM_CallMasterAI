# Analytics & Billing Specification

## Purpose
Define los requisitos para la recolección, agregación y visualización de métricas operativas y financieras para el Platform Owner y los Tenants.

## Requirements

### Requirement: Granular Call Metrics Collection

The system MUST record the operational data for every call placed by the AI agents.

#### Scenario: Call Data Capture
- GIVEN an initiated call
- WHEN the call finishes
- THEN the system MUST store: `Duration (seconds)`, `Status (Success/Failed)`, `Cost (calculated based on duration)`, and `Environment (Sandbox/Production)`.

### Requirement: Platform Owner Global Dashboard (Executive View)

The system MUST provide a high-level view for the Platform Owner to monitor the entire platform's health and revenue.

#### Scenario: View Global Operational Metrics
- GIVEN the Platform Owner dashboard
- THEN the system MUST display:
    - Total Tenants segmented by Status (Active, Suspended, Inactive).
    - Total Campaigns created across all Tenants.
    - Total Calls placed and Total Minutes consumed.

#### Scenario: View Revenue and Debt Metrics
- GIVEN the Platform Owner billing view
- THEN the system MUST display:
    - Total revenue generated (Production only).
    - Total outstanding debt across all Tenants.
    - A ranking of Tenants by expenditure ("Top Spenders").

### Requirement: Tenant Analytics & Billing View

The system MUST provide each Tenant with a private view of their own metrics and financial status.

#### Scenario: Tenant Self-Service Analytics
- GIVEN a logged-in Tenant
- THEN the system MUST display metrics ONLY for that Tenant:
    - Success rate of their campaigns.
    - Total minutes used and total cost incurred.
    - Current balance or outstanding debt.

### Requirement: Environment Segmentation & Billing

The system MUST distinguish between Sandbox and Production metrics for reporting and billing.

#### Scenario: Billing for Sandbox and Production
- GIVEN any call execution (Sandbox or Production)
- WHEN the call finishes
- THEN the system MUST calculate the cost based on the configured rate for that environment
- AND Sandbox calls MUST be clearly labeled as "Sandbox" in all billing and analytics views.

### Requirement: Multi-Platform Analytics Access (Web & Mobile)

The system MUST expose analytics data via an API that supports both the Web Platform (Admin/Tenant) and the Mobile Monitoring App (Tenant only).

#### Scenario: Mobile Monitoring Access
- GIVEN a Tenant user accessing the Mobile App
- WHEN the user views their dashboard
- THEN the system MUST provide a read-only, real-time summary of their campaigns and expenditure
- AND the data MUST be identical to the one shown in the Web Platform.
