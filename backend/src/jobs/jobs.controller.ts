import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /** POST /jobs — สร้าง job ใหม่ */
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  create(
    @Body() dto: CreateJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.create(dto, req.user);
  }

  /** GET /jobs — รายการ jobs (filter by customer/status/type) */
  @Get()
  findAll(
    @Query() query: QueryJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.findAll(query, req.user);
  }

  /** GET /jobs/:id — รายละเอียด job */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.findOne(id, req.user);
  }

  /** PATCH /jobs/:id — แก้ไข job (DRAFT/PREPARING เท่านั้น) */
  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.update(id, dto, req.user);
  }

  /** PATCH /jobs/:id/status — เปลี่ยน status */
  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobStatusDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.updateStatus(id, dto, req.user);
  }

  // ─── B1: Job Assignment ─────────────────────────────────────────

  /** PATCH /jobs/:id/assign — มอบหมายงาน */
  @Patch(':id/assign')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  assignJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assignToId: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.assignJob(id, body.assignToId, req.user);
  }

  // ─── B2: Approval Workflow ──────────────────────────────────────

  /** PATCH /jobs/:id/request-approval — ขออนุมัติ */
  @Patch(':id/request-approval')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN)
  requestApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.requestApproval(id, body.note, req.user);
  }

  /** PATCH /jobs/:id/approve — อนุมัติ */
  @Patch(':id/approve')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  approveJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.approveJob(id, body.note, req.user);
  }

  /** PATCH /jobs/:id/reject — ปฏิเสธ */
  @Patch(':id/reject')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  rejectJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.rejectJob(id, body.note, req.user);
  }

  /** GET /jobs/:id/history — ดู status history */
  @Get(':id/history')
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.getHistory(id, req.user);
  }

  /** DELETE /jobs/:id — ลบ job (DRAFT เท่านั้น) */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.remove(id, req.user);
  }
}
