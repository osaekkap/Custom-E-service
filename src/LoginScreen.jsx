import { useState } from 'react';
import { useAuth } from './stores/AuthContext';

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
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px', color: '#fff'
          }}>⚓</div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-main)' }}>
            CUSTOMS-EDOC
          </div>
          <div className="text-muted" style={{ fontSize: '16px', marginTop: '6px' }}>
            ระบบใบขนสินค้าขาออกอิเล็กทรอนิกส์
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '36px 32px' }}>
          <h2 style={{ margin: '0 0 28px', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>
            Sign in
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label className="text-muted" style={{ fontSize: '15px', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@customs-edoc.local"
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid var(--border-main)', fontSize: '17px', color: 'var(--text-main)',
                  background: 'var(--bg-card)', boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label className="text-muted" style={{ fontSize: '15px', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid var(--border-main)', fontSize: '17px', color: 'var(--text-main)',
                  background: 'var(--bg-card)', boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
                background: 'var(--danger-light)', border: '1px solid #FECACA',
                fontSize: '16px', color: 'var(--danger)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: loading ? 'var(--text-light)' : 'var(--primary)', color: '#fff',
                fontSize: '18px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease, transform 0.1s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '16px', color: 'var(--text-muted)' }}>
          ยังไม่มีบัญชี?{' '}
          <button onClick={onRegister} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '16px', cursor: 'pointer', padding: 0 }}>
            สมัครใช้งาน (B2B)
          </button>
        </div>
        <div className="text-light" style={{ textAlign: 'center', marginTop: '16px', fontSize: '15px' }}>
          Powered by NSW Thailand · ebXML v2.0
        </div>
      </div>
    </div>
  );
}
