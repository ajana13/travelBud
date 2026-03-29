import { describe, it, expect } from "vitest";
import { createLogger, type LogEntry } from "../../../../insforge/functions/_shared/logging.ts";

describe("logging helper", () => {
  describe("createLogger()", () => {
    it("creates a logger with the given function name", () => {
      const logger = createLogger("health-check");
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("info() produces a structured log entry", () => {
      const entries: LogEntry[] = [];
      const logger = createLogger("test-fn", (entry) => entries.push(entry));
      logger.info("hello world", { extra: 1 });
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe("info");
      expect(entries[0].fn).toBe("test-fn");
      expect(entries[0].msg).toBe("hello world");
      expect(entries[0].data).toEqual({ extra: 1 });
    });

    it("error() produces error-level entry", () => {
      const entries: LogEntry[] = [];
      const logger = createLogger("test-fn", (entry) => entries.push(entry));
      logger.error("fail", { reason: "timeout" });
      expect(entries[0].level).toBe("error");
    });
  });
});
