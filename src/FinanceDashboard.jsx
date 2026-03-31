import React from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { cssVar } from './theme';

const BLUE    = cssVar.primary;
const BG      = cssVar.bgMain;
const BORDER  = cssVar.borderMain;
const TEXT    = cssVar.textMain;
const TEXT2   = cssVar.textMuted;
const TEXT3   = cssVar.textLight;
const GREEN   = cssVar.success;
const RED     = cssVar.danger;
const ORANGE  = cssVar.warning;

// Mock Data for Charts
const monthlyData = [
  { name: 'Oct', duty: 1200000, freight: 800000, storage: 150000 },
  { name: 'Nov', duty: 1500000, freight: 850000, storage: 180000 },
  { name: 'Dec', duty: 1100000, freight: 900000, storage: 120000 },
  { name: 'Jan', duty: 900000,  freight: 750000, storage: 100000 },
  { name: 'Feb', duty: 1600000, freight: 110000, storage: 200000 },
  { name: 'Mar', duty: 1800000, freight: 120000, storage: 50000  },
];

const expenseData = [
  { name: 'Customs Duty & Tax', value: 8100000, color: BLUE },
  { name: 'Freight & Logistics', value: 3710000, color: '#38BDF8' },
  { name: 'Storage & Warehouse', value: 800000,  color: '#FB923C' },
  { name: 'Brokerage Fees',      value: 400000,  color: '#A78BFA' },
];

export default function FinanceDashboard({ onSwitchToCustomer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: 40 }}>
      
      {/* 1. Top KPI Cards */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT }}>Executive Financial Highlights</h2>
        </div>
        
        <div className="dashboard-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>YTD Duty & Tax Paid</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: TEXT }}>฿ 8.1M</div>
            <div style={{ fontSize: '13px', color: GREEN, marginTop: '8px', fontWeight: 600 }}>↑ 12% vs Last Year</div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>Pending Accounts Payable</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: RED }}>฿ 452K</div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '8px', fontWeight: 600 }}>Due within 7 Days</div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>Total Import Value (CIF)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: TEXT }}>$ 4.2M</div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '8px', fontWeight: 600 }}>For currently active shipments</div>
          </div>
          <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${ORANGE}` }}>
            <div style={{ fontSize: '14px', color: ORANGE, fontWeight: 700, marginBottom: '8px' }}>D&D Risk Exposure</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: ORANGE }}>12 Cont.</div>
            <div style={{ fontSize: '13px', color: TEXT2, marginTop: '8px', fontWeight: 600 }}>Nearing free time limit</div>
          </div>
        </div>
      </section>

      {/* 2. Charts Section */}
      <section className="dashboard-split" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* Trend Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '20px' }}>Expense Trend (Trailing 6 Months)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDuty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: TEXT3 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: TEXT3 }} tickFormatter={v => `฿${v/1000000}M`} dx={-10} />
                <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3"/>
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value)}
                />
                <Area type="monotone" dataKey="duty" name="Duty & Tax" stroke={BLUE} strokeWidth={3} fillOpacity={1} fill="url(#colorDuty)" />
                <Area type="monotone" dataKey="freight" name="Logistics & Freight" stroke="#38BDF8" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '20px' }}>Expense Breakdown (YTD)</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              {expenseData.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: TEXT2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Risk & Compliance */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700, color: TEXT }}>Risk & Compliance Alerts</h2>
        <div className="grid-2">
          <div className="card" style={{ padding: '20px', borderLeft: `5px solid ${RED}` }}>
             <h3 style={{ fontSize: '15px', color: RED, margin: '0 0 8px', fontWeight: 700 }}>Company Certificate Expiry Warning</h3>
             <p style={{ fontSize: '14px', color: TEXT2, margin: '0 0 16px' }}>
               หนังสือรับรองบริษัทของท่านกำลังจะหมดอายุในอีก <strong>14 วัน</strong> กรุณาอัปโหลดฉบับใหม่เพื่อหลีกเลี่ยงความล่าช้าในการผ่านพิธีการศุลกากร
             </p>
             <button style={{ background: '#fff', color: RED, border: `1px solid ${RED}`, padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Upload New Certificate</button>
          </div>
          <div className="card" style={{ padding: '20px', borderLeft: `5px solid ${ORANGE}` }}>
             <h3 style={{ fontSize: '15px', color: ORANGE, margin: '0 0 8px', fontWeight: 700 }}>Inspection (Red Line) Rate</h3>
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
               <span style={{ fontSize: '28px', fontWeight: 800, color: TEXT, lineHeight: 1 }}>14%</span>
               <span style={{ fontSize: '14px', color: TEXT2, paddingBottom: 4 }}>of shipments selected for customs inspection</span>
             </div>
             <p style={{ fontSize: '13px', color: TEXT3, margin: 0 }}>This is slightly higher than industry average (10%).</p>
          </div>
        </div>
      </section>

    </div>
  )
}
