import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../stores/AuthContext.jsx";
import { auditApi } from "../../api/auditApi.js";
import client from "../../api/client.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, RoleBadge } from "../ui/index.jsx";
import { AuditActionBadge } from "./AuditActionBadge.jsx";

export default function SettingsSecurity() {
  const auth = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState(false);

  useEffect(() => {
    auditApi.list({ limit: 200 }).then(data => {
      setLogs(data?.data ?? (Array.isArray(data) ? data : []));
      setTotal(data?.total ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const FILTERS = ["ALL","LOGIN","JOB","DECLARATION","USER","COMPANY"];
  const shown = filter === "ALL" ? logs : logs.filter(l => {
    if (filter === "LOGIN")       return l.action === "LOGIN";
    if (filter === "JOB")         return l.entityType === "JOB";
    if (filter === "DECLARATION") return l.entityType === "DECLARATION";
    if (filter === "USER")        return l.entityType === "USER";
    if (filter === "COMPANY")     return l.entityType === "CUSTOMER";
    return true;
  });

  // Last login entry
  const lastLogin = logs.find(l => l.action === "LOGIN" && l.status !== "FAILED");
  const lastLoginTime = lastLogin
    ? new Date(lastLogin.createdAt).toLocaleString("th-TH", { dateStyle:"medium", timeStyle:"short" })
    : "—";
  const lastIp = lastLogin?.ipAddress || "—";

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk(false);
    if (!pwForm.current) return setPwErr("กรุณากรอกรหัสผ่านปัจจุบัน");
    if (pwForm.next.length < 8) return setPwErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwForm.next)) return setPwErr("ต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข");
    if (pwForm.next !== pwForm.confirm) return setPwErr("รหัสผ่านไม่ตรงกัน");
    try {
      await client.post("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwOk(true);
      setPwForm({ current:"", next:"", confirm:"" });
    } catch(e) {
      setPwErr(e?.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Session info + Change password */}
      <div className="grid-2">
        <Card>
          <SectionHeader title="เปลี่ยนรหัสผ่าน" />
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
            {[["รหัสผ่านปัจจุบัน","current"],["รหัสผ่านใหม่","next"],["ยืนยันรหัสผ่านใหม่","confirm"]].map(([l,k]) => (
              <div key={k}>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                <input type="password" placeholder="••••••••" value={pwForm[k]}
                  onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width:"100%", background:"#FFFFFF", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, color:TEXT, boxSizing:"border-box" }}/>
              </div>
            ))}
            {pwErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{pwErr}</div>}
            {pwOk  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:14, color:"#16A34A" }}>✓ เปลี่ยนรหัสผ่านสำเร็จ</div>}
            <Btn onClick={handleChangePassword} style={{ alignSelf:"flex-start" }}>Update password</Btn>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Session & access" />
          <div style={{ padding:"16px 20px" }}>
            {[
              ["Last login",    lastLoginTime],
              ["IP address",    lastIp],
              ["Session",       "JWT · 8h validity"],
              ["ISO 27001",     "Compliant — Audit log active ✓"],
            ].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:14, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:600, color: l==="ISO 27001"?"#16A34A":TEXT }}>{v}</span>
              </div>
            ))}
            <Btn variant="danger" onClick={auth?.logout} style={{ marginTop:16, width:"100%", textAlign:"center" }}>Sign out</Btn>
          </div>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <SectionHeader
          title="Audit Log — ประวัติการใช้งาน"
          sub={loading ? "Loading…" : `${total} รายการทั้งหมด · แสดง ${shown.length} รายการล่าสุด`}
          right={
            <div style={{ display:"flex", gap:6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:"4px 10px", borderRadius:20, fontSize:13, fontWeight:600, cursor:"pointer",
                  background: filter===f ? BLUE : "transparent",
                  color: filter===f ? "#fff" : TEXT2,
                  border:`1px solid ${filter===f ? BLUE : BORDER}`,
                }}>{f}</button>
              ))}
            </div>
          }
        />
        {loading && <div style={{ padding:"24px", textAlign:"center", fontSize:14, color:TEXT3 }}>Loading audit logs…</div>}
        {!loading && shown.length === 0 && <div style={{ padding:"24px", textAlign:"center", fontSize:14, color:TEXT3 }}>ยังไม่มีประวัติการใช้งาน</div>}
        {shown.length > 0 && (
          <div style={{ overflowX:"auto" }}>
            <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["วันเวลา","Action","ผู้ใช้","IP Address","Status"].map(h => (
                    <th key={h} style={{ padding:"8px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((log, i) => {
                  const dt = new Date(log.createdAt).toLocaleString("th-TH", { dateStyle:"short", timeStyle:"medium" });
                  const failed = log.status === "FAILED" || (log.detail && log.detail.error);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background: failed?"#FFFBEB":W }}
                      onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                      onMouseLeave={e=>e.currentTarget.style.background=failed?"#FFFBEB":W}>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:13, color:TEXT3, whiteSpace:"nowrap" }}>{dt}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <AuditActionBadge action={log.action} status={log.status} />
                        {log.entityId && <span style={{ marginLeft:6, fontSize:13, color:TEXT3, fontFamily:MONO }}>{log.entityId.substring(0,8)}…</span>}
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:14, color:TEXT2 }}>
                        {log.actorEmail || "—"}
                      </td>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:13, color:TEXT2 }}>
                        {log.ipAddress || "—"}
                      </td>
                      <td style={{ padding:"10px 16px" }}>
                        <span style={{
                          padding:"2px 7px", borderRadius:20, fontSize:12, fontWeight:700,
                          background: failed?"#FEF2F2":"#F0FDF4",
                          color: failed?"#DC2626":"#16A34A",
                          border:`1px solid ${failed?"#FECACA":"#BBF7D0"}`,
                        }}>{failed?"FAILED":"SUCCESS"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        )}
      </Card>
    </div>
  );
}
