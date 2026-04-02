import { useState } from "react";
import { W, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn } from "./ui/index.jsx";
import { HS_MASTER } from "../lib/mockData.js";

function MasterData() {
  const [tab, setTab] = useState("hs");
  const [hsList, setHsList] = useState(HS_MASTER);
  const [hsModal, setHsModal] = useState(null); // null | "add" | { edit: hs }
  const [hsForm, setHsForm] = useState({ code:"", desc:"", thDesc:"", unit:"pcs", dutyRate:"0%", origin:"TH" });

  const openAdd = () => { setHsForm({ code:"", desc:"", thDesc:"", unit:"pcs", dutyRate:"0%", origin:"TH" }); setHsModal("add"); };
  const openEdit = (hs) => { setHsForm({ ...hs }); setHsModal({ edit: hs }); };
  const closeHsModal = () => setHsModal(null);

  const saveHs = () => {
    if (!hsForm.code || !hsForm.desc) return alert("กรุณากรอก HS Code และ Description");
    if (hsModal === "add") {
      setHsList(prev => [...prev, { ...hsForm }]);
    } else {
      setHsList(prev => prev.map(h => h.code === hsModal.edit.code ? { ...hsForm } : h));
    }
    closeHsModal();
  };

  const deleteHs = (code) => {
    if (!window.confirm(`ลบ HS Code ${code} ใช่หรือไม่?`)) return;
    setHsList(prev => prev.filter(h => h.code !== code));
  };

  const FIELD = (label, key, opts) => (
    <div key={key}>
      <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <input value={hsForm[key]} onChange={e => setHsForm(f => ({...f, [key]: e.target.value}))}
        style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}
        {...(opts||{})} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Master Data</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>HS codes · Exporters · Privilege codes · Customers</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {[
          ["hs","HS Codes"],["exporters","Exporters"],["privilege","Privilege codes"],["customers","Customers"],
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
              {hsModal === "add" ? "+ Add HS Code" : `Edit HS Code: ${hsModal.edit.code}`}
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {FIELD("HS Code *", "code", hsModal !== "add" ? { readOnly:true, style:{ background:"#F1F5F9", cursor:"not-allowed" } } : {})}
              {FIELD("Description (EN) *", "desc")}
              {FIELD("Thai Description", "thDesc")}
              {FIELD("Unit", "unit")}
              {FIELD("Duty Rate", "dutyRate", { placeholder:"0%" })}
              {FIELD("Origin", "origin", { placeholder:"TH" })}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={closeHsModal}>Cancel</Btn>
              <Btn onClick={saveHs}>{hsModal === "add" ? "Add HS Code" : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="hs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <input placeholder="Search HS code or description..." style={{ border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:14, width:320, background:W }}/>
            <Btn onClick={openAdd}>+ Add HS code</Btn>
          </div>
          <Card>
            <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["HS Code","Description (EN)","Thai description","Unit","Duty rate","Origin",""].map(h=>(
                    <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hsList.map((hs,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                    onMouseLeave={e=>e.currentTarget.style.background=W}>
                    <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:"#2563EB", fontWeight:700 }}>{hs.code}</td>
                    <td style={{ padding:"11px 16px", color:TEXT, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{hs.desc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2, fontSize:14 }}>{hs.thDesc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2 }}>{hs.unit}</td>
                    <td style={{ padding:"11px 16px" }}>
                      <Tag label={hs.dutyRate} color={hs.dutyRate==="0%"?"#16A34A":"#DC2626"}/>
                    </td>
                    <td style={{ padding:"11px 16px" }}><Tag label={hs.origin} color="#16A34A"/></td>
                    <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => openEdit(hs)}>Edit</Btn>
                      <Btn variant="danger" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => deleteHs(hs.code)}>Delete</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </Card>
        </div>
      )}

      {tab==="exporters" && (
        <Card>
          <SectionHeader title="Exporter profiles" sub="Used in declaration header" right={<Btn onClick={() => alert("เพิ่ม Exporter — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          {[
            { name:"บริษัท ไทยอิเล็กทรอนิกส์ จำกัด", taxId:"0105561000123", address:"123 ถ.พระราม 2 บางมด จอมทอง กรุงเทพฯ", tel:"02-123-4567", default:true },
          ].map((e,i) => (
            <div key={i} style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:TEXT }}>{e.name}</span>
                  {e.default && <Tag label="Default" color="#16A34A"/>}
                </div>
                <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>Tax ID: <span style={{ fontFamily:MONO }}>{e.taxId}</span></div>
                <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>{e.address}</div>
                <div style={{ fontSize:14, color:TEXT3 }}>{e.tel}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${e.name}`)}>Edit</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab==="privilege" && (
        <Card>
          <SectionHeader title="Privilege codes" sub="BOI, IEAT, Free Zone, etc." right={<Btn onClick={() => alert("เพิ่ม Privilege code — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { code:"IEAT-Z3", name:"IEAT Zone 3", type:"IEAT", taxBenefit:"Full exemption", active:true },
              { code:"BOI-T1",  name:"BOI Tier 1 Electronics", type:"BOI", taxBenefit:"8-year exemption", active:true },
              { code:"FZ-EEC",  name:"EEC Free Zone", type:"FreeZone", taxBenefit:"Full exemption", active:false },
            ].map((p,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:"#7C3AED" }}>{p.code}</span>
                      <span style={{ fontSize:14, color:TEXT }}>{p.name}</span>
                      <Tag label={p.type} color="#7C3AED"/>
                    </div>
                    <div style={{ fontSize:14, color:TEXT3 }}>{p.taxBenefit}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Tag label={p.active?"Active":"Inactive"} color={p.active?"#16A34A":"#DC2626"}/>
                  <Btn variant="ghost" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${p.code}`)}>Edit</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="customers" && (
        <Card>
          <SectionHeader title="Consignees / customers" sub="Used in shipment Consignee field" right={<Btn onClick={() => alert("เพิ่ม Consignee — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { name:"Samsung Electronics Co., Ltd.", country:"Korea", code:"KR", jobs:18 },
              { name:"Toyota Motor Corporation",      country:"Japan", code:"JP", jobs:12 },
              { name:"Intel Corporation Ireland",     country:"Ireland", code:"IE", jobs:7 },
            ].map((c,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:TEXT, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:14, color:TEXT3 }}>{c.country} · {c.jobs} shipments</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Tag label={c.code} color={BLUE}/>
                  <Btn variant="ghost" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${c.name}`)}>Edit</Btn>
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
