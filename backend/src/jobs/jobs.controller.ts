import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /** POST /jobs — สร้าง job ใหม่ */
  @ApiOperation({ summary: 'สร้าง job ใหม่' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  create(
    @Body() dto: CreateJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.create(dto, req.user);
  }

  /** GET /jobs — รายการ jobs (filter by customer/status/type) */
  @ApiOperation({ summary: 'รายการ jobs ทั้งหมด (กรองตาม customer/status/type)' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() query: QueryJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.findAll(query, req.user);
  }

  /** GET /jobs/:id — รายละเอียด job */
  @ApiOperation({ summary: 'ดูรายละเอียด job' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.findOne(id, req.user);
  }

  /** PATCH /jobs/:id — แก้ไข job (DRAFT/PREPARING เท่านั้น) */
  @ApiOperation({ summary: 'แก้ไขข้อมูล job (เฉพาะสถานะ DRAFT/PREPARING)' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job not found' })
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
  @ApiOperation({ summary: 'เปลี่ยนสถานะ job' })
  @ApiResponse({ status: 200, description: 'Job status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'มอบหมายงาน job ให้กับผู้ใช้' })
  @ApiResponse({ status: 200, description: 'Job assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'ขออนุมัติ job' })
  @ApiResponse({ status: 200, description: 'Approval requested' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'อนุมัติ job' })
  @ApiResponse({ status: 200, description: 'Job approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires MANAGER role or above' })
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
  @ApiOperation({ summary: 'ปฏิเสธ job' })
  @ApiResponse({ status: 200, description: 'Job rejected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires MANAGER role or above' })
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
  @ApiOperation({ summary: 'ดูประวัติการเปลี่ยนสถานะของ job' })
  @ApiResponse({ status: 200, description: 'Job status history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Get(':id/history')
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.getHistory(id, req.user);
  }

  /** DELETE /jobs/:id — ลบ job (DRAFT เท่านั้น) */
  @ApiOperation({ summary: 'ลบ job (เฉพาะสถานะ DRAFT)' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job not found' })
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
