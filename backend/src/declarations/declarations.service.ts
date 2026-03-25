import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { CreateDeclarationItemDto, UpdateDeclarationItemDto } from './dto/create-item.dto';
import { Role, HsVerificationStatus } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@Injectable()
export class DeclarationsService {
  constructor(private prisma: PrismaService) {}

  // ─── Declarations ─────────────────────────────────────────────────

  async listByJob(jobId: string, user: RequestUser) {
    await this.assertJobAccess(jobId, user);
    return this.prisma.exportDeclaration.findMany({
      where: { jobId },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(jobId: string, dto: CreateDeclarationDto, user: RequestUser) {
    const job = await this.assertJobAccess(jobId, user);

    // Auto-populate Exporter info from default Exporter master
    const defaultExporter = await this.prisma.exporter.findFirst({
      where: { customerId: job.customerId, isDefault: true },
    });

    return this.prisma.exportDeclaration.create({
      data: {
        jobId,
        customerId: job.customerId,
        declarationType: dto.declarationType,
        invoiceRef: dto.invoiceRef,

        // Exporter (from master, overrideable via DTO)
        exporterTaxId:   dto.exporterTaxId   ?? defaultExporter?.taxId,
        exporterBranch:  dto.exporterBranch  ?? '0',
        exporterNameTh:  dto.exporterNameTh  ?? defaultExporter?.nameTh,
        exporterNameEn:  dto.exporterNameEn  ?? defaultExporter?.nameEn ?? undefined,
        exporterAddress: dto.exporterAddress ?? defaultExporter?.address?.substring(0, 70) ?? undefined,

        // Agent/Broker (from Customer master)
        agentCardNo:  dto.agentCardNo  ?? job.customer?.agentCardNo,
        agentName:    dto.agentName    ?? job.customer?.agentName,
        agentBranch:  dto.agentBranch  ?? '0',
        managerIdCard: dto.managerIdCard,
        managerName:   dto.managerName,
        brokerName:   dto.brokerName   ?? job.customer?.brokerName,
        brokerTaxId:  dto.brokerTaxId  ?? job.customer?.brokerTaxId,

        // Transport (from LogisticsJob)
        transportMode: dto.transportMode ?? job.transportMode,
        cargoTypeCode: dto.cargoTypeCode,
        vesselName:    dto.vesselName    ?? job.vesselName ?? undefined,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : job.etd ?? undefined,

        // Bill of Lading
        masterBl: dto.masterBl,
        houseBl:  dto.houseBl,

        // Port (from LogisticsJob)
        portOfReleaseCode: dto.portOfReleaseCode ?? job.portOfReleaseCode,
        portOfLoading:     dto.portOfLoading     ?? job.portOfLoading,
        portOfLoadingCode: dto.portOfLoadingCode ?? job.portOfLoadingCode,
        soldToCountryCode: dto.soldToCountryCode,
        destinationCode:   dto.destinationCode,

        // Package & Weight
        totalPackages:    dto.totalPackages,
        shippingMarks:    dto.shippingMarks,
        packageUnitCode:  dto.packageUnitCode,
        totalNetWeight:   dto.totalNetWeight,
        netWeightUnit:    dto.netWeightUnit ?? 'KGM',
        totalGrossWeight: dto.totalGrossWeight,
        grossWeightUnit:  dto.grossWeightUnit ?? 'KGM',

        // FOB & Exchange
        totalFobForeign:  dto.totalFobForeign,
        exchangeRate:     dto.exchangeRate,
        exchangeCurrency: dto.exchangeCurrency ?? job.currency,
        exchangeRateDate: dto.exchangeRateDate ? new Date(dto.exchangeRateDate) : undefined,

        // Financial
        paymentMethod:   dto.paymentMethod  ?? 'D',
        guaranteeMethod: dto.guaranteeMethod ?? 'A',

        // NSW / Reference
        declarationDocType:    dto.declarationDocType    ?? 'E',
        nswReferenceNumber:    dto.nswReferenceNumber,
        nswRegistrationId:     dto.nswRegistrationId     ?? job.customer?.nswAgentCode ?? undefined,
        exportTaxIncentivesId: dto.exportTaxIncentivesId,

        // Signatory
        signatoryName:    dto.signatoryName,
        submissionMethod: dto.submissionMethod,
      },
    });
  }

  async findOne(id: string, user: RequestUser) {
    const decl = await this.prisma.exportDeclaration.findUnique({
      where: { id },
      include: {
        items: { orderBy: { seqNo: 'asc' } },
        nswSubmissions: { orderBy: { attemptNo: 'asc' } },
      },
    });
    if (!decl) throw new NotFoundException(`Declaration ${id} not found`);
    this.assertAccess(decl.customerId, user);
    return decl;
  }

  async update(id: string, dto: Partial<CreateDeclarationDto>, user: RequestUser) {
    const decl = await this.findOne(id, user);
    if (decl.submissionStatus === 'SUCCESS') {
      throw new BadRequestException('Cannot edit a submitted declaration');
    }
    return this.prisma.exportDeclaration.update({
      where: { id },
      data: {
        ...dto,
        exchangeRateDate: (dto as any).exchangeRateDate
          ? new Date((dto as any).exchangeRateDate)
          : undefined,
      },
    });
  }

  // ─── Declaration Items ─────────────────────────────────────────────

  async addItem(declarationId: string, dto: CreateDeclarationItemDto, user: RequestUser) {
    const decl = await this.findOne(declarationId, user);

    // Check seqNo unique
    const existing = await this.prisma.declarationItem.findUnique({
      where: { declarationId_seqNo: { declarationId, seqNo: dto.seqNo } },
    });
    if (existing) throw new BadRequestException(`seqNo ${dto.seqNo} already exists`);

    // Auto-verify HS code against master
    const hsMaster = await this.prisma.hsMasterItem.findUnique({
      where: { customerId_hsCode: { customerId: decl.customerId, hsCode: dto.hsCode } },
    });

    const hsVerification = hsMaster
      ? HsVerificationStatus.AI_MATCHED
      : HsVerificationStatus.MISSING;

    return this.prisma.declarationItem.create({
      data: {
        declarationId,
        customerId: decl.customerId,
        seqNo: dto.seqNo,
        packageMark: dto.packageMark,
        packageQty: dto.packageQty,
        packageType: dto.packageType,
        descriptionEn: dto.descriptionEn,
        descriptionTh: dto.descriptionTh,
        brandName: dto.brandName,
        netWeightKg: dto.netWeightKg,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit,
        hsCode: dto.hsCode,
        hsVerification,
        hsConfidence: hsMaster ? 1.0 : undefined,
        statisticsCode: dto.statisticsCode ?? hsMaster?.statisticsCode,
        statisticsUnit: dto.statisticsUnit ?? hsMaster?.statisticsUnit,
        fobForeign: dto.fobForeign,
        fobCurrency: dto.fobCurrency ?? 'USD',
        privilegeCode: dto.privilegeCode,
        dutyRate: dto.dutyRate ?? hsMaster?.dutyRate ?? 0,
        exportLicenseNo: dto.exportLicenseNo,
        exportLicenseExpiry: dto.exportLicenseExpiry ? new Date(dto.exportLicenseExpiry) : undefined,
        sourceInvoiceNo: dto.sourceInvoiceNo,
        sourceProductCode: dto.sourceProductCode,
      },
    });
  }

  async updateItem(
    declarationId: string,
    itemId: string,
    dto: UpdateDeclarationItemDto,
    user: RequestUser,
  ) {
    await this.findOne(declarationId, user);
    const item = await this.prisma.declarationItem.findFirst({
      where: { id: itemId, declarationId },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);
    return this.prisma.declarationItem.update({ where: { id: itemId }, data: dto });
  }

  async removeItem(declarationId: string, itemId: string, user: RequestUser) {
    await this.findOne(declarationId, user);
    const item = await this.prisma.declarationItem.findFirst({
      where: { id: itemId, declarationId },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);
    await this.prisma.declarationItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private async assertJobAccess(jobId: string, user: RequestUser) {
    const job = await this.prisma.logisticsJob.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          select: {
            agentCardNo: true, agentName: true,
            brokerName: true, brokerTaxId: true,
            nswAgentCode: true,
          },
        },
      },
    });
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    this.assertAccess(job.customerId, user);
    return job;
  }

  private assertAccess(customerId: string, user: RequestUser) {
    if (user.role === Role.SUPER_ADMIN) return;
    if (user.customerId !== customerId) throw new ForbiddenException('Access denied');
  }
}
