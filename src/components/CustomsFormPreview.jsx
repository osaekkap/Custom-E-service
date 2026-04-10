import { useRef } from "react";

/* ─── Official กศก. 101/1 color scheme ─── */
const G   = "#2d6b2d";      // dark green (borders)
const GL  = "#3a8a3a";      // label green
const BGG = "#f6fdf6";      // very light green bg

const PRINT_CSS = `
@media print {
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .form-page { box-shadow: none !important; border: none !important; margin: 0 !important; border-radius: 0 !important; }
}
@page { size: A4 landscape; margin: 6mm; }
`;

/* helper: bordered cell */
const Cell = ({ children, style, colSpan, rowSpan }) => (
  <td colSpan={colSpan} rowSpan={rowSpan} style={{
    border: `1px solid ${G}`, padding: "3px 6px", verticalAlign: "top", fontSize: 11, lineHeight: 1.35, ...style,
  }}>{children}</td>
);

/* helper: field label */
const Lbl = ({ num, children }) => (
  <div style={{ fontSize: 9.5, color: GL, lineHeight: 1.3, marginBottom: 1 }}>
    {num != null && <b style={{ color: G, marginRight: 2 }}>{num}.</b>}{children}
  </div>
);

/* helper: field value */
const Val = ({ children, style }) => (
  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#111", whiteSpace: "pre-wrap", wordBreak: "break-word", ...style }}>{children || "—"}</div>
);

