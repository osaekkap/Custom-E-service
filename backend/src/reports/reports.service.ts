import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface MonthlySummaryRow {
  month: string;
  type: string;
  job_count: bigint;
  total_fob_usd: Prisma.Decimal | null;
  total_fob_thb: Prisma.Decimal | null;
}

interface TopDestinationRow {
  destination: string;
  fob_usd: Prisma.Decimal | null;
  fob_thb: Prisma.Decimal | null;
  job_count: bigint;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate LogisticsJob by month and type (EXPORT/IMPORT).
   * Returns an array of { month, exportCount, importCount, totalFobUsd, totalFobThb }.
   */
  async getMonthlySummary(customerId: string, months: number) {
    const rows = await this.prisma.$queryRaw<MonthlySummaryRow[]>`
      SELECT
        to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
        "type",
        COUNT(*)::bigint AS job_count,
        SUM("totalFobUsd") AS total_fob_usd,
        SUM("totalFobThb") AS total_fob_thb
      FROM "LogisticsJob"
      WHERE "customerId" = ${customerId}
        AND "createdAt" >= date_trunc('month', now()) - ${`${months} months`}::interval
      GROUP BY date_trunc('month', "createdAt"), "type"
      ORDER BY month DESC, "type"
    `;

    // Pivot rows into { month, exportCount, importCount, totalFobUsd, totalFobThb }
    const monthMap = new Map<string, {
      month: string;
      exportCount: number;
      importCount: number;
      totalFobUsd: number;
      totalFobThb: number;
    }>();

    for (const row of rows) {
      const key = row.month;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          month: key,
          exportCount: 0,
          importCount: 0,
          totalFobUsd: 0,
          totalFobThb: 0,
        });
      }
      const entry = monthMap.get(key)!;
      const count = Number(row.job_count);
      const fobUsd = row.total_fob_usd ? Number(row.total_fob_usd) : 0;
      const fobThb = row.total_fob_thb ? Number(row.total_fob_thb) : 0;

      if (row.type === 'EXPORT') {
        entry.exportCount += count;
      } else if (row.type === 'IMPORT') {
        entry.importCount += count;
      }
      entry.totalFobUsd += fobUsd;
      entry.totalFobThb += fobThb;
    }

    return Array.from(monthMap.values());
  }

  /**
   * Top 10 destinations by FOB value.
   * Returns array of { destination, fobUsd, fobThb, jobCount, percentage }.
   */
  async getTopDestinations(customerId: string, months: number) {
    const rows = await this.prisma.$queryRaw<TopDestinationRow[]>`
      SELECT
        COALESCE("consigneeNameEn", 'Unknown') AS destination,
        SUM("totalFobUsd") AS fob_usd,
        SUM("totalFobThb") AS fob_thb,
        COUNT(*)::bigint AS job_count
      FROM "LogisticsJob"
      WHERE "customerId" = ${customerId}
        AND "createdAt" >= date_trunc('month', now()) - ${`${months} months`}::interval
      GROUP BY COALESCE("consigneeNameEn", 'Unknown')
      ORDER BY SUM("totalFobUsd") DESC
      LIMIT 10
    `;

    // Calculate total FOB USD for percentage
    const totalFobUsd = rows.reduce(
      (sum, r) => sum + (r.fob_usd ? Number(r.fob_usd) : 0),
      0,
    );

    return rows.map((row) => {
      const fobUsd = row.fob_usd ? Number(row.fob_usd) : 0;
      return {
        destination: row.destination,
        fobUsd,
        fobThb: row.fob_thb ? Number(row.fob_thb) : 0,
        jobCount: Number(row.job_count),
        percentage: totalFobUsd > 0
          ? Math.round((fobUsd / totalFobUsd) * 10000) / 100
          : 0,
      };
    });
  }
}
