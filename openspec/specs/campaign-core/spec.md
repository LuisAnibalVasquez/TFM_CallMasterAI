# Campaign Core Specification

## Purpose
Define el ciclo de vida de las campañas de llamadas, el procesamiento de datos de clientes y la orquestación con proveedores de IA externos.

## Requirements

### Requirement: Campaign Creation & Data Ingestion

A Tenant MUST be able to create a campaign by providing a name and a CSV file containing the list of clients to be called. 

#### Scenario: Valid Campaign Creation with CSV
- GIVEN a logged-in Tenant or valid API Key
- WHEN the Tenant creates a campaign with a name and a CSV file containing columns: `Customer Name`, `Phone Number`, `Age`, and `Preferred Language`
- THEN the system MUST store the client list associated with the campaign
- AND the campaign status MUST be set to "Created"
- AND the system MUST NOT start any calls automatically

### Requirement: Asynchronous Campaign Execution via Queuing

The system MUST process campaign calls asynchronously and sequentially to ensure system stability and reliable integration with the AI provider.

#### Scenario: Campaign Call Queuing
- GIVEN a campaign with a list of clients in "In-Progress" status
- WHEN the campaign is started
- THEN the system MUST place all call requests into a processing queue
- AND a worker process MUST consume the queue sequentially
- AND for each item, it MUST invoke the AI Provider API (Voiceflow)
- AND MUST handle rate limits or concurrency constraints defined by the provider

#### Scenario: Sequential Processing with Failure Handling
- GIVEN a call request in the queue
- WHEN the worker attempts to invoke the AI Provider API
- THEN the system MUST wait for the provider's acknowledgment before processing the next call for that specific campaign (or respect the defined concurrency level)
- AND IF the API invocation fails, the system MUST implement a retry mechanism or log the specific failure before moving to the next client in the queue

#### Scenario: Campaign Cancellation (Graceful Shutdown)
- GIVEN a campaign in "In-Progress" status
- WHEN the Tenant triggers the "Cancel" action
- THEN the system MUST stop placing new calls from the queue
- AND MUST terminate any calls that were queued but not yet initiated
- AND once the queue is empty, the campaign status MUST change to "Cancelled"

### Requirement: Sandbox vs Production Execution

The system MUST distinguish between Sandbox and Production executions by routing calls to the appropriate AI Agent environment.

#### Scenario: Sandbox Campaign Execution
- GIVEN a campaign created or started using a "Sandbox" API Key (or flagged as Sandbox)
- WHEN the campaign is started
- THEN the system MUST place phone calls using the **Sandbox API Base URL** and **Sandbox API Key** configured for the Tenant
- AND the system SHOULD inform the user if the AI provider (Voiceflow) limits are reached for this sandbox agent

#### Scenario: Production Campaign Execution
- GIVEN a campaign created or started using a "Production" API Key (or flagged as Production)
- WHEN the campaign is started
- THEN the system MUST proceed with real calls using the **Production API Base URL** and **Production API Key**
- AND MUST record real costs and metrics associated with the Tenant

#### Scenario: Call Initiation with Metadata
- GIVEN an active campaign in "In-Progress" status
- WHEN it is time to call a specific client
- THEN the system MUST invoke the AI Provider API
- AND MUST pass the `Preferred Language` and other metadata to ensure the agent uses the correct localized script

### Requirement: Data Integrity & Audit

The system MUST NOT allow the deletion of completed or cancelled campaigns.

#### Scenario: Attempt to delete a non-draft campaign
- GIVEN a campaign in "Completed" or "Cancelled" status
- WHEN the Tenant attempts to delete the campaign
- THEN the system MUST reject the request to preserve the audit trail
