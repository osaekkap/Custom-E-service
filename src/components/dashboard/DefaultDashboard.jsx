import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../stores/AuthContext.jsx";
import { jobsApi } from "../../api/jobsApi.js";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, Badge, Tag } from "../ui/index.jsx";
import { STATUS_COLORS } from "../../theme";
import { SHIPMENTS } from "../../lib/mockData.js";

const STATUS = STATUS_COLORS;

function DefaultDashboard({ onNav }) {
  const auth = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const companyName = auth?.user?.customer?.companyNameTh || auth?.user?.customer?.companyNameEn || "\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17";

  useEffect(() => {
    jobsApi.list({ limit: 200 }).then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr);
    }).catch(() => {});
  }, []);

  const thisMonth = new Date().toISOString().substring(0,7);
  const monthJobs = jobs.filter(j => (j.createdAt||"").startsWith(thisMonth));
  const pending = jobs.filter(j => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(j.status));
  const cleared = jobs.filter(j => ["CLEARED","COMPLETED"].includes(j.status));
  const pendingUi = (jobs.length > 0 ? pending : SHIPMENTS.filter(s => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(s.status)));
  const recentUi = jobs.length > 0 ? jobs.slice(0,5).map(mapJob) : SHIPMENTS.slice(0,5);
  const mon = new Date().toLocaleString("th-TH",{month:"long", year:"numeric"});

  // Build last 6 months for chart
  const fobChartData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0,7);
      const label = d.toLocaleString("th-TH", { month:"short" });
      const monthJb = jobs.filter(j => (j.createdAt||"").startsWith(key));
      const fob = monthJb.reduce((sum, j) => sum + (Number(j.totalFobUsd) || 0), 0);
      months.push({ month: label, fob: Math.round(fob / 1000), jobs: monthJb.length });
    }
    if (jobs.length === 0) return [
      { month:"\u0e15.\u0e04.", fob:2100, jobs:28 },
      { month:"\u0e1e.\u0e22.", fob:2800, jobs:35 },
      { month:"\u0e18.\u0e04.", fob:3100, jobs:42 },
      { month:"\u0e21.\u0e04.", fob:2600, jobs:31 },
      { month:"\u0e01.\u0e1e.", fob:3800, jobs:47 },
      { month:"\u0e21\u0e35.\u0e04.", fob:4200, jobs:52 },
    ];
    return months;
  })();

  // Status breakdown for bar chart
  const statusData = (() => {
    const src = jobs.length > 0 ? jobs : SHIPMENTS;
    const counts = {};
    src.forEach(j => { counts[j.status] = (counts[j.status]||0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS[status]?.label || status,
      count,
      fill: STATUS[status]?.color || "#6B7280",
    }));
  })();

  // Custom tooltip for FOB chart
  const FobTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", fontSize:14 }}>
        <div style={{ fontWeight:700, color:TEXT, marginBottom:4 }}>{label}</div>
        <div style={{ color:BLUE }}>FOB: ${payload[0]?.value?.toLocaleString()}K</div>
        <div style={{ color:"#8B5CF6" }}>Jobs: {payload[1]?.value}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Dashboard</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>{companyName} \u00b7 {mon}</p>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-metrics">
        {[
          { label:"Jobs this month",    value: jobs.length>0 ? String(monthJobs.length) : "\u2014", sub:"\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e19\u0e35\u0e49",   color:"#2563EB" },
          { label:"Awaiting clearance", value: jobs.length>0 ? String(pending.length) : "\u2014",   sub:"NSW + Customs queue", color:"#F59E0B" },
          { label:"Cleared / Done",     value: jobs.length>0 ? String(cleared.length) : "\u2014",   sub:"All export jobs",     color:"#22C55E" },
          { label:"Total jobs",         value: jobs.length>0 ? String(jobs.length) : "\u2014",       sub:"\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19\u0e23\u0e30\u0e1a\u0e1a",       color:"#8B5CF6" },
        ].map((k,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:k.color, fontFamily:MONO, marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:14, color:TEXT3 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="dashboard-split">
        {/* FOB Area Chart */}
        <Card>
          <SectionHeader title="FOB Value by Month" sub="USD (thousands) \u00b7 6 \u0e40\u0e14\u0e37\u0e2d\u0e19\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14" />
          <div style={{ padding:"16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={fobChartData} margin={{ top:4, right:8, left:-16, bottom:0 }}>
                <defs>
                  <linearGradient id="fobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<FobTooltip/>}/>
                <Area type="monotone" dataKey="fob" stroke={BLUE} strokeWidth={2} fill="url(#fobGrad)" dot={{ r:3, fill:BLUE }}/>
                <Area type="monotone" dataKey="jobs" stroke="#8B5CF6" strokeWidth={2} fill="url(#jobGrad)" dot={{ r:3, fill:"#8B5CF6" }}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:TEXT3 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:BLUE }}/> FOB (K USD)
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:TEXT3 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:"#8B5CF6" }}/> Jobs
              </div>
            </div>
          </div>
        </Card>

        {/* Status Bar Chart */}
        <Card>
          <SectionHeader title="Jobs by Status" sub="\u0e2a\u0e16\u0e32\u0e19\u0e30 shipment \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14" />
          <div style={{ padding:"16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} margin={{ top:4, right:8, left:-16, bottom:0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false}/>
                <XAxis type="number" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="status" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false} width={80}/>
                <Tooltip
                  contentStyle={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, fontSize:14, boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}
                  cursor={{ fill:"#F9FAFB" }}
                />
                <Bar dataKey="count" radius={[0,4,4,0]} maxBarSize={20}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="dashboard-split">
        <Card>
          <SectionHeader title="Recent shipments" right={<Btn variant="ghost" onClick={() => onNav("shipments")} style={{ fontSize:14 }}>View all \u2192</Btn>} />
          {recentUi.length === 0 && <div style={{ padding:"20px", fontSize:14, color:TEXT3, textAlign:"center" }}>\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35 shipment</div>}
          {recentUi.map((s,i) => (
            <div key={i} onClick={() => onNav("shipment_detail", s)} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"11px 20px", borderBottom:i<recentUi.length-1?`1px solid ${BORDER2}`:"none",
              cursor:"pointer",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
            onMouseLeave={e=>e.currentTarget.style.background=W}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id}</span>
                  <Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"} />
                </div>
                <div style={{ fontSize:14, color:TEXT3 }}>{s.vessel} \u00b7 {s.fob}</div>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <SectionHeader title="Jobs awaiting clearance" />
            {pendingUi.length === 0 && <div style={{ padding:"20px", fontSize:14, color:TEXT3, textAlign:"center" }}>All clear \u2713</div>}
            {pendingUi.slice(0,5).map((s,i) => (
              <div key={i} style={{ padding:"10px 18px", borderBottom:i<Math.min(pendingUi.length,5)-1?`1px solid ${BORDER2}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id || s.jobNo}</span>
                  <Badge status={s.status} />
                </div>
                <div style={{ fontSize:14, color:TEXT3 }}>{s.fob} \u00b7 {s.date || s.createdAt?.substring(0,10)}</div>
              </div>
            ))}
          </Card>

          <Card>
            <SectionHeader title="Billing summary" />
            <div style={{ padding:"14px 18px" }}>
              {[
                { label:"Jobs this month", value: jobs.length>0 ? `${monthJobs.length} jobs` : "42 jobs", color:TEXT  },
                { label:"Rate per job",    value:"\u0e3f450 / job", color:TEXT2 },
                { label:"Est. this month", value: jobs.length>0 ? `\u0e3f${(monthJobs.length*450).toLocaleString()}` : "\u0e3f18,900", color:"#16A34A" },
                { label:"Outstanding",     value:"\u0e3f78,750", color:"#DC2626" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                  <span style={{ fontSize:14, color:TEXT3 }}>{r.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:r.color }}>{r.value}</span>
                </div>
              ))}
              <Btn variant="secondary" onClick={() => onNav("billing")} style={{ width:"100%", marginTop:12, textAlign:"center" }}>View invoices</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function mapJob(job) {
  return {
    id: job.jobNo,
    _id: job.id,
    type: job.type === "EXPORT" ? "Export" : "Import",
    vessel: job.vesselName || "—",
    container: job.containerNo || "—",
    hs: "—",
    fob: job.totalFobUsd ? `USD ${Number(job.totalFobUsd).toLocaleString()}` : "—",
    status: job.status,
    date: job.createdAt?.substring(0, 10) || "—",
    items: job._count?.declarations ?? 0,
    nsw: job.nswRefNo || null,
    consignee: job.consigneeNameEn || "—",
    pod: job.portOfDischarge || job.portOfLoading || "—",
    // B1: Job Assignment
    assignedToId: job.assignedToId || null,
    assignedToName: job.assignedTo?.fullName || job.assignedTo?.email || null,
    assignedAt: job.assignedAt || null,
    // B2: Approval Workflow
    approvalStatus: job.approvalStatus || "NONE",
    approvalNote: job.approvalNote || null,
    _raw: job,
  };
}

export default DefaultDashboard;
