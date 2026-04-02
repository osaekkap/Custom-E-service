import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { cssVar } from './theme';
import { billingApi } from './api/billingApi';

const BLUE    = cssVar.primary;
const BG      = cssVar.bgMain;
const BORDER  = cssVar.borderMain;
const TEXT    = cssVar.textMain;
const TEXT2   = cssVar.textMuted;
const TEXT3   = cssVar.textLight;
const GREEN   = cssVar.success;
const RED     = cssVar.danger;
const ORANGE  = cssVar.warning;

function formatTHB(v) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(v);
}

function summarizeBilling(items, invoices) {
  const totalBilled = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const uninvoiced = items.filter((i) => !i.isInvoiced).reduce((s, i) => s + Number(i.amount || 0), 0);
  const pendingInvoices = invoices.filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE');
  const pendingAmount = pendingInvoices.reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
  const paidAmount = paidInvoices.reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE').length;

  // Group items by month for chart
  const byMonth = {};
  items.forEach((item) => {
    const d = new Date(item.createdAt);
    const key = d.toLocaleString('en', { month: 'short' });
    if (!byMonth[key]) byMonth[key] = { name: key, amount: 0 };
    byMonth[key].amount += Number(item.amount || 0);
  });
  const monthlyData = Object.values(byMonth).slice(-6);

  // Group by type for pie chart
  const byType = {};
  items.forEach((item) => {
    const type = item.type || 'OTHER';
    if (!byType[type]) byType[type] = 0;
    byType[type] += Number(item.amount || 0);
  });
  const typeColors = { DECLARATION_FEE: BLUE, AI_EXTRACTION_FEE: '#38BDF8', NSW_SUBMISSION_FEE: '#FB923C', CUSTOMS_SERVICE_FEE: '#A78BFA' };
  const typeLabels = { DECLARATION_FEE: 'Declaration Fee', AI_EXTRACTION_FEE: 'AI Extraction', NSW_SUBMISSION_FEE: 'NSW Submission', CUSTOMS_SERVICE_FEE: 'Customs Service' };
  const expenseData = Object.entries(byType).map(([type, value]) => ({
    name: typeLabels[type] || type,
    value,
    color: typeColors[type] || '#94A3B8',
  }));

  return { totalBilled, uninvoiced, pendingAmount, paidAmount, overdueCount, monthlyData, expenseData, totalItems: items.length, totalInvoices: invoices.length };
}

export default function FinanceDashboard({ onSwitchToCustomer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([billingApi.listItems(), billingApi.listInvoices()])
      .then(([items, invoices]) => {
        setData(summarizeBilling(items, invoices));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = data || {
    totalBilled: 0, uninvoiced: 0, pendingAmount: 0, paidAmount: 0,
    overdueCount: 0, monthlyData: [], expenseData: [], totalItems: 0, totalInvoices: 0,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: 40 }}>
      
      {/* 1. Top KPI Cards */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT }}>Executive Financial Highlights</h2>
          {loading && <span style={{ fontSize: '13px', color: TEXT3 }}>Loading...</span>}
        </div>

        <div className="dashboard-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>Total Billed (YTD)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: TEXT }}>{formatTHB(summary.totalBilled)}</div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '8px', fontWeight: 600 }}>{summary.totalItems} billing items</div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>Pending / Overdue</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: summary.pendingAmount > 0 ? RED : TEXT }}>{formatTHB(summary.pendingAmount)}</div>
            <div style={{ fontSize: '13px', color: summary.overdueCount > 0 ? RED : TEXT3, marginTop: '8px', fontWeight: 600 }}>
              {summary.overdueCount > 0 ? `${summary.overdueCount} overdue invoice(s)` : 'No overdue'}
            </div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', color: TEXT2, fontWeight: 600, marginBottom: '8px' }}>Paid (YTD)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: GREEN }}>{formatTHB(summary.paidAmount)}</div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '8px', fontWeight: 600 }}>{summary.totalInvoices} invoices total</div>
          </div>
          <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${ORANGE}` }}>
            <div style={{ fontSize: '14px', color: ORANGE, fontWeight: 700, marginBottom: '8px' }}>Uninvoiced Amount</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: ORANGE }}>{formatTHB(summary.uninvoiced)}</div>
            <div style={{ fontSize: '13px', color: TEXT2, marginTop: '8px', fontWeight: 600 }}>Not yet included in an invoice</div>
          </div>
        </div>
      </section>

      {/* 2. Charts Section */}
      <section className="dashboard-split" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* Trend Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '20px' }}>Billing Trend (Recent Months)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {summary.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDuty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: TEXT3 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: TEXT3 }} tickFormatter={v => `฿${(v/1000).toFixed(0)}K`} dx={-10} />
                <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3"/>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatTHB(value)}
                />
                <Area type="monotone" dataKey="amount" name="Billing Amount" stroke={BLUE} strokeWidth={3} fillOpacity={1} fill="url(#colorDuty)" />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: TEXT3, fontSize: '14px' }}>No billing data yet</div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '20px' }}>Billing by Type (YTD)</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {summary.expenseData.length > 0 ? (<>
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.expenseData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {summary.expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatTHB(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              {summary.expenseData.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: TEXT2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
            </>) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: TEXT3, fontSize: '14px' }}>No billing data yet</div>
            )}
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
