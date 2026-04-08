import { C } from "../constants";

export function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 11px", borderRadius: 20,
      fontSize:14, fontWeight: 700, letterSpacing: "0.4px",
      color, background: bg, border: `1px solid ${border || color + "55"}`,
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

export function StatusPill({ status }) {
  const map = {
    active:       { label: "Active",       color: C.green,  bg: C.greenBg },
    trial:        { label: "Trial",        color: C.amber,  bg: C.amberBg },
    suspended:    { label: "Suspended",    color: C.red,    bg: C.redBg },
    connected:    { label: "Connected",    color: C.teal,   bg: C.tealBg },
    pending:      { label: "Pending",      color: C.amber,  bg: C.amberBg },
    disconnected: { label: "Offline",      color: C.red,    bg: C.redBg },
    paid:         { label: "Paid",         color: C.green,  bg: C.greenBg },
    overdue:      { label: "Overdue",      color: C.red,    bg: C.redBg },
    CLEARED:      { label: "Cleared",      color: C.green,  bg: C.greenBg },
    NSW_PROC:     { label: "NSW Proc.",    color: C.blue,   bg: C.blueBg },
    REVIEW:       { label: "Review",       color: C.amber,  bg: C.amberBg },
    SUBMITTED:    { label: "Submitted",    color: C.purple, bg: C.purpleBg },
    DRAFT:        { label: "Draft",        color: C.textDim, bg: "rgba(71,85,105,0.15)" },
  };
  const c = map[status] || map.active;
  return <Pill label={c.label} color={c.color} bg={c.bg} />;
}

export function Card({ children, style = {} }) {
  return (
    <div className="card-hover" style={{
      background: C.bg2, border: `1px solid ${C.border}`,
      borderRadius: 16, transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      ...style,
    }}>{children}</div>
  );
}

export function CardHeader({ title, sub, action }) {
  return (
    <div style={{
      padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize:17, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>{title}</div>
        {sub && <div style={{ fontSize:14, color: C.textDim, marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, color = C.teal }) {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ fontSize:14, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight: 800, color, fontFamily: C.mono, marginBottom: 5, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize:14, color: C.textDim }}>{sub}</div>}
    </div>
  );
}

export const JOB_STATUS_MAP = {
  DRAFT:           { label:"Draft",           color: C.textDim, bg:"rgba(71,85,105,0.15)" },
  PREPARING:       { label:"Preparing",       color: C.amber,   bg: C.amberBg },
  READY:           { label:"Ready",           color: C.blue,    bg: C.blueBg  },
  SUBMITTED:       { label:"Submitted",       color: C.purple,  bg: C.purpleBg },
  NSW_PROCESSING:  { label:"NSW Proc.",       color: C.blue,    bg: C.blueBg  },
  CUSTOMS_REVIEW:  { label:"Customs Review",  color: C.amber,   bg: C.amberBg },
  CLEARED:         { label:"Cleared",         color: C.teal,    bg: C.tealBg  },
  COMPLETED:       { label:"Completed",       color: C.green,   bg: C.greenBg },
  REJECTED:        { label:"Rejected",        color: C.red,     bg: C.redBg   },
};

export function JobStatusPill({ status }) {
  const s = JOB_STATUS_MAP[status] || JOB_STATUS_MAP.DRAFT;
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:20,
      fontSize:13, fontWeight:700, letterSpacing:"0.3px",
      color:s.color, background:s.bg, border:`1px solid ${s.color}44`,
    }}>{s.label}</span>
  );
}
