import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./stores/AuthContext.jsx";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";
import LandingPage from "./LandingPage.jsx";
import SuperAdminConsole from "./super-admin-console.jsx";
import { usePermissions } from "./hooks/usePermissions.js";
import { masterApi } from "./api/masterApi.js";

// Decomposed components
import { BG, TEXT, TEXT2, BLUE, RoleBadge, ReadOnlyBanner } from "./components/ui/index.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ShipmentList from "./components/shipments/ShipmentList.jsx";
import ShipmentDetail from "./components/shipments/ShipmentDetail.jsx";
import NewShipment from "./components/NewShipment.jsx";
import NSWTracking from "./components/NSWTracking.jsx";
import Declarations from "./components/Declarations.jsx";
import MasterData from "./components/MasterData.jsx";
import Billing from "./components/Billing.jsx";
import Reports from "./components/Reports.jsx";
import Settings from "./components/settings/Settings.jsx";

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const auth = useContext(AuthContext);
  const perms = usePermissions();
  const [screen, setScreen] = useState("dashboard");
  const [detailJob, setDetailJob] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // HS Master cache
  const [hsMaster, setHsMaster] = useState([]);

  useEffect(() => {
    if (auth?.token && perms.canViewMasterData) {
      masterApi.listHsCodes({ limit: 20000 }).then(data => {
        const arr = data?.data ?? (Array.isArray(data) ? data : []);
        const unique = [];
        const seen = new Set();
        for (const h of arr) {
          if (!seen.has(h.hsCode)) {
            seen.add(h.hsCode);
            unique.push({
              code: h.hsCode,
              desc: h.descriptionEn,
              thDesc: h.descriptionTh,
              unit: h.statisticsUnit || "C62",
              dutyRate: h.dutyRate || 0,
              statsCode: h.statisticsCode
            });
          }
        }
        setHsMaster(unique);
      }).catch(err => console.error("Failed to load HS Master:", err));
    }
  }, [auth?.token, perms.canViewMasterData]);

  // Show register / landing page if not authenticated
  if (!auth?.token) {
    if (showRegister) return <RegisterScreen onBack={() => setShowRegister(false)} />;
    return <LandingPage onRegister={() => setShowRegister(true)} />;
  }

  if (screen === "superadmin" && perms.canViewSuperAdmin) {
    return <SuperAdminConsole onExit={() => setScreen("dashboard")} />;
  }

  const handleNav = (id, data) => {
    if (id === "shipment_detail" && data) {
      setDetailJob(data);
      setScreen("shipment_detail");
    } else {
      setDetailJob(null);
      setScreen(id);
    }
  };

  // ─── Screen access guard ──────────────────────────────────────────
  const AccessDenied = () => (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16 }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <div style={{ fontSize:20, fontWeight:700, color:TEXT }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      <div style={{ fontSize:14, color:TEXT2 }}>บัญชีของคุณ (<RoleBadge role={auth?.user?.role}/>) ไม่มีสิทธิ์ดูส่วนนี้</div>
      <button onClick={() => setScreen("dashboard")} style={{
        marginTop:8, padding:"8px 20px", background:BLUE, color:"#fff",
        border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer",
      }}>← กลับ Dashboard</button>
    </div>
  );

  const content = () => {
    switch(screen) {
      case "dashboard":       return <Dashboard onNav={handleNav}/>;
      case "shipments":       return <ShipmentList onNew={() => handleNav("new")} onDetail={job => handleNav("shipment_detail",job)}/>;
      case "shipment_detail": return <ShipmentDetail job={detailJob} onBack={() => setScreen("shipments")}/>;
      case "new":             return perms.canCreateShipment
                                ? <NewShipment onBack={() => setScreen("shipments")} onCreated={() => setScreen("shipments")} hsMaster={hsMaster}/>
                                : <AccessDenied/>;
      case "nsw":             return <NSWTracking/>;
      case "declarations":    return perms.canViewDeclarations ? <Declarations readOnly={perms.isReadOnly("declarations")}/> : <AccessDenied/>;
      case "master":          return perms.canViewMasterData   ? <MasterData   readOnly={perms.isReadOnly("master")}/>       : <AccessDenied/>;
      case "billing":         return perms.canViewBilling      ? <Billing/>                                                  : <AccessDenied/>;
      case "reports":         return <Reports/>;
      case "settings":        return perms.canViewSettings     ? <Settings canManageUsers={perms.canManageUsers} canEditCompany={perms.canEditCompanySettings} canViewSecurity={perms.canViewSecurity} readOnly={perms.isReadOnly("settings")}/> : <AccessDenied/>;
      default: return null;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:BG }}>
      {/* Dark overlay — closes sidebar when tapped on mobile */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        active={screen}
        onNav={id => { handleNav(id); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="portal-main" style={{ flex:1, padding:"24px 32px", overflowY:"auto", minHeight:"100vh" }}>
        {/* Hamburger — visible only on tablet/mobile via CSS */}
        <button
          className="hamburger-btn"
          style={{ marginBottom:12 }}
          onClick={() => setSidebarOpen(true)}
          title="Open menu"
        >☰</button>

        {perms.isViewer && <ReadOnlyBanner />}
        {content()}
      </main>
    </div>
  );
}
