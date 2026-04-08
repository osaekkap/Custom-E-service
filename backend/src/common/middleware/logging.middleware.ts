import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers['x-correlation-id'] as string) ?? randomUUID();
    const start = Date.now();

    // Attach correlation ID so downstream services can read it
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] ?? '';

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const contentLength = res.getHeader('content-length') ?? '-';

      // Structured JSON log line — parseable by Loki / CloudWatch / Datadog
      const logEntry = {
        correlationId,
        method,
        url: originalUrl,
        statusCode,
        duration,
        contentLength,
        ip,
        userAgent: userAgent.substring(0, 120),
      };

      if (statusCode >= 500) {
        this.logger.error(JSON.stringify(logEntry));
      } else if (statusCode >= 400) {
        this.logger.warn(JSON.stringify(logEntry));
      } else {
        this.logger.log(JSON.stringify(logEntry));
      }
    });

    next();
  }
}
