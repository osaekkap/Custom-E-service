import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { CreateDeclarationItemDto, UpdateDeclarationItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';
import { NswService } from '../nsw/nsw.service';
import { XmlBuilderService } from '../nsw/xml-builder.service';

@ApiTags('Declarations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DeclarationsController {
  constructor(
    private readonly declarationsService: DeclarationsService,
    private readonly nswService: NswService,
    private readonly xmlBuilder: XmlBuilderService,
  ) {}

  /** GET /jobs/:jobId/declarations */
  @ApiOperation({ summary: 'รายการใบขนสินค้าของ job' })
  @ApiResponse({ status: 200, description: 'List of declarations for the job' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Get('jobs/:jobId/declarations')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listByJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.listByJob(jobId, req.user);
  }

  /** POST /jobs/:jobId/declarations */
  @ApiOperation({ summary: 'สร้างใบขนสินค้าใหม่สำหรับ job' })
  @ApiResponse({ status: 201, description: 'Declaration created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('jobs/:jobId/declarations')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  create(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateDeclarationDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.create(jobId, dto, req.user);
  }

  /** GET /declarations/:id */
  @ApiOperation({ summary: 'ดูรายละเอียดใบขนสินค้า' })
  @ApiResponse({ status: 200, description: 'Declaration details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  @Get('declarations/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.findOne(id, req.user);
  }

  /** PATCH /declarations/:id */
  @ApiOperation({ summary: 'แก้ไขใบขนสินค้า' })
  @ApiResponse({ status: 200, description: 'Declaration updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  @Patch('declarations/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateDeclarationDto>,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.update(id, dto, req.user);
  }

  // ─── NSW Submission ────────────────────────────────────────────────

  /** POST /declarations/:id/submit */
  @ApiOperation({ summary: 'ส่งใบขนสินค้าไปยังระบบ NSW' })
  @ApiResponse({ status: 201, description: 'Declaration submitted to NSW' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('declarations/:id/submit')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.nswService.submit(id, req.user);
  }

  /** GET /declarations/:id/xml-preview — generate XML without submitting */
  @ApiOperation({ summary: 'ดูตัวอย่าง XML ของใบขนสินค้าก่อนส่ง NSW' })
  @ApiResponse({ status: 200, description: 'XML preview of declaration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('declarations/:id/xml-preview')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  async getXmlPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    const decl = await this.declarationsService.findOne(id, req.user);
    const xml = this.xmlBuilder.buildExportDeclaration(decl as any);
    return { xml };
  }

  /** GET /declarations/:id/nsw-status */
  @ApiOperation({ summary: 'ตรวจสอบสถานะใบขนสินค้าจากระบบ NSW' })
  @ApiResponse({ status: 200, description: 'NSW submission status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('declarations/:id/nsw-status')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  getNswStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.nswService.getNswStatus(id, req.user);
  }

  /** POST /nsw/retry-failed — retry all failed/timeout submissions */
  @ApiOperation({ summary: 'ส่งใบขนสินค้าที่ล้มเหลวซ้ำทั้งหมด' })
  @ApiResponse({ status: 201, description: 'Retry initiated for failed NSW submissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('nsw/retry-failed')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  retryFailed(@Request() req: { user: RequestUser }) {
    return this.nswService.retryFailed(req.user);
  }

  // ─── Items ─────────────────────────────────────────────────────────

  /** POST /declarations/:id/items */
  @ApiOperation({ summary: 'เพิ่มรายการสินค้าในใบขนสินค้า' })
  @ApiResponse({ status: 201, description: 'Declaration item added' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('declarations/:id/items')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  addItem(
    @Param('id', ParseUUIDPipe) declarationId: string,
    @Body() dto: CreateDeclarationItemDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.addItem(declarationId, dto, req.user);
  }

  /** PATCH /declarations/:id/items/:itemId */
  @ApiOperation({ summary: 'แก้ไขรายการสินค้าในใบขนสินค้า' })
  @ApiResponse({ status: 200, description: 'Declaration item updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Declaration item not found' })
  @Patch('declarations/:id/items/:itemId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateItem(
    @Param('id', ParseUUIDPipe) declarationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateDeclarationItemDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.updateItem(declarationId, itemId, dto, req.user);
  }

  /** DELETE /declarations/:id/items/:itemId */
  @ApiOperation({ summary: 'ลบรายการสินค้าออกจากใบขนสินค้า' })
  @ApiResponse({ status: 200, description: 'Declaration item removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Declaration item not found' })
  @Delete('declarations/:id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  removeItem(
    @Param('id', ParseUUIDPipe) declarationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.removeItem(declarationId, itemId, req.user);
  }
}
