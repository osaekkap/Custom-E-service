const ACTION_LABELS = {
  LOGIN:               { label:"เข้าสู่ระบบ",       icon:"🔐", color:"#0EA5E9" },
  REGISTER_B2B:        { label:"สมัครใช้งาน B2B",   icon:"🏢", color:"#7C3AED" },
  REGISTER_USER:       { label:"สร้างผู้ใช้",        icon:"👤", color:"#7C3AED" },
  CREATE_JOB:          { label:"สร้าง Shipment",     icon:"📦", color:"#16A34A" },
  UPDATE_JOB:          { label:"แก้ไข Shipment",     icon:"✏️", color:"#D97706" },
  UPDATE_JOB_STATUS:   { label:"เปลี่ยนสถานะ Job",   icon:"🔄", color:"#D97706" },
  DELETE_JOB:          { label:"ลบ Shipment",        icon:"🗑️", color:"#DC2626" },
  CREATE_DECLARATION:  { label:"สร้างใบขนสินค้า",   icon:"📄", color:"#16A34A" },
  SUBMIT_DECLARATION:  { label:"ยื่นใบขนฯ NSW",      icon:"🚀", color:"#0EA5E9" },
  UPDATE_DECLARATION:  { label:"แก้ไขใบขนสินค้า",   icon:"✏️", color:"#D97706" },
  UPLOAD_DOCUMENT:     { label:"อัปโหลดเอกสาร",     icon:"📎", color:"#16A34A" },
  REFRESH_DOCUMENT:    { label:"รีเฟรช URL เอกสาร", icon:"🔗", color:"#64748B" },
  UPDATE_COMPANY:      { label:"แก้ไขข้อมูลบริษัท", icon:"🏭", color:"#7C3AED" },
  INVITE_USER:         { label:"เชิญผู้ใช้",         icon:"📧", color:"#16A34A" },
  UPDATE_USER_ROLE:    { label:"เปลี่ยน Role",       icon:"🔑", color:"#D97706" },
  REMOVE_USER:         { label:"ลบผู้ใช้",           icon:"🚫", color:"#DC2626" },
};

export function AuditActionBadge({ action, status }) {
  const meta = ACTION_LABELS[action] || { label: action, icon:"⚡", color:"#64748B" };
  const failed = status === "FAILED";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", borderRadius:20, fontSize:13, fontWeight:700,
      background: failed?"#FEF2F2":`${meta.color}12`,
      color: failed?"#DC2626":meta.color,
      border:`1px solid ${failed?"#FECACA":`${meta.color}30`}`,
    }}>
      {meta.icon} {meta.label}
      {failed && <span style={{ marginLeft:2, fontSize:12 }}>✗</span>}
    </span>
  );
}
