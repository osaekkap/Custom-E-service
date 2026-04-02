import { useState, useContext } from "react";
import { AuthContext } from "../stores/AuthContext.jsx";
import { usePermissions } from "../hooks/usePermissions.js";
import NotificationBell from "./NotificationBell.jsx";
import { W, BORDER, TEXT, TEXT2, TEXT3, BLUE, MONO, RoleBadge } from "./ui/index.jsx";

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  const auth = useContext(AuthContext);
  const perms = usePermissions();
  const email   = auth?.user?.email || "";
  const company = auth?.user?.customer;
  const role    = auth?.user?.role || "VIEWER";
  const initials = email.charAt(0).toUpperCase();

  const isFactoryUser = perms.isCustomerAdmin || perms.isCustomer;
  const ALL_NAV = [
    ...(perms.canViewSuperAdmin ? [{ id:"superadmin", label:"Administration", icon:"👑" }] : []),
    { id:"dashboard",    label:"Dashboard",                               icon:"▦",  show: true },
    { id:"shipments",    label: isFactoryUser ? "Shipments ของฉัน" : "Shipments", icon:"≡", badge: 3, show: true },
    { id:"new",          label:"New Shipment",                            icon:"+",  show: perms.canCreateShipment },
    { id:"nsw",          label:"NSW Tracking",                            icon:"⊙",  show: true },
    { id:"declarations", label:"Declarations",                            icon:"◫",  show: perms.canViewDeclarations },
    { id:"master",       label:"Master Data",                             icon:"⊞",  show: perms.canViewMasterData },
    { id:"billing",      label: isFactoryUser ? "Billing ของฉัน" : "Billing", icon:"◧", show: perms.canViewBilling },
    { id:"reports",      label:"Reports",                                 icon:"⌗",  show: true },
    { id:"settings",     label:"Settings",                                icon:"⚙",  show: perms.canViewSettings },
  ];

  const NAV = ALL_NAV.filter(item => item.show !== false);

  return (
    <div style={{
      width:256, background:W, minHeight:"100vh",
      borderRight:`1px solid ${BORDER}`,
      boxShadow:"1px 0 0 #E5E7EB",
      display:"flex", flexDirection:"column", flexShrink:0,
      position:"sticky", top:0,
    }}>
      {/* Logo */}
      <div style={{
        height:64, padding:"0 20px",
        borderBottom:`1px solid ${BORDER}`,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:BLUE, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:20, color:"#fff", flexShrink:0,
        }}>⚓</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, letterSpacing:"0.05em", color:BLUE, fontFamily:MONO }}>CUSTOMS-EDOC</div>
          <div style={{ fontSize:13, color:TEXT3 }}>Factory Portal</div>
        </div>
        <NotificationBell />
      </div>

      {/* Company info */}
      {company && (
        <div style={{
          padding:"12px 20px",
          borderBottom:`1px solid ${BORDER}`,
          background:"#F9FAFB",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:BLUE, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:15, fontWeight:700, color:"#fff", flexShrink:0,
            }}>{initials}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {company.companyNameTh || company.companyNameEn || "—"}
              </div>
              <div style={{ fontSize:13, color:TEXT3, fontFamily:MONO }}>{company.code || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
        <p style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:TEXT3, padding:"0 8px", marginBottom:8, marginTop:0 }}>Main Menu</p>
        {NAV.map(item => {
          const isActive = active === item.id || (active === "shipment_detail" && item.id === "shipments");
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center",
              gap:10, padding:"8px 12px",
              marginBottom:2,
              borderRadius:"0 6px 6px 0",
              background: isActive ? "#EFF6FF" : "transparent",
              color: isActive ? BLUE : TEXT2,
              fontWeight: isActive ? 600 : 400,
              fontSize:15,
              cursor:"pointer",
              borderTop:"none",
              borderRight:"none",
              borderBottom:"none",
              borderLeft: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
              textAlign:"left",
              transition:"all 0.15s",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="#F9FAFB"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontSize:17, width:20, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background:"#EF4444", color:"#fff",
                  borderRadius:10, padding:"1px 6px",
                  fontSize:12, fontWeight:700, lineHeight:"14px",
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding:"14px 20px",
        borderTop:`1px solid ${BORDER}`,
        background:"#F9FAFB",
      }}>
        {/* User info row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:BLUE, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, flexShrink:0,
          }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email}</div>
            <div style={{ marginTop:2 }}><RoleBadge role={role}/></div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", flexShrink:0 }}/>
          <span style={{ fontSize:12, color:TEXT3 }}>NSW · Customs · BoT</span>
        </div>
        <button
          onClick={auth?.logout}
          onMouseEnter={e => { e.currentTarget.style.color="#DC2626"; e.currentTarget.style.background="#FEF2F2"; }}
          onMouseLeave={e => { e.currentTarget.style.color=TEXT2; e.currentTarget.style.background="transparent"; }}
          style={{
            width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"7px 10px", borderRadius:6,
            border:"none", background:"transparent",
            color:TEXT2, fontSize:14, fontWeight:600, cursor:"pointer",
            textAlign:"left", transition:"all 0.15s",
          }}>
          ⎋ Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
