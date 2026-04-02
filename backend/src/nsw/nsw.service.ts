import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { XmlBuilderService } from './xml-builder.service';
import { EbxmlWrapperService } from './ebxml-wrapper.service';
import { RequestUser } from '../auth/jwt.strategy';
import { Role, EbxmlAckStatus, NswMessageStatus, SubmissionStatus } from '@prisma/client';

@Injectable()
export class NswService {
  private readonly logger = new Logger(NswService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private xmlBuilder: XmlBuilderService,
    private ebxmlWrapper: EbxmlWrapperService,
  ) {}

  // ─── Submit Declaration to NSW ────────────────────────────────────

  async submit(declarationId: string, user: RequestUser) {
    const decl = await this.prisma.exportDeclaration.findUnique({
      where: { id: declarationId },
      include: { items: { orderBy: { seqNo: 'asc' } } },
    });
    if (!decl) throw new NotFoundException(`Declaration ${declarationId} not found`);
    this.assertAccess(decl.customerId, user);

    if (decl.items.length === 0) {
      throw new BadRequestException('Cannot submit declaration with no items');
    }
    if (decl.submissionStatus === SubmissionStatus.SUCCESS) {
      throw new BadRequestException('Declaration already submitted successfully');
    }

    // Build XML
    const payloadXml = this.xmlBuilder.buildExportDeclaration(decl);

    // Wrap in ebXML SOAP envelope
    const { messageId, conversationId, xml: envelopeXml } = this.ebxmlWrapper.wrap(
      payloadXml,
      decl.ebxmlConversationId ?? undefined,
    );

    // Get attempt number (idempotent retry support)
    const attemptNo = (await this.prisma.nswSubmission.count({
      where: { declarationId },
    })) + 1;

    // Record submission attempt
    const endpoint = this.config.get<string>('NSW_ENDPOINT', 'http://localhost:18080/nsw/mock');
    const submission = await this.prisma.nswSubmission.create({
      data: {
        customerId: decl.customerId,
        jobId: decl.jobId,
        declarationId,
        attemptNo,
        ebxmlMessageId: messageId,
        endpointUrl: endpoint,
        soapAction: 'CustomsExportDeclaration',
        requestBody: envelopeXml,
        requestSentAt: new Date(),
      },
    });

    // Update declaration — mark in-progress + store ebXML IDs
    await this.prisma.exportDeclaration.update({
      where: { id: declarationId },
      data: {
        submissionStatus: SubmissionStatus.IN_PROGRESS,
        ebxmlMessageId: messageId,
        ebxmlConversationId: conversationId,
        ebxmlAckStatus: EbxmlAckStatus.WAITING,
        ebxmlLastSentAt: new Date(),
        ebxmlRetryCount: { increment: attemptNo === 1 ? 0 : 1 },
        nswMessageStatus: NswMessageStatus.NOT_SENT,
        submittedAt: new Date(),
      },
    });

    // POST to NSW endpoint
    let ackStatus: EbxmlAckStatus;
    let nswStatus: NswMessageStatus;
    let rawResponse: string | undefined;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"CustomsExportDeclaration"',
        },
        body: envelopeXml,
        signal: AbortSignal.timeout(30_000),
      });

      rawResponse = await response.text();
      this.logger.log(`NSW response [${response.status}] for declaration ${declarationId}`);

      if (response.ok) {
        ackStatus = EbxmlAckStatus.RECEIVED;
        nswStatus = this.parseNswStatus(rawResponse);
      } else {
        ackStatus = EbxmlAckStatus.FAILED;
        nswStatus = NswMessageStatus.NOT_RECOGNIZED;
        this.logger.warn(`NSW returned ${response.status}: ${rawResponse.substring(0, 200)}`);
      }
    } catch (err: any) {
      // Network error or timeout — mark for retry
      this.logger.error(`NSW connection error for ${declarationId}: ${err.message}`);
      ackStatus = EbxmlAckStatus.TIMEOUT;
      nswStatus = NswMessageStatus.NOT_SENT;
      rawResponse = `Connection error: ${err.message}`;
    }

    // Update submission log with response
    await this.prisma.nswSubmission.update({
      where: { id: submission.id },
      data: {
        responseBody: rawResponse,
        respondedAt: new Date(),
        ackStatus,
        ackReceivedAt: ackStatus === EbxmlAckStatus.RECEIVED ? new Date() : undefined,
        nswMessageStatus: nswStatus,
      },
    });

    // Update declaration with final ack status
    const submissionStatus =
      ackStatus === EbxmlAckStatus.RECEIVED
        ? SubmissionStatus.SUCCESS
        : SubmissionStatus.FAILED;

    await this.prisma.exportDeclaration.update({
      where: { id: declarationId },
      data: {
        ebxmlAckStatus: ackStatus,
        ebxmlAckReceivedAt: ackStatus === EbxmlAckStatus.RECEIVED ? new Date() : undefined,
        nswMessageStatus: nswStatus,
        nswStatusCheckedAt: new Date(),
        submissionStatus,
      },
    });

    // Transition job status on success
    if (submissionStatus === SubmissionStatus.SUCCESS) {
      await this.prisma.logisticsJob.update({
        where: { id: decl.jobId },
        data: { status: 'SUBMITTED' },
      });
    }

    return {
      submissionId: submission.id,
      messageId,
      conversationId,
      ackStatus,
      nswStatus,
      submissionStatus,
    };
  }

  // ─── Get NSW Status ───────────────────────────────────────────────

  async getNswStatus(declarationId: string, user: RequestUser) {
    const decl = await this.prisma.exportDeclaration.findUnique({
      where: { id: declarationId },
      include: { nswSubmissions: { orderBy: { attemptNo: 'desc' }, take: 5 } },
    });
    if (!decl) throw new NotFoundException(`Declaration ${declarationId} not found`);
    this.assertAccess(decl.customerId, user);

    return {
      declarationId,
      submissionStatus: decl.submissionStatus,
      ebxmlAckStatus: decl.ebxmlAckStatus,
      ebxmlMessageId: decl.ebxmlMessageId,
      nswMessageStatus: decl.nswMessageStatus,
      nswStatusCheckedAt: decl.nswStatusCheckedAt,
      attempts: decl.nswSubmissions.map((s) => ({
        id: s.id,
        attemptNo: s.attemptNo,
        messageId: s.ebxmlMessageId,
        sentAt: s.requestSentAt,
      })),
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  /**
   * Parse NSW CustomsResponse MessageType from response XML.
   * EXPA = Export Declaration Accept → FORWARDED
   * EXPR = Export Declaration Reject → REJECTED
   */
  private parseNswStatus(xml: string): NswMessageStatus {
    if (xml.includes('EXPA')) return NswMessageStatus.FORWARDED;
    if (xml.includes('EXPR')) return NswMessageStatus.REJECTED;
    if (xml.includes('Acknowledgment')) return NswMessageStatus.RECEIVED;
    return NswMessageStatus.RECEIVED;
  }

  private assertAccess(customerId: string, user: RequestUser) {
    if (user.role === Role.SUPER_ADMIN) return;
    if (!user.customerId) return; // NKTech internal staff (no customerId)
    if (user.customerId !== customerId) {
      throw new BadRequestException('Access denied');
    }
  }
}
