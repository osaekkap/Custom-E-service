import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }

  /** Convert a multer file to a Gemini inlineData part */
  private fileToGeminiPart(file: Express.Multer.File): any {
    const mime = file.mimetype;

    // PDF → inline base64 (Gemini reads natively)
    if (mime === 'application/pdf') {
      return {
        inlineData: {
          mimeType: 'application/pdf',
          data: file.buffer.toString('base64'),
        },
      };
    }

    // Excel / CSV → parse to text
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    let text = `[File: ${file.originalname}]\n`;
    for (const name of workbook.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      text += `\n--- Sheet: ${name} ---\n${csv}\n`;
    }
    return { text };
  }

  async extractFromDocuments(files: {
    invoice?: Express.Multer.File;
    packingList?: Express.Multer.File;
    booking?: Express.Multer.File;
  }): Promise<ExtractedDeclaration> {
    if (!files.invoice) {
      throw new BadRequestException('Commercial Invoice file is required');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an expert Thai Customs declaration specialist (กรมศุลกากร).
Extract structured data from commercial invoices and packing lists for Thailand export customs declarations (กศก.101/1 / A008-1).
Your output MUST be valid JSON only. Never include markdown code fences or prose.
If a field is not found, use null. Always extract ALL line items listed.`,
    });

    // Build prompt parts
    const parts: any[] = [];

    parts.push({ text: 'Extract Thailand Customs export declaration data from these documents:\n\n=== COMMERCIAL INVOICE ===' });
    parts.push(this.fileToGeminiPart(files.invoice));

    if (files.packingList) {
      parts.push({ text: '\n=== PACKING LIST ===' });
      parts.push(this.fileToGeminiPart(files.packingList));
    }

    if (files.booking) {
      parts.push({ text: '\n=== BOOKING CONFIRMATION ===' });
      parts.push(this.fileToGeminiPart(files.booking));
    }

    parts.push({
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

    const result = await model.generateContent(parts);
    const raw = result.response
      .text()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(raw) as ExtractedDeclaration;
      if (!Array.isArray(parsed.items)) parsed.items = [];
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
