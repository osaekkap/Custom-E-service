import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditService } from './audit.service';
import { RequestUser } from '../auth/jwt.strategy';

/** Maps HTTP method + URL pattern → human-readable action name */
function resolveAction(method: string, url: string): { action: string; entityType: string } {
  const path = url.replace(/\?.*$/, '').replace(/\/api/, '');
  const segs  = path.split('/').filter(Boolean);
  const base  = segs[0] ?? '';
  const sub   = segs[2] ?? '';

  const map: Record<string, Record<string, { action: string; entityType: string }>> = {
    POST: {
      'auth/login':           { action: 'LOGIN',               entityType: 'AUTH' },
      'auth/register':        { action: 'REGISTER_USER',       entityType: 'AUTH' },
      'auth/register/b2b':    { action: 'REGISTER_B2B',        entityType: 'AUTH' },
      'jobs':                 { action: 'CREATE_JOB',          entityType: 'JOB'  },
      'declarations':         { action: 'CREATE_DECLARATION',  entityType: 'DECLARATION' },
      'declarations/submit':  { action: 'SUBMIT_DECLARATION',  entityType: 'DECLARATION' },
      'customers/my/users':   { action: 'INVITE_USER',         entityType: 'USER' },
    },
    PATCH: {
      'jobs':                 { action: 'UPDATE_JOB',          entityType: 'JOB'  },
      'jobs/status':          { action: 'UPDATE_JOB_STATUS',   entityType: 'JOB'  },
      'declarations':         { action: 'UPDATE_DECLARATION',  entityType: 'DECLARATION' },
      'customers/my':         { action: 'UPDATE_COMPANY',      entityType: 'CUSTOMER' },
      'customers/my/users':   { action: 'UPDATE_USER_ROLE',    entityType: 'USER' },
    },
    DELETE: {
      'jobs':                 { action: 'DELETE_JOB',          entityType: 'JOB'  },
      'declarations/items':   { action: 'DELETE_ITEM',         entityType: 'DECLARATION' },
      'customers/my/users':   { action: 'REMOVE_USER',         entityType: 'USER' },
    },
    PUT: {
      'documents':            { action: 'UPLOAD_DOCUMENT',     entityType: 'DOCUMENT' },
    },
  };

  // Try exact key match first
  const methodMap = map[method] ?? {};

  // Check common paths
  if (segs.includes('submit'))  return { action: 'SUBMIT_DECLARATION', entityType: 'DECLARATION' };
  if (segs.includes('status'))  return { action: 'UPDATE_JOB_STATUS',  entityType: 'JOB' };
  if (segs.includes('refresh')) return { action: 'REFRESH_DOCUMENT',   entityType: 'DOCUMENT' };
  if (segs.includes('login'))   return { action: 'LOGIN',              entityType: 'AUTH' };
  if (segs.includes('register'))return { action: 'REGISTER',           entityType: 'AUTH' };

  // Try base match
  const matched = methodMap[base] ?? methodMap[`${base}/${sub}`];
  if (matched) return matched;

  return { action: `${method}:/${segs.join('/')}`, entityType: base.toUpperCase() };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req  = ctx.switchToHttp().getRequest<{
      method: string; url: string; ip: string;
      headers: Record<string, string>;
      user?: RequestUser;
      params?: Record<string, string>;
    }>();

    const { method, url, ip, headers, user } = req;

    // Only log mutating HTTP methods
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const { action, entityType } = resolveAction(method, url);
    const entityId = req.params?.id ?? req.params?.jobId ?? req.params?.profileId ?? undefined;

    const base: Parameters<AuditService['log']>[0] = {
      actorId:    user?.userId,
      actorEmail: user?.email,
      customerId: user?.customerId ?? null,
      action,
      entityType,
      entityId,
      ipAddress:  ip || headers['x-forwarded-for'],
      userAgent:  headers['user-agent'],
      status:     'SUCCESS',
    };

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({ ...base, status: 'SUCCESS' });
      }),
      catchError((err) => {
        this.auditService.log({
          ...base,
          status: 'FAILED',
          detail: { error: err?.message ?? 'Unknown error', statusCode: err?.status },
        });
        return throwError(() => err);
      }),
    );
  }
}
