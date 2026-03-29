import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "npm:@insforge/sdk": path.resolve(__dirname, "mocks/insforge-sdk.ts"),
      "npm:zod": "zod",
    },
  },
  test: {
    setupFiles: ["./setup/deno-globals.ts"],
    include: ["__tests__/**/*.test.ts"],
  },
});
