// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { SetMetadata } from "@nestjs/common";

export const ALLOW_OVERRIDE_KEY = "allowOverride";
export const AllowOverride = () => SetMetadata(ALLOW_OVERRIDE_KEY, true);
