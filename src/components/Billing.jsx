import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, Tag, printHTML } from "./ui/index.jsx";
import { SHIPMENTS, INVOICES_FACTORY } from "../lib/mockData.js";

export default function Billing() {
  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Billing</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Service invoices from LogiConnect Co., Ltd.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Billing type",     value:"Per job",     color:BLUE  },
          { label:"Rate per job",     value:"\u0e3f450",        color:TEXT  },
          { label:"Outstanding",      value:"\u0e3f78,750",     color:"#DC2626" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid-2">
        <Card>
          <SectionHeader title="Invoice history" />
          {INVOICES_FACTORY.map((inv,i) => (
            <div key={i} style={{ padding:"14px 20px", borderBottom:i<INVOICES_FACTORY.length-1?`1px solid ${BORDER2}`:"none", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:TEXT, marginBottom:4 }}>{inv.id}</div>
                <div style={{ fontSize:14, color:TEXT3 }}>{inv.period} · {inv.jobs} jobs</div>
                <div style={{ fontSize:14, color:TEXT3 }}>Issued: {inv.issued} · Due: {inv.due}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:MONO, color:inv.status==="paid"?"#16A34A":"#DC2626", marginBottom:6 }}>{inv.amount}</div>
                <Tag label={inv.status} color={inv.status==="paid"?"#16A34A":"#DC2626"}/>
                <div style={{ marginTop:8 }}>
                  <Btn variant="ghost" style={{ fontSize:13 }} onClick={() => {
                    const html = `<h2>Invoice ${inv.id}</h2>
                      <div class="table-wrapper"><table>
                        <tr><th style="text-align:left;width:160px">Invoice No.</th><td>${inv.id}</td></tr>
                        <tr><th style="text-align:left">Period</th><td>${inv.period}</td></tr>
                        <tr><th style="text-align:left">Jobs</th><td>${inv.jobs} jobs</td></tr>
                        <tr><th style="text-align:left">Amount</th><td><strong>${inv.amount}</strong></td></tr>
                        <tr><th style="text-align:left">Status</th><td>${inv.status.toUpperCase()}</td></tr>
                        <tr><th style="text-align:left">Issued</th><td>${inv.issued}</td></tr>
                        <tr><th style="text-align:left">Due</th><td>${inv.due}</td></tr>
                      </table></div>
                      <p style="margin-top:20px;font-size:11px;color:#666">LogiConnect Co., Ltd. · Service invoice</p>`;
                    printHTML(`Invoice ${inv.id}`, html);
                  }}>⬇ Download PDF</Btn>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionHeader title="Unbilled jobs this month" sub="Will be invoiced on Mar 25" />
          <div style={{ padding:"14px 20px" }}>
            {SHIPMENTS.filter(s=>["CLEARED","COMPLETED"].includes(s.status)).slice(0,3).map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER2}` }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:14, color:TEXT, fontWeight:600 }}>{s.id}</div>
                  <div style={{ fontSize:13, color:TEXT3, marginTop:2 }}>{s.date} · {s.fob}</div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>฿450</span>
              </div>
            ))}
            <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, color:TEXT3 }}>Estimated invoice (5 jobs)</span>
              <span style={{ fontSize:16, fontWeight:800, color:TEXT }}>฿2,250</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
