import { useState } from 'react';
import client from './api/client';
import { colors, fonts } from './theme';

const BLUE   = colors.primary;
const BLUE2  = colors.primaryHover;
const TEXT   = colors.textMain;
const TEXT2  = colors.textMuted;
const TEXT3  = colors.textLight;
const BORDER = colors.borderMain;
const RED    = colors.danger;
const GREEN  = colors.success;
const MONO   = fonts.mono;

const TC_VERSION = '2026-v1';
const STEPS = ['ข้อมูลบริษัท', 'ผู้ดูแลระบบ', 'เงื่อนไขการใช้งาน'];

// ─── Input ────────────────────────────────────────────────────────
function Input({ label, required, hint, icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize:13, fontWeight:600, color:TEXT2, display:'block', marginBottom:6 }}>
        {label} {required && <span style={{ color:RED }}>*</span>}
      </label>
      <div style={{ position:'relative' }}>
        {icon && (
          <span style={{
            position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
            fontSize:15, pointerEvents:'none', color:TEXT3,
          }}>{icon}</span>
        )}
        <input {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width:'100%', padding: icon ? '10px 12px 10px 36px' : '10px 14px',
            borderRadius:10, fontSize:15, color:TEXT, background:'#FFFFFF',
            border:`1.5px solid ${focused ? BLUE : BORDER}`,
            boxSizing:'border-box', outline:'none',
            boxShadow: focused ? `0 0 0 3px ${BLUE}22` : 'none',
            transition:'border-color 0.15s, box-shadow 0.15s',
            ...props.style,
          }}
        />
      </div>
      {hint && <p style={{ fontSize:12, color:TEXT3, margin:'4px 0 0' }}>{hint}</p>}
    </div>
  );
}

// ─── FileInput ────────────────────────────────────────────────────
function FileInput({ label, required, accept, onChange, file }) {
  const [hover, setHover] = useState(false);
  return (
    <div>
      <label style={{ fontSize:13, fontWeight:600, color:TEXT2, display:'block', marginBottom:6 }}>
        {label} {required && <span style={{ color:RED }}>*</span>}
      </label>
      <label
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:6, padding:'16px 12px',
          border:`1.5px dashed ${file ? '#86EFAC' : hover ? BLUE : BORDER}`,
          borderRadius:10, background: file ? '#F0FDF4' : hover ? '#EFF6FF' : '#FAFAFA',
          cursor:'pointer', transition:'all 0.15s', minHeight:80,
        }}
      >
        <span style={{ fontSize:22 }}>{file ? '✅' : '📎'}</span>
        <span style={{ fontSize:13, fontWeight:600, color: file ? GREEN : hover ? BLUE : TEXT2, textAlign:'center', lineHeight:1.4 }}>
          {file ? file.name : 'คลิกเพื่อเลือกไฟล์'}
        </span>
        {!file && <span style={{ fontSize:11, color:TEXT3 }}>{accept?.includes('image') ? 'PDF หรือรูปภาพ' : 'PDF เท่านั้น'} · ไม่เกิน 5 MB</span>}
        <input type="file" accept={accept} onChange={onChange} style={{ display:'none' }} />
      </label>
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
function PasswordInput({ label, required, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize:13, fontWeight:600, color:TEXT2, display:'block', marginBottom:6 }}>
        {label} {required && <span style={{ color:RED }}>*</span>}
      </label>
      <div style={{ position:'relative' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width:'100%', padding:'10px 40px 10px 14px', borderRadius:10, fontSize:15, color:TEXT,
            background:'#FFFFFF', border:`1.5px solid ${focused ? BLUE : BORDER}`, boxSizing:'border-box',
            outline:'none', boxShadow: focused ? `0 0 0 3px ${BLUE}22` : 'none', transition:'all 0.15s',
          }}
        />
        <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
          style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color: show ? BLUE : TEXT3, display:'flex', alignItems:'center', padding:4 }}>
          {show ? <EyeOpen /> : <EyeOff />}
        </button>
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontSize:13, fontWeight:700, color:TEXT2, textTransform:'uppercase', letterSpacing:'0.06em' }}>{children}</span>
    </div>
  );
}

