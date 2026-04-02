import { useState, useEffect } from "react";
import { jobsApi } from "../api/jobsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, Badge, Tag } from "./ui/index.jsx";
import { mapJob } from "./dashboard/DefaultDashboard.jsx";
import { SHIPMENTS } from "../lib/mockData.js";

function NSWTracking() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setAllJobs(arr.length > 0 ? arr.map(mapJob) : SHIPMENTS);
      setLastUpdated(new Date());
    }).catch(() => setAllJobs(SHIPMENTS)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      jobsApi.list().then(data => {
        const arr = data?.data ?? (Array.isArray(data) ? data : []);
        if (arr.length > 0) setAllJobs(arr.map(mapJob));
        setLastUpdated(new Date());
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      if (arr.length > 0) setAllJobs(arr.map(mapJob));
      setLastUpdated(new Date());
    }).catch(() => {});
  };

  const active = allJobs.filter(s=>!["COMPLETED","DRAFT"].includes(s.status));

  return (
    <div>
      <div style={{ marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>
            NSW Thailand status · อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH", {hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            {loading && " · Loading…"}
            {!loading && ` · ${active.length} jobs in progress`}
          </p>
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
              <div style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:BG }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontFamily:MONO, fontWeight:700, color:TEXT, fontSize:15 }}>{job.id}</span>
                  <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"}/>
                  <span style={{ fontSize:14, color:TEXT3 }}>{job.vessel} · {job.fob}</span>
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
