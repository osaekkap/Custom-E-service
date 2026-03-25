import { useState } from 'react';
import client from './api/client';

const BLUE   = '#0EA5E9';
const TEXT   = '#0F172A';
const TEXT2  = '#475569';
const TEXT3  = '#94A3B8';
const BORDER = '#E2E8F0';
const BG     = '#F8FAFC';
const GREEN  = '#16A34A';
const RED    = '#DC2626';
const MONO   = "'JetBrains Mono','Courier New',monospace";

const TC_VERSION = '2026-v1';

const STEPS = ['ข้อมูลบริษัท', 'ผู้ดูแลระบบ', 'เงื่อนไขการใช้งาน'];

function Input({ label, required, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label} {required && <span style={{ color: RED }}>*</span>}
      </label>
      <input {...props} style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT,
        background: BG, boxSizing: 'border-box', outline: 'none',
        ...props.style,
      }} />
    </div>
  );
}

// Eye icons (SVG inline)
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordInput({ label, required, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label} {required && <span style={{ color: RED }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '9px 40px 9px 12px', borderRadius: 8,
            border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT,
            background: BG, boxSizing: 'border-box', outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: show ? BLUE : TEXT3, padding: 2, display: 'flex', alignItems: 'center',
          }}
          tabIndex={-1}
          title={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
        >
          {show ? <EyeOpen /> : <EyeOff />}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Company Info ─────────────────────────────────────────
function StepCompany({ data, onChange, onNext }) {
  const [err, setErr] = useState('');
  const ok = () => {
    if (!data.companyNameTh.trim()) return setErr('กรุณากรอกชื่อบริษัท (ภาษาไทย)');
    if (!/^\d{13}$/.test(data.taxId)) return setErr('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
    setErr('');
    onNext();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="ชื่อบริษัท (ภาษาไทย)" required placeholder="บริษัท ไทยอิเล็กทรอนิกส์ จำกัด"
        value={data.companyNameTh} onChange={e => onChange('companyNameTh', e.target.value)} />
      <Input label="Company Name (English)" placeholder="Thai Electronics Co., Ltd."
        value={data.companyNameEn} onChange={e => onChange('companyNameEn', e.target.value)} />
      <Input label="เลขประจำตัวผู้เสียภาษีอากร" required placeholder="0000000000000 (13 หลัก)"
        value={data.taxId} onChange={e => onChange('taxId', e.target.value)} maxLength={13} />
      <Input label="ที่อยู่บริษัท" placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
        value={data.address} onChange={e => onChange('address', e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="รหัสไปรษณีย์" placeholder="10400"
          value={data.postcode} onChange={e => onChange('postcode', e.target.value)} maxLength={10} />
        <Input label="เบอร์โทรบริษัท" placeholder="02-000-0000"
          value={data.companyPhone} onChange={e => onChange('companyPhone', e.target.value)} />
      </div>
      {err && <div style={{ fontSize: 12, color: RED, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>{err}</div>}
      <button onClick={ok} style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        ถัดไป →
      </button>
    </div>
  );
}

// ─── Step 2: Admin User ───────────────────────────────────────────
function StepAdmin({ data, onChange, onNext, onBack }) {
  const [err, setErr] = useState('');
  const ok = () => {
    if (!data.fullName.trim()) return setErr('กรุณากรอกชื่อ-นามสกุล');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setErr('รูปแบบอีเมลไม่ถูกต้อง');
    if (data.password.length < 8) return setErr('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) return setErr('รหัสผ่านต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข (อักขระพิเศษก็ใช้ได้)');
    if (data.password !== data.confirmPassword) return setErr('รหัสผ่านไม่ตรงกัน');
    setErr('');
    onNext();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '10px 14px', background: '#F0F9FF', borderRadius: 8, border: '1px solid #BAE6FD', fontSize: 12, color: '#0369A1' }}>
        บัญชีนี้จะมีสิทธิ์ระดับ <strong>Tenant Admin</strong> — สามารถจัดการผู้ใช้และข้อมูลทั้งหมดของบริษัท
      </div>
      <Input label="ชื่อ-นามสกุล" required placeholder="สมชาย ใจดี"
        value={data.fullName} onChange={e => onChange('fullName', e.target.value)} />
      <Input label="ตำแหน่งงาน" placeholder="ผู้จัดการฝ่ายนำเข้า-ส่งออก"
        value={data.jobTitle} onChange={e => onChange('jobTitle', e.target.value)} />
      <Input label="อีเมล" required type="email" placeholder="admin@yourcompany.com"
        value={data.email} onChange={e => onChange('email', e.target.value)} />
      <Input label="เบอร์โทรติดต่อ" placeholder="081-000-0000"
        value={data.adminPhone} onChange={e => onChange('adminPhone', e.target.value)} />
      <PasswordInput label="รหัสผ่าน" required placeholder="อย่างน้อย 8 ตัว · A-Z a-z 0-9 !@#$..."
        value={data.password} onChange={e => onChange('password', e.target.value)} />
      <PasswordInput label="ยืนยันรหัสผ่าน" required placeholder="••••••••"
        value={data.confirmPassword} onChange={e => onChange('confirmPassword', e.target.value)} />
      {err && <div style={{ fontSize: 12, color: RED, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, background: 'none', color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ← ย้อนกลับ
        </button>
        <button onClick={ok} style={{ flex: 2, background: BLUE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          ถัดไป →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Terms & Conditions ──────────────────────────────────
function StepTerms({ onBack, onSubmit, loading, err }) {
  const [tcOk, setTcOk]   = useState(false);
  const [pdpaOk, setPdpaOk] = useState(false);

  const handleSubmit = () => {
    if (!tcOk) return alert('กรุณายอมรับข้อกำหนดการใช้งานก่อน');
    if (!pdpaOk) return alert('กรุณายอมรับนโยบายความเป็นส่วนตัว (PDPA) ก่อน');
    onSubmit(tcOk, pdpaOk);
  };

  const CheckRow = ({ checked, onChange, children }) => (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '10px 14px', background: checked ? '#F0FDF4' : '#FAFAFA', borderRadius: 8, border: `1px solid ${checked ? '#86EFAC' : BORDER}`, transition: 'all 0.15s' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 2, accentColor: GREEN, width: 15, height: 15, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: TEXT2, lineHeight: 1.5 }}>{children}</span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* T&C Box */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: '#F8FAFC', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>ข้อกำหนดการใช้งาน (Terms of Service)</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT3 }}>v{TC_VERSION} · ISO 27001:2022</span>
        </div>
        <div style={{ maxHeight: 180, overflowY: 'auto', padding: '14px 16px', fontSize: 11.5, color: TEXT2, lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, color: TEXT }}>1. ขอบเขตการให้บริการ</p>
          <p style={{ margin: '0 0 10px' }}>Customs-Edoc ("ผู้ให้บริการ") ให้บริการระบบยื่นใบขนสินค้าออกอิเล็กทรอนิกส์ผ่าน NSW Thailand สำหรับองค์กรธุรกิจ ("ผู้ใช้บริการ") โดยเชื่อมต่อกับระบบของกรมศุลกากรแห่งประเทศไทย</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>2. มาตรฐานความปลอดภัยสารสนเทศ (ISO 27001:2022)</p>
          <p style={{ margin: '0 0 8px' }}>ผู้ให้บริการดำเนินงานตามมาตรฐาน ISO/IEC 27001:2022 Information Security Management System (ISMS) ครอบคลุม:</p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
            <li>การควบคุมการเข้าถึง (Access Control) — บัญชีผู้ใช้แต่ละรายมีสิทธิ์แยกต่อกันตาม Role-Based Access Control (RBAC)</li>
            <li>การเข้ารหัสข้อมูล (Cryptography) — ข้อมูลรหัสผ่านและ credentials ทั้งหมดถูกเข้ารหัสด้วย AES-256</li>
            <li>การจัดการเหตุการณ์ด้านความปลอดภัย (Incident Management) — มีระบบ audit log บันทึกทุกการกระทำ</li>
            <li>การสำรองข้อมูล (Business Continuity) — ข้อมูลถูกสำรองทุก 24 ชั่วโมง เก็บรักษาไว้ 90 วัน</li>
            <li>การประเมินความเสี่ยง (Risk Assessment) — มีการทบทวนความเสี่ยงและช่องโหว่ประจำปี</li>
          </ul>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>3. ความรับผิดชอบของผู้ใช้บริการ</p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
            <li>ให้ข้อมูลที่ถูกต้องและเป็นจริงในการยื่นใบขนสินค้า</li>
            <li>รักษาความลับของรหัสผ่านและไม่เปิดเผยให้ผู้อื่น</li>
            <li>แจ้งให้ผู้ให้บริการทราบทันทีหากพบการใช้งานที่ผิดปกติ</li>
            <li>ปฏิบัติตามพระราชบัญญัติศุลกากร พ.ศ. 2560 และกฎระเบียบที่เกี่ยวข้อง</li>
          </ul>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>4. การระงับและยกเลิกบริการ</p>
          <p style={{ margin: '0 0 10px' }}>ผู้ให้บริการสงวนสิทธิ์ระงับหรือยกเลิกบัญชีหากพบการละเมิดข้อกำหนด การให้ข้อมูลเท็จ หรือการใช้ระบบในทางที่ผิดกฎหมาย</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>5. ข้อจำกัดความรับผิด</p>
          <p style={{ margin: '0 0 10px' }}>ผู้ให้บริการไม่รับผิดชอบต่อความเสียหายจากการกรอกข้อมูลผิดพลาดโดยผู้ใช้ การล่าช้าของระบบ NSW หรือกรมศุลกากร และเหตุสุดวิสัย (Force Majeure)</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>6. กฎหมายที่ใช้บังคับ</p>
          <p style={{ margin: 0 }}>ข้อพิพาทใดๆ ที่เกิดขึ้นจะอยู่ภายใต้กฎหมายไทยและศาลไทยเป็นผู้มีอำนาจพิจารณา</p>
        </div>
      </div>

      {/* PDPA Box */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: '#F8FAFC', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>นโยบายความเป็นส่วนตัว (Privacy Policy)</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT3 }}>PDPA พ.ร.บ. 2562</span>
        </div>
        <div style={{ maxHeight: 180, overflowY: 'auto', padding: '14px 16px', fontSize: 11.5, color: TEXT2, lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, color: TEXT }}>การคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>1. ข้อมูลที่เก็บรวบรวม</p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
            <li><strong>ข้อมูลตัวตน:</strong> ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ ตำแหน่งงาน</li>
            <li><strong>ข้อมูลองค์กร:</strong> ชื่อบริษัท เลขประจำตัวผู้เสียภาษี ที่อยู่</li>
            <li><strong>ข้อมูลการใช้งาน:</strong> Log การเข้าถึงระบบ IP address วันเวลา</li>
            <li><strong>ข้อมูลศุลกากร:</strong> ข้อมูลใบขนสินค้า HS Code มูลค่าสินค้า</li>
          </ul>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>2. วัตถุประสงค์การใช้ข้อมูล</p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
            <li>ให้บริการระบบยื่นใบขนสินค้าออกอิเล็กทรอนิกส์และเชื่อมต่อ NSW Thailand</li>
            <li>ยืนยันตัวตนและจัดการสิทธิ์การเข้าถึงระบบ</li>
            <li>ออกใบแจ้งหนี้และเอกสารทางการเงินที่เกี่ยวข้อง</li>
            <li>ปรับปรุงคุณภาพและความปลอดภัยของบริการ</li>
          </ul>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>3. ระยะเวลาการเก็บรักษาข้อมูล</p>
          <p style={{ margin: '0 0 10px' }}>ข้อมูลส่วนบุคคลจะถูกเก็บรักษาตลอดระยะเวลาการใช้บริการและต่ออีก 5 ปีหลังสิ้นสุดสัญญา ตามข้อกำหนดทางศุลกากรและภาษีอากร</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>4. สิทธิ์ของเจ้าของข้อมูล</p>
          <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
            <li>สิทธิ์เข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
            <li>สิทธิ์แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>สิทธิ์ขอลบข้อมูล (ภายใต้ข้อกำหนดกฎหมาย)</li>
            <li>สิทธิ์คัดค้านหรือจำกัดการประมวลผลข้อมูล</li>
            <li>สิทธิ์ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล</li>
          </ul>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>5. การเปิดเผยข้อมูลต่อบุคคลที่สาม</p>
          <p style={{ margin: '0 0 10px' }}>ข้อมูลจะถูกส่งให้กรมศุลกากรและ NSW Thailand เพื่อการยื่นใบขนสินค้าเท่านั้น โดยไม่มีการขายหรือเปิดเผยแก่บุคคลภายนอกที่ไม่เกี่ยวข้อง ยกเว้นกรณีที่กฎหมายกำหนด</p>

          <p style={{ margin: '0 0 6px', fontWeight: 700, color: TEXT }}>6. ช่องทางติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</p>
          <p style={{ margin: 0 }}>หากมีคำถามหรือต้องการใช้สิทธิ์ตาม PDPA กรุณาติดต่อ: <strong>dpo@customs-edoc.th</strong> หรือโทร 02-xxx-xxxx ในวันและเวลาทำการ</p>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <CheckRow checked={tcOk} onChange={setTcOk}>
        ฉันได้อ่านและยอมรับ <strong>ข้อกำหนดการใช้งาน</strong> (Terms of Service v{TC_VERSION}) ที่อ้างอิงมาตรฐาน ISO/IEC 27001:2022 แล้ว
      </CheckRow>
      <CheckRow checked={pdpaOk} onChange={setPdpaOk}>
        ฉันยินยอมให้เก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคลตาม <strong>นโยบายความเป็นส่วนตัว</strong> ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
      </CheckRow>

      {err && (
        <div style={{ fontSize: 12, color: RED, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} disabled={loading} style={{ flex: 1, background: 'none', color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ← ย้อนกลับ
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !tcOk || !pdpaOk}
          style={{
            flex: 2, border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700,
            background: (loading || !tcOk || !pdpaOk) ? TEXT3 : GREEN,
            color: '#fff', cursor: (loading || !tcOk || !pdpaOk) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'กำลังสมัคร…' : 'สมัครใช้งาน'}
        </button>
      </div>
    </div>
  );
}

// ─── Success Screen ────────────────────────────────────────────────
function SuccessScreen({ result, onLogin }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: TEXT }}>สมัครใช้งานสำเร็จ!</h3>
      <p style={{ fontSize: 13, color: TEXT2, margin: '0 0 20px' }}>บัญชีของคุณอยู่ในสถานะ <strong style={{ color: BLUE }}>Trial</strong> — ทีมงานจะติดต่อกลับเพื่อเปิดใช้งานเต็มรูปแบบ</p>

      <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 16px', textAlign: 'left', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>ข้อมูลบริษัทที่ลงทะเบียน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: TEXT2 }}>รหัสบริษัท</span>
            <span style={{ fontFamily: MONO, fontWeight: 700, color: TEXT }}>{result.companyCode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: TEXT2 }}>อีเมล</span>
            <span style={{ color: TEXT }}>{result.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: TEXT2 }}>สถานะ</span>
            <span style={{ color: '#D97706', fontWeight: 600 }}>TRIAL</span>
          </div>
        </div>
      </div>

      <button onClick={onLogin} style={{ width: '100%', background: BLUE, color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        เข้าสู่ระบบ
      </button>
    </div>
  );
}

// ─── Main RegisterScreen ───────────────────────────────────────────
export default function RegisterScreen({ onBack }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    // Step 1 — Company
    companyNameTh: '', companyNameEn: '', taxId: '',
    address: '', postcode: '', companyPhone: '',
    // Step 2 — Admin
    fullName: '', jobTitle: '', email: '',
    adminPhone: '', password: '', confirmPassword: '',
  });

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (tcOk, pdpaOk) => {
    setLoading(true);
    setSubmitErr('');
    try {
      const { data } = await client.post('/auth/register/b2b', {
        companyNameTh: form.companyNameTh,
        companyNameEn: form.companyNameEn || undefined,
        taxId: form.taxId,
        address: form.address || undefined,
        postcode: form.postcode || undefined,
        companyPhone: form.companyPhone || undefined,
        fullName: form.fullName,
        jobTitle: form.jobTitle || undefined,
        email: form.email,
        adminPhone: form.adminPhone || undefined,
        password: form.password,
        tcAccepted: tcOk,
        pdpaAccepted: pdpaOk,
        tcVersion: TC_VERSION,
      });
      setResult(data);
    } catch (e) {
      const msg = e?.response?.data?.message;
      setSubmitErr(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่'));
    } finally {
      setLoading(false);
    }
  };

  // ── Stepper UI ────────────────────────────────────────────────────
  const Stepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 0 }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: i < step ? GREEN : i === step ? BLUE : BORDER,
              color: i <= step ? '#fff' : TEXT3,
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10, color: i === step ? BLUE : TEXT3, fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? GREEN : BORDER, margin: '0 8px', marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: BG, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11, background: '#0B1929',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, margin: '0 auto 12px',
          }}>⚓</div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', color: TEXT }}>
            CUSTOMS-EDOC
          </div>
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 3 }}>สมัครใช้งานสำหรับองค์กร (B2B)</div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16,
          padding: '28px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {result ? (
            <SuccessScreen result={result} onLogin={onBack} />
          ) : (
            <>
              <Stepper />
              {step === 0 && <StepCompany data={form} onChange={onChange} onNext={() => setStep(1)} />}
              {step === 1 && <StepAdmin data={form} onChange={onChange} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
              {step === 2 && <StepTerms onBack={() => setStep(1)} onSubmit={handleSubmit} loading={loading} err={submitErr} />}
            </>
          )}
        </div>

        {!result && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 12, color: TEXT3, cursor: 'pointer' }}>
              ← กลับไปหน้า Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