// ─── Step 1: Company Info ─────────────────────────────────────────
function StepCompany({ data, onChange, onNext }) {
  const [err, setErr] = useState('');
  const ok = () => {
    if (!data.companyNameTh.trim()) return setErr('กรุณากรอกชื่อบริษัท (ภาษาไทย)');
    if (!/^\d{13}$/.test(data.taxId)) return setErr('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
    if (!data.companyCert) return setErr('กรุณาอัปโหลดหนังสือรับรองบริษัท');
    if (!data.pp20) return setErr('กรุณาอัปโหลดใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)');
    setErr(''); onNext();
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <SectionTitle icon="🏢">ข้อมูลบริษัท</SectionTitle>

      <Input label="ชื่อบริษัท (ภาษาไทย)" required icon="🏛️"
        placeholder="บริษัท ไทยอิเล็กทรอนิกส์ จำกัด"
        value={data.companyNameTh} onChange={e => onChange('companyNameTh', e.target.value)} />

      <Input label="Company Name (English)" icon="🌐"
        placeholder="Thai Electronics Co., Ltd."
        value={data.companyNameEn} onChange={e => onChange('companyNameEn', e.target.value)} />

      <Input label="เลขประจำตัวผู้เสียภาษีอากร" required icon="🪪"
        placeholder="0000000000000 (13 หลัก)"
        value={data.taxId} onChange={e => onChange('taxId', e.target.value)} maxLength={13}
        hint="เลขประจำตัว 13 หลักจากกรมสรรพากร" />

      <Input label="ที่อยู่บริษัท" icon="📍"
        placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
        value={data.address} onChange={e => onChange('address', e.target.value)} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="รหัสไปรษณีย์" placeholder="10400"
          value={data.postcode} onChange={e => onChange('postcode', e.target.value)} maxLength={10} />
        <Input label="เบอร์โทรบริษัท" icon="📞" placeholder="02-000-0000"
          value={data.companyPhone} onChange={e => onChange('companyPhone', e.target.value)} />
      </div>

      <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:16, marginTop:4 }}>
        <SectionTitle icon="📄">เอกสารประกอบ</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <FileInput label="หนังสือรับรองบริษัท" required accept=".pdf"
            file={data.companyCert} onChange={e => onChange('companyCert', e.target.files[0])} />
          <FileInput label="ภ.พ.20 (ทะเบียน VAT)" required accept=".pdf,image/*"
            file={data.pp20} onChange={e => onChange('pp20', e.target.files[0])} />
        </div>
      </div>

      {err && <ErrBox>{err}</ErrBox>}

      <button onClick={ok} style={{
        width:'100%', background:`linear-gradient(135deg,${BLUE},${BLUE2})`, color:'#fff',
        border:'none', borderRadius:10, padding:'12px', fontSize:15, fontWeight:700,
        cursor:'pointer', boxShadow:`0 4px 14px ${BLUE}44`,
        transition:'opacity 0.15s',
      }} onMouseEnter={e => e.currentTarget.style.opacity='0.9'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
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
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) return setErr('รหัสผ่านต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข');
    if (data.password !== data.confirmPassword) return setErr('รหัสผ่านไม่ตรงกัน');
    setErr(''); onNext();
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <SectionTitle icon="👤">ข้อมูลผู้ดูแลระบบ</SectionTitle>

      <div style={{ padding:'10px 14px', background:'#EFF6FF', borderRadius:10, border:'1px solid #BFDBFE', fontSize:14, color:'#1D4ED8', display:'flex', gap:10, alignItems:'center' }}>
        <span style={{ fontSize:20 }}>🛡️</span>
        <span>บัญชีนี้จะมีสิทธิ์ระดับ <strong>Admin</strong> — จัดการผู้ใช้และข้อมูลทั้งหมดของบริษัทได้</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="ชื่อ-นามสกุล" required icon="👤" placeholder="สมชาย ใจดี"
          value={data.fullName} onChange={e => onChange('fullName', e.target.value)} />
        <Input label="ตำแหน่งงาน" icon="💼" placeholder="ผู้จัดการฝ่ายส่งออก"
          value={data.jobTitle} onChange={e => onChange('jobTitle', e.target.value)} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="อีเมล" required type="email" icon="✉️" placeholder="admin@company.com"
          value={data.email} onChange={e => onChange('email', e.target.value)} />
        <Input label="เบอร์โทรติดต่อ" icon="📱" placeholder="081-000-0000"
          value={data.adminPhone} onChange={e => onChange('adminPhone', e.target.value)} />
      </div>

      <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:16 }}>
        <SectionTitle icon="🔑">รหัสผ่าน</SectionTitle>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <PasswordInput label="รหัสผ่าน" required placeholder="อย่างน้อย 8 ตัว · A-Z a-z 0-9"
            value={data.password} onChange={e => onChange('password', e.target.value)} />
          <PasswordInput label="ยืนยันรหัสผ่าน" required placeholder="••••••••"
            value={data.confirmPassword} onChange={e => onChange('confirmPassword', e.target.value)} />
        </div>
      </div>

      {err && <ErrBox>{err}</ErrBox>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10 }}>
        <BtnSecondary onClick={onBack}>← ย้อนกลับ</BtnSecondary>
        <BtnPrimary onClick={ok}>ถัดไป →</BtnPrimary>
      </div>
    </div>
  );
}

