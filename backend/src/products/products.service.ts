import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(customerId: string, search?: string) {
    return this.prisma.productMaster.findMany({
      where: {
        customerId,
        isActive: true,
        ...(search && {
          OR: [
            { productCode: { contains: search, mode: 'insensitive' as const } },
            { descriptionEn: { contains: search, mode: 'insensitive' as const } },
            { descriptionTh: { contains: search } },
            { hsCode: { contains: search } },
          ],
        }),
      },
      orderBy: { productCode: 'asc' },
    });
  }

  async findOne(customerId: string, id: string) {
    const item = await this.prisma.productMaster.findFirst({ where: { id, customerId } });
    if (!item) throw new NotFoundException(`Product ${id} not found`);
    return item;
  }

  async create(customerId: string, dto: CreateProductDto) {
    const exists = await this.prisma.productMaster.findUnique({
      where: { customerId_productCode: { customerId, productCode: dto.productCode } },
    });
    if (exists) throw new ConflictException(`Product code ${dto.productCode} already exists`);

    return this.prisma.productMaster.create({ data: { customerId, ...dto } });
  }

  async update(customerId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(customerId, id);
    return this.prisma.productMaster.update({ where: { id }, data: dto });
  }

  async remove(customerId: string, id: string) {
    await this.findOne(customerId, id);
    await this.prisma.productMaster.update({ where: { id }, data: { isActive: false } });
    return { message: 'Product deactivated' };
  }
}
