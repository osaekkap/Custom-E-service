import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { CreateDeclarationItemDto, UpdateDeclarationItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller()
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  /** GET /jobs/:jobId/declarations */
  @Get('jobs/:jobId/declarations')
  listByJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.listByJob(jobId, req.user);
  }

  /** POST /jobs/:jobId/declarations */
  @Post('jobs/:jobId/declarations')
  create(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateDeclarationDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.create(jobId, dto, req.user);
  }

  /** GET /declarations/:id */
  @Get('declarations/:id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.findOne(id, req.user);
  }

  /** PATCH /declarations/:id */
  @Patch('declarations/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateDeclarationDto>,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.update(id, dto, req.user);
  }

  // ─── Items ─────────────────────────────────────────────────────────

  /** POST /declarations/:id/items */
  @Post('declarations/:id/items')
  addItem(
    @Param('id', ParseUUIDPipe) declarationId: string,
    @Body() dto: CreateDeclarationItemDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.addItem(declarationId, dto, req.user);
  }

  /** PATCH /declarations/:id/items/:itemId */
  @Patch('declarations/:id/items/:itemId')
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
  removeItem(
    @Param('id', ParseUUIDPipe) declarationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.declarationsService.removeItem(declarationId, itemId, req.user);
  }
}