// ─── Step 3: Terms ────────────────────────────────────────────────
function StepTerms({ onBack, onSubmit, loading, err }) {
  const [tcOk, setTcOk] = useState(false);
  const [pdpaOk, setPdpaOk] = useState(false);
  const allOk = tcOk && pdpaOk;

  const handleSubmit = () => {
    if (!tcOk) return alert('กรุณายอมรับข้อกำหนดการใช้งานก่อน');
    if (!pdpaOk) return alert('กรุณายอมรับนโยบายความเป็นส่วนตัว (PDPA) ก่อน');
    onSubmit(tcOk, pdpaOk);
  };

  const DocBox = ({ title, badge, children }) => (
    <div style={{ border:`1px solid ${BORDER}`, borderRadius:10, overflow:'hidden' }}>
      <div style={{ padding:'10px 14px', background:'#F9FAFB', borderBottom:`1px solid ${BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>{title}</span>
        <span style={{ fontSize:11, fontFamily:MONO, color:TEXT3, background:'#F1F5F9', padding:'2px 8px', borderRadius:4 }}>{badge}</span>
      </div>
      <div style={{ maxHeight:160, overflowY:'auto', padding:'14px', fontSize:13.5, color:TEXT2, lineHeight:1.7 }}>{children}</div>
    </div>
  );

  const CheckRow = ({ checked, onChange, children }) => (
    <label style={{
      display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', padding:'12px 14px',
      background: checked ? '#F0FDF4' : '#FAFAFA',
      borderRadius:10, border:`1.5px solid ${checked ? '#86EFAC' : BORDER}`, transition:'all 0.15s',
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ marginTop:2, accentColor:GREEN, width:16, height:16, flexShrink:0 }} />
      <span style={{ fontSize:14, color:TEXT2, lineHeight:1.5 }}>{children}</span>
    </label>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SectionTitle icon="📋">เงื่อนไขการใช้งาน</SectionTitle>

      <DocBox title="ข้อกำหนดการใช้งาน (Terms of Service)" badge={`v${TC_VERSION} · ISO 27001`}>
        <p style={{ margin:'0 0 8px', fontWeight:700, color:TEXT }}>1. ขอบเขตการให้บริการ</p>
        <p style={{ margin:'0 0 8px' }}>Customs-Edoc ให้บริการระบบยื่นใบขนสินค้าออกอิเล็กทรอนิกส์ผ่าน NSW Thailand สำหรับองค์กรธุรกิจ</p>
        <p style={{ margin:'0 0 8px', fontWeight:700, color:TEXT }}>2. มาตรฐานความปลอดภัย (ISO 27001:2022)</p>
        <ul style={{ margin:'0 0 8px', paddingLeft:18 }}>
          <li>Access Control — RBAC แยกสิทธิ์รายบุคคล</li>
          <li>Cryptography — AES-256 สำหรับข้อมูลสำคัญ</li>
          <li>Audit Log — บันทึกทุกการกระทำในระบบ</li>
          <li>Backup — สำรองข้อมูลทุก 24 ชม. เก็บ 90 วัน</li>
        </ul>
        <p style={{ margin:'0 0 8px', fontWeight:700, color:TEXT }}>3. ความรับผิดชอบผู้ใช้</p>
        <ul style={{ margin:0, paddingLeft:18 }}>
          <li>ให้ข้อมูลที่ถูกต้องในการยื่นใบขน</li>
          <li>รักษาความลับของรหัสผ่าน</li>
          <li>ปฏิบัติตาม พ.ร.บ.ศุลกากร พ.ศ. 2560</li>
        </ul>
      </DocBox>

      <DocBox title="นโยบายความเป็นส่วนตัว (Privacy Policy)" badge="PDPA พ.ร.บ. 2562">
        <p style={{ margin:'0 0 8px', fontWeight:700, color:TEXT }}>ข้อมูลที่เก็บรวบรวม</p>
        <ul style={{ margin:'0 0 8px', paddingLeft:18 }}>
          <li><strong>ข้อมูลตัวตน:</strong> ชื่อ อีเมล เบอร์โทร ตำแหน่ง</li>
          <li><strong>ข้อมูลองค์กร:</strong> ชื่อบริษัท เลขภาษี ที่อยู่</li>
          <li><strong>ข้อมูลศุลกากร:</strong> ใบขนสินค้า HS Code มูลค่า</li>
        </ul>
        <p style={{ margin:'0 0 8px', fontWeight:700, color:TEXT }}>การเปิดเผยข้อมูล</p>
        <p style={{ margin:'0 0 8px' }}>ข้อมูลจะถูกส่งให้กรมศุลกากรและ NSW Thailand เพื่อยื่นใบขนเท่านั้น ไม่ขายหรือเปิดเผยต่อบุคคลภายนอก</p>
        <p style={{ margin:'0 0 4px', fontWeight:700, color:TEXT }}>ติดต่อ DPO</p>
        <p style={{ margin:0 }}>dpo@customs-edoc.th | 02-xxx-xxxx</p>
      </DocBox>

      <CheckRow checked={tcOk} onChange={setTcOk}>
        ฉันได้อ่านและยอมรับ <strong>ข้อกำหนดการใช้งาน</strong> (Terms of Service v{TC_VERSION}) อ้างอิง ISO/IEC 27001:2022
      </CheckRow>
      <CheckRow checked={pdpaOk} onChange={setPdpaOk}>
        ฉันยินยอมให้เก็บและประมวลผลข้อมูลส่วนบุคคลตาม <strong>นโยบายความเป็นส่วนตัว</strong> ภายใต้ พ.ร.บ. PDPA 2562
      </CheckRow>

      {err && <ErrBox>{err}</ErrBox>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10 }}>
        <BtnSecondary onClick={onBack} disabled={loading}>← ย้อนกลับ</BtnSecondary>
        <button onClick={handleSubmit} disabled={loading || !allOk} style={{
          border:'none', borderRadius:10, padding:'12px', fontSize:15, fontWeight:700,
          background: allOk && !loading ? `linear-gradient(135deg,${GREEN},#15803D)` : TEXT3,
          color:'#fff', cursor: allOk && !loading ? 'pointer' : 'not-allowed',
          boxShadow: allOk ? `0 4px 14px ${GREEN}44` : 'none',
          transition:'all 0.15s',
        }}>
          {loading ? '⏳ กำลังสมัคร…' : '✅ สมัครใช้งาน'}
        </button>
      </div>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────
function SuccessScreen({ result, onLogin }) {
  return (
    <div style={{ textAlign:'center', padding:'10px 0' }}>
      <div style={{
        width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#DCFCE7,#BBF7D0)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:36,
        margin:'0 auto 20px', boxShadow:'0 8px 24px #16A34A33',
      }}>✅</div>
      <h3 style={{ margin:'0 0 8px', fontSize:22, fontWeight:800, color:TEXT }}>สมัครสำเร็จ!</h3>
      <p style={{ fontSize:15, color:TEXT2, margin:'0 0 24px' }}>
        บัญชีของคุณอยู่ในสถานะ <strong style={{ color:'#D97706' }}>Trial</strong><br/>ทีมงานจะติดต่อกลับเพื่อเปิดใช้งานเต็มรูปแบบ
      </p>
      <div style={{ background:'#F9FAFB', border:`1px solid ${BORDER}`, borderRadius:12, padding:'16px 18px', textAlign:'left', marginBottom:24 }}>
        <div style={{ fontSize:12, fontWeight:700, color:TEXT3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>รายละเอียดบัญชี</div>
        {[
          ['รหัสบริษัท', result.companyCode, true],
          ['อีเมล', result.email, false],
          ['สถานะ', 'TRIAL', false],
        ].map(([label, val, isMono]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, padding:'6px 0', borderBottom:`1px solid ${BORDER}` }}>
            <span style={{ color:TEXT2 }}>{label}</span>
            <span style={{ fontFamily: isMono ? MONO : 'inherit', fontWeight:700, color: val === 'TRIAL' ? '#D97706' : TEXT }}>{val}</span>
          </div>
        ))}
      </div>
      <button onClick={onLogin} style={{
        width:'100%', background:`linear-gradient(135deg,${BLUE},${BLUE2})`, color:'#fff',
        border:'none', borderRadius:10, padding:'12px', fontSize:15, fontWeight:700, cursor:'pointer',
        boxShadow:`0 4px 14px ${BLUE}44`,
      }}>
        เข้าสู่ระบบ →
      </button>
    </div>
  );
}

// ─── Shared Buttons & Error ───────────────────────────────────────
function BtnPrimary({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? TEXT3 : `linear-gradient(135deg,${BLUE},${BLUE2})`,
      color:'#fff', border:'none', borderRadius:10, padding:'12px', fontSize:15, fontWeight:700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : `0 4px 14px ${BLUE}44`, transition:'all 0.15s',
    }} onMouseEnter={e => !disabled && (e.currentTarget.style.opacity='0.9')}
       onMouseLeave={e => (e.currentTarget.style.opacity='1')}>
      {children}
    </button>
  );
}
function BtnSecondary({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:'#fff', color:TEXT2, border:`1.5px solid ${BORDER}`,
      borderRadius:10, padding:'12px', fontSize:15, fontWeight:600,
      cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 0.15s',
    }} onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor=BLUE, e.currentTarget.style.color=BLUE)}
       onMouseLeave={e => (e.currentTarget.style.borderColor=BORDER, e.currentTarget.style.color=TEXT2)}>
      {children}
    </button>
  );
}
function ErrBox({ children }) {
  return (
    <div style={{
      fontSize:14, color:'#991B1B', padding:'10px 14px',
      background:'#FEF2F2', borderRadius:8,
      borderLeft:`3px solid ${RED}`,
    }}>
      ⚠️ {children}
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
    companyNameTh:'', companyNameEn:'', taxId:'',
    address:'', postcode:'', companyPhone:'',
    companyCert:null, pp20:null,
    fullName:'', jobTitle:'', email:'',
    adminPhone:'', password:'', confirmPassword:'',
  });

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (tcOk, pdpaOk) => {
    setLoading(true); setSubmitErr('');
    try {
      const formData = new FormData();
      formData.append('companyNameTh', form.companyNameTh);
      if (form.companyNameEn) formData.append('companyNameEn', form.companyNameEn);
      formData.append('taxId', form.taxId);
      if (form.address) formData.append('address', form.address);
      if (form.postcode) formData.append('postcode', form.postcode);
      if (form.companyPhone) formData.append('companyPhone', form.companyPhone);
      formData.append('fullName', form.fullName);
      if (form.jobTitle) formData.append('jobTitle', form.jobTitle);
      formData.append('email', form.email);
      if (form.adminPhone) formData.append('adminPhone', form.adminPhone);
      formData.append('password', form.password);
      formData.append('tcAccepted', tcOk);
      formData.append('pdpaAccepted', pdpaOk);
      formData.append('tcVersion', TC_VERSION);
      if (form.companyCert) formData.append('companyCert', form.companyCert);
      if (form.pp20) formData.append('pp20', form.pp20);

      const { data } = await client.post('/auth/register/b2b', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (e) {
      const msg = e?.response?.data?.message;
      setSubmitErr(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่'));
    } finally {
      setLoading(false);
    }
  };

  // ── Stepper ────────────────────────────────────────────────────
  const Stepper = () => (
    <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
      {STEPS.map((label, i) => {
        const done = i < step, active = i === step;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:700, transition:'all 0.2s',
                background: done ? GREEN : active ? BLUE : '#F3F4F6',
                color: (done || active) ? '#fff' : TEXT3,
                boxShadow: active ? `0 0 0 4px ${BLUE}22` : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:12, fontWeight: active ? 700 : 400, color: active ? BLUE : done ? GREEN : TEXT3, whiteSpace:'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, margin:'0 8px', marginBottom:18, borderRadius:2,
                background: i < step ? GREEN : '#E5E7EB',
                transition:'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0FDF4 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Sarabun','DM Sans','Segoe UI',system-ui,sans-serif",
      padding:'24px 16px',
    }}>
      <div style={{ width:'100%', maxWidth:520 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:`linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, margin:'0 auto 14px',
            boxShadow:`0 8px 24px ${BLUE}44`,
          }}>⚓</div>
          <div style={{ fontFamily:MONO, fontSize:14, fontWeight:800, letterSpacing:'2px', color:TEXT }}>
            CUSTOMS-EDOC
          </div>
          <div style={{ fontSize:14, color:TEXT3, marginTop:4 }}>สมัครใช้งานสำหรับองค์กร (B2B)</div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.95)',
          backdropFilter:'blur(12px)',
          border:`1px solid ${BORDER}`,
          borderRadius:20,
          padding:'32px 32px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.08)',
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
          <div style={{ textAlign:'center', marginTop:20 }}>
            <button onClick={onBack} style={{ background:'none', border:'none', fontSize:14, color:TEXT3, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color=BLUE}
              onMouseLeave={e => e.currentTarget.style.color=TEXT3}>
              ← กลับไปหน้า Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
