import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DeclarationsController {
  constructor(
    private readonly declarationsService: DeclarationsService,
    private readonly nswService: NswService,
    private readonly xmlBuilder: XmlBuilderService,
  ) {}

  /** GET /jobs/:jobId/declarations */
  @Get('jobs/:jobId/declarations')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listByJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.listByJob(jobId, req.user);
  }

  /** POST /jobs/:jobId/declarations */
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
  @Get('declarations/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.findOne(id, req.user);
  }

  /** PATCH /declarations/:id */
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
  @Post('declarations/:id/submit')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.nswService.submit(id, req.user);
  }

  /** GET /declarations/:id/xml-preview — generate XML without submitting */
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
  @Get('declarations/:id/nsw-status')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  getNswStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.nswService.getNswStatus(id, req.user);
  }

  // ─── Items ─────────────────────────────────────────────────────────

  /** POST /declarations/:id/items */
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
