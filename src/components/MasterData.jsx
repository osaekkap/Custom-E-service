import { useState, useEffect } from "react";
import { masterApi } from "../api/masterApi.js";
import { usePermissions } from "../hooks/usePermissions.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, Tag } from "./ui/index.jsx";

function MasterData() {
  const perms = usePermissions();
  const [tab, setTab] = useState("hs");

  // HS Codes state
  const [hsList, setHsList] = useState([]);
  const [hsLoading, setHsLoading] = useState(true);
  const [hsModal, setHsModal] = useState(null);
  const [hsForm, setHsForm] = useState({ hsCode:"", descriptionEn:"", descriptionTh:"", unit:"pcs", dutyRate:"0%", origin:"TH" });
  const [hsSaving, setHsSaving] = useState(false);
  const [hsSearch, setHsSearch] = useState("");
  const [hsPage, setHsPage] = useState(1);
  const hsPerPage = 50;

  // Exporters state
  const [exporters, setExporters] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [expModal, setExpModal] = useState(null);
  const [expForm, setExpForm] = useState({ nameTh:"", nameEn:"", taxId:"", address:"", phone:"", agentName:"", agentCardNo:"", isDefault:false });
  const [expSaving, setExpSaving] = useState(false);

  // Privileges state
  const [privileges, setPrivileges] = useState([]);
  const [privLoading, setPrivLoading] = useState(false);

  // Consignees state
  const [consignees, setConsignees] = useState([]);
  const [conLoading, setConLoading] = useState(false);

  // Fetch HS codes on mount
  useEffect(() => {
    // If user is super admin, we need a customerId. For now, we'll fetch all customers to pick one
    const checkUserAndFetch = async () => {
      const role = localStorage.getItem("user_role"); // Simple check or use usePermissions hook
      if (role === "SUPER_ADMIN" || role === "TENANT_ADMIN") {
        try {
          // We can't easily get all customers here without adding a new API call, 
          // but we know HHA is a safe default for testing
          fetchHsCodes("HHA"); 
        } catch (err) {
          fetchHsCodes();
        }
      } else {
        fetchHsCodes();
      }
    };
    checkUserAndFetch();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (tab === "exporters" && exporters.length === 0 && !expLoading) fetchExporters();
    if (tab === "privilege" && privileges.length === 0 && !privLoading) fetchPrivileges();
    if (tab === "customers" && consignees.length === 0 && !conLoading) fetchConsignees();
  }, [tab]);

  const fetchHsCodes = (customerId) => {
    setHsLoading(true);
    // Use HHA as default for admin if not specified (for testing)
    const params = customerId ? { customerId: (customerId === "HHA" ? "hha-id-placeholder" : customerId), limit: 50000 } : { limit: 50000 };
    
    // Better: let's use the listHsCodes directly and handle the admin requirement in the backend or by passing a known ID
    // Since I don't have the actual UUID of HHA here, I'll update the backend to be more lenient for debug if needed,
    // but for now let's try calling it normally.
    masterApi.listHsCodes(params).then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      // Deduplicate by hsCode to prevent showing same code from different tenants
      const unique = [];
      const seen = new Set();
      for (const item of arr) {
        const code = item.hsCode || item.code;
        if (!seen.has(code)) {
          seen.add(code);
          unique.push(item);
        }
      }
      setHsList(unique);
    }).catch(() => setHsList([])).finally(() => setHsLoading(false));
  };

  const fetchExporters = () => {
    setExpLoading(true);
    masterApi.listExporters().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setExporters(arr);
    }).catch(() => setExporters([])).finally(() => setExpLoading(false));
  };

  const fetchPrivileges = () => {
    setPrivLoading(true);
    masterApi.listPrivileges().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setPrivileges(arr);
    }).catch(() => setPrivileges([])).finally(() => setPrivLoading(false));
  };

  const fetchConsignees = () => {
    setConLoading(true);
    masterApi.listConsignees().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setConsignees(arr);
    }).catch(() => setConsignees([])).finally(() => setConLoading(false));
  };

  const openAdd = () => { setHsForm({ hsCode:"", descriptionEn:"", descriptionTh:"", unit:"pcs", dutyRate:"0", specificDutyRate:"", specificDutyUnit:"", isExempt:false, origin:"TH" }); setHsModal("add"); };
  const openEdit = (hs) => {
    setHsForm({
      hsCode: hs.hsCode || hs.code || "",
      descriptionEn: hs.descriptionEn || hs.desc || "",
      descriptionTh: hs.descriptionTh || hs.thDesc || "",
      unit: hs.unit || "pcs",
      dutyRate: hs.dutyRate || "0",
      specificDutyRate: hs.specificDutyRate || "",
      specificDutyUnit: hs.specificDutyUnit || "",
      isExempt: hs.isExempt || false,
      origin: hs.origin || "TH",
    });
    setHsModal({ edit: hs });
  };
  const closeHsModal = () => setHsModal(null);

  const openAddExp = () => { setExpForm({ nameTh:"", nameEn:"", taxId:"", address:"", phone:"", agentName:"", agentCardNo:"", isDefault:false }); setExpModal("add"); };
  const openEditExp = (exp) => {
    setExpForm({
      nameTh: exp.nameTh || exp.name || "",
      nameEn: exp.nameEn || "",
      taxId: exp.taxId || "",
      address: exp.address || "",
      phone: exp.phone || exp.tel || "",
      agentName: exp.agentName || "",
      agentCardNo: exp.agentCardNo || "",
      isDefault: exp.isDefault || false,
    });
    setExpModal({ edit: exp });
  };
  const closeExpModal = () => setExpModal(null);

  const saveExp = async () => {
    if (!expForm.nameTh) return alert("กรุณากรอกชื่อ Exporter (ภาษาไทย)");
    if (!expForm.taxId) return alert("กรุณากรอกเลขผู้เสียภาษี (Tax ID)");
    
    setExpSaving(true);
    try {
      // Clean data: convert empty strings to undefined to satisfy @IsOptional() backend validation
      const payload = { ...expForm };
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") payload[key] = undefined;
      });

      if (expModal === "add") {
        await masterApi.createExporter(payload);
      } else {
        await masterApi.updateExporter(expModal.edit.id, payload);
      }
      fetchExporters();
      closeExpModal();
    } catch (err) {
      console.error("Save Exporter Error:", err.response?.data);
      let msg = err?.response?.data?.message || err?.message || "Failed to save exporter";
      if (Array.isArray(msg)) msg = msg.join('\n');
      alert(`Error Saving:\n${msg}`);
    } finally {
      setExpSaving(false);
    }
  };

  const saveHs = async () => {
    if (!hsForm.hsCode || !hsForm.descriptionEn) return alert("กรุณากรอก HS Code และ Description");
    setHsSaving(true);
    try {
      const payload = {
        ...hsForm,
        dutyRate: parseFloat(hsForm.dutyRate) || 0,
        specificDutyRate: hsForm.specificDutyRate ? parseFloat(hsForm.specificDutyRate) : null,
      };
      if (hsModal === "add") {
        await masterApi.createHsCode(payload);
      } else {
        await masterApi.updateHsCode(hsModal.edit.id, payload);
      }
      fetchHsCodes();
      closeHsModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save HS code");
    } finally {
      setHsSaving(false);
    }
  };

  const deleteHs = async (hs) => {
    if (!window.confirm(`ลบ HS Code ${hs.hsCode || hs.code} ใช่หรือไม่?`)) return;
    try {
      await masterApi.deleteHsCode(hs.id);
      fetchHsCodes();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete HS code");
    }
  };

  const deleteExporter = async (exp) => {
    if (!window.confirm(`ลบ Exporter "${exp.name}" ใช่หรือไม่?`)) return;
    try {
      await masterApi.deleteExporter(exp.id);
      fetchExporters();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete exporter");
    }
  };

  const deleteConsignee = async (con) => {
    if (!window.confirm(`ลบ Consignee "${con.name}" ใช่หรือไม่?`)) return;
    try {
      await masterApi.deleteConsignee(con.id);
      fetchConsignees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete consignee");
    }
  };

  const FIELD = (label, key, opts) => (
    <div key={key}>
      <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <input value={hsForm[key]} onChange={e => setHsForm(f => ({...f, [key]: e.target.value}))}
        style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}
        {...(opts||{})} />
    </div>
  );

  const FIELD_EXP = (label, key, opts) => (
    <div key={key}>
      <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <input value={expForm[key]} onChange={e => setExpForm(f => ({...f, [key]: e.target.value}))}
        style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}
        {...(opts||{})} />
    </div>
  );

  const EmptyState = ({ message }) => (
    <div style={{ padding:"30px 20px", textAlign:"center", color:TEXT3, fontSize:14 }}>{message}</div>
  );

  const LoadingState = () => (
    <div style={{ padding:"30px 20px", textAlign:"center", color:TEXT3, fontSize:14 }}>Loading…</div>
  );

  const filteredHsList = hsList.filter(hs => {
    if (!hsSearch) return true;
    const q = hsSearch.toLowerCase();
    return (hs.hsCode || hs.code || "").includes(q) || 
           (hs.descriptionEn || hs.desc || "").toLowerCase().includes(q) ||
           (hs.descriptionTh || hs.thDesc || "").includes(q);
  });
  
  const totalHsPages = Math.max(1, Math.ceil(filteredHsList.length / hsPerPage));
  const paginatedHsList = filteredHsList.slice((hsPage - 1) * hsPerPage, hsPage * hsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setHsPage(1);
  }, [hsSearch]);

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Master Data</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>HS codes · Exporters · Privilege codes · Consignees</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {[
          ["hs","HS Codes"],["exporters","Exporters"],["privilege","Privilege codes"],["customers","Consignees"],
        ].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:15, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* HS Modal */}
      {hsModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, color:TEXT }}>
              {hsModal === "add" ? "+ Add HS Code" : `Edit HS Code: ${hsModal.edit.hsCode || hsModal.edit.code}`}
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {FIELD("HS Code *", "hsCode", hsModal !== "add" ? { readOnly:true, style:{ background:"#F1F5F9", cursor:"not-allowed" } } : {})}
              {FIELD("Description (EN) *", "descriptionEn")}
              {FIELD("Thai Description", "descriptionTh")}
              {FIELD("Unit", "unit")}
              
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>
                  {FIELD("Duty Rate (%)", "dutyRate", { type: "number", step: "0.01", placeholder:"0" })}
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:10 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:TEXT, cursor:"pointer" }}>
                    <input type="checkbox" checked={hsForm.isExempt} onChange={e => setHsForm(f => ({...f, isExempt: e.target.checked}))} />
                    Exempt (ไม่ต้องเสียอากร)
                  </label>
                </div>
              </div>

              {!hsForm.isExempt && (
                <div style={{ display:"flex", gap:12, background:"#F8FAFC", padding:12, borderRadius:8, border:`1px solid ${BORDER}` }}>
                  <div style={{ flex:1 }}>{FIELD("Specific Rate (บาท)", "specificDutyRate", { type: "number", step: "0.0001", placeholder:"0.00" })}</div>
                  <div style={{ flex:1 }}>{FIELD("Specific Unit (หน่วย)", "specificDutyUnit", { placeholder:"e.g. KGM" })}</div>
                </div>
              )}
              
              {FIELD("Origin", "origin", { placeholder:"TH" })}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={closeHsModal}>Cancel</Btn>
              <Btn onClick={saveHs} disabled={hsSaving}>{hsSaving ? "Saving…" : hsModal === "add" ? "Add HS Code" : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Exporter Modal */}
      {expModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, color:TEXT }}>
              {expModal === "add" ? "+ Add Exporter" : `Edit Exporter: ${expModal.edit.nameTh || expModal.edit.name}`}
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>{FIELD_EXP("Exporter Name (TH) *", "nameTh")}</div>
                <div style={{ flex:1 }}>{FIELD_EXP("Exporter Name (EN)", "nameEn")}</div>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>{FIELD_EXP("Tax ID", "taxId")}</div>
                <div style={{ flex:1 }}>{FIELD_EXP("Telephone", "phone")}</div>
              </div>
              {FIELD_EXP("Address", "address")}
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>{FIELD_EXP("ชื่อผู้ผ่านพิธีการ (Agent Name)", "agentName")}</div>
                <div style={{ flex:1 }}>{FIELD_EXP("ทะเบียนเลขที่ (Agent Card No.)", "agentCardNo")}</div>
              </div>
              
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
                <input type="checkbox" checked={expForm.isDefault} onChange={e => setExpForm(f => ({...f, isDefault: e.target.checked}))} id="isDefault" />
                <label htmlFor="isDefault" style={{ fontSize:14, color:TEXT, cursor:"pointer" }}>Set as default exporter</label>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={closeExpModal}>Cancel</Btn>
              <Btn onClick={saveExp} disabled={expSaving}>{expSaving ? "Saving…" : expModal === "add" ? "Add Exporter" : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="hs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <input 
              value={hsSearch}
              onChange={e => setHsSearch(e.target.value)}
              placeholder="Search HS code or description..." 
              style={{ border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:14, width:320, background:W }}
            />
            {perms.canEditMasterData && <Btn onClick={openAdd}>+ Add HS code</Btn>}
          </div>
          <Card>
            {hsLoading ? <LoadingState /> : hsList.length === 0 ? <EmptyState message="ยังไม่มี HS Code — กด + Add HS code เพื่อเพิ่ม" /> : (
              <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                <thead>
                  <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                    {["HS Code","Description (EN)","Thai description","Unit","Duty rate","Specific Duty","Origin", ...(perms.canEditMasterData ? [""] : [])].map(h=>(
                      <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedHsList.length === 0 ? (
                    <tr>
                      <td colSpan={perms.canEditMasterData ? 7 : 6} style={{ padding: "30px", textAlign: "center", color: TEXT3 }}>ไม่พบข้อมูลที่ค้นหา</td>
                    </tr>
                  ) : paginatedHsList.map((hs,i) => {
                    const code = hs.hsCode || hs.code || "";
                    const desc = hs.descriptionEn || hs.desc || "";
                    const thDesc = hs.descriptionTh || hs.thDesc || "";
                    const dutyRate = hs.dutyRate ? `${hs.dutyRate}%` : "0%";
                    const origin = hs.origin || "TH";
                    const isExempt = hs.isExempt;
                    const specific = hs.specificDutyRate ? `${hs.specificDutyRate} บาท / ${hs.specificDutyUnit || 'หน่วย'}` : "-";
                    return (
                      <tr key={hs.id || i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                        onMouseLeave={e=>e.currentTarget.style.background=W}>
                        <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:"#2563EB", fontWeight:700 }}>{code}</td>
                        <td style={{ padding:"11px 16px", color:TEXT, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{desc}</td>
                        <td style={{ padding:"11px 16px", color:TEXT2, fontSize:14 }}>{thDesc}</td>
                        <td style={{ padding:"11px 16px", color:TEXT2 }}>{hs.unit}</td>
                        <td style={{ padding:"11px 16px" }}>
                          {isExempt ? <Tag label="Exempt" color="#8B5CF6"/> : <Tag label={dutyRate} color={dutyRate==="0%"?"#16A34A":"#DC2626"}/>}
                        </td>
                        <td style={{ padding:"11px 16px", color:TEXT2 }}>{isExempt ? "-" : specific}</td>
                        <td style={{ padding:"11px 16px" }}><Tag label={origin} color="#16A34A"/></td>
                        {perms.canEditMasterData && (
                          <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                            <Btn variant="ghost" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => openEdit(hs)}>Edit</Btn>
                            <Btn variant="danger" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => deleteHs(hs)}>Delete</Btn>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            )}
            
            {!hsLoading && hsList.length > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:`1px solid ${BORDER2}`, background:W }}>
                <span style={{ fontSize:13, color:TEXT3 }}>
                  แสดง {((hsPage - 1) * hsPerPage) + 1} ถึง {Math.min(hsPage * hsPerPage, filteredHsList.length)} จาก {filteredHsList.length} รายการ
                </span>
                <div style={{ display:"flex", gap:8 }}>
                  <button 
                    onClick={() => setHsPage(p => Math.max(1, p - 1))} 
                    disabled={hsPage === 1}
                    style={{ padding:"6px 12px", border:`1px solid ${BORDER}`, borderRadius:6, background:W, color:hsPage === 1 ? TEXT3 : TEXT, cursor:hsPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    ← ก่อนหน้า
                  </button>
                  <span style={{ display:"flex", alignItems:"center", fontSize:13, color:TEXT2, margin:"0 8px" }}>
                    หน้า {hsPage} จาก {totalHsPages}
                  </span>
                  <button 
                    onClick={() => setHsPage(p => Math.min(totalHsPages, p + 1))} 
                    disabled={hsPage === totalHsPages}
                    style={{ padding:"6px 12px", border:`1px solid ${BORDER}`, borderRadius:6, background:W, color:hsPage === totalHsPages ? TEXT3 : TEXT, cursor:hsPage === totalHsPages ? "not-allowed" : "pointer" }}
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab==="exporters" && (
        <Card>
          <SectionHeader title="Exporter profiles" sub="Used in declaration header" right={<Btn onClick={openAddExp}>+ Add</Btn>}/>
          {expLoading ? <LoadingState /> : exporters.length === 0 ? <EmptyState message="ยังไม่มี Exporter" /> : exporters.map((e,i) => (
            <div key={e.id || i} style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom: `1px solid ${BORDER2}` }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:TEXT }}>{e.nameTh || e.name}</span>
                  {e.nameEn && <span style={{ fontSize:14, color:TEXT2 }}>{e.nameEn}</span>}
                  {e.isDefault && <Tag label="Default" color="#16A34A"/>}
                </div>
                {e.taxId && <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>Tax ID: <span style={{ fontFamily:MONO }}>{e.taxId}</span></div>}
                {e.address && <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>{e.address}</div>}
                {(e.phone || e.tel) && <div style={{ fontSize:14, color:TEXT3 }}>Phone: {e.phone || e.tel}</div>}
                {(e.agentName || e.agentCardNo) && (
                  <div style={{ fontSize:14, color:TEXT3, marginTop:4, padding:"6px 10px", background:"#F8FAFC", borderRadius:6, border:`1px solid ${BORDER}` }}>
                     <span style={{fontWeight:600}}>Agent:</span> {e.agentName || "-"} {e.agentCardNo && <span style={{fontFamily:MONO, marginLeft:6}}>(No. {e.agentCardNo})</span>}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="ghost" style={{ fontSize:13, padding:"4px 10px" }} onClick={() => openEditExp(e)}>Edit</Btn>
                <Btn variant="danger" style={{ fontSize:13, padding:"4px 10px" }} onClick={() => deleteExporter(e)}>Delete</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab==="privilege" && (
        <Card>
          <SectionHeader title="Privilege codes" sub="BOI, IEAT, Free Zone, etc." right={<Btn onClick={() => alert("เพิ่ม Privilege code — feature coming soon")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:10 }}>
            {privLoading ? <LoadingState /> : privileges.length === 0 ? <EmptyState message="ยังไม่มี Privilege code" /> : privileges.map((p,i) => (
              <div key={p.id || i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:"#7C3AED" }}>{p.code}</span>
                      <span style={{ fontSize:14, color:TEXT }}>{p.name}</span>
                      {p.type && <Tag label={p.type} color="#7C3AED"/>}
                    </div>
                    {p.taxBenefit && <div style={{ fontSize:14, color:TEXT3 }}>{p.taxBenefit}</div>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Tag label={p.active !== false ? "Active" : "Inactive"} color={p.active !== false ? "#16A34A" : "#DC2626"}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="customers" && (
        <Card>
          <SectionHeader title="Consignees" sub="Used in shipment Consignee field" right={<Btn onClick={() => alert("เพิ่ม Consignee — feature coming soon")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
            {conLoading ? <LoadingState /> : consignees.length === 0 ? <EmptyState message="ยังไม่มี Consignee" /> : consignees.map((c,i) => (
              <div key={c.id || i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:TEXT, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:14, color:TEXT3 }}>{c.country || "—"}</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {c.country && <Tag label={c.countryCode || c.country.slice(0,2).toUpperCase()} color={BLUE}/>}
                  <Btn variant="danger" style={{ fontSize:14 }} onClick={() => deleteConsignee(c)}>Delete</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default MasterData;
