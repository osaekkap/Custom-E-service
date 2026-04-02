import { useState } from "react";
import { W, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, Card, SectionHeader, Btn } from "../ui/index.jsx";

export default function SettingsNotifications() {
  const ITEMS = [
    ["Job submitted to NSW",   true ],
    ["NSW approval received",  true ],
    ["Customs cleared",        true ],
    ["Job rejected",           true ],
    ["Invoice issued",         true ],
    ["Monthly summary report", false],
    ["New user invited",       false],
  ];
  const [notifs, setNotifs] = useState(ITEMS.map(([,v]) => v));
  const toggle = (i) => setNotifs(n => n.map((v, idx) => idx===i ? !v : v));

  return (
    <Card style={{ maxWidth:560 }}>
      <SectionHeader title="Email notifications" />
      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
        {ITEMS.map(([label], i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<ITEMS.length-1?`1px solid ${BORDER2}`:"none" }}>
            <span style={{ fontSize:15, color:TEXT }}>{label}</span>
            <button onClick={() => toggle(i)} style={{
              width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative",
              background:notifs[i]?BLUE:"#E2E8F0", transition:"background 0.15s",
            }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:notifs[i]?23:3, transition:"left 0.15s" }}/>
            </button>
          </div>
        ))}
        <Btn style={{ alignSelf:"flex-start" }} onClick={() => alert("Notification settings saved ✓")}>Save preferences</Btn>
      </div>
    </Card>
  );
}
