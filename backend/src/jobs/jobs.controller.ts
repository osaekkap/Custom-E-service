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
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /** POST /jobs — สร้าง job ใหม่ (factory user) */
  @Post()
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.update(id, dto, req.user);
  }

  /** PATCH /jobs/:id/status — เปลี่ยน status */
  @Patch(':id/status')
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
  requestApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.requestApproval(id, body.note, req.user);
  }

  /** PATCH /jobs/:id/approve — อนุมัติ */
  @Patch(':id/approve')
  approveJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.approveJob(id, body.note, req.user);
  }

  /** PATCH /jobs/:id/reject — ปฏิเสธ */
  @Patch(':id/reject')
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.jobsService.remove(id, req.user);
  }
}
