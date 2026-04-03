import { useContext } from "react";
import ToastContext from "../../stores/ToastContext.jsx";

const COLORS = {
  success: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", icon: "✓" },
  error:   { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "✕" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", icon: "!" },
  info:    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", icon: "i" },
};

export default function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      display: "flex", flexDirection: "column-reverse", gap: 8,
      maxWidth: 400, pointerEvents: "none",
    }}>
      {ctx.toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 10, padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "flex-start", gap: 10,
            pointerEvents: "auto",
            animation: "toast-in 0.25s ease-out",
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: c.border, color: c.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, flexShrink: 0,
            }}>{c.icon}</span>
            <span style={{ fontSize: 14, color: c.text, lineHeight: 1.4, flex: 1 }}>{t.message}</span>
            <button onClick={() => ctx.removeToast(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, color: c.text, opacity: 0.5, padding: 0, flexShrink: 0,
            }}>×</button>
          </div>
        );
      })}
      <style>{`@keyframes toast-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
