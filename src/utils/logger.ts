import * as pino from 'pino';
interface ILoggerConfig {
  level?: string;
  enabled?: boolean;
}

export function createLogger(name, loggerConfig: ILoggerConfig = {}) {
  const { level = 'debug', enabled = process.env.NODE_ENV !== 'test' } = loggerConfig;

  return pino({
    level,
    safe: true,
    prettyPrint: true,
    enabled,
    name,
  });
}
