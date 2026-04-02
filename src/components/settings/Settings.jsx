import { useState } from "react";
import { W, BORDER, TEXT, TEXT2, TEXT3, BLUE } from "../ui/index.jsx";
import SettingsCompany from "./SettingsCompany.jsx";
import SettingsUsers from "./SettingsUsers.jsx";
import SettingsNotifications from "./SettingsNotifications.jsx";
import SettingsSecurity from "./SettingsSecurity.jsx";

export default function Settings({ canManageUsers = true, canEditCompany = true, canViewSecurity = false, readOnly = false }) {
  const [tab, setTab] = useState("company");

  // Build visible tabs based on permissions
  const allTabs = [
    { id:"company",       label:"Company",       show: true },
    { id:"users",         label:"Users",         show: canManageUsers },
    { id:"notifications", label:"Notifications", show: true },
    { id:"security",      label:"Security",      show: canViewSecurity },
  ].filter(t => t.show);

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Settings</h1>
          {readOnly && (
            <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:4,
              background:"#FFF7ED", color:"#D97706", border:"1px solid #FDE68A" }}>
              👁 View Only
            </span>
          )}
        </div>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Account · notifications · users · security</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {allTabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:15, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {tab==="company"       && <SettingsCompany readOnly={readOnly || !canEditCompany} />}
      {tab==="users"         && canManageUsers && <SettingsUsers />}
      {tab==="notifications" && <SettingsNotifications />}
      {tab==="security"      && canViewSecurity && <SettingsSecurity />}
    </div>
  );
}
