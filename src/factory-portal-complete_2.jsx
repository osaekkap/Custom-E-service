import { useState, useContext } from "react";
import { AuthContext } from "./stores/AuthContext.jsx";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";
import LandingPage from "./LandingPage.jsx";
import SuperAdminConsole from "./super-admin-console.jsx";
import { usePermissions } from "./hooks/usePermissions.js";

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
                                ? <NewShipment onBack={() => setScreen("shipments")} onCreated={() => setScreen("shipments")}/>
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
      <Sidebar active={screen} onNav={handleNav}/>
      <main style={{ flex:1, padding:"24px 32px", overflowY:"auto", minHeight:"100vh" }}>
        {perms.isViewer && <ReadOnlyBanner />}
        {content()}
      </main>
    </div>
  );
}
