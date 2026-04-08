import { C, NAV } from "../constants";

export function Sidebar({ active, onNav, onClose, onExit }) {
  return (
    <div className="main-sidebar" style={{
      width: 230, background: C.bg0, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 22px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`,
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize:20, color: C.bg0,
            boxShadow: `0 0 16px ${C.teal}44`,
          }}>⚓</div>
          <div>
            <div style={{ fontFamily: C.mono, fontSize:14, fontWeight: 700, color: C.teal, letterSpacing: "1px" }}>CUSTOMS-EDOC</div>
            <div style={{ fontSize:14, color: C.textDim, marginTop: 2 }}>Super Admin Console</div>
          </div>
        </div>
      </div>

      {/* Operator badge */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ background: C.bg3, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.borderHi}` }}>
          <div style={{ fontSize:12, color: C.teal, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Operator</div>
          <div style={{ fontSize:15, color: C.text, fontWeight: 600 }}>LogiConnect Co., Ltd.</div>
          <div style={{ fontSize:14, color: C.textDim, marginTop: 3 }}>admin@logiconnect.co.th</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 12px" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} className="nav-btn" onClick={() => { onNav(item.id); onClose && onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 14px", borderRadius: 10, marginBottom: 3,
              background: isActive ? C.tealBg : "transparent",
              border: `1px solid ${isActive ? C.teal + "55" : "transparent"}`,
              color: isActive ? C.teal : C.textMid,
              cursor: "pointer", textAlign: "left",
              fontSize:16, fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize:17, width: 20, textAlign: "center", fontFamily: C.mono }}>{item.icon}</span>
              {item.label}
              {item.id === "billing" && (
                <span style={{
                  marginLeft: "auto", background: C.red, color: "#fff",
                  borderRadius: 10, padding: "2px 7px", fontSize:13, fontWeight: 700,
                }}>2</span>
              )}
            </button>
          );
        })}
      </nav>

      {onExit && (
        <div style={{ padding: "12px 16px" }}>
          <button onClick={onExit} onMouseEnter={e => { e.currentTarget.style.background = C.bg3; e.currentTarget.style.color = C.text; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }} style={{
            width: "100%", padding: "10px", borderRadius: 8,
            background: "transparent", border: `1px solid ${C.borderHi}`,
            color: C.textMid, cursor: "pointer", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            transition: "all 0.15s"
          }}>
            ⎋ Exit to Portal
          </button>
        </div>
      )}

      {/* System status */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
        {[
          { label: "NSW API", ok: true },
          { label: "Customs Portal", ok: true },
          { label: "BoT Rate API", ok: true },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? C.green : C.red, flexShrink: 0 }} />
            <span style={{ fontSize:14, color: C.textDim }}>{s.label}</span>
          </div>
        ))}
        <div style={{ fontSize:12, color: C.textDim, marginTop: 6, fontFamily: C.mono }}>v2.0.0 · ISO 27001</div>
      </div>
    </div>
  );
}
