import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export interface EbxmlEnvelope {
  messageId: string;
  conversationId: string;
  xml: string;
}

@Injectable()
export class EbxmlWrapperService {
  constructor(private config: ConfigService) {}

  /**
   * Wrap payload XML in an ebXML 2.0 SOAP envelope per NSW Thailand spec.
   * Produces a multipart/form-data MIME envelope (simplified text form for HTTP POST).
   */
  wrap(payloadXml: string, conversationId?: string): EbxmlEnvelope {
    const messageId = `${randomUUID()}@customs-edoc`;
    const convId = conversationId ?? randomUUID();
    const timestamp = new Date().toISOString();

    const cpaId = this.config.get<string>('NSW_CPA_ID', 'DEFAULT_CPA');
    const fromPartyId = this.config.get<string>('NSW_FROM_PARTY_ID', 'urn:customs-edoc');
    const toPartyId = this.config.get<string>('NSW_TO_PARTY_ID', 'urn:duns:customs.go.th');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SOAP-ENV:Header>
    <eb:MessageHeader SOAP-ENV:mustUnderstand="1" eb:version="2.0">
      <eb:From>
        <eb:PartyId eb:type="urn:nsw">${this.esc(fromPartyId)}</eb:PartyId>
      </eb:From>
      <eb:To>
        <eb:PartyId eb:type="urn:nsw">${this.esc(toPartyId)}</eb:PartyId>
      </eb:To>
      <eb:CPAId>${this.esc(cpaId)}</eb:CPAId>
      <eb:ConversationId>${this.esc(convId)}</eb:ConversationId>
      <eb:Service eb:type="urn:oasis:names:tc:ebxml-msg:service">urn:www.customs.go.th:eXchangeService</eb:Service>
      <eb:Action>CustomsExportDeclaration</eb:Action>
      <eb:MessageData>
        <eb:MessageId>${this.esc(messageId)}</eb:MessageId>
        <eb:Timestamp>${timestamp}</eb:Timestamp>
      </eb:MessageData>
      <eb:DuplicateElimination/>
    </eb:MessageHeader>
    <eb:AckRequested SOAP-ENV:mustUnderstand="1"
      eb:version="2.0"
      eb:signed="false"/>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
    <eb:Manifest eb:version="2.0">
      <eb:Reference eb:id="payload-1" xlink:href="cid:payload-1">
        <eb:Schema eb:location="http://ebxml.customs.go.th/XMLSchema/CustomsExportDeclaration_4_00" eb:version="4.00"/>
        <eb:Description xml:lang="th">ใบขนสินค้าขาออก</eb:Description>
      </eb:Reference>
    </eb:Manifest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
<!--PAYLOAD_BOUNDARY-->
${payloadXml}`;

    return { messageId, conversationId: convId, xml };
  }

  private esc(v: string): string {
    return v
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
