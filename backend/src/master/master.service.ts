import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHsCodeDto, UpdateHsCodeDto } from './dto/hs-code.dto';
import { CreateExporterDto, UpdateExporterDto } from './dto/exporter.dto';
import { CreateConsigneeDto, UpdateConsigneeDto } from './dto/consignee.dto';
import { CreatePrivilegeDto, UpdatePrivilegeDto } from './dto/privilege.dto';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  // ─── HS Codes ──────────────────────────────────────────────────────

  async listHsCodes(customerId: string, search?: string, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const where = {
      customerId,
      isActive: true,
      ...(search && {
        OR: [
          { hsCode: { contains: search } },
          { descriptionEn: { contains: search, mode: 'insensitive' as const } },
          { descriptionTh: { contains: search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.hsMasterItem.findMany({ where, skip, take: limit, orderBy: { hsCode: 'asc' } }),
      this.prisma.hsMasterItem.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createHsCode(customerId: string, dto: CreateHsCodeDto) {
    const exists = await this.prisma.hsMasterItem.findUnique({
      where: { customerId_hsCode: { customerId, hsCode: dto.hsCode } },
    });
    if (exists) throw new ConflictException(`HS Code ${dto.hsCode} already exists`);

    return this.prisma.hsMasterItem.create({ data: { customerId, ...dto } });
  }

  async updateHsCode(customerId: string, id: string, dto: UpdateHsCodeDto) {
    await this.assertHsCodeExists(customerId, id);
    return this.prisma.hsMasterItem.update({ where: { id }, data: dto });
  }

  async deleteHsCode(customerId: string, id: string) {
    await this.assertHsCodeExists(customerId, id);
    await this.prisma.hsMasterItem.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'HS Code deactivated' };
  }

  private async assertHsCodeExists(customerId: string, id: string) {
    const item = await this.prisma.hsMasterItem.findFirst({ where: { id, customerId } });
    if (!item) throw new NotFoundException(`HS Code ${id} not found`);
    return item;
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  async listExporters(customerId: string) {
    return this.prisma.exporter.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { nameTh: 'asc' }],
    });
  }

  async createExporter(customerId: string, dto: CreateExporterDto) {
    // ถ้า isDefault=true ให้ reset ตัวอื่นก่อน
    if (dto.isDefault) {
      await this.prisma.exporter.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.exporter.create({ data: { customerId, ...dto } });
  }

  async updateExporter(customerId: string, id: string, dto: UpdateExporterDto) {
    await this.assertExporterExists(customerId, id);
    if (dto.isDefault) {
      await this.prisma.exporter.updateMany({
        where: { customerId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.exporter.update({ where: { id }, data: dto });
  }

  async deleteExporter(customerId: string, id: string) {
    await this.assertExporterExists(customerId, id);
    await this.prisma.exporter.delete({ where: { id } });
    return { message: 'Exporter deleted' };
  }

  private async assertExporterExists(customerId: string, id: string) {
    const item = await this.prisma.exporter.findFirst({ where: { id, customerId } });
    if (!item) throw new NotFoundException(`Exporter ${id} not found`);
    return item;
  }

  // ─── Consignees ────────────────────────────────────────────────────

  async listConsignees(customerId: string, search?: string, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const where = {
      customerId,
      isActive: true,
      ...(search && {
        OR: [
          { nameEn: { contains: search, mode: 'insensitive' as const } },
          { nameTh: { contains: search } },
          { country: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.consignee.findMany({ where, skip, take: limit, orderBy: { nameEn: 'asc' } }),
      this.prisma.consignee.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createConsignee(customerId: string, dto: CreateConsigneeDto) {
    return this.prisma.consignee.create({ data: { customerId, ...dto } });
  }

  async updateConsignee(customerId: string, id: string, dto: UpdateConsigneeDto) {
    await this.assertConsigneeExists(customerId, id);
    return this.prisma.consignee.update({ where: { id }, data: dto });
  }

  async deleteConsignee(customerId: string, id: string) {
    await this.assertConsigneeExists(customerId, id);
    await this.prisma.consignee.update({ where: { id }, data: { isActive: false } });
    return { message: 'Consignee deactivated' };
  }

  private async assertConsigneeExists(customerId: string, id: string) {
    const item = await this.prisma.consignee.findFirst({ where: { id, customerId } });
    if (!item) throw new NotFoundException(`Consignee ${id} not found`);
    return item;
  }

  // ─── Privileges ────────────────────────────────────────────────────

  async listPrivileges(customerId: string) {
    return this.prisma.privilegeCode.findMany({
      where: { customerId, isActive: true },
      orderBy: { type: 'asc' },
    });
  }

  async createPrivilege(customerId: string, dto: CreatePrivilegeDto) {
    return this.prisma.privilegeCode.create({
      data: {
        customerId,
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async updatePrivilege(customerId: string, id: string, dto: UpdatePrivilegeDto) {
    await this.assertPrivilegeExists(customerId, id);
    return this.prisma.privilegeCode.update({
      where: { id },
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async deletePrivilege(customerId: string, id: string) {
    await this.assertPrivilegeExists(customerId, id);
    await this.prisma.privilegeCode.update({ where: { id }, data: { isActive: false } });
    return { message: 'Privilege deactivated' };
  }

  private async assertPrivilegeExists(customerId: string, id: string) {
    const item = await this.prisma.privilegeCode.findFirst({ where: { id, customerId } });
    if (!item) throw new NotFoundException(`Privilege ${id} not found`);
    return item;
  }
}
