import { useState, useEffect } from "react";
import { usePermissions } from "../../hooks/usePermissions.js";
import { customerApi } from "../../api/customerApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, RoleBadge, Tag } from "../ui/index.jsx";

export default function SettingsUsers() {
  const perms = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email:"", fullName:"", role:"CUSTOMER", password:"" });
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(null); // { email, password }
  const [editModal, setEditModal] = useState(null); // { user, role }
  const [editRole, setEditRole] = useState("CUSTOMER");
  const [savingRole, setSavingRole] = useState(false);
  const [showInvitePw, setShowInvitePw] = useState(false);

  // Role options visible to the current user when inviting / editing
  // CUSTOMER_ADMIN (factory) → only factory-side roles
  // NKTech ADMIN → all roles
  const ROLE_OPTIONS = perms.isCustomerAdmin
    ? [
        { value:"CUSTOMER",       label:"ลูกค้า — ยื่น Shipment + ดูข้อมูลตัวเอง" },
        { value:"CUSTOMER_ADMIN", label:"โรงงาน Admin — จัดการ Users + Billing ของบริษัท" },
        { value:"VIEWER",         label:"Viewer — ดูได้อย่างเดียว" },
      ]
    : [
        { value:"CUSTOMER",       label:"ลูกค้า — ยื่น Shipment + ดูข้อมูลตัวเอง" },
        { value:"CUSTOMER_ADMIN", label:"โรงงาน Admin — จัดการ Users + Billing ของบริษัท" },
        { value:"STAFF",          label:"เจ้าหน้าที่ — ทำใบขน + NSW (NKTech)" },
        { value:"MANAGER",        label:"ผู้บริหาร — ดู Reports + อนุมัติ Billing (NKTech)" },
        { value:"TENANT_ADMIN",   label:"Admin — สิทธิ์เต็ม (NKTech)" },
        { value:"VIEWER",         label:"Viewer — ดูได้อย่างเดียว" },
      ];
  const [pwCopied, setPwCopied] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    customerApi.listUsers().then(data => {
      setUsers(Array.isArray(data) ? data : (data?.data ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleInvite = async () => {
    setInviteErr("");
    if (!inviteForm.email) return setInviteErr("กรุณากรอกอีเมล");
    if (!inviteForm.password || inviteForm.password.length < 8)
      return setInviteErr("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(inviteForm.password))
      return setInviteErr("รหัสผ่านต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข");
    setInviting(true);
    try {
      await customerApi.inviteUser({ ...inviteForm });
      const savedEmail = inviteForm.email;
      const savedPw = inviteForm.password;
      setInviteModal(false);
      setInviteForm({ email:"", fullName:"", role:"USER", password:"" });
      setShowInvitePw(false);
      setInviteSuccess({ email: savedEmail, password: savedPw });
      loadUsers();
    } catch(e) {
      const m = e?.response?.data?.message;
      setInviteErr(Array.isArray(m) ? m.join(", ") : (m || "Invite failed"));
    } finally { setInviting(false); }
  };

  const copyPw = () => {
    if (inviteSuccess?.password) {
      navigator.clipboard?.writeText(inviteSuccess.password).catch(() => {});
      setPwCopied(true);
      setTimeout(() => setPwCopied(false), 2000);
    }
  };

  const openEditRole = (u) => { setEditModal(u); setEditRole(u.role || "USER"); };

  const handleUpdateRole = async () => {
    setSavingRole(true);
    try {
      await customerApi.updateUserRole(editModal.profileId || editModal.id, editRole);
      setEditModal(null);
      loadUsers();
    } catch(e) {
      alert(e?.response?.data?.message || "Update failed");
    } finally { setSavingRole(false); }
  };

  return (
    <>
      {/* Invite Success Dialog */}
      {inviteSuccess && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:420, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:TEXT }}>Invite สำเร็จ!</h3>
              <p style={{ fontSize:14, color:TEXT2, margin:0 }}>แชร์ข้อมูลด้านล่างให้ผู้ใช้เพื่อเข้าสู่ระบบครั้งแรก</p>
            </div>
            <div style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                <span style={{ color:TEXT3, fontWeight:600 }}>EMAIL</span>
                <span style={{ color:TEXT, fontWeight:600 }}>{inviteSuccess.email}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14 }}>
                <span style={{ color:TEXT3, fontWeight:600 }}>รหัสผ่าน</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontFamily:"monospace", fontWeight:700, color:TEXT, fontSize:16, letterSpacing:1 }}>
                    {inviteSuccess.password}
                  </span>
                  <button onClick={copyPw} style={{ background: pwCopied ? "#DCFCE7":"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"3px 10px", fontSize:14, fontWeight:600, color: pwCopied ? "#16A34A":BLUE, cursor:"pointer" }}>
                    {pwCopied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <p style={{ fontSize:14, color:TEXT3, margin:"0 0 16px", textAlign:"center" }}>⚠️ บันทึกรหัสผ่านนี้ไว้ก่อนปิด — ระบบจะไม่แสดงอีก</p>
            <Btn style={{ width:"100%" }} onClick={() => setInviteSuccess(null)}>ปิด</Btn>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:420, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, color:TEXT }}>+ Invite User</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["Email *","email","email"],["Full Name","fullName","text"]].map(([l,k,t]) => (
                <div key={k}>
                  <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                  <input type={t} value={inviteForm[k]} onChange={e => setInviteForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Temporary Password *</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showInvitePw ? "text" : "password"}
                    value={inviteForm.password}
                    onChange={e => setInviteForm(f=>({...f, password:e.target.value}))}
                    placeholder="อย่างน้อย 8 ตัว · A-Z a-z 0-9"
                    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 40px 9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}/>
                  <button type="button" onClick={() => setShowInvitePw(v=>!v)}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:TEXT3, fontSize:15 }}>
                    {showInvitePw ? "🙈" : "👁"}
                  </button>
                </div>
                <p style={{ fontSize:14, color:TEXT3, margin:"4px 0 0" }}>ส่งรหัสผ่านนี้ให้ผู้ใช้เพื่อ login ครั้งแรก และแนะนำให้เปลี่ยนทันที</p>
              </div>
              <div>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(f=>({...f,role:e.target.value}))}
                  style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {inviteErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{inviteErr}</div>}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => { setInviteModal(false); setInviteErr(""); setInviteForm({ email:"", fullName:"", role:"USER", password:"" }); }}>Cancel</Btn>
              <Btn onClick={handleInvite}>{inviting ? "Inviting…" : "Send invite"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:360, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:18, fontWeight:800, color:TEXT }}>Edit Role</h3>
            <p style={{ fontSize:15, color:TEXT2, margin:"0 0 16px" }}>{editModal.profile?.email || editModal.email || "—"}</p>
            <div>
              <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:15, background:"#FFFFFF" }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => setEditModal(null)}>Cancel</Btn>
              <Btn onClick={handleUpdateRole}>{savingRole ? "Saving…" : "Save"}</Btn>
            </div>
          </div>
        </div>
      )}

      <Card>
        <SectionHeader title="Organisation users" sub="Manage access for your team" right={<Btn onClick={() => setInviteModal(true)}>+ Invite user</Btn>}/>
        {loading && <div style={{ padding:"20px", textAlign:"center", fontSize:14, color:TEXT3 }}>Loading users…</div>}
        {!loading && users.length === 0 && <div style={{ padding:"20px", textAlign:"center", fontSize:14, color:TEXT3 }}>ยังไม่มีผู้ใช้ในระบบ</div>}
        {users.length > 0 && (
          <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["Name","Email","Role","Status",""].map(h=>(
                  <th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i) => {
                const name = u.profile?.fullName || u.fullName || "—";
                const email = u.profile?.email || u.email || "—";
                const role = u.role || "USER";
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}` }}>
                    <td style={{ padding:"13px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#0EA5E915", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:BLUE }}>
                          {name.charAt(0)}
                        </div>
                        <span style={{ fontSize:15, fontWeight:600, color:TEXT }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 18px", color:TEXT2 }}>{email}</td>
                    <td style={{ padding:"13px 18px" }}>
                      <RoleBadge role={role}/>
                    </td>
                    <td style={{ padding:"13px 18px" }}>
                      <Tag label="Active" color="#16A34A"/>
                    </td>
                    <td style={{ padding:"13px 18px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:13 }} onClick={() => openEditRole(u)}>Edit role</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
