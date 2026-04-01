import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CmsService {
  private cache: { data: any; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 min

  constructor(private prisma: PrismaService) {}

  // ─── PUBLIC ────────────────────────────────────────────────

  async getLandingPage() {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    const [theme, sections] = await Promise.all([
      this.prisma.cmsTheme.findFirst(),
      this.prisma.cmsSection.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          cards: {
            where: { isVisible: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    const data = { theme, sections };
    this.cache = { data, timestamp: Date.now() };
    return data;
  }

  // ─── THEME ─────────────────────────────────────────────────

  async getTheme() {
    return this.prisma.cmsTheme.findFirst();
  }

  async updateTheme(dto: UpdateThemeDto) {
    const existing = await this.prisma.cmsTheme.findFirst();
    if (!existing) {
      const result = await this.prisma.cmsTheme.create({ data: dto });
      this.invalidateCache();
      return result;
    }
    const result = await this.prisma.cmsTheme.update({
      where: { id: existing.id },
      data: dto,
    });
    this.invalidateCache();
    return result;
  }

  // ─── SECTIONS ──────────────────────────────────────────────

  async getAllSections() {
    return this.prisma.cmsSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        cards: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    const result = await this.prisma.cmsSection.update({
      where: { id },
      data: dto,
    });
    this.invalidateCache();
    return result;
  }

  async reorderSections(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.cmsSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    this.invalidateCache();
    return { success: true };
  }

  // ─── CARDS ─────────────────────────────────────────────────

  async createCard(sectionId: string, dto: CreateCardDto) {
    const result = await this.prisma.cmsSectionCard.create({
      data: { ...dto, sectionId },
    });
    this.invalidateCache();
    return result;
  }

  async updateCard(cardId: string, dto: UpdateCardDto) {
    const result = await this.prisma.cmsSectionCard.update({
      where: { id: cardId },
      data: dto,
    });
    this.invalidateCache();
    return result;
  }

  async deleteCard(cardId: string) {
    await this.prisma.cmsSectionCard.delete({ where: { id: cardId } });
    this.invalidateCache();
    return { success: true };
  }

  async reorderCards(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.cmsSectionCard.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    this.invalidateCache();
    return { success: true };
  }

  // ─── CACHE ─────────────────────────────────────────────────

  private invalidateCache() {
    this.cache = null;
  }
}
