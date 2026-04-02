import { useState } from "react";
import { usePermissions } from "../../hooks/usePermissions.js";
import CustomerDashboard from "../../CustomerDashboard.jsx";
import FinanceDashboard from "../../FinanceDashboard.jsx";
import DefaultDashboard from "./DefaultDashboard.jsx";
import { W, BORDER, TEXT2, BLUE } from "../ui/index.jsx";

function Dashboard({ onNav }) {
  const perms = usePermissions();

  // Route to the right dashboard view based on real role
  if (perms.isCustomer || perms.isCustomerAdmin) return <CustomerDashboard />;
  if (perms.isManager) return <FinanceDashboard />;
  if (perms.isSuperAdmin || perms.isAdmin) {
    // Admin/SuperAdmin can switch between views for demo purposes
    const [view, setView] = useState("default");
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display:"flex", gap:8, marginBottom:24, padding:"12px 16px", background:W, borderRadius:10, border:`1px solid ${BORDER}` }}>
          <span style={{ fontSize:13, color:TEXT2, alignSelf:"center", marginRight:4 }}>Dashboard view:</span>
          {[
            { id:"default",  label:"\ud83c\udfdb\ufe0f Operations" },
            { id:"customer", label:"\ud83d\udc68\u200d\ud83d\udcbc Customer" },
            { id:"finance",  label:"\ud83d\udcca Finance" },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding:"6px 14px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer",
              background: view===v.id ? BLUE : "transparent",
              color: view===v.id ? "#fff" : TEXT2,
              border: `1px solid ${view===v.id ? BLUE : BORDER}`,
              transition:"all 0.15s",
            }}>{v.label}</button>
          ))}
        </div>
        {view === "customer" && <CustomerDashboard />}
        {view === "finance"  && <FinanceDashboard />}
        {view === "default"  && <DefaultDashboard onNav={onNav} />}
      </div>
    );
  }
  // STAFF → full operations dashboard
  return <DefaultDashboard onNav={onNav} />;
}

export default Dashboard;
