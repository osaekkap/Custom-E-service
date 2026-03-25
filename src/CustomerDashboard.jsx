import React from 'react';

const BLUE    = "var(--primary)";
const BG      = "var(--bg-main)";
const BORDER  = "var(--border-main)";
const TEXT    = "var(--text-main)";
const TEXT2   = "var(--text-muted)";
const TEXT3   = "var(--text-light)";
const GREEN   = "var(--success)";
const RED     = "var(--danger)";
const ORANGE  = "var(--warning)";

export default function CustomerDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: 40 }}>
      
      {/* 1. Action Center */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700, color: TEXT }}>Action Center (สิ่งที่ต้องดำเนินการด่วน)</h2>
        <div className="dashboard-split" style={{ gridTemplateColumns: '1fr 1fr' }}>
          
          <div className="card" style={{ padding: '20px', borderLeft: `5px solid ${RED}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: RED, margin: '0 0 6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Awaiting Payment
                </h3>
                <p style={{ fontSize: '14px', color: TEXT2, margin: '0 0 16px' }}>รอชำระภาษีศุลกากร (Job: BKK-0922)</p>
                <div style={{ fontSize: '24px', fontWeight: 800, color: TEXT }}>฿ 45,200.00</div>
              </div>
              <button style={{ background: RED, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}>
                Pay Now
              </button>
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px', borderLeft: `5px solid ${ORANGE}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: ORANGE, margin: '0 0 6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Draft to Review
                </h3>
                <p style={{ fontSize: '14px', color: TEXT2, margin: '0 0 8px' }}>ใบขนร่างรอหน้าเว็บเพื่อตรวจสอบและยืนยัน</p>
                <div style={{ fontSize: '14px', color: TEXT, fontWeight: 600, background: '#FFFBEB', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>Job: BKK-0925 (ETA 12 Nov)</div>
              </div>
              <button style={{ background: '#FFFBEB', color: ORANGE, border: `1px solid ${ORANGE}`, padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Review Draft
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. Active Shipments Pipeline */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700, color: TEXT }}>Active Shipments Tracking</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Shipment Card 1 */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: BLUE, padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '15px' }}>
                  BKK-0923
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Air Import - Electronics</div>
                  <div style={{ fontSize: '13px', color: TEXT3, marginTop: 2 }}>AWB: 123-45678901</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: ORANGE, fontWeight: 700, background: '#FFFBEB', padding: '6px 12px', borderRadius: '6px', border: `1px solid rgba(217, 119, 6, 0.2)` }}>
                ⏳ ETA: Today • D&D Free Time: 4 Days
              </div>
            </div>
            
            {/* Pipeline Visualizer (Responsive flex) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', marginTop: 10, padding: '0 20px' }}>
              {/* Progress Line */}
              <div style={{ position: 'absolute', top: '16px', left: '4%', right: '4%', height: '4px', background: BORDER, zIndex: 0, borderRadius: 2 }}>
                 <div style={{ width: '50%', height: '100%', background: BLUE, borderRadius: 2 }} />
              </div>
              
              {/* Steps */}
              {['Arrival', 'Draft/Submit', 'Customs Clearance', 'Cargo Released', 'Delivering'].map((step, idx) => {
                const isActive = idx <= 2;
                const isCurrent = idx === 2;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '100px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: isCurrent ? BLUE : (isActive ? GREEN : '#fff'), 
                      border: `3px solid ${isActive ? (isCurrent ? BLUE : GREEN) : BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? '#fff' : TEXT3, fontSize: '14px', fontWeight: 'bold',
                      boxShadow: isCurrent ? `0 0 0 4px rgba(37,99,235,0.15)` : 'none'
                    }}>
                      {isActive && !isCurrent ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      ) : (idx + 1)}
                    </div>
                    <span style={{ fontSize: '13px', marginTop: '12px', color: isCurrent ? BLUE : (isActive ? TEXT : TEXT3), textAlign: 'center', fontWeight: isCurrent ? 700 : 500 }}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. Document Archive */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700, color: TEXT }}>Document Archive (Self-Service)</h2>
        <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', background: '#F8FAFC', marginBottom: '16px' }}>
          <input type="text" placeholder="ค้นหา Job No., เลขที่ใบขนสินค้า หรือ BL No..." style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, outline: 'none', fontSize: '15px' }} />
          <button style={{ background: BLUE, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
            Search Docs
          </button>
        </div>
        <div className="doc-grid">
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = BLUE} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
             <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22, 163, 74, 0.1)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             </div>
             <div>
               <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Duty Receipts</div>
               <div style={{ fontSize: '13px', color: TEXT3, marginTop: 4 }}>ใบเสร็จภาษีกรมศุลกากร PDF</div>
             </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = BLUE} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
             <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37, 99, 235, 0.1)', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
             </div>
             <div>
               <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Declarations</div>
               <div style={{ fontSize: '13px', color: TEXT3, marginTop: 4 }}>ใบขนสินค้าขาเข้า/ขาออก (XML/PDF)</div>
             </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = BLUE} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
             <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217, 119, 6, 0.1)', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
             </div>
             <div>
               <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Unpaid Invoices</div>
               <div style={{ fontSize: '13px', color: TEXT3, marginTop: 4 }}>ยอดค้างชำระ & ใบแจ้งหนี้</div>
             </div>
          </div>
        </div>
      </section>

    </div>
  )
}
