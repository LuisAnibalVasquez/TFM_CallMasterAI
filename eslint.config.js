import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["node_modules", "dist", "build"],
  }
);
