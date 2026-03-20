import { useState } from "react";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "#94A3B8", bg: "#F1F5F9" },
  PREPARING: { label: "Preparing", color: "#F59E0B", bg: "#FFFBEB" },
  READY: { label: "Ready", color: "#3B82F6", bg: "#EFF6FF" },
  SUBMITTED: { label: "Submitted", color: "#8B5CF6", bg: "#F5F3FF" },
  NSW_PROCESSING: { label: "NSW Processing", color: "#0EA5E9", bg: "#F0F9FF" },
  CUSTOMS_REVIEW: { label: "Customs Review", color: "#F97316", bg: "#FFF7ED" },
  CLEARED: { label: "Cleared", color: "#22C55E", bg: "#F0FDF4" },
  COMPLETED: { label: "Completed", color: "#16A34A", bg: "#DCFCE7" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "#FEF2F2" },
};

const SHIPMENTS = [
  { id: "SH-2026-0234", type: "Export", factory: "บริษัท ไทยอิเล็กทรอนิกส์ จำกัด", vessel: "MSC AURORA V.124", container: "MSCU7823410", hs: "8542.31.10", fob: "USD 128,450", status: "CLEARED", date: "2026-03-18" },
  { id: "SH-2026-0235", type: "Export", factory: "บริษัท สยามออโต้ พาร์ท จำกัด", vessel: "EVER GIVEN V.89", container: "EISU4561230", hs: "8708.10.90", fob: "USD 87,200", status: "NSW_PROCESSING", date: "2026-03-19" },
  { id: "SH-2026-0236", type: "Import", factory: "บริษัท ไทยอิเล็กทรอนิกส์ จำกัด", vessel: "OOCL EUROPE V.32", container: "OOLU6312870", hs: "8473.30.90", fob: "USD 45,600", status: "CUSTOMS_REVIEW", date: "2026-03-19" },
  { id: "SH-2026-0237", type: "Export", factory: "บริษัท มิตรผล กรุ๊ป จำกัด", vessel: "COSCO PRIDE V.67", container: "CSNU5012340", hs: "1701.99.10", fob: "USD 234,100", status: "SUBMITTED", date: "2026-03-20" },
  { id: "SH-2026-0238", type: "Export", factory: "บริษัท สยามออโต้ พาร์ท จำกัด", vessel: "MAERSK TITAN V.41", container: "MSKU8723410", hs: "8708.99.90", fob: "USD 63,800", status: "DRAFT", date: "2026-03-20" },
  { id: "SH-2026-0239", type: "Import", factory: "บริษัท มิตรผล กรุ๊ป จำกัด", vessel: "EVER BLOOM V.15", container: "EISU1203450", hs: "8424.89.90", fob: "USD 19,200", status: "PREPARING", date: "2026-03-20" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "shipments", label: "Shipment List", icon: "≡" },
  { id: "new", label: "New Shipment", icon: "+" },
  { id: "nsw", label: "NSW Tracking", icon: "⊙" },
  { id: "declarations", label: "Declarations", icon: "◫" },
  { id: "master", label: "Master Data", icon: "⊞" },
  { id: "reports", label: "Reports", icon: "⌗" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const KPI_DATA = [
  { label: "Total Shipments", value: "156", sub: "March 2026", color: "#0EA5E9", icon: "📦" },
  { label: "Pending NSW", value: "12", sub: "Awaiting response", color: "#F59E0B", icon: "⌛" },
  { label: "Cleared Today", value: "8", sub: "Customs approved", color: "#22C55E", icon: "✓" },
  { label: "Total FOB Value", value: "$4.2M", sub: "Month to date", color: "#8B5CF6", icon: "$" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`
    }}>
      {cfg.label}
    </span>
  );
}

function Sidebar({ active, onNav }) {
  return (
    <div style={{
      width: 220, background: "#0F2744", height: "100vh", display: "flex",
      flexDirection: "column", flexShrink: 0, position: "sticky", top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#1A8FA3,#0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#fff"
          }}>⚓</div>
          <div>
            <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px" }}>CUSTOMS-EDOC</div>
            <div style={{ color: "#94A3B8", fontSize: 10 }}>Factory Portal</div>
          </div>
        </div>
      </div>

      {/* Factory selector */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px",
          cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ color: "#94A3B8", fontSize: 10, marginBottom: 2 }}>Active Factory</div>
          <div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 600 }}>ไทยอิเล็กทรอนิกส์ จำกัด</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px", borderRadius: 8,
              background: isActive ? "rgba(14,165,233,0.15)" : "transparent",
              border: isActive ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent",
              color: isActive ? "#38BDF8" : "#94A3B8",
              cursor: "pointer", textAlign: "left", marginBottom: 2,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "#64748B", fontSize: 10, marginBottom: 4 }}>Service Provider</div>
        <div style={{ color: "#94A3B8", fontSize: 11 }}>LogiConnect Co., Ltd.</div>
        <div style={{ color: "#475569", fontSize: 10, marginTop: 4 }}>v2.0 · ISO 27001 Compliant</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>บริษัท ไทยอิเล็กทรอนิกส์ จำกัด · March 2026</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {KPI_DATA.map((k, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "18px 20px",
            border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Recent Shipments */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Recent Shipments</div>
            <span style={{ fontSize: 11, color: "#0EA5E9", cursor: "pointer", fontWeight: 600 }}>View all →</span>
          </div>
          {SHIPMENTS.slice(0, 4).map((s, i) => (
            <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{s.id}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s.vessel} · {s.fob}</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>

        {/* NSW Status Summary */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>NSW Submission Status</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              { label: "Submitted to NSW", val: 28, color: "#8B5CF6" },
              { label: "NSW Processing", val: 12, color: "#0EA5E9" },
              { label: "Customs Review", val: 6, color: "#F59E0B" },
              { label: "Cleared", val: 8, color: "#22C55E" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</span>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(item.val / 28) * 100}%`, height: "100%", background: item.color, borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
          </div>

          {/* NSW Connection indicator */}
          <div style={{ margin: "0 20px 20px", background: "#F0FDF4", borderRadius: 8, padding: "10px 14px", border: "1px solid #BBF7D0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>NSW Connected</span>
              <span style={{ fontSize: 11, color: "#86EFAC", marginLeft: "auto" }}>API Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentListPage({ onNewShipment }) {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "Export", "Import", "CLEARED", "NSW_PROCESSING", "DRAFT"];
  const filtered = filter === "ALL" ? SHIPMENTS : SHIPMENTS.filter(s => s.status === filter || s.type === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>Shipment List</h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>{filtered.length} records found</p>
        </div>
        <button onClick={onNewShipment} style={{
          background: "#0EA5E9", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
        }}>+ New Shipment</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            background: filter === f ? "#0EA5E9" : "#fff",
            color: filter === f ? "#fff" : "#64748B",
            borderColor: filter === f ? "#0EA5E9" : "#E2E8F0"
          }}>{f.replace("_", " ")}</button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              {["Job ID", "Type", "Factory", "Vessel / Container", "HS Code", "FOB Value", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0F172A", fontFamily: "monospace", fontSize: 12 }}>{s.id}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: s.type === "Export" ? "#EFF6FF" : "#FFF7ED",
                    color: s.type === "Export" ? "#1D4ED8" : "#C2410C"
                  }}>{s.type}</span>
                </td>
                <td style={{ padding: "12px 16px", color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.factory}</td>
                <td style={{ padding: "12px 16px", color: "#475569", fontFamily: "monospace", fontSize: 11 }}>{s.vessel}<br />{s.container}</td>
                <td style={{ padding: "12px 16px", color: "#475569", fontFamily: "monospace", fontSize: 12 }}>{s.hs}</td>
                <td style={{ padding: "12px 16px", color: "#0F172A", fontWeight: 600, fontSize: 12 }}>{s.fob}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={s.status} /></td>
                <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: 12 }}>{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewShipmentPage({ onBack }) {
  const [step, setStep] = useState(1);
  const steps = ["Upload Documents", "AI Extraction & Verify", "Declaration & Submit"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#64748B" }}>← Back</button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>New Export Shipment</h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>ยื่นใบขนสินค้าขาออก — Export Declaration Wizard</p>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
        {steps.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  background: done ? "#22C55E" : active ? "#0EA5E9" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8"
                }}>{done ? "✓" : n}</div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? "#0F172A" : "#94A3B8" }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#22C55E" : "#E2E8F0", margin: "0 16px" }} />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {["Commercial Invoice (PDF/Excel)", "Packing List (PDF/Excel)", "Booking Confirmation (PDF)"].map((doc, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, border: "2px dashed #CBD5E1", padding: "28px 20px", textAlign: "center", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#0EA5E9"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#CBD5E1"}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>{doc}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16 }}>Drag & drop or click to upload</div>
              <div style={{ fontSize: 11, color: "#CBD5E1" }}>Max 20MB · PDF, XLSX, CSV</div>
            </div>
          ))}
          <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setStep(2)} style={{ background: "#0EA5E9", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Extract with AI →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          {/* AI status banner */}
          <div style={{ background: "linear-gradient(90deg,#EFF6FF,#F5F3FF)", padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1E40AF" }}>AI Extraction Complete</span>
            <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 4 }}>Gemini Flash · 14 items extracted · 12 matched</span>
            <div style={{ marginLeft: "auto", background: "#FEF3C7", color: "#D97706", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #FDE68A" }}>2 items need HS Code</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["#", "Item Description", "Thai Description", "HS Code", "Qty", "Unit", "FOB/Unit", "Status"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "Semiconductor IC Controller", "วงจรรวมไมโครคอนโทรลเลอร์", "8542.31.10", "2,000", "pcs", "USD 24.50", "MATCHED"],
                ["2", "PCB Assembly Board", "แผงวงจรพิมพ์", "8534.00.10", "500", "pcs", "USD 85.00", "MATCHED"],
                ["3", "LCD Display Module 7-inch", "จอแสดงผลแอลซีดี", "8524.12.90", "300", "pcs", "USD 45.20", "MATCHED"],
                ["4", "Power Supply Unit 12V", "แหล่งจ่ายไฟ 12V", "—", "150", "pcs", "USD 18.00", "MISSING"],
                ["5", "Enclosure Housing ABS", "กล่องพลาสติก ABS", "3926.90.99", "200", "pcs", "USD 12.50", "MATCHED"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F8FAFC", background: row[7] === "MISSING" ? "#FFFBEB" : "transparent" }}>
                  <td style={{ padding: "10px 14px", color: "#94A3B8" }}>{row[0]}</td>
                  <td style={{ padding: "10px 14px", color: "#0F172A", fontWeight: 500 }}>{row[1]}</td>
                  <td style={{ padding: "10px 14px", color: "#475569", fontSize: 11 }}>{row[2]}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {row[7] === "MISSING"
                      ? <input defaultValue="" placeholder="Enter HS Code" style={{ border: "1px solid #FCD34D", borderRadius: 6, padding: "4px 8px", fontSize: 11, width: 100, background: "#FFFBEB" }} />
                      : <span style={{ fontFamily: "monospace", color: "#1D4ED8", fontWeight: 600 }}>{row[3]}</span>
                    }
                  </td>
                  <td style={{ padding: "10px 14px", color: "#475569" }}>{row[4]}</td>
                  <td style={{ padding: "10px 14px", color: "#475569" }}>{row[5]}</td>
                  <td style={{ padding: "10px 14px", color: "#475569" }}>{row[6]}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: row[7] === "MATCHED" ? "#F0FDF4" : "#FEF3C7",
                      color: row[7] === "MATCHED" ? "#16A34A" : "#D97706",
                      border: `1px solid ${row[7] === "MATCHED" ? "#BBF7D0" : "#FDE68A"}`
                    }}>{row[7] === "MATCHED" ? "AI Match" : "Missing"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: "16px 20px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, color: "#64748B" }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ background: "#0EA5E9", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Generate Declaration →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Declaration Form */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: "20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
              ใบขนสินค้าขาออก A008-1
            </div>
            {[
              ["ผู้ส่งออก (Exporter)", "บริษัท ไทยอิเล็กทรอนิกส์ จำกัด"],
              ["Tax ID", "0105561000123"],
              ["Consignee", "Samsung Electronics Co., Ltd. Korea"],
              ["Port of Loading", "Laem Chabang Port (THLCH)"],
              ["Port of Discharge", "Busan, Korea (KRPUS)"],
              ["Vessel / Voyage", "MSC AURORA V.124"],
              ["ETD", "2026-03-25"],
              ["Exchange Rate (USD)", "35.75 THB (BoT)"],
              ["Privilege Code", "IEAT Zone 3"],
              ["Incoterms", "FOB"],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, marginBottom: 10, alignItems: "center" }}>
                <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{label}</label>
                <input defaultValue={val} style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#0F172A", background: "#F8FAFC" }} />
              </div>
            ))}
          </div>

          {/* Submit panel */}
          <div>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: "20px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Submit Options</div>
              {[
                { icon: "⊙", title: "Submit via NSW Thailand", desc: "National Single Window API — Recommended", color: "#0EA5E9", check: true },
                { icon: "⊡", title: "Submit via Customs Portal", desc: "Playwright automation — Direct submission", color: "#8B5CF6", check: false },
                { icon: "⬇", title: "Export Netbay CSV", desc: "Download CSV for manual upload", color: "#22C55E", check: false },
              ].map((opt, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "12px",
                  borderRadius: 8, marginBottom: 8, cursor: "pointer",
                  border: opt.check ? `2px solid ${opt.color}` : "1px solid #E2E8F0",
                  background: opt.check ? `${opt.color}08` : "#fff"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${opt.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{opt.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{opt.title}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#F0FDF4", borderRadius: 12, border: "1px solid #BBF7D0", padding: "16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#15803D", marginBottom: 8 }}>✓ Ready to Submit</div>
              <div style={{ fontSize: 12, color: "#16A34A" }}>14 items · 12 HS codes verified · 2 manually confirmed</div>
              <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 4 }}>Exchange rate fetched from BoT API · 35.75 THB/USD</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "11px", cursor: "pointer", fontSize: 13, color: "#64748B" }}>← Back</button>
              <button style={{ flex: 2, background: "linear-gradient(135deg,#0EA5E9,#0284C7)", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Submit to NSW →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NSWTrackingPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>NSW Tracking</h1>
        <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>Real-time submission status — NSW Thailand Integration</p>
      </div>

      {/* NSW connection status */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: "20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>NSW API Connected</span>
        </div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>|</div>
        <div style={{ fontSize: 12, color: "#475569" }}>กรมศุลกากร Portal: <span style={{ color: "#22C55E", fontWeight: 600 }}>Online</span></div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>|</div>
        <div style={{ fontSize: 12, color: "#475569" }}>BoT Exchange Rate: <span style={{ color: "#0EA5E9", fontWeight: 600 }}>35.75 THB/USD</span></div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8" }}>Last sync: 5 min ago</div>
      </div>

      {/* Tracking timeline */}
      {[
        {
          id: "SH-2026-0235", factory: "สยามออโต้ พาร์ท", type: "Export", fob: "USD 87,200",
          timeline: [
            { step: "Shipment Created", status: "done", time: "Mar 19, 09:14", detail: "Job created by factory user" },
            { step: "AI Extraction", status: "done", time: "Mar 19, 09:16", detail: "14 items, Gemini Flash · HS codes verified" },
            { step: "Declaration Generated", status: "done", time: "Mar 19, 09:32", detail: "A008-1 prepared · FOB USD 87,200" },
            { step: "Submitted to NSW", status: "done", time: "Mar 19, 10:05", detail: "NSW ref: NSW-TH-2026-039201" },
            { step: "NSW Processing", status: "active", time: "In progress", detail: "Document verification by NSW system" },
            { step: "Customs Clearance", status: "pending", time: "Pending", detail: "Awaiting กรมศุลกากร review" },
            { step: "Cleared", status: "pending", time: "—", detail: "" },
          ]
        }
      ].map((job, ji) => (
        <div key={ji} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
            <div>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{job.id}</span>
              <span style={{ marginLeft: 12, fontSize: 12, color: "#94A3B8" }}>{job.factory} · {job.fob}</span>
            </div>
            <StatusBadge status="NSW_PROCESSING" />
          </div>
          <div style={{ padding: "24px 28px" }}>
            {job.timeline.map((t, ti) => (
              <div key={ti} style={{ display: "flex", gap: 16, marginBottom: ti < job.timeline.length - 1 ? 8 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: t.status === "done" ? "#22C55E" : t.status === "active" ? "#0EA5E9" : "#E2E8F0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff", fontWeight: 700,
                    border: t.status === "active" ? "2px solid #7DD3FC" : "none"
                  }}>{t.status === "done" ? "✓" : t.status === "active" ? "●" : ""}</div>
                  {ti < job.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 12, background: t.status === "done" ? "#BBF7D0" : "#E2E8F0", margin: "2px 0" }} />}
                </div>
                <div style={{ paddingBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: t.status === "active" ? 700 : 500, color: t.status === "pending" ? "#94A3B8" : "#0F172A" }}>{t.step}</span>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{t.time}</span>
                  </div>
                  {t.detail && <div style={{ fontSize: 11, color: "#94A3B8" }}>{t.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");

  const renderContent = () => {
    switch (screen) {
      case "dashboard": return <DashboardPage />;
      case "shipments": return <ShipmentListPage onNewShipment={() => setScreen("new")} />;
      case "new": return <NewShipmentPage onBack={() => setScreen("shipments")} />;
      case "nsw": return <NSWTrackingPage />;
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", color: "#94A3B8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Coming Soon</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>This module is under development</div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <Sidebar active={screen} onNav={setScreen} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh" }}>
        {renderContent()}
      </main>
    </div>
  );
}
