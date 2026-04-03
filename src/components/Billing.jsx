import { useState, useEffect } from "react";
import { billingApi } from "../api/billingApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, Tag, printHTML } from "./ui/index.jsx";

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [unbilledItems, setUnbilledItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      billingApi.listInvoices().catch(() => []),
      billingApi.listItems({ invoiced: false }).catch(() => []),
    ]).then(([inv, items]) => {
      const invArr = inv?.data ?? (Array.isArray(inv) ? inv : []);
      const itemsArr = items?.data ?? (Array.isArray(items) ? items : []);
      setInvoices(invArr);
      setUnbilledItems(itemsArr);
    }).catch(err => setError(err.message || "Failed to load billing data"))
      .finally(() => setLoading(false));
  }, []);

  const outstanding = invoices
    .filter(inv => inv.status !== "PAID")
    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  const unbilledTotal = unbilledItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const fmt = (n) => `฿${Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom:18 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Billing</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ marginBottom:18 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Billing</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:"#DC2626" }}>{error}</p>
          <Btn variant="secondary" style={{ marginTop:12 }} onClick={() => window.location.reload()}>Retry</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Billing</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Service invoices</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total invoices",   value: String(invoices.length),   color:BLUE  },
          { label:"Unbilled items",   value: String(unbilledItems.length), color:TEXT  },
          { label:"Outstanding",      value: fmt(outstanding),          color:"#DC2626" },
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
          {invoices.length === 0 && (
            <div style={{ padding:"30px 20px", textAlign:"center", color:TEXT3, fontSize:14 }}>ยังไม่มี invoice</div>
          )}
          {invoices.map((inv,i) => (
            <div key={inv.id || i} style={{ padding:"14px 20px", borderBottom:i<invoices.length-1?`1px solid ${BORDER2}`:"none", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:TEXT, marginBottom:4 }}>{inv.invoiceNo || inv.id}</div>
                <div style={{ fontSize:14, color:TEXT3 }}>{inv.period || "—"} · {inv.itemCount ?? "—"} jobs</div>
                <div style={{ fontSize:14, color:TEXT3 }}>
                  Issued: {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("th-TH") : "—"}
                  {inv.dueDate && ` · Due: ${new Date(inv.dueDate).toLocaleDateString("th-TH")}`}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:MONO, color:inv.status==="PAID"?"#16A34A":"#DC2626", marginBottom:6 }}>{fmt(inv.totalAmount)}</div>
                <Tag label={inv.status || "PENDING"} color={inv.status==="PAID"?"#16A34A":"#DC2626"}/>
                <div style={{ marginTop:8 }}>
                  <Btn variant="ghost" style={{ fontSize:13 }} onClick={() => {
                    const html = `<h2>Invoice ${inv.invoiceNo || inv.id}</h2>
                      <div class="table-wrapper"><table>
                        <tr><th style="text-align:left;width:160px">Invoice No.</th><td>${inv.invoiceNo || inv.id}</td></tr>
                        <tr><th style="text-align:left">Amount</th><td><strong>${fmt(inv.totalAmount)}</strong></td></tr>
                        <tr><th style="text-align:left">Status</th><td>${(inv.status || "PENDING").toUpperCase()}</td></tr>
                        <tr><th style="text-align:left">Issued</th><td>${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("th-TH") : "—"}</td></tr>
                      </table></div>`;
                    printHTML(`Invoice ${inv.invoiceNo || inv.id}`, html);
                  }}>⬇ Download PDF</Btn>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionHeader title="Unbilled items" sub={unbilledItems.length > 0 ? `${unbilledItems.length} items pending` : ""} />
          <div style={{ padding:"14px 20px" }}>
            {unbilledItems.length === 0 && (
              <div style={{ textAlign:"center", color:TEXT3, fontSize:14, padding:"20px 0" }}>ไม่มีรายการที่ยังไม่ออก invoice</div>
            )}
            {unbilledItems.map((item,i) => (
              <div key={item.id || i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER2}` }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:14, color:TEXT, fontWeight:600 }}>{item.description || item.jobNo || `Item #${i+1}`}</div>
                  <div style={{ fontSize:13, color:TEXT3, marginTop:2 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("th-TH") : "—"}
                  </div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>{fmt(item.amount)}</span>
              </div>
            ))}
            {unbilledItems.length > 0 && (
              <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14, color:TEXT3 }}>Estimated total ({unbilledItems.length} items)</span>
                <span style={{ fontSize:16, fontWeight:800, color:TEXT }}>{fmt(unbilledTotal)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
