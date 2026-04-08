import { useState, useEffect } from "react";
import { C, RESPONSIVE_CSS } from "./super-admin/constants";
import { Sidebar } from "./super-admin/components/Sidebar";
import { OverviewPage } from "./super-admin/pages/OverviewPage";
import { TenantListPage } from "./super-admin/pages/TenantListPage";
import { TenantDetailPage } from "./super-admin/pages/TenantDetailPage";
import { BillingPage } from "./super-admin/pages/BillingPage";
import { AddTenantPage } from "./super-admin/pages/AddTenantPage";
import { SystemPage } from "./super-admin/pages/SystemPage";
import { AllJobsPage } from "./super-admin/pages/AllJobsPage";
import { LandingPageManager } from "./super-admin/pages/LandingPageManager";
import { ThemeEditorPage } from "./super-admin/pages/ThemeEditorPage";

// ─── APP SHELL ────────────────────────────────────────────────────
export default function App({ onExit }) {
  const [screen, setScreen] = useState("overview");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = RESPONSIVE_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleNav = (id) => {
    setSelectedTenant(null);
    setScreen(id);
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setScreen("tenant_detail");
  };

  const renderContent = () => {
    if (screen === "tenant_detail" && selectedTenant) {
      return <TenantDetailPage tenant={selectedTenant} onBack={() => setScreen("tenants")} />;
    }
    if (screen === "new_tenant") {
      return <AddTenantPage onBack={() => setScreen("tenants")} />;
    }
    switch (screen) {
      case "overview": return <OverviewPage onNav={handleNav} />;
      case "tenants":  return <TenantListPage onSelect={handleSelectTenant} onNew={() => setScreen("new_tenant")} />;
      case "billing":  return <BillingPage />;
      case "jobs":     return <AllJobsPage />;
      case "system":   return <SystemPage />;
      case "landing":  return <LandingPageManager />;
      case "theme":    return <ThemeEditorPage />;
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <div style={{ fontSize:32, fontFamily: C.mono, color: C.teal, marginBottom: 12 }}>⊙</div>
            <div style={{ fontSize:16, fontWeight: 600, color: C.text }}>Coming soon</div>
            <div style={{ fontSize:14, color: C.textDim, marginTop: 6 }}>Module under development</div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg1, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar active={screen} onNav={handleNav} onClose={() => setSidebarOpen(false)}
        className={sidebarOpen ? "open" : ""} onExit={onExit} />

      <main className="main-content" style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh", overflowX: "hidden" }}>
        {/* Mobile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)}
            style={{ color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", background: C.bg2 }}>
            ☰
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
