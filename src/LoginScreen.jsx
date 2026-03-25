import { useState } from 'react';
import { useAuth } from './stores/AuthContext';

const BLUE  = '#0EA5E9';
const TEXT  = '#0F172A';
const TEXT2 = '#475569';
const TEXT3 = '#94A3B8';
const BORDER = '#E2E8F0';
const BG    = '#F8FAFC';
const MONO  = "'JetBrains Mono','Courier New',monospace";

export default function LoginScreen({ onRegister }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh', background: BG, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: '#0B1929',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 14px',
          }}>⚓</div>
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', color: TEXT }}>
            CUSTOMS-EDOC
          </div>
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 4 }}>
            ระบบใบขนสินค้าขาออกอิเล็กทรอนิกส์
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16,
          padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 800, color: TEXT }}>
            Sign in
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@customs-edoc.local"
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT,
                  background: BG, boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT,
                  background: BG, boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
                fontSize: 12, color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: loading ? TEXT3 : BLUE, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: TEXT3 }}>
          ยังไม่มีบัญชี?{' '}
          <button onClick={onRegister} style={{ background: 'none', border: 'none', color: BLUE, fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0 }}>
            สมัครใช้งาน (B2B)
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: TEXT3 }}>
          Powered by NSW Thailand · ebXML v2.0
        </div>
      </div>
    </div>
  );
}
