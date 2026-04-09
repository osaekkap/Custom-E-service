import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';
import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';

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

  /** Check if a string contains Thai Unicode characters (U+0E00–U+0E7F) */
  private containsThai(str: string): boolean {
    return /[\u0E00-\u0E7F]/.test(str);
  }

  /**
   * Decode a CSV buffer to UTF-8.
   * Strategy: try UTF-8 first; if result has no Thai, try Windows-874 (CP874).
   * chardet often misidentifies Thai CP874 as ISO-8859-1, so we cross-check.
   */
  private decodeBuffer(buffer: Buffer): Buffer {
    // If already valid UTF-8 with Thai characters → use as-is
    const utf8str = buffer.toString('utf-8');
    if (this.containsThai(utf8str)) return buffer;

    // Try Windows-874 (Thai) — chardet may have said ISO-8859-1 but it's actually CP874
    const cp874str = iconv.decode(buffer, 'windows874');
    if (this.containsThai(cp874str)) {
      return Buffer.from(cp874str, 'utf-8');
    }

    // Fallback: use chardet detection
    const detected = chardet.detect(buffer);
    const enc = (detected ?? 'utf-8').toLowerCase();
    if (!enc.includes('utf-8') && !enc.includes('utf8') && iconv.encodingExists(enc)) {
      const converted = iconv.decode(buffer, enc);
      return Buffer.from(converted, 'utf-8');
    }

    return buffer;
  }

  /** Convert a multer file to a Gemini inlineData part */
  private fileToGeminiPart(file: Express.Multer.File): any {
    const mime = file.mimetype;
    const name = file.originalname.toLowerCase();

    // PDF → inline base64 (Gemini reads natively)
    if (mime === 'application/pdf') {
      return {
        inlineData: {
          mimeType: 'application/pdf',
          data: file.buffer.toString('base64'),
        },
      };
    }

    // CSV — may be Windows-874 (Thai): decode to UTF-8 first
    if (mime === 'text/csv' || name.endsWith('.csv')) {
      const utf8Buffer = this.decodeBuffer(file.buffer);
      const workbook = XLSX.read(utf8Buffer, { type: 'buffer', codepage: 65001 });
      let text = `[File: ${file.originalname}]\n`;
      for (const sheetName of workbook.SheetNames) {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        text += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
      }
      return { text };
    }

    // Excel (.xlsx / .xls) → XLSX handles encoding internally
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    let text = `[File: ${file.originalname}]\n`;
    for (const sheetName of workbook.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      text += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
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

    // Model preference: try stable first, fallback if unavailable
    const MODEL_CANDIDATES = ['gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.5-flash'];

    const buildParts = (): any[] => {
      const parts: any[] = [];
      parts.push({ text: 'Extract Thailand Customs export declaration data from these documents:\n\n=== COMMERCIAL INVOICE ===' });
      parts.push(this.fileToGeminiPart(files.invoice!));
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
      return parts;
    };

    const SYSTEM_INSTRUCTION = `You are an expert Thai Customs declaration specialist (กรมศุลกากร).
Extract structured data from commercial invoices and packing lists for Thailand export customs declarations (กศก.101/1 / A008-1).
Your output MUST be valid JSON only. Never include markdown code fences or prose.
If a field is not found, use null. Always extract ALL line items listed.`;

    /** Retry a single model up to maxRetries times on 503 */
    const tryModel = async (modelName: string, maxRetries = 3): Promise<string> => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const model = this.genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_INSTRUCTION });
          const result = await model.generateContent(buildParts());
          return result.response.text();
        } catch (err: any) {
          const is503 = err?.message?.includes('503') || err?.status === 503;
          const isLast = attempt === maxRetries - 1;
          if (is503 && !isLast) {
            // Exponential backoff: 1s, 2s, 4s
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
            continue;
          }
          throw err;
        }
      }
      throw new Error('Unreachable');
    };

    // Try each candidate model in order
    let raw = '';
    let lastError: any;
    for (const candidate of MODEL_CANDIDATES) {
      try {
        raw = await tryModel(candidate);
        break;
      } catch (err: any) {
        lastError = err;
        // Continue to next candidate only on 503/404
        const retryable = err?.message?.includes('503') || err?.message?.includes('404') || err?.status === 503;
        if (!retryable) throw err;
      }
    }
    if (!raw) throw new BadRequestException(`AI extraction failed: ${lastError?.message ?? 'all models unavailable'}`);

    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as ExtractedDeclaration;
      if (!Array.isArray(parsed.items)) parsed.items = [];
      parsed.items = parsed.items.map((item, idx) => ({
        ...item,
        seqNo: item.seqNo ?? idx + 1,
      }));
      return parsed;
    } catch {
      throw new BadRequestException(
        `AI response was not valid JSON. Raw: ${cleaned.substring(0, 200)}`,
      );
    }
  }
}
