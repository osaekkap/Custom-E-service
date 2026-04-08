import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateSectionDto, ReorderSectionsDto, ReorderCardsDto } from './dto/update-section.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ─── PUBLIC (no auth) ──────────────────────────────────────

  @ApiOperation({ summary: 'ดูข้อมูล landing page (public)' })
  @ApiResponse({ status: 200, description: 'Landing page CMS data' })
  @Get('landing-page')
  getLandingPage() {
    return this.cmsService.getLandingPage();
  }

  // ─── ADMIN ONLY ────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูการตั้งค่า theme (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'CMS theme settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Get('theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  getTheme() {
    return this.cmsService.getTheme();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปเดต theme (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Theme updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateTheme(@Body() dto: UpdateThemeDto) {
    return this.cmsService.updateTheme(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'รายการ sections ทั้งหมด (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'All CMS sections' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  getAllSections() {
    return this.cmsService.getAllSections();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'จัดเรียง sections ใหม่ (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Sections reordered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('sections/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  reorderSections(@Body() dto: ReorderSectionsDto) {
    return this.cmsService.reorderSections(dto.items);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปเดต section (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.cmsService.updateSection(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'สร้าง card ใน section (SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Card created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('sections/:id/cards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  createCard(
    @Param('id', ParseUUIDPipe) sectionId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.cmsService.createCard(sectionId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปเดต card ใน section (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Card updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('sections/:sectionId/cards/:cardId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cmsService.updateCard(cardId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'ลบ card ออกจาก section (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Card deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('sections/:sectionId/cards/:cardId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  deleteCard(@Param('cardId', ParseUUIDPipe) cardId: string) {
    return this.cmsService.deleteCard(cardId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'จัดเรียง cards ใน section ใหม่ (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cards reordered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('sections/:id/cards/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  reorderCards(
    @Param('id', ParseUUIDPipe) _sectionId: string,
    @Body() dto: ReorderCardsDto,
  ) {
    return this.cmsService.reorderCards(dto.items);
  }
}
