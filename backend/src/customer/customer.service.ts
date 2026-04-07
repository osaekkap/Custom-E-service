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
    return this.prisma.customer.create({
      data: {
        ...rest,
        ...(pricePerJob !== undefined && { pricePerJob }),
        ...(customsPasswordEnc && { customsPasswordEnc: this.encryption.encrypt(customsPasswordEnc) }),
      },
    });
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
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        ...(status && { status }),
        ...(pricePerJob !== undefined && { pricePerJob }),
        ...(customsPasswordEnc && { customsPasswordEnc: this.encryption.encrypt(customsPasswordEnc) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false, status: CustomerStatus.SUSPENDED },
    });
  }
}
