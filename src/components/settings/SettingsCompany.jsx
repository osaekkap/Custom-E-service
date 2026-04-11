import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../stores/AuthContext.jsx";
import { customerApi } from "../../api/customerApi.js";
import { masterApi } from "../../api/masterApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn } from "../ui/index.jsx";

export default function SettingsCompany() {
  const auth = useContext(AuthContext);
  const cust = auth?.user?.customer;
  const userRole = auth?.user?.role || localStorage.getItem("user_role") || "";
  const canEdit = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(userRole);

  const [form, setForm] = useState({
    companyNameTh: cust?.companyNameTh || "",
    companyNameEn: cust?.companyNameEn || "",
    taxId:         cust?.taxId || "",
    address:       cust?.address || "",
    phone:         cust?.phone || "",
    email:         auth?.user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Load company profile + fallback to default Exporter if fields are empty
  useEffect(() => {
    customerApi.getMy().then(async (data) => {
      let merged = {
        companyNameTh: data.companyNameTh || "",
        companyNameEn: data.companyNameEn || "",
        taxId:         data.taxId || "",
        address:       data.address || "",
        phone:         data.phone || "",
        email:         data.email || auth?.user?.email || "",
      };

      // If key fields are still empty, pull from default Exporter
      if (!merged.companyNameEn || !merged.taxId || !merged.address) {
        try {
          const exporters = await masterApi.listExporters();
          const arr = Array.isArray(exporters) ? exporters : (exporters?.data ?? []);
          const defaultExp = arr.find(e => e.isDefault) || arr[0];
          if (defaultExp) {
            if (!merged.companyNameTh) merged.companyNameTh = defaultExp.nameTh || "";
            if (!merged.companyNameEn) merged.companyNameEn = defaultExp.nameEn || "";
            if (!merged.taxId)         merged.taxId         = defaultExp.taxId || "";
            if (!merged.address)       merged.address       = defaultExp.address || "";
            if (!merged.phone)         merged.phone         = defaultExp.phone || "";
          }
        } catch (_) {}
      }

      setForm(f => ({ ...f, ...merged }));
    }).catch(() => {
      // If GET /customers/my fails, try to load from Exporter only
      masterApi.listExporters().then(exporters => {
        const arr = Array.isArray(exporters) ? exporters : (exporters?.data ?? []);
        const defaultExp = arr.find(e => e.isDefault) || arr[0];
        if (defaultExp) {
          setForm(f => ({
            ...f,
            companyNameTh: f.companyNameTh || defaultExp.nameTh || "",
            companyNameEn: f.companyNameEn || defaultExp.nameEn || "",
            taxId:         f.taxId         || defaultExp.taxId || "",
            address:       f.address       || defaultExp.address || "",
            phone:         f.phone         || defaultExp.phone || "",
          }));
        }
      }).catch(() => {});
    });
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setErrMsg("");
    try {
      await customerApi.updateMy({
        companyNameTh: form.companyNameTh || undefined,
        companyNameEn: form.companyNameEn || undefined,
        address:       form.address || undefined,
        phone:         form.phone || undefined,
        email:         form.email || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      const m = e?.response?.data?.message;
      setErrMsg(Array.isArray(m) ? m.join(", ") : (m || "Save failed"));
    } finally { setSaving(false); }
  };

  return (
    <div className="dashboard-split">
      <Card>
        <SectionHeader title="Company profile" />
        <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
          {!canEdit && (
            <div style={{ padding:"10px 14px", background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:8, fontSize:14, color:"#C2410C" }}>
              ℹ️ ข้อมูลบริษัทถูกจัดการโดยผู้ดูแลระบบ — ติดต่อ Admin เพื่อแก้ไข
            </div>
          )}
          {[
            ["ชื่อบริษัท (ภาษาไทย)", "companyNameTh"],
            ["Company Name (English)", "companyNameEn"],
            ["เลขประจำตัวผู้เสียภาษี (Tax ID)", "taxId", true],
            ["ที่อยู่", "address"],
            ["เบอร์โทร", "phone"],
            ["อีเมลบริษัท", "email"],
          ].map(([l, k, alwaysReadonly]) => {
            const isReadonly = alwaysReadonly || !canEdit;
            return (
              <div key={k}>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                <input
                  value={form[k]}
                  readOnly={isReadonly}
                  onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width:"100%", background: isReadonly?"#F3F4F6":"#FFFFFF", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, color: isReadonly?TEXT3:TEXT, boxSizing:"border-box", cursor: isReadonly?"not-allowed":"text" }}
                />
              </div>
            );
          })}
          {errMsg && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{errMsg}</div>}
          {saved  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:14, color:"#16A34A" }}>✓ บันทึกสำเร็จ</div>}
          {canEdit && (
            <Btn onClick={handleSave} style={{ alignSelf:"flex-start" }}>{saving ? "Saving…" : "Save changes"}</Btn>
          )}
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <SectionHeader title="Service plan" />
          <div style={{ padding:"16px 20px" }}>
            <div style={{ background:BG, borderRadius:8, padding:"14px", border:`1px solid ${BORDER}`, marginBottom:12 }}>
              <div style={{ fontSize:13, color:TEXT3, marginBottom:4, textTransform:"uppercase", fontWeight:600 }}>Current plan</div>
              <div style={{ fontSize:18, fontWeight:800, color:TEXT }}>Standard</div>
              <div style={{ fontSize:14, color:TEXT3, marginTop:4 }}>฿450 per job · Per-job billing</div>
            </div>
            {[
              ["Status", cust?.status || "ACTIVE"],
              ["Customer code", cust?.code || "—"],
              ["Tax ID", form.taxId || "—"],
              ["T&C version", cust?.tcVersion || "—"],
            ].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:14, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:600, color: l==="Status"&&v==="TRIAL"?"#D97706":TEXT }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
