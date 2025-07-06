import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { LoggerService } from '@nestjs/common';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
});

export class WinstonLogger implements LoggerService {
  log(message: any) {
    logger.info(message);
  }

  error(message: any, trace?: string) {
    logger.error(message, { trace });
  }

  warn(message: any) {
    logger.warn(message);
  }

  debug?(message: any) {
    logger.debug?.(message);
  }

  verbose?(message: any) {
    logger.verbose?.(message);
  }
}
