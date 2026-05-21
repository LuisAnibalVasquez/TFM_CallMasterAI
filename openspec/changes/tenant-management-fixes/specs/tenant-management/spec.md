# Delta for tenant-management

## ADDED Requirements

### Requirement: Campaign Count in Tenant List

The system MUST expose the number of campaigns associated with each Tenant when listing all tenants. The `campaignCount` field SHALL be populated via a single recursive query (no N+1).

#### Scenario: Tenant list includes campaign counts

- GIVEN a set of Tenants with varying campaign counts
- WHEN the Platform Owner views the tenant list
- THEN each Tenant returned MUST include a `campaignCount` property
- AND the value SHALL be the count of campaigns where `campaigns.tenant_id = tenants.id`

### Requirement: Frontend Deletion Guard

The UI MUST visually disable the delete action for Tenants with `campaignCount > 0`. The system SHALL display a tooltip or descriptive text explaining the constraint.

#### Scenario: Delete button disabled for tenants with campaigns

- GIVEN a Tenant with `campaignCount > 0`
- WHEN the Platform Owner views the tenant row
- THEN the delete button MUST be disabled (`disabled` attribute)
- AND a tooltip SHALL read "Cannot delete tenant with existing campaigns"

#### Scenario: Delete button enabled for tenants without campaigns

- GIVEN a Tenant with `campaignCount === 0`
- WHEN the Platform Owner views the tenant row
- THEN the delete button MUST be enabled

## MODIFIED Requirements

### Requirement: Tenant Deletion Constraints

The system MUST NOT allow the deletion of a Tenant if it has at least one campaign (regardless of status). The UI SHALL prevent the user from initiating deletion at the button level in addition to server-side enforcement.
(Previously: Backend-only rejection; user could click delete and get a 409 after confirmation.)

#### Scenario: Attempt to delete Tenant with campaigns (unchanged — server-side)

- GIVEN a Tenant that has previously created campaigns
- WHEN the Platform Owner attempts to delete the Tenant
- THEN the system MUST reject the deletion
- AND MUST inform the user that Tenants with campaign history cannot be removed

#### Scenario: Attempt to delete Tenant with campaigns — frontend guard

- GIVEN a Tenant with `campaignCount > 0`
- WHEN the Platform Owner opens the tenant list
- THEN the delete button SHALL be disabled
- AND the user SHALL NOT be able to open the delete confirmation dialog

#### Scenario: Successful Tenant deletion (unchanged)

- GIVEN a Tenant with NO campaign history
- WHEN the Platform Owner deletes the Tenant
- THEN the system MUST remove the Tenant and all associated users

## REMOVED Requirements

None.
