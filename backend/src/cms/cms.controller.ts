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
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateSectionDto, ReorderSectionsDto, ReorderCardsDto } from './dto/update-section.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ─── PUBLIC (no auth) ──────────────────────────────────────

  @Get('landing-page')
  getLandingPage() {
    return this.cmsService.getLandingPage();
  }

  // ─── ADMIN ONLY ────────────────────────────────────────────

  @Get('theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  getTheme() {
    return this.cmsService.getTheme();
  }

  @Put('theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateTheme(@Body() dto: UpdateThemeDto) {
    return this.cmsService.updateTheme(dto);
  }

  @Get('sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  getAllSections() {
    return this.cmsService.getAllSections();
  }

  @Put('sections/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  reorderSections(@Body() dto: ReorderSectionsDto) {
    return this.cmsService.reorderSections(dto.items);
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.cmsService.updateSection(id, dto);
  }

  @Post('sections/:id/cards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  createCard(
    @Param('id', ParseUUIDPipe) sectionId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.cmsService.createCard(sectionId, dto);
  }

  @Put('sections/:sectionId/cards/:cardId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cmsService.updateCard(cardId, dto);
  }

  @Delete('sections/:sectionId/cards/:cardId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  deleteCard(@Param('cardId', ParseUUIDPipe) cardId: string) {
    return this.cmsService.deleteCard(cardId);
  }

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
