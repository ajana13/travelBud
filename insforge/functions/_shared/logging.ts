export interface LogEntry {
  level: "info" | "warn" | "error";
  fn: string;
  msg: string;
  data?: unknown;
  ts: string;
}

type LogSink = (entry: LogEntry) => void;

const defaultSink: LogSink = (entry) => {
  console.log(JSON.stringify(entry));
};

export interface Logger {
  info(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  error(msg: string, data?: unknown): void;
}

export function createLogger(fnName: string, sink?: LogSink): Logger {
  const emit = sink || defaultSink;

  function log(level: LogEntry["level"], msg: string, data?: unknown) {
    emit({ level, fn: fnName, msg, data, ts: new Date().toISOString() });
  }

  return {
    info: (msg, data) => log("info", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
  };
}
