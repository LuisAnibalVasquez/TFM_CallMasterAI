# Delta for tenant-management

## MODIFIED Requirements

### Requirement: Tenant Deletion Constraints

The system MUST NOT allow the deletion of a Tenant if it has at least one campaign (regardless of status). When deletion is allowed, the system MUST remove all associated Auth users before deleting the tenant record.
(Previously: Only checked campaigns and deleted tenant record; Auth users were left orphaned.)

#### Scenario: Attempt to delete Tenant with campaigns

- GIVEN a Tenant that has previously created campaigns
- WHEN the Platform Owner attempts to delete the Tenant
- THEN the system MUST reject the deletion
- AND MUST inform the user that Tenants with campaign history cannot be removed

#### Scenario: Successful Tenant deletion

- GIVEN a Tenant with NO campaign history
- WHEN the Platform Owner deletes the Tenant
- THEN the system MUST first delete all Auth users associated with the Tenant
- AND MUST only delete the Tenant record after all Auth users have been successfully removed
- AND MUST NOT leave any orphaned user rows in `auth.users`
- AND MUST NOT leave any orphaned rows in `public.profiles`

#### Scenario: Auth user deletion failure during tenant deletion

- GIVEN a Tenant with NO campaign history
- AND the Tenant has associated Auth users
- WHEN the system fails to delete an Auth user (e.g., network error, invalid user ID)
- THEN the system MUST abort the entire deletion
- AND MUST NOT delete the Tenant record
- AND MUST NOT delete any remaining Auth users
- AND MUST return an error to the caller

#### Scenario: Tenant deletion with multiple Auth users

- GIVEN a Tenant with NO campaign history
- AND the Tenant has 3+ associated Auth users
- WHEN the Platform Owner deletes the Tenant
- THEN the system MUST delete every Auth user belonging to that Tenant
- AND MUST then delete the Tenant record
- AND MUST NOT fail if a user ID no longer exists in `auth.users` (idempotent)
