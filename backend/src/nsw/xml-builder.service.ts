import { Injectable } from '@nestjs/common';
import { ExportDeclaration, DeclarationItem, TransportMode } from '@prisma/client';

type DeclWithItems = ExportDeclaration & { items: DeclarationItem[] };

@Injectable()
export class XmlBuilderService {
  /**
   * Build CustomsExportDeclaration XML string per XSD v4.00
   * Namespace: http://ebxml.customs.go.th/XMLSchema/CustomsExportDeclaration_4_00
   */
  buildExportDeclaration(decl: DeclWithItems): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<CustomsExportDeclaration
  xmlns="http://ebxml.customs.go.th/XMLSchema/CustomsExportDeclaration_4_00"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <DocumentControl>
${this.buildDocumentControl(decl)}
  </DocumentControl>
  <GoodsShipment>
${this.buildGoodsShipment(decl)}
  </GoodsShipment>
</CustomsExportDeclaration>`;
  }

  // ─── DocumentControl ─────────────────────────────────────────────

  private buildDocumentControl(decl: DeclWithItems): string {
    const lines: string[] = [];

    // Seq.1 ReferenceNumber (M, an13)
    lines.push(`    <ReferenceNumber>${this.esc(decl.nswReferenceNumber ?? this.padRef(decl.declarationNo))}</ReferenceNumber>`);

    // Seq.2 DocumentType (M, an1) — "E" for Export
    lines.push(`    <DocumentType>${this.esc(decl.declarationDocType ?? 'E')}</DocumentType>`);

    // Seq.3-11 Exporter
    lines.push(`    <Exporter>`);
    lines.push(`      <TaxNumber>${this.esc(decl.exporterTaxId ?? '')}</TaxNumber>`);
    lines.push(`      <Branch>${decl.exporterBranch ?? 0}</Branch>`);
    if (decl.exporterNameTh) lines.push(`      <ThaiName>${this.esc(decl.exporterNameTh)}</ThaiName>`);
    lines.push(`      <EnglishName>${this.esc(decl.exporterNameEn ?? decl.exporterNameTh ?? '')}</EnglishName>`);
    if (decl.exporterAddress) lines.push(`      <StreetAndNumber>${this.esc(decl.exporterAddress)}</StreetAndNumber>`);
    lines.push(`    </Exporter>`);

    // Seq.12-13 Agent (Broker) — optional
    if (decl.brokerTaxId) {
      lines.push(`    <Agent>`);
      lines.push(`      <TaxNumber>${this.esc(decl.brokerTaxId)}</TaxNumber>`);
      lines.push(`      <Branch>${decl.agentBranch ?? 0}</Branch>`);
      lines.push(`    </Agent>`);
    }

    // Seq.14-17 AuthorisedPerson (M)
    lines.push(`    <AuthorisedPerson>`);
    lines.push(`      <CustomsClearanceIDCard>${this.esc(decl.agentCardNo ?? '')}</CustomsClearanceIDCard>`);
    lines.push(`      <CustomsClearanceName>${this.esc(decl.agentName ?? '')}</CustomsClearanceName>`);
    lines.push(`      <ManagerIDCard>${this.esc(decl.managerIdCard ?? decl.agentCardNo ?? '')}</ManagerIDCard>`);
    lines.push(`      <ManagerName>${this.esc(decl.managerName ?? decl.agentName ?? '')}</ManagerName>`);
    lines.push(`    </AuthorisedPerson>`);

    // Seq.18-21 BorderTransportMeans (M)
    lines.push(`    <BorderTransportMeans>`);
    lines.push(`      <ModeCode>${this.transportModeCode(decl.transportMode)}</ModeCode>`);
    lines.push(`      <CargoTypeCode>${this.esc(decl.cargoTypeCode ?? '1')}</CargoTypeCode>`);
    lines.push(`      <VesselName>${this.esc(decl.vesselName ?? '')}</VesselName>`);
    lines.push(`      <DepartureDate>${this.formatDate(decl.departureDate)}</DepartureDate>`);
    lines.push(`    </BorderTransportMeans>`);

    // Seq.22-23 BillofLading (O)
    if (decl.masterBl || decl.houseBl) {
      lines.push(`    <BillofLading>`);
      if (decl.masterBl) lines.push(`      <Master>${this.esc(decl.masterBl)}</Master>`);
      if (decl.houseBl) lines.push(`      <House>${this.esc(decl.houseBl)}</House>`);
      lines.push(`    </BillofLading>`);
    }

    // Seq.24 ReleasePort (M)
    lines.push(`    <ReleasePort>${this.esc(decl.portOfReleaseCode ?? '0')}</ReleasePort>`);

    // Seq.25 LoadPort (M)
    lines.push(`    <LoadPort>${this.esc(decl.portOfLoadingCode ?? '0')}</LoadPort>`);

    // Seq.26 PurchaseCountryCode (M, a2)
    lines.push(`    <PurchaseCountryCode>${this.esc((decl.soldToCountryCode ?? 'TH').substring(0, 2))}</PurchaseCountryCode>`);

    // Seq.27 DestinationCountryCode (M, a2)
    lines.push(`    <DestinationCountryCode>${this.esc((decl.destinationCode ?? 'TH').substring(0, 2))}</DestinationCountryCode>`);

    // Seq.28-30 TotalPackage (M)
    lines.push(`    <TotalPackage>`);
    lines.push(`      <ShippingMarks>${this.esc(decl.shippingMarks ?? 'N/M')}</ShippingMarks>`);
    lines.push(`      <Amount>${decl.totalPackages ?? 0}</Amount>`);
    lines.push(`      <UnitCode>${this.esc(decl.packageUnitCode ?? 'CT')}</UnitCode>`);
    lines.push(`    </TotalPackage>`);

    // Seq.31-32 TotalNetWeight (M)
    lines.push(`    <TotalNetWeight>`);
    lines.push(`      <Weight>${this.decimal(decl.totalNetWeight, 3)}</Weight>`);
    lines.push(`      <UnitCode>${this.esc(decl.netWeightUnit ?? 'KGM')}</UnitCode>`);
    lines.push(`    </TotalNetWeight>`);

    // Seq.33-34 TotalGrossWeight (M)
    lines.push(`    <TotalGrossWeight>`);
    lines.push(`      <Weight>${this.decimal(decl.totalGrossWeight, 3)}</Weight>`);
    lines.push(`      <UnitCode>${this.esc(decl.grossWeightUnit ?? 'KGM')}</UnitCode>`);
    lines.push(`    </TotalGrossWeight>`);

    // Seq.35 CurrencyCode (M, a3)
    lines.push(`    <CurrencyCode>${this.esc((decl.exchangeCurrency ?? 'USD').substring(0, 3))}</CurrencyCode>`);

    // Seq.36 RateofExchange (M)
    lines.push(`    <RateofExchange>${this.decimal(decl.exchangeRate, 5)}</RateofExchange>`);

    // Seq.37-38 FOBValue (M)
    lines.push(`    <FOBValue>`);
    lines.push(`      <Foreign>${this.decimal(decl.totalFobForeign, 2)}</Foreign>`);
    lines.push(`      <Baht>${this.decimal(decl.totalFobThb, 2)}</Baht>`);
    lines.push(`    </FOBValue>`);

    // Seq.45 BankInfo/PaymentMethod (M)
    lines.push(`    <BankInfo>`);
    lines.push(`      <PaymentMethod>${this.esc(decl.paymentMethod ?? 'D')}</PaymentMethod>`);
    lines.push(`    </BankInfo>`);

    // Seq.46 TotalTax (M)
    lines.push(`    <TotalTax>${this.decimal(decl.totalDutyThb, 2)}</TotalTax>`);

    // Seq.47 TotalDeposit (M)
    lines.push(`    <TotalDeposit>${this.decimal(decl.securityDeposit, 2)}</TotalDeposit>`);

    // Seq.51 ObligationGuarantee (M)
    lines.push(`    <ObligationGuarantee>`);
    lines.push(`      <Method>${this.esc(decl.guaranteeMethod ?? 'A')}</Method>`);
    lines.push(`    </ObligationGuarantee>`);

    // Seq.57 ExportTaxIncentivesID (C)
    if (decl.exportTaxIncentivesId) {
      lines.push(`    <ExportTaxIncentivesID>${this.esc(decl.exportTaxIncentivesId)}</ExportTaxIncentivesID>`);
    }

    // Seq.66 RegistrationID (M)
    lines.push(`    <RegistrationID>${this.esc(decl.nswRegistrationId ?? '')}</RegistrationID>`);

    return lines.join('\n');
  }

  // ─── GoodsShipment ───────────────────────────────────────────────

  private buildGoodsShipment(decl: DeclWithItems): string {
    // Group items by sourceInvoiceNo (one invoice if not specified)
    const invoiceMap = new Map<string, DeclarationItem[]>();
    for (const item of decl.items) {
      const key = item.sourceInvoiceNo ?? decl.invoiceRef ?? 'INV-001';
      if (!invoiceMap.has(key)) invoiceMap.set(key, []);
      invoiceMap.get(key)!.push(item);
    }

    const lines: string[] = [];
    for (const [invoiceNo, items] of invoiceMap) {
      lines.push(`    <Invoice>`);
      lines.push(`      <Number>${this.esc(invoiceNo)}</Number>`);
      lines.push(`      <Date>${this.formatDate(decl.createdAt)}</Date>`);
      lines.push(`      <PurchaseOrderNumber>${this.esc(invoiceNo)}</PurchaseOrderNumber>`);
      lines.push(`      <TermsofPaymentCode>TT</TermsofPaymentCode>`);

      for (const item of items) {
        lines.push(this.buildGoodsItem(item));
      }

      lines.push(`    </Invoice>`);
    }

    return lines.join('\n');
  }

  private buildGoodsItem(item: DeclarationItem): string {
    const lines: string[] = [];
    lines.push(`      <GoodsItem>`);
    lines.push(`        <SequenceNumber>${item.seqNo}</SequenceNumber>`);

    if (item.packageMark) lines.push(`        <PackingMark>${this.esc(item.packageMark)}</PackingMark>`);
    if (item.packageQty) lines.push(`        <PackageQuantity>${item.packageQty}</PackageQuantity>`);
    if (item.packageType) lines.push(`        <PackageType>${this.esc(item.packageType)}</PackageType>`);

    lines.push(`        <GoodsDescription>${this.esc(item.descriptionEn)}</GoodsDescription>`);

    lines.push(`        <TariffCode>`);
    lines.push(`          <HSCode>${this.esc(item.hsCode)}</HSCode>`);
    if (item.statisticsCode) lines.push(`          <StatisticsCode>${this.esc(item.statisticsCode)}</StatisticsCode>`);
    lines.push(`        </TariffCode>`);

    lines.push(`        <GoodsQuantity>`);
    lines.push(`          <Quantity>${this.decimal(item.quantity, 4)}</Quantity>`);
    lines.push(`          <UnitCode>${this.esc(item.quantityUnit)}</UnitCode>`);
    lines.push(`        </GoodsQuantity>`);

    if (item.netWeightKg != null) {
      lines.push(`        <NetWeight>`);
      lines.push(`          <Weight>${this.decimal(item.netWeightKg, 3)}</Weight>`);
      lines.push(`          <UnitCode>KGM</UnitCode>`);
      lines.push(`        </NetWeight>`);
    }

    lines.push(`        <FOBValue>`);
    lines.push(`          <Foreign>${this.decimal(item.fobForeign, 2)}</Foreign>`);
    lines.push(`          <Baht>${this.decimal(item.fobThb, 2)}</Baht>`);
    lines.push(`        </FOBValue>`);

    lines.push(`        <DutyRate>${this.decimal(item.dutyRate, 4)}</DutyRate>`);

    if (item.exportDutyThb != null) {
      lines.push(`        <ExportDuty>${this.decimal(item.exportDutyThb, 2)}</ExportDuty>`);
    }

    if (item.privilegeCode) {
      lines.push(`        <TaxIncentiveCode>${this.esc(item.privilegeCode)}</TaxIncentiveCode>`);
    }

    if (item.exportLicenseNo) {
      lines.push(`        <ExportLicenseNumber>${this.esc(item.exportLicenseNo)}</ExportLicenseNumber>`);
    }

    lines.push(`      </GoodsItem>`);
    return lines.join('\n');
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  /** Map TransportMode enum → UNECE Recommendation 19 code */
  private transportModeCode(mode: TransportMode): string {
    const map: Record<TransportMode, string> = {
      SEA: '1', AIR: '4', LAND: '3', POST: '5',
    };
    return map[mode] ?? '1';
  }

  /** Escape XML special characters */
  private esc(v: string): string {
    return v
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /** Format date as YYYY-MM-DD (XSD date type) */
  private formatDate(d: Date | null | undefined): string {
    if (!d) return new Date().toISOString().substring(0, 10);
    return new Date(d).toISOString().substring(0, 10);
  }

  /** Format decimal to fixed decimal places, fallback 0 */
  private decimal(v: any, places: number): string {
    const n = v == null ? 0 : Number(v);
    return n.toFixed(places);
  }

  /** Pad declarationNo to 13 chars for ReferenceNumber (an13) */
  private padRef(ref: string | null | undefined): string {
    if (!ref) return '0000000000000';
    return ref.padStart(13, '0').substring(0, 13);
  }
}
