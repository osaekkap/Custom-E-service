import { Injectable, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';

export interface ExtractedItem {
  seqNo: number;
  descriptionEn: string;
  descriptionTh?: string;
  hsCode?: string | null;
  quantity: number;
  quantityUnit: string;
  fobForeign: number;
  netWeightKg?: number;
}

export interface ExtractedDeclaration {
  shipper?: string;
  consignee?: string;
  vessel?: string;
  containerNo?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  etd?: string;
  currency?: string;
  exchangeRate?: number;
  items: ExtractedItem[];
  confidence?: 'high' | 'medium' | 'low';
  rawText?: string;
}

@Injectable()
export class AiExtractionService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /** Convert a multer file to a Claude content block */
  private fileToContentBlock(
    file: Express.Multer.File,
  ): Anthropic.MessageParam['content'] {
    const mime = file.mimetype;

    // PDF → document block (Claude reads natively)
    if (mime === 'application/pdf') {
      return [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: file.buffer.toString('base64'),
          },
          title: file.originalname,
        } as any,
      ];
    }

    // Excel / CSV → parse to CSV text
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    let text = `[File: ${file.originalname}]\n`;
    for (const name of workbook.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      text += `\n--- Sheet: ${name} ---\n${csv}\n`;
    }
    return [{ type: 'text', text }];
  }

  async extractFromDocuments(files: {
    invoice?: Express.Multer.File;
    packingList?: Express.Multer.File;
    booking?: Express.Multer.File;
  }): Promise<ExtractedDeclaration> {
    if (!files.invoice) {
      throw new BadRequestException('Commercial Invoice file is required');
    }

    // Build content blocks
    const userContent: any[] = [
      {
        type: 'text',
        text: 'Extract Thailand Customs export declaration data from these documents:',
      },
      { type: 'text', text: '\n=== COMMERCIAL INVOICE ===' },
      ...this.fileToContentBlock(files.invoice),
    ];

    if (files.packingList) {
      userContent.push({ type: 'text', text: '\n=== PACKING LIST ===' });
      userContent.push(...this.fileToContentBlock(files.packingList));
    }
    if (files.booking) {
      userContent.push({ type: 'text', text: '\n=== BOOKING CONFIRMATION ===' });
      userContent.push(...this.fileToContentBlock(files.booking));
    }

    userContent.push({
      type: 'text',
      text: `Return ONLY a valid JSON object — no markdown fences, no explanation, just raw JSON:
{
  "shipper": "exporter company name",
  "consignee": "importer/buyer company name",
  "vessel": "ship name and voyage if present",
  "containerNo": "container number or null",
  "portOfLoading": "full port name",
  "portOfDischarge": "destination port name",
  "etd": "YYYY-MM-DD or null",
  "currency": "USD",
  "exchangeRate": 35.0,
  "items": [
    {
      "seqNo": 1,
      "descriptionEn": "full English product description",
      "descriptionTh": "Thai description if available or null",
      "hsCode": "8471.30.0000 or null if unknown",
      "quantity": 100,
      "quantityUnit": "PCS",
      "fobForeign": 1500.00,
      "netWeightKg": 25.5
    }
  ],
  "confidence": "high"
}
Rules:
- descriptionEn must be specific (not just "goods")
- hsCode: include if written on invoice, else null
- fobForeign: unit price × quantity = total line FOB in foreign currency
- quantityUnit: PCS, KGS, CTN, SET, EA, etc.
- confidence: "high" if most fields found, "medium" if partial, "low" if many missing`,
    });

    const response = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: `You are an expert Thai Customs declaration specialist (กรมศุลกากร).
Extract structured data from commercial invoices and packing lists for Thailand export customs declarations (กศก.101/1 / A008-1).
Your output MUST be valid JSON only. Never include markdown code fences or prose.
If a field is not found, use null. Always extract ALL line items listed.`,
      messages: [{ role: 'user', content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new BadRequestException('AI returned no text response');
    }

    // Strip any accidental markdown fences
    const raw = textBlock.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(raw) as ExtractedDeclaration;
      // Ensure items array
      if (!Array.isArray(parsed.items)) parsed.items = [];
      // Normalize seqNo
      parsed.items = parsed.items.map((item, idx) => ({
        ...item,
        seqNo: item.seqNo ?? idx + 1,
      }));
      return parsed;
    } catch {
      throw new BadRequestException(
        `AI response was not valid JSON. Raw: ${raw.substring(0, 200)}`,
      );
    }
  }
}
