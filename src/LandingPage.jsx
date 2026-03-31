import { useState, useEffect, useRef } from 'react';
import { useAuth } from './stores/AuthContext';
import { colors, fonts } from './theme';

// ─── Brand tokens (from unified theme) ─────────────────────────────
const C = {
  navy:        colors.navy,
  navyMid:     colors.navyMid,
  primary:     colors.primary,
  primaryDark: colors.primaryHover,
  primaryLight:colors.primaryLight,
  accent:      colors.accent,
  accentGlow:  colors.accentGlow,
  gold:        colors.gold,
  green:       colors.success,
  red:         colors.danger,
  textWhite:   colors.textWhite,
  textGray:    colors.textGray,
  textMuted:   colors.textDim,
  textDark:    colors.textMain,
  cardBg:      colors.cardBg,
  cardBorder:  colors.cardBorder,
  glassBg:     colors.glassBg,
  glassBorder: colors.glassBorder,
  mono:        fonts.mono,
};

// ─── Intersection Observer hook for scroll animations ──────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
    }, { threshold: 0.15, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

// ─── Animated counter ──────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Particle background (subtle floating dots) ───────────────────
function ParticleField() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const size = 2 + Math.random() * 3;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 6 + Math.random() * 8;
        return (
          <div key={i} className="landing-particle" style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`,
            width: size, height: size, borderRadius: '50%',
            background: i % 3 === 0 ? C.accent : i % 3 === 1 ? C.primaryLight : C.gold,
            opacity: 0.15 + Math.random() * 0.2,
            animationDelay: `${delay}s`,
            animationDuration: `${dur}s`,
          }} />
        );
      })}
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────
function LoginModal({ open, onClose, onRegister }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="landing-modal-backdrop" onClick={onClose}>
      <div className="landing-modal-card" onClick={e => e.stopPropagation()}>
        <button className="landing-modal-close" onClick={onClose}>x</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', boxShadow: `0 4px 16px ${C.accentGlow}`,
          }}>⚓</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark, marginBottom: 4 }}>
            Sign in
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>เข้าสู่ระบบด้วยบัญชีองค์กร</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@customs-edoc.local" required
              className="landing-input"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="landing-input"
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 14 }}>
                {showPw ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: '#FEF2F2', border: '1px solid #FECACA',
              fontSize: 14, color: C.red,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} className="landing-login-btn">
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="landing-spinner" /> Signing in…
              </span>
            ) : 'เข้าสู่ระบบ →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: C.textMuted }}>
          ยังไม่มีบัญชี?{' '}
          <button onClick={() => { onClose(); onRegister(); }} style={{
            background: 'none', border: 'none', color: C.primary,
            fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0,
            textDecoration: 'underline', textUnderlineOffset: 3,
          }}>สมัครใช้งาน (B2B)</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: C.textGray }}>
          🔒 มาตรฐาน ISO 27001 · AES-256 Encryption
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────
function Navbar({ onScrollTo, onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', boxShadow: `0 4px 16px ${C.accentGlow}`,
          }}>⚓</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '1.5px', color: C.textWhite, fontFamily: C.mono }}>
              CUSTOMS-EDOC
            </div>
            <div style={{ fontSize: 11, color: C.textGray, letterSpacing: '0.5px' }}>NSW Thailand · ebXML v2.0</div>
          </div>
        </div>

        <div className="landing-nav-links">
          {[
            ['exchange', 'อัตราแลกเปลี่ยน'],
            ['news', 'ข่าวศุลกากร'],
            ['features', 'ฟีเจอร์'],
            ['how', 'วิธีใช้งาน'],
            ['customers', 'กลุ่มลูกค้า'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => onScrollTo(id)} className="landing-nav-link">{label}</button>
          ))}
        </div>

        <button onClick={onOpenLogin} className="landing-nav-cta">
          เข้าสู่ระบบ
        </button>
      </div>
    </nav>
  );
}

// ─── HERO SECTION (full-width, no login card) ─────────────────────
function HeroSection({ onOpenLogin, onRegister }) {
  const [ref, isInView] = useInView();

  return (
    <section id="hero" ref={ref} className="landing-hero">
      <ParticleField />
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.primary}20 0%, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.accent}15 0%, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="landing-hero-inner-full" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="landing-hero-badge" style={{ margin: '0 auto' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
          พร้อมให้บริการ · NSW Thailand Connected
        </div>

        <h1 className="landing-hero-title" style={{ textAlign: 'center' }}>
          ระบบใบขนสินค้า
          <span className="landing-gradient-text"> อิเล็กทรอนิกส์ </span>
          ครบวงจร
        </h1>

        <p className="landing-hero-desc" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          ยื่นใบขน กศก.101/1 ผ่าน National Single Window ด้วย AI
          ที่ช่วยกรอกข้อมูล ค้นหา HS Code อัตโนมัติ และจัดการ
          สิทธิประโยชน์ทางภาษี — ทั้งหมดในระบบเดียว
        </p>

        <div className="landing-hero-features" style={{ maxWidth: 520, margin: '0 auto' }}>
          {[
            { icon: '🤖', text: 'AI สกัดข้อมูลจากเอกสาร' },
            { icon: '📋', text: 'HS Code 15,913+ รายการ' },
            { icon: '🔗', text: 'เชื่อม NSW/ebXML อัตโนมัติ' },
            { icon: '🛡️', text: 'รองรับ 7 สิทธิประโยชน์' },
          ].map((f, i) => (
            <div key={i} className="landing-hero-feature-item"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: C.textGray }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="landing-hero-cta-row">
          <button onClick={onRegister} className="landing-hero-btn-primary">
            เริ่มต้นใช้งาน →
          </button>
          <button onClick={onOpenLogin} className="landing-hero-btn-secondary">
            เข้าสู่ระบบ
          </button>
        </div>

        <div className="landing-hero-trust" style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: C.textGray, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            มาตรฐาน
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['XSD v4.00', 'ebXML v2.0', 'ISO 27001', 'PDPA'].map(t => (
              <span key={t} style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px',
                borderRadius: 6, background: C.glassBg, border: `1px solid ${C.glassBorder}`,
                color: C.textGray, fontFamily: C.mono, letterSpacing: '0.3px',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── LIVE DATA STRIP (compact ticker below hero) ──────────────────
function LiveDataStrip({ rates, loading, onScrollTo }) {
  const highlighted = ['USD', 'EUR', 'JPY', 'CNY', 'GBP'];
  const topRates = highlighted.map(code => rates.find(r => r.code === code)).filter(Boolean);

  return (
    <div className="landing-ticker-strip">
      <div className="landing-ticker-inner">
        <div className="landing-ticker-date">
          {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="landing-ticker-rates">
          {loading ? (
            <span style={{ color: C.textGray, fontSize: 13 }}>กำลังโหลดอัตราแลกเปลี่ยน...</span>
          ) : topRates.length > 0 ? topRates.map(r => (
            <span key={r.code} className="landing-ticker-pill">
              <span style={{ fontWeight: 800, color: C.textWhite }}>{r.code}</span>
              <span style={{ color: C.accent, fontFamily: C.mono, fontWeight: 600 }}>
                {r.exportRate?.toFixed(4) || '—'}
              </span>
            </span>
          )) : (
            <span style={{ color: C.textGray, fontSize: 13 }}>ไม่สามารถโหลดข้อมูลได้</span>
          )}
        </div>
        <button onClick={() => onScrollTo('exchange')} className="landing-ticker-link">
          ดูทั้งหมด →
        </button>
      </div>
    </div>
  );
}

// ─── EXCHANGE RATE SECTION ────────────────────────────────────────
function ExchangeRateSection({ rates, fetchedAt, loading }) {
  const [ref, isInView] = useInView();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 10;

  const highlighted = ['USD', 'EUR', 'JPY'];
  const topRates = highlighted.map(code => rates.find(r => r.code === code)).filter(Boolean);

  const filtered = rates.filter(r =>
    r.currency.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="exchange" className="landing-section landing-section-dark">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.accent}20`, color: C.accent, borderColor: `${C.accent}40` }}>
            LIVE DATA
          </span>
          <h2 className="landing-section-title-dark">อัตราแลกเปลี่ยนวันนี้</h2>
          <p className="landing-section-sub-dark">
            ข้อมูลจากกรมศุลกากร · อัปเดตล่าสุด {fetchedAt ? new Date(fetchedAt).toLocaleTimeString('th-TH') : '—'}
          </p>
        </div>

        {loading ? (
          <div className="landing-rate-skeleton">
            {[1,2,3].map(i => <div key={i} className="landing-skeleton-card" />)}
          </div>
        ) : (
          <>
            {/* Highlight cards */}
            <div className="landing-rate-highlights">
              {topRates.map(r => (
                <div key={r.code} className="landing-rate-card">
                  <div style={{ fontSize: 14, color: C.textGray, marginBottom: 4 }}>{r.currency}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: C.mono, marginBottom: 8 }}>
                    {r.code}/THB
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textGray, marginBottom: 2 }}>ส่งออก</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.textWhite, fontFamily: C.mono }}>
                        {r.exportRate?.toFixed(4) || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textGray, marginBottom: 2 }}>นำเข้า</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.textWhite, fontFamily: C.mono }}>
                        {r.importRate?.toFixed(4) || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search + Table */}
            <div style={{ marginTop: 32 }}>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาสกุลเงิน... (เช่น USD, Dollar, สหรัฐ)"
                className="landing-rate-search"
              />

              <div className="landing-rate-table-wrap">
                <table className="landing-rate-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ประเทศ</th>
                      <th>สกุลเงิน</th>
                      <th>รหัส</th>
                      <th>อัตราส่งออก</th>
                      <th>อัตรานำเข้า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: C.textGray, padding: 32 }}>
                        {search ? 'ไม่พบสกุลเงินที่ค้นหา' : 'ไม่มีข้อมูล'}
                      </td></tr>
                    ) : (search ? filtered : filtered.slice(0, expanded ? filtered.length : VISIBLE_COUNT)).map((r, i) => (
                      <tr key={r.code}>
                        <td>{i + 1}</td>
                        <td>{r.country}</td>
                        <td>{r.currency}</td>
                        <td style={{ fontFamily: C.mono, fontWeight: 700, color: C.accent }}>{r.code}</td>
                        <td style={{ fontFamily: C.mono }}>{r.exportRate?.toFixed(4) || '—'}</td>
                        <td style={{ fontFamily: C.mono }}>{r.importRate?.toFixed(4) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!search && filtered.length > VISIBLE_COUNT && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={() => setExpanded(e => !e)} className="landing-rate-toggle">
                    {expanded ? 'แสดงน้อยลง ▲' : `ดูทั้งหมด ${filtered.length} สกุลเงิน ▼`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── NEWS FEED SECTION ────────────────────────────────────────────
function NewsFeedSection({ news, loading }) {
  const [ref, isInView] = useInView();

  const gradients = [
    `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
    `linear-gradient(135deg, ${C.accent}, ${C.green})`,
    `linear-gradient(135deg, #8B5CF6, ${C.primary})`,
    `linear-gradient(135deg, ${C.gold}, ${C.red})`,
    `linear-gradient(135deg, ${C.green}, ${C.accent})`,
    `linear-gradient(135deg, ${C.primaryDark}, #8B5CF6)`,
  ];

  return (
    <section id="news" className="landing-section landing-section-light">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.gold}15`, color: C.gold, borderColor: `${C.gold}40` }}>
            ข่าวศุลกากร
          </span>
          <h2 className="landing-section-title-light">ข่าวสารจากกรมศุลกากร</h2>
          <p className="landing-section-sub-light">อัปเดตล่าสุดจาก customs.go.th</p>
        </div>

        {loading ? (
          <div className="landing-news-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="landing-news-card">
                <div className="landing-news-thumb-skeleton" />
                <div style={{ padding: 20 }}>
                  <div className="landing-skeleton-line" style={{ width: '40%', marginBottom: 8 }} />
                  <div className="landing-skeleton-line" style={{ width: '100%', marginBottom: 6 }} />
                  <div className="landing-skeleton-line" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="landing-news-grid">
            {news.map((item, i) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="landing-news-card" style={{ animationDelay: `${i * 0.1}s`, textDecoration: 'none', color: 'inherit' }}>
                <div className="landing-news-thumb" style={{ background: gradients[i % gradients.length] }}>
                  <span style={{ fontSize: 32, opacity: 0.7 }}>📰</span>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div className="landing-news-meta">
                    <span>{item.date}</span>
                    {item.views > 0 && <span>· {item.views.toLocaleString()} views</span>}
                  </div>
                  <h3 className="landing-news-title">{item.title}</h3>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>อ่านต่อ →</span>
                </div>
              </a>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="https://www.customs.go.th" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 14, color: C.primary, fontWeight: 700, textDecoration: 'none' }}>
            ดูข่าวทั้งหมดที่ customs.go.th →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── PAIN POINTS ───────────────────────────────────────────────────
function PainPointsSection() {
  const [ref, isInView] = useInView();
  const cards = [
    { icon: '📝', color: '#EF4444', title: 'กรอกข้อมูลซ้ำ', desc: 'ข้อมูลเดิมๆ ต้องพิมพ์ใหม่ทุกครั้ง ใบขน Invoice Packing List — เสียเวลาหลายชั่วโมง' },
    { icon: '❌', color: '#F59E0B', title: 'เอกสารผิดพลาด', desc: 'HS Code ผิด น้ำหนักไม่ตรง FOB คำนวณพลาด — ถูก Reject ต้องแก้ไขยื่นใหม่' },
    { icon: '🔍', color: '#8B5CF6', title: 'ติดตามสถานะยาก', desc: 'ไม่รู้ว่าใบขนไปถึงไหนแล้ว ต้องโทรถามกรมศุลกากรเอง ไม่มี dashboard' },
  ];

  return (
    <section className="landing-section landing-section-dark">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.red}20`, color: C.red, borderColor: `${C.red}40` }}>
            ปัญหาที่พบบ่อย
          </span>
          <h2 className="landing-section-title-dark">การทำใบขนแบบเดิม<br />ยุ่งยากเกินไป</h2>
          <p className="landing-section-sub-dark">หลายบริษัทยังเสียเวลากับกระบวนการที่ทำซ้ำได้</p>
        </div>

        <div className="landing-pain-grid">
          {cards.map((card, i) => (
            <div key={i} className="landing-pain-card" style={{ animationDelay: `${i * 0.15}s`, borderLeft: `3px solid ${card.color}` }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${card.color}15`, border: `1px solid ${card.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 16,
              }}>{card.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.textWhite, marginBottom: 8 }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: C.textGray, lineHeight: 1.7, margin: 0 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ──────────────────────────────────────────────────────
function FeaturesSection() {
  const [ref, isInView] = useInView();
  const features = [
    { icon: '🤖', title: 'AI Document Extraction', desc: 'อัปโหลด Invoice + Packing List → AI สกัดข้อมูลและกรอก กศก.101/1 ให้อัตโนมัติ', color: C.primary },
    { icon: '🔎', title: 'HS Code Lookup', desc: 'ค้นหาจาก 15,913+ รหัส HS ตาม AHTN Protocol 2022 พร้อม auto-fill สถิติ/หน่วย/อัตราภาษี', color: C.accent },
    { icon: '🔗', title: 'NSW Integration', desc: 'ส่งข้อมูลผ่าน ebXML v2.0 ไปยัง National Single Window โดยตรง ไม่ต้องพิมพ์ซ้ำ', color: '#8B5CF6' },
    { icon: '🛡️', title: 'สิทธิประโยชน์ 7 ประเภท', desc: 'รองรับ BOI, Bond, Section 19, Re-export, FZ, IEAT, Compensation พร้อมระบบแนบเอกสาร', color: C.gold },
    { icon: '📊', title: 'Real-time Dashboard', desc: 'ติดตามสถานะทุก Shipment แบบ real-time พร้อม KPI charts และ billing summary', color: C.green },
    { icon: '💰', title: 'Billing & Invoice', desc: 'ระบบออกบิลอัตโนมัติ per-job หรือแบบ Term พร้อม PDF invoice และ payment tracking', color: '#EC4899' },
  ];

  return (
    <section id="features" className="landing-section landing-section-light">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.primary}12`, color: C.primary, borderColor: `${C.primary}30` }}>
            ฟีเจอร์หลัก
          </span>
          <h2 className="landing-section-title-light">ทุกเครื่องมือที่คุณต้องการ</h2>
          <p className="landing-section-sub-light">ระบบครบวงจรตั้งแต่สร้าง Shipment จนถึงผ่านพิธีการศุลกากร</p>
        </div>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${f.color}10`, border: `1px solid ${f.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textDark, marginBottom: 8, letterSpacing: '-0.2px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────
function HowItWorksSection() {
  const [ref, isInView] = useInView();
  const steps = [
    { num: '01', title: 'สมัครใช้งาน', desc: 'สมัครบัญชีองค์กร ยืนยันตัวตนด้วยเลขภาษี 13 หลัก และอัปโหลดหนังสือรับรอง', icon: '📋', color: C.primary },
    { num: '02', title: 'สร้าง Shipment', desc: 'อัปโหลดเอกสาร หรือกรอกข้อมูลเอง — AI ช่วย extract ข้อมูลและค้นหา HS Code', icon: '📦', color: C.accent },
    { num: '03', title: 'ส่งผ่าน NSW', desc: 'ระบบสร้าง กศก.101/1 ตาม XSD v4.00 และส่งผ่าน ebXML ไปยัง NSW Thailand', icon: '🚀', color: '#8B5CF6' },
    { num: '04', title: 'ติดตามสถานะ', desc: 'Monitor real-time ตั้งแต่ submitted → NSW processing → customs review → cleared', icon: '✅', color: C.green },
  ];

  return (
    <section id="how" className="landing-section landing-section-dark">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.accent}20`, color: C.accent, borderColor: `${C.accent}40` }}>
            วิธีใช้งาน
          </span>
          <h2 className="landing-section-title-dark">เริ่มได้ใน 4 ขั้นตอน</h2>
          <p className="landing-section-sub-dark">จากสมัครจนถึงผ่านพิธีการ — ง่ายกว่าที่คิด</p>
        </div>

        <div className="landing-steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="landing-step-card">
              <div className="landing-step-number" style={{ color: step.color }}>{step.num}</div>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${step.color}12`, border: `1px solid ${step.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 16px',
              }}>{step.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: C.textWhite, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: C.textGray, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATISTICS ────────────────────────────────────────────────────
function StatisticsSection() {
  const [ref, isInView] = useInView();
  const stats = [
    { value: 15913, suffix: '+', label: 'รหัส HS Code', icon: '🔎', desc: 'จาก AHTN Protocol 2022' },
    { value: 7, suffix: '', label: 'สิทธิประโยชน์', icon: '🛡️', desc: 'BOI · Bond · FZ · IEAT …' },
    { value: 101, suffix: '/1', label: 'กศก.', icon: '📄', desc: 'ใบขนสินค้าขาออก' },
    { value: 4, suffix: '.00', label: 'XSD Version', icon: '📐', desc: 'Export Declaration Schema' },
  ];

  return (
    <section id="stats" className="landing-section landing-section-gradient">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="landing-stat-card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: C.mono, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
                {isInView ? <AnimatedNumber target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TARGET CUSTOMERS ──────────────────────────────────────────────
function TargetCustomersSection() {
  const [ref, isInView] = useInView();
  const segments = [
    {
      icon: '🚢', title: 'Freight Forwarder',
      desc: 'ตัวแทนออกของ / ตัวแทนเรือ ที่ยื่นใบขนให้ลูกค้าหลายราย — ต้องการระบบ multi-tenant ที่แยกข้อมูลได้',
      features: ['Multi-customer management', 'Batch declaration', 'NSW automation'],
      gradient: `linear-gradient(135deg, ${C.primary}08, ${C.accent}08)`,
      borderColor: C.primary,
    },
    {
      icon: '🏭', title: 'โรงงานผู้ผลิต',
      desc: 'โรงงานที่ส่งออกสินค้าเอง — ต้องการกรอกข้อมูลง่าย HS Code ถูกต้อง และจัดการสิทธิประโยชน์ BOI/FZ',
      features: ['Manual declaration form', 'Product master catalog', 'Privilege document upload'],
      gradient: `linear-gradient(135deg, ${C.green}08, ${C.gold}08)`,
      borderColor: C.green,
    },
    {
      icon: '📦', title: 'Logistics Provider',
      desc: 'ผู้ให้บริการโลจิสติกส์ที่มีลูกค้าหลายราย — ต้องการ dashboard รวม billing และ performance tracking',
      features: ['Unified dashboard', 'Auto billing', 'Performance reports'],
      gradient: `linear-gradient(135deg, ${C.gold}08, #EC489908)`,
      borderColor: C.gold,
    },
  ];

  return (
    <section id="customers" className="landing-section landing-section-light">
      <div ref={ref} className="landing-container" style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-section-header">
          <span className="landing-tag" style={{ background: `${C.green}12`, color: C.green, borderColor: `${C.green}30` }}>
            กลุ่มเป้าหมาย
          </span>
          <h2 className="landing-section-title-light">ออกแบบมาสำหรับธุรกิจส่งออก</h2>
          <p className="landing-section-sub-light">ไม่ว่าจะเป็นตัวแทน โรงงาน หรือ logistics — เรามีโซลูชันให้</p>
        </div>

        <div className="landing-segments-grid">
          {segments.map((seg, i) => (
            <div key={i} className="landing-segment-card" style={{ background: seg.gradient, borderColor: `${seg.borderColor}20` }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{seg.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.textDark, marginBottom: 10 }}>{seg.title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{seg.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {seg.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textMuted }}>
                    <span style={{ color: seg.borderColor, fontSize: 14 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ────────────────────────────────────────────────────
function CTABanner({ onOpenLogin, onRegister }) {
  const [ref, isInView] = useInView();
  return (
    <section className="landing-section landing-cta-section">
      <div ref={ref} className="landing-container landing-cta-inner"
        style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s ease-out' }}>
        <div className="landing-cta-card">
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
            พร้อมเปลี่ยนการทำใบขน<br />ให้เร็วขึ้น?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 28, maxWidth: 500 }}>
            เริ่มต้นวันนี้ — สมัครฟรี ไม่มีค่าติดตั้ง ทดลองใช้ได้ทันที
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onRegister} className="landing-cta-btn-primary">
              สมัครใช้งานฟรี →
            </button>
            <button onClick={onOpenLogin} className="landing-cta-btn-secondary">
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────
function Footer({ onScrollTo }) {
  const cols = [
    { title: 'Product', links: ['ฟีเจอร์', 'Pricing', 'Roadmap', 'Changelog'] },
    { title: 'Resources', links: ['Documentation', 'API Reference', 'HS Code Lookup', 'XSD v4.00 Guide'] },
    { title: 'ข้อมูลศุลกากร', links: ['อัตราแลกเปลี่ยน', 'ข่าวกรมศุลกากร', 'สถิตินำเข้า-ส่งออก', 'customs.go.th'] },
    { title: 'Contact', links: ['support@customs-edoc.th', '02-XXX-XXXX', 'Line: @customs-edoc', 'Bangkok, Thailand'] },
  ];

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff',
              }}>⚓</div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: C.textWhite, fontFamily: C.mono }}>
                CUSTOMS-EDOC
              </div>
            </div>
            <p style={{ fontSize: 13, color: C.textGray, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
              ระบบยื่นใบขนสินค้าขาออกอิเล็กทรอนิกส์
              ผ่าน NSW Thailand · มาตรฐาน ISO 27001
            </p>
          </div>

          {cols.map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.textWhite, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
                {col.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link, j) => {
                  const scrollIds = { 'อัตราแลกเปลี่ยน': 'exchange', 'ข่าวกรมศุลกากร': 'news' };
                  const isScroll = scrollIds[link];
                  const isExternal = link === 'customs.go.th';
                  return isExternal ? (
                    <a key={j} href="https://www.customs.go.th" target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: C.textGray, cursor: 'pointer', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = C.textWhite}
                      onMouseLeave={e => e.currentTarget.style.color = C.textGray}>
                      {link}
                    </a>
                  ) : (
                    <span key={j} style={{ fontSize: 13, color: C.textGray, cursor: 'pointer', transition: 'color 0.15s' }}
                      onClick={isScroll ? () => onScrollTo(isScroll) : undefined}
                      onMouseEnter={e => e.currentTarget.style.color = C.textWhite}
                      onMouseLeave={e => e.currentTarget.style.color = C.textGray}>
                      {link}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="landing-footer-bottom">
          <div style={{ fontSize: 13, color: C.textGray }}>
            © 2026 NKTech Co., Ltd. · Customs-Edoc · All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['ebXML v2.0', 'XSD v4.00', 'NSW Thailand'].map(t => (
              <span key={t} style={{ fontSize: 11, fontFamily: C.mono, color: C.textGray, opacity: 0.6 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


// ═══════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage({ onRegister }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [rates, setRates] = useState([]);
  const [ratesFetchedAt, setRatesFetchedAt] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Fetch exchange rates
  useEffect(() => {
    fetch('/api/customs/exchange-rates')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates || []);
        setRatesFetchedAt(data.fetchedAt);
      })
      .catch(() => setRates([]))
      .finally(() => setRatesLoading(false));
  }, []);

  // Fetch news
  useEffect(() => {
    fetch('/api/customs/news?limit=6')
      .then(r => r.json())
      .then(data => setNews(data.news || []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openLogin = () => setLoginOpen(true);
  const closeLogin = () => setLoginOpen(false);

  return (
    <div className="landing-root">
      <Navbar onScrollTo={scrollTo} onOpenLogin={openLogin} />
      <HeroSection onOpenLogin={openLogin} onRegister={onRegister} />
      <LiveDataStrip rates={rates} loading={ratesLoading} onScrollTo={scrollTo} />
      <ExchangeRateSection rates={rates} fetchedAt={ratesFetchedAt} loading={ratesLoading} />
      <NewsFeedSection news={news} loading={newsLoading} />
      <PainPointsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatisticsSection />
      <TargetCustomersSection />
      <CTABanner onOpenLogin={openLogin} onRegister={onRegister} />
      <Footer onScrollTo={scrollTo} />
      <LoginModal open={loginOpen} onClose={closeLogin} onRegister={onRegister} />
    </div>
  );
}
