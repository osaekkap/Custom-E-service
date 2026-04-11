import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHsCodeDto, UpdateHsCodeDto } from './dto/hs-code.dto';
import { CreateExporterDto, UpdateExporterDto } from './dto/exporter.dto';
import { CreateConsigneeDto, UpdateConsigneeDto } from './dto/consignee.dto';
import { CreatePrivilegeDto, UpdatePrivilegeDto } from './dto/privilege.dto';
import { CreateBrokerDto, UpdateBrokerDto } from './dto/broker.dto';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  // ─── HS Codes ──────────────────────────────────────────────────────

  async listHsCodes(customerId?: string, search?: string, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const where = {
      ...(customerId && { customerId }),
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

  async listExporters(customerId: string | null) {
    return this.prisma.exporter.findMany({
      where: customerId
        ? { OR: [{ customerId }, { customerId: null }] }
        : {},
      orderBy: [{ isDefault: 'desc' }, { nameTh: 'asc' }],
    });
  }

  async createExporter(customerId: string | null, dto: CreateExporterDto) {

    // 1. ถ้าอันใหม่เป็น Default ให้ปลดอันเก่าของลูกค้ารายนี้ออกก่อน
    if (dto.isDefault) {
      // @ts-ignore: Bypass cache type issues
      await this.prisma.exporter.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 2. บันทึกข้อมูล
    try {
      // @ts-ignore: Bypass cache type issues
      return await this.prisma.exporter.create({
        data: {
          customerId: customerId || null,
          nameTh: dto.nameTh.trim(),
          nameEn: dto.nameEn?.trim() || null,
          taxId: dto.taxId.trim(),
          address: dto.address || null,
          postcode: dto.postcode || null,
          phone: dto.phone || null,
          agentName: dto.agentName || null,
          agentCardNo: dto.agentCardNo || null,
          brokerName: dto.brokerName || null,
          brokerTaxId: dto.brokerTaxId || null,
          brokerBranch: dto.brokerBranch || null,
          isDefault: !!dto.isDefault,
        },
      });
    } catch (err) {
      console.error('Exporter Creation Error:', err);
      if (err.code === 'P2002') throw new ConflictException('Exporter with this Tax ID already exists');
      throw new BadRequestException(`Database Error: ${err.message}`);
    }
  }

  async updateExporter(customerId: string | null, id: string, dto: UpdateExporterDto) {
    await this.assertExporterExists(customerId, id);
    if (dto.isDefault) {
      // @ts-ignore: Bypass cache type issues
      await this.prisma.exporter.updateMany({
        where: { customerId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    // @ts-ignore: Bypass cache type issues
    return this.prisma.exporter.update({
      where: { id },
      data: {
        nameTh: dto.nameTh,
        nameEn: dto.nameEn || null,
        taxId: dto.taxId,
        address: dto.address || null,
        postcode: dto.postcode || null,
        phone: dto.phone || null,
        agentName: dto.agentName || null,
        agentCardNo: dto.agentCardNo || null,
        brokerName: dto.brokerName || null,
        brokerTaxId: dto.brokerTaxId || null,
        brokerBranch: dto.brokerBranch || null,
        isDefault: !!dto.isDefault,
      },
    });
  }

  async deleteExporter(customerId: string, id: string) {
    await this.assertExporterExists(customerId, id);
    await this.prisma.exporter.delete({ where: { id } });
    return { message: 'Exporter deleted' };
  }

  private async assertExporterExists(customerId: string | null, id: string) {
    const whereCondition = customerId ? { id, customerId } : { id };
    // @ts-ignore: Bypass cache type issues
    const item = await this.prisma.exporter.findFirst({ where: whereCondition });
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

  // ─── Brokers ───────────────────────────────────────────────────────

  async listBrokers(customerId: string | null) {
    // @ts-ignore
    return this.prisma.broker.findMany({
      where: customerId
        ? { OR: [{ customerId }, { customerId: null }] }
        : {},
      orderBy: [{ isDefault: 'desc' }, { nameTh: 'asc' }],
    });
  }

  async createBroker(customerId: string | null, dto: CreateBrokerDto) {
    if (dto.isDefault) {
      // @ts-ignore
      await this.prisma.broker.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }
    try {
      // @ts-ignore
      return await this.prisma.broker.create({
        data: {
          customerId: customerId || null,
          nameTh: dto.nameTh.trim(),
          nameEn: dto.nameEn?.trim() || null,
          taxId: dto.taxId.trim(),
          branch: dto.branch || null,
          agentCardNo: dto.agentCardNo || null,
          agentName: dto.agentName || null,
          isDefault: !!dto.isDefault,
        },
      });
    } catch (err) {
      console.error('Broker Creation Error:', err);
      throw new BadRequestException(`Database Error: ${err.message}`);
    }
  }

  async updateBroker(customerId: string | null, id: string, dto: UpdateBrokerDto) {
    await this.assertBrokerExists(customerId, id);
    if (dto.isDefault) {
      // @ts-ignore
      await this.prisma.broker.updateMany({
        where: { customerId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    // @ts-ignore
    return this.prisma.broker.update({
      where: { id },
      data: {
        nameTh: dto.nameTh,
        nameEn: dto.nameEn || null,
        taxId: dto.taxId,
        branch: dto.branch || null,
        agentCardNo: dto.agentCardNo || null,
        agentName: dto.agentName || null,
        isDefault: dto.isDefault !== undefined ? !!dto.isDefault : undefined,
      },
    });
  }

  async deleteBroker(customerId: string | null, id: string) {
    await this.assertBrokerExists(customerId, id);
    // @ts-ignore
    await this.prisma.broker.delete({ where: { id } });
    return { message: 'Broker deleted' };
  }

  private async assertBrokerExists(customerId: string | null, id: string) {
    const whereCondition = customerId ? { id, customerId } : { id };
    // @ts-ignore
    const item = await this.prisma.broker.findFirst({ where: whereCondition });
    if (!item) throw new NotFoundException(`Broker ${id} not found`);
    return item;
  }
}
