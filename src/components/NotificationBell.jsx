import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationsApi } from '../api/notificationsApi';

const POLL_INTERVAL = 30_000; // 30 seconds

const TYPE_ICONS = {
  JOB_STATUS_CHANGED:  '📦',
  JOB_CREATED:         '🆕',
  JOB_ASSIGNED:        '👤',
  APPROVAL_REQUESTED:  '📋',
  APPROVAL_APPROVED:   '✅',
  APPROVAL_REJECTED:   '❌',
  DECLARATION_READY:   '📄',
  NSW_RESPONSE:        '🔗',
  BILLING_INVOICE:     '💰',
  SYSTEM:              '🔔',
};

const TYPE_COLORS = {
  JOB_STATUS_CHANGED:  '#2563EB',
  JOB_CREATED:         '#16A34A',
  JOB_ASSIGNED:        '#7C3AED',
  APPROVAL_REQUESTED:  '#D97706',
  APPROVAL_APPROVED:   '#16A34A',
  APPROVAL_REJECTED:   '#DC2626',
  DECLARATION_READY:   '#0284C7',
  NSW_RESPONSE:        '#06B6D4',
  BILLING_INVOICE:     '#EC4899',
  SYSTEM:              '#64748B',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Poll unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      // silently fail — backend may not support yet
    }
  }, []);

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({ limit: 15 });
      setNotifications(res.data ?? []);
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling on mount
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          width: 36,
          height: 36,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--border-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="การแจ้งเตือน"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 16,
            height: 16,
            borderRadius: 99,
            background: '#EF4444',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
            boxShadow: '0 0 0 2px var(--bg-card)',
            animation: 'notifPulse 2s ease-in-out infinite',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            maxHeight: 480,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'notifSlideIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                การแจ้งเตือน
              </span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 99, background: '#EFF6FF', color: '#2563EB',
                }}>
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{
                background: 'none', border: 'none', fontSize: 13,
                color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
                padding: '4px 8px', borderRadius: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
            {loading && notifications.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>
                กำลังโหลด…
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 14, color: 'var(--text-light)' }}>
                  ยังไม่มีการแจ้งเตือน
                </div>
              </div>
            )}

            {notifications.map((n, i) => {
              const icon = TYPE_ICONS[n.type] || '🔔';
              const color = TYPE_COLORS[n.type] || '#64748B';
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
                    display: 'flex',
                    gap: 12,
                    cursor: n.isRead ? 'default' : 'pointer',
                    background: n.isRead ? 'transparent' : 'var(--primary-light)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--primary-light)'; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: n.isRead ? 500 : 700,
                      color: 'var(--text-main)', marginBottom: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {n.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#2563EB', flexShrink: 0,
                      marginTop: 4,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
