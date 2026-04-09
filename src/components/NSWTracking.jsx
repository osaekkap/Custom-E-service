import { useState, useEffect } from "react";
import { jobsApi } from "../api/jobsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, Badge, Tag } from "./ui/index.jsx";
import { mapJob } from "./dashboard/DefaultDashboard.jsx";

function NSWTracking() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchJobs = () => {
    return jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setAllJobs(arr.map(mapJob));
      setLastUpdated(new Date());
      setError(null);
    }).catch(err => {
      setError(err.message || "Failed to load jobs");
    });
  };

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchJobs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchJobs();
  };

  const active = allJobs.filter(s=>!["COMPLETED","DRAFT"].includes(s.status));

  if (loading) {
    return (
      <div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>
            NSW Thailand status · อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH", {hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            {` · ${active.length} jobs in progress`}
          </p>
          {error && <p style={{ margin:"3px 0 0", fontSize:14, color:"#DC2626" }}>{error}</p>}
        </div>
        <Btn variant="secondary" onClick={handleRefresh} style={{ fontSize:14, flexShrink:0 }}>Refresh</Btn>
      </div>

      <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20 }}>
        {[
          { dot:"#22C55E", label:"NSW API", val:"Connected" },
          { dot:"#22C55E", label:"กรมศุลกากร", val:"Online" },
          { dot:"#0EA5E9", label:"BoT Rate", val:"35.75 THB/USD" },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s.dot }}/>
            <span style={{ fontSize:14, color:TEXT2 }}>{s.label}: <strong>{s.val}</strong></span>
            {i<2 && <span style={{ color:BORDER, marginLeft:12 }}>|</span>}
          </div>
        ))}
        <span style={{ marginLeft:"auto", fontSize:14, color:TEXT3 }}>Auto-refresh every 30s</span>
      </div>

      {active.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:TEXT3, fontSize:15 }}>
          ยังไม่มี NSW submission ที่กำลังดำเนินการ
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {active.map((job,ji) => {
          const steps = [
            { label:"Job created",        done:true  },
            { label:"AI extraction",      done:true  },
            { label:"Declaration ready",  done:job.status!=="PREPARING" },
            { label:"NSW submitted",      done:["NSW_PROCESSING","CUSTOMS_REVIEW","CLEARED","COMPLETED"].includes(job.status) },
            { label:"NSW approved",       done:["CUSTOMS_REVIEW","CLEARED","COMPLETED"].includes(job.status), active:job.status==="NSW_PROCESSING" },
            { label:"Customs cleared",    done:["CLEARED","COMPLETED"].includes(job.status), active:job.status==="CUSTOMS_REVIEW" },
          ];
          return (
            <Card key={ji}>
              <div style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:6, background:BG }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:MONO, fontWeight:700, color:TEXT, fontSize:15, whiteSpace:"nowrap", flexShrink:0 }}>{job.id}</span>
                  <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"}/>
                  <span style={{ fontSize:14, color:TEXT3, whiteSpace:"nowrap" }}>{job.vessel} · {job.fob}</span>
                </div>
                <Badge status={job.status}/>
              </div>
              <div style={{ padding:"16px 24px", display:"flex", gap:0 }}>
                {steps.map((s,si) => (
                  <div key={si} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                      {si>0 && <div style={{ flex:1, height:2, background:steps[si-1].done?"#22C55E":BORDER }}/>}
                      <div style={{
                        width:22, height:22, borderRadius:"50%", flexShrink:0,
                        background:s.done?"#22C55E":s.active?"#0EA5E9":"#F1F5F9",
                        border:`2px solid ${s.done?"#22C55E":s.active?"#0EA5E9":BORDER}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:13, fontWeight:700, color:s.done||s.active?"#fff":TEXT3,
                      }}>{s.done?"✓":s.active?"●":""}</div>
                      {si<steps.length-1 && <div style={{ flex:1, height:2, background:s.done?"#22C55E":BORDER }}/>}
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:s.active?BLUE:s.done?"#16A34A":TEXT3, marginTop:6, textAlign:"center", maxWidth:70 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {job.nsw && (
                <div style={{ padding:"8px 24px 14px", display:"flex", gap:20 }}>
                  <span style={{ fontSize:14, color:TEXT3 }}>NSW ref: <span style={{ fontFamily:MONO, color:"#2563EB" }}>{job.nsw}</span></span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default NSWTracking;
