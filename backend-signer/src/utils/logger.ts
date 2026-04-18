import winston from 'winston';
import fs from 'fs';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const enableFileLogging = process.env.LOG_TO_FILES === 'true';

const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    )
  }),
];

if (enableFileLogging) {
  const logsDir = path.resolve(process.cwd(), 'logs');

  try {
    fs.mkdirSync(logsDir, { recursive: true });

    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5,
      })
    );
  } catch (error: any) {
    // Keep service alive even when file logging is unavailable in restricted containers.
    console.warn(
      `[logger] File logging disabled: ${error?.message || 'failed to initialize log directory'}`
    );
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports
});

export default logger;
