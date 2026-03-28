const TEST_DEFAULTS: Record<string, string> = {
  INSFORGE_BASE_URL: "https://test.insforge.app",
  ANON_KEY: "test-anon-key",
};

(globalThis as any).Deno = {
  env: {
    get(key: string): string | undefined {
      return process.env[key] ?? TEST_DEFAULTS[key];
    },
  },
};
