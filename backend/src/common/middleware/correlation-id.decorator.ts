import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * @CorrelationId() — inject correlation ID from request header into controller method params.
 * Usage: getResource(@CorrelationId() correlationId: string) { ... }
 */
export const CorrelationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['x-correlation-id'] as string ?? '';
  },
);
