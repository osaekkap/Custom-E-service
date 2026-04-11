import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Prisma, CustomerStatus } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async create(dto: CreateCustomerDto) {
    const exists = await this.prisma.customer.findFirst({
      where: { OR: [{ code: dto.code }, { taxId: dto.taxId }] },
    });
    if (exists) {
      throw new ConflictException(
        exists.code === dto.code
          ? `Customer code "${dto.code}" already exists`
          : `Tax ID "${dto.taxId}" already exists`,
      );
    }

    const { pricePerJob, customsPasswordEnc, ...rest } = dto;
    const customer = await this.prisma.customer.create({
      data: {
        ...rest,
        ...(pricePerJob !== undefined && { pricePerJob }),
        ...(customsPasswordEnc && { customsPasswordEnc: this.encryption.encrypt(customsPasswordEnc) }),
      },
    });

    // Auto-create default Exporter from company registration data
    if (customer.companyNameTh && customer.taxId) {
      await this.upsertDefaultExporter(customer.id, {
        nameTh: customer.companyNameTh,
        nameEn: customer.companyNameEn ?? undefined,
        taxId: customer.taxId,
        address: customer.address ?? undefined,
        phone: customer.phone ?? undefined,
      });
    }

    return customer;
  }

  async findAll(query: QueryCustomerDto) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { companyNameTh: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { companyNameEn: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { taxId: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          companyNameTh: true,
          companyNameEn: true,
          taxId: true,
          phone: true,
          email: true,
          billingType: true,
          termDays: true,
          pricePerJob: true,
          status: true,
          isActive: true,
          createdAt: true,
          _count: { select: { jobs: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { jobs: true, billingInvoices: true } },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    if (dto.code || dto.taxId) {
      const conflict = await this.prisma.customer.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(dto.code ? [{ code: dto.code }] : []),
                ...(dto.taxId ? [{ taxId: dto.taxId }] : []),
              ],
            },
          ],
        },
      });
      if (conflict) throw new ConflictException('code or taxId already in use');
    }

    const { pricePerJob, status, customsPasswordEnc, ...rest } = dto as Partial<CreateCustomerDto> & { status?: CustomerStatus };
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        ...(status && { status }),
        ...(pricePerJob !== undefined && { pricePerJob }),
        ...(customsPasswordEnc && { customsPasswordEnc: this.encryption.encrypt(customsPasswordEnc) }),
      },
    });

    // Sync to default Exporter whenever company data changes
    if (updated.companyNameTh && updated.taxId) {
      await this.upsertDefaultExporter(id, {
        nameTh: updated.companyNameTh,
        nameEn: updated.companyNameEn ?? undefined,
        taxId: updated.taxId,
        address: updated.address ?? undefined,
        phone: updated.phone ?? undefined,
      });
    }

    return updated;
  }

  /** Upsert the default Exporter record to keep in sync with customer company data */
  private async upsertDefaultExporter(customerId: string, data: {
    nameTh: string; nameEn?: string; taxId: string; address?: string; phone?: string;
  }) {
    try {
      // @ts-ignore
      const existing = await this.prisma.exporter.findFirst({
        where: { customerId, isDefault: true },
      });
      if (existing) {
        // @ts-ignore
        await this.prisma.exporter.update({
          where: { id: existing.id },
          data: {
            nameTh: data.nameTh,
            nameEn: data.nameEn || null,
            taxId: data.taxId,
            address: data.address || null,
            phone: data.phone || null,
          },
        });
      } else {
        // @ts-ignore
        await this.prisma.exporter.create({
          data: {
            customerId,
            nameTh: data.nameTh,
            nameEn: data.nameEn || null,
            taxId: data.taxId,
            address: data.address || null,
            phone: data.phone || null,
            isDefault: true,
          },
        });
      }
    } catch (err) {
      // Non-critical: log but don't throw
      console.warn('upsertDefaultExporter failed:', err.message);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false, status: CustomerStatus.SUSPENDED },
    });
  }
}
