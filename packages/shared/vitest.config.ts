// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