export default function CustomsFormPreview({ extracted, form, items, totalFobForeign, totalFobThb, cur, exRate }) {
  const formRef = useRef(null);

  const totalNetWeight = items.reduce((s, it) => s + (Number(it.netWeightKg) || 0), 0);
  const grossWeight = Number(extracted?.grossWeightKg) || totalNetWeight;
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const qtyUnit = items[0]?.quantityUnit || "PCS";
  const pkgCount = extracted?.packageCount || items.length;
  const pkgType = extracted?.packageType || "Package";
  const incoterms = extracted?.incoterms || "FOB";
  const today = new Date();
  const thaiDate = today.toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" });

  /* vessel + voyage display */
  const vesselDisplay = [extracted?.vessel || form.vesselName, extracted?.voyageNo].filter(Boolean).join(" / ");

  const handlePrint = () => {
    const el = formRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=1100,height=800");
    win.document.write(`<!DOCTYPE html><html><head><title>กศก.101/1 — Print Preview</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "Sarabun", "Noto Sans Thai", "TH SarabunPSK", sans-serif; background: #fff; }
        ${PRINT_CSS}
        .no-print { text-align: center; padding: 12px; background: #f0f0f0; }
        .no-print button { font-size: 14px; padding: 8px 32px; cursor: pointer; border-radius: 6px; border: 1px solid #999; background: #fff; margin: 0 6px; }
        .no-print button:hover { background: #e8e8e8; }
      </style></head><body>
      <div class="no-print">
        <button onclick="window.print()">🖨️ Print / Save PDF</button>
        <button onclick="window.close()">✕ ปิด</button>
      </div>
      ${el.outerHTML}
    </body></html>`);
    win.document.close();
  };

  return (
    <div>
      {/* Print button */}
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, gap: 8 }}>
        <button onClick={handlePrint} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 20px", borderRadius: 8, cursor: "pointer",
          background: "#fff", border: `1.5px solid ${G}`, color: G,
          fontSize: 14, fontWeight: 700, transition: "all .15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = G; }}
        >
          🖨️ Print Preview
        </button>
      </div>

      {/* ─── Form ─── */}
      <div ref={formRef} className="form-page" style={{
        background: "#fff", border: `2px solid ${G}`, borderRadius: 4,
        fontFamily: '"Sarabun","Noto Sans Thai","TH SarabunPSK",sans-serif',
        maxWidth: 1060, margin: "0 auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "16.66%" }} />
            <col style={{ width: "16.66%" }} />
            <col style={{ width: "16.66%" }} />
            <col style={{ width: "16.66%" }} />
            <col style={{ width: "16.66%" }} />
            <col style={{ width: "16.66%" }} />
          </colgroup>
          <tbody>

            {/* ═══ HEADER ROW ═══ */}
            <tr style={{ background: BGG }}>
              <Cell colSpan={2} style={{ textAlign: "center", padding: "8px 6px", borderBottom: `2px solid ${G}` }}>
                <div style={{ fontSize: 20, lineHeight: 1 }}>⚙️</div>
                <div style={{ fontSize: 9, color: G, fontWeight: 700, marginTop: 2 }}>กรมศุลกากร</div>
                <div style={{ fontSize: 7.5, color: "#666" }}>Royal Thai Customs</div>
              </Cell>
              <Cell colSpan={2} style={{ textAlign: "center", padding: "8px 6px", borderBottom: `2px solid ${G}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: G }}>ใบขนสินค้าขาออก</div>
                <div style={{ fontSize: 11, color: G, fontWeight: 600 }}>กศก 101/1</div>
              </Cell>
              <Cell colSpan={2} style={{ padding: "6px 8px", borderBottom: `2px solid ${G}`, fontSize: 10 }}>
                <div style={{ textAlign: "right", color: "#666", fontSize: 9 }}>แบบ 101/1</div>
                <div style={{ textAlign: "right", fontSize: 9, color: "#666", marginTop: 1 }}>ใบแนบที่ 1/{Math.ceil(items.length / 3) || 1}</div>
                <div style={{ textAlign: "right", marginTop: 4, fontWeight: 700, color: G, fontSize: 11 }}>DRAFT</div>
              </Cell>
            </tr>

            {/* ═══ ROW 1: Exporter (spans 2 rows) + TIN + Declaration No. ═══ */}
            <tr>
              <Cell colSpan={3} rowSpan={2}>
                <Lbl num={1}>ผู้ส่งออก (Exporter) / ชื่อ ที่อยู่ โทรศัพท์</Lbl>
                <Val style={{ fontSize: 12.5, fontWeight: 700 }}>{extracted?.shipper}</Val>
              </Cell>
              <Cell colSpan={1}>
                <Lbl num={2}>เลขประจำตัวผู้เสียภาษีอากร (TIN)</Lbl>
                <Val>{form.exporterTaxId}</Val>
              </Cell>
              <Cell colSpan={2}>
                <Lbl num={4}>เลขที่ใบขนสินค้าฯ (Declaration No.)</Lbl>
                <Val>— (ออกโดยระบบ)</Val>
              </Cell>
            </tr>
            <tr>
              <Cell colSpan={1}>
                <Lbl num={3}>ประเภทใบขนฯ (Declaration Type)</Lbl>
                <Val>{form.declarationType || "ส่งออก"}</Val>
              </Cell>
              <Cell colSpan={2}>
                <Lbl num={5}>ชื่อและเลขที่บัตรผ่านพิธีการ</Lbl>
                <Val>{form.agentName}</Val>
              </Cell>
            </tr>

            {/* ═══ ROW 2: Customs Broker + Consignee + Inspection ═══ */}
            <tr>
              <Cell colSpan={2}>
                <Lbl num={7}>ตัวแทนออกของ (Customs Broker)</Lbl>
                <Val>{form.brokerTaxId}</Val>
              </Cell>
              <Cell colSpan={3}>
                <Lbl>ผู้รับของ (Consignee)</Lbl>
                <Val style={{ fontSize: 12, fontWeight: 700 }}>{extracted?.consignee}</Val>
              </Cell>
              <Cell colSpan={1}>
                <Lbl num={6}>สั่งการตรวจ</Lbl>
                <Val style={{ fontSize: 10, color: "#888" }}>— (ระบบ)</Val>
              </Cell>
            </tr>

            {/* ═══ ROW 3: Transport & Financial (Boxes 8–13) ═══ */}
            <tr>
              <Cell>
                <Lbl num={8}>อากรขาออก (บาท)</Lbl>
                <Val>0.00</Val>
              </Cell>
              <Cell>
                <Lbl num={9}>เงินประกัน (บาท)</Lbl>
                <Val>0.00</Val>
              </Cell>
              <Cell>
                <Lbl num={10}>ชื่อยานพาหนะ</Lbl>
                <Val style={{ fontWeight: 700 }}>{vesselDisplay}</Val>
              </Cell>
              <Cell>
                <Lbl num={11}>ส่งออกโดยทาง</Lbl>
                <Val>เรือ (Sea)</Val>
              </Cell>
              <Cell>
                <Lbl num={12}>วันที่ส่งออก (ETD)</Lbl>
                <Val style={{ fontWeight: 700 }}>{extracted?.etd || form.etd}</Val>
              </Cell>
              <Cell>
                <Lbl num={13}>เลขที่ชำระภาษี/ประกัน</Lbl>
                <Val>—</Val>
              </Cell>
            </tr>

            {/* ═══ ROW 4: Port & Exchange (Boxes 14–18) ═══ */}
            <tr>
              <Cell colSpan={2}>
                <Lbl num={14}>ท่าบรรทุก (Port of Loading)</Lbl>
                <Val style={{ fontWeight: 700 }}>{extracted?.portOfLoading || form.portOfLoading}</Val>
              </Cell>
              <Cell>
                <Lbl num={15}>ประเทศที่ขาย (Sold to)</Lbl>
                <Val>{extracted?.destinationCountry || form.soldToCountryCode}</Val>
              </Cell>
              <Cell>
                <Lbl num={16}>ประเทศปลายทาง (Destination)</Lbl>
                <Val>{extracted?.portOfDischarge || form.portOfDischarge}</Val>
              </Cell>
              <Cell>
                <Lbl num={17}>จำนวนหีบห่อ (Packages)</Lbl>
                <Val>{pkgCount}</Val>
              </Cell>
              <Cell>
                <Lbl num={18}>อัตราแลกเปลี่ยน</Lbl>
                <Val style={{ fontSize: 10.5 }}>1 {cur} = {exRate} THB</Val>
              </Cell>
            </tr>

            {/* ═══ Booking / Shipment details row ═══ */}
            <tr style={{ background: BGG }}>
              <Cell colSpan={6} style={{ padding: "5px 8px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 24px", fontSize: 10.5 }}>
                  {extracted?.containerNo && (
                    <span><b style={{ color: G }}>Container No:</b> {extracted.containerNo}</span>
                  )}
                  {extracted?.bookingNo && (
                    <span><b style={{ color: G }}>Booking No:</b> {extracted.bookingNo}</span>
                  )}
                  {extracted?.blNo && (
                    <span><b style={{ color: G }}>B/L No:</b> {extracted.blNo}</span>
                  )}
                  {extracted?.shippingAgent && (
                    <span><b style={{ color: G }}>Shipping Agent:</b> {extracted.shippingAgent}</span>
                  )}
                  {extracted?.eta && (
                    <span><b style={{ color: G }}>ETA:</b> {extracted.eta}</span>
                  )}
                  <span><b style={{ color: G }}>Incoterms:</b> {incoterms}</span>
                  <span><b style={{ color: G }}>หีบห่อ:</b> {pkgCount} {pkgType}</span>
                  {grossWeight > 0 && (
                    <span><b style={{ color: G }}>GW:</b> {grossWeight.toLocaleString("en")} KGM</span>
                  )}
                </div>
              </Cell>
            </tr>

            {/* ═══ GOODS ITEMS TABLE HEADER ═══ */}
            <tr style={{ background: BGG }}>
              <Cell style={{ textAlign: "center", fontSize: 9, fontWeight: 700, padding: "4px 2px" }}>ลำดับ/กร.</Cell>
              <Cell colSpan={2} style={{ fontSize: 9, fontWeight: 700, padding: "4px 4px" }}>
                <div>ชนิดของ / Description</div>
                <div style={{ color: "#666", fontWeight: 400 }}>เครื่องหมายและเลขหมายหีบห่อ</div>
              </Cell>
              <Cell style={{ textAlign: "center", fontSize: 9, fontWeight: 700, padding: "4px 2px" }}>
                <div>พิกัดศุลกากร</div>
                <div>HS Code</div>
              </Cell>
              <Cell style={{ textAlign: "center", fontSize: 9, fontWeight: 700, padding: "4px 2px" }}>
                <div>น้ำหนัก/ปริมาณ</div>
                <div>KGM / QTY</div>
              </Cell>
              <Cell style={{ textAlign: "right", fontSize: 9, fontWeight: 700, padding: "4px 4px" }}>
                <div>ราคาของ FOB (บาท)</div>
                <div style={{ color: "#666", fontWeight: 400 }}>FOB ({cur})</div>
              </Cell>
            </tr>

            {/* ═══ GOODS ITEMS ═══ */}
            {items.map((it, idx) => {
              const fobThb = (Number(it.fobForeign) || 0) * exRate;
              return (
                <tr key={idx}>
                  <Cell style={{ textAlign: "center", fontWeight: 700, fontSize: 12 }}>{it.seqNo}</Cell>
                  <Cell colSpan={2}>
                    <Val style={{ fontSize: 11, fontWeight: 600 }}>{it.descriptionEn}</Val>
                    {it.descriptionTh && <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{it.descriptionTh}</div>}
                    {/* Show container no. in items like the official form */}
                    {extracted?.containerNo && idx === 0 && (
                      <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{extracted.containerNo}</div>
                    )}
                  </Cell>
                  <Cell style={{ textAlign: "center" }}>
                    <Val style={{ fontSize: 11, fontWeight: 700, color: it.hsCode ? G : "#dc2626" }}>
                      {it.hsCode || "ไม่พบ"}
                    </Val>
                  </Cell>
                  <Cell style={{ textAlign: "right", fontSize: 10.5 }}>
                    <div>{(Number(it.netWeightKg) || 0).toLocaleString("en")} KGM</div>
                    <div style={{ marginTop: 2 }}>{(Number(it.quantity) || 0).toLocaleString("en")} {it.quantityUnit}</div>
                  </Cell>
                  <Cell style={{ textAlign: "right" }}>
                    <Val style={{ fontSize: 11.5, fontWeight: 700 }}>
                      THB {fobThb.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Val>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>
                      {(Number(it.fobForeign) || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>อากร: 0% &nbsp; 0.00</div>
                  </Cell>
                </tr>
              );
            })}

            {/* ═══ TOTALS ROW ═══ */}
            <tr style={{ background: BGG }}>
              <Cell colSpan={2} style={{ fontWeight: 700, fontSize: 10.5, padding: "6px 8px" }}>
                <div>{incoterms}</div>
                {extracted?.shippingAgent && <div style={{ fontSize: 9.5, color: "#555", marginTop: 2 }}>{extracted.shippingAgent}</div>}
              </Cell>
              <Cell colSpan={2} style={{ textAlign: "right", fontWeight: 700, fontSize: 10.5, padding: "6px 8px" }}>
                <div>NW = {totalNetWeight.toLocaleString("en")} KGM</div>
                <div>GW = {grossWeight.toLocaleString("en")} KGM</div>
                <div>Qty = {totalQty.toLocaleString("en")} {qtyUnit}</div>
              </Cell>
              <Cell style={{ textAlign: "right", fontWeight: 700, fontSize: 11, padding: "6px 8px" }}>
                {cur} {totalFobForeign.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Cell>
              <Cell style={{ textAlign: "right", fontWeight: 700, fontSize: 11, padding: "6px 8px" }}>
                <div>THB {totalFobThb.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                  {pkgCount} {pkgType}
                </div>
              </Cell>
            </tr>

            {/* ═══ SUMMARY: Total FOB + Duties + Declaration ═══ */}
            <tr>
              <Cell colSpan={2} style={{ padding: "8px" }}>
                <Lbl num={35}>รวม FOB (บาท) / Total FOB THB</Lbl>
                <Val style={{ fontSize: 14, fontWeight: 800, color: G }}>
                  ฿ {totalFobThb.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Val>
              </Cell>
              <Cell colSpan={1} style={{ padding: "8px" }}>
                <Lbl num={36}>รวมค่าภาษีอากรทั้งสิ้น / Total Duties (บาท)</Lbl>
                <Val style={{ fontSize: 14, fontWeight: 800 }}>฿ 0.00</Val>
              </Cell>
              <Cell colSpan={3} style={{ padding: "8px" }}>
                <Lbl num={37}>คำรับรอง / Declaration</Lbl>
                <div style={{ fontSize: 10, color: "#333", lineHeight: 1.5, marginTop: 2 }}>
                  ข้าพเจ้าขอรับรองว่ารายการที่แสดงข้างต้นนี้เป็นความจริงทุกประการ
                </div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 8, borderTop: "1px dashed #999", paddingTop: 6 }}>
                  ลายมือชื่อ _____________________ (ผู้ส่งออก/ผู้รับมอบ)
                </div>
                <div style={{ fontSize: 9, color: "#888", marginTop: 4 }}>38. วันที่ยื่น: {thaiDate}</div>
              </Cell>
            </tr>

            {/* ═══ STATUS ROW ═══ */}
            <tr style={{ background: BGG }}>
              <Cell colSpan={3} style={{ padding: "6px 8px", fontSize: 10 }}>
                <div style={{ color: "#666" }}>STATUS = DRAFT</div>
                <div style={{ color: "#888", fontSize: 9, marginTop: 2 }}>กำลังรอยื่น · Pending submission</div>
              </Cell>
              <Cell colSpan={3} style={{ padding: "6px 8px", textAlign: "right", fontSize: 10 }}>
                <div style={{ fontWeight: 700, color: G }}>{extracted?.shipper || "—"}</div>
                <div style={{ color: "#888", fontSize: 9, marginTop: 2 }}>วันที่พิมพ์: {thaiDate}</div>
              </Cell>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
