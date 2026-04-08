import { useState, useEffect, useCallback } from "react";
import { C } from "../constants";
import { cmsApi } from "../../api/cmsApi";

function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }, []);
  const Toast = msg ? (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 10,
      background: msg.type === "error" ? C.redBg : C.greenBg,
      border: `1px solid ${msg.type === "error" ? C.red : C.green}`,
      color: msg.type === "error" ? C.red : C.green,
      fontSize: 14, fontWeight: 600, boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }}>{msg.text}</div>
  ) : null;
  return { show, Toast };
}

export function ThemeEditorPage() {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await cmsApi.getTheme();
        setTheme(data);
        setForm(data || {});
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, updatedAt, ...payload } = form;
      const updated = await cmsApi.updateTheme(payload);
      setTheme(updated);
      setForm(updated);
      toast.show("Theme saved!");
    } catch (e) { toast.show("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (loading) return <div style={{ color: C.textDim, padding: 40 }}>Loading theme...</div>;

  const colorFields = [
    { key: "primary", label: "Primary" },
    { key: "primaryHover", label: "Primary Hover" },
    { key: "accent", label: "Accent" },
    { key: "success", label: "Success" },
    { key: "warning", label: "Warning" },
    { key: "danger", label: "Danger" },
    { key: "navy", label: "Navy" },
    { key: "navyMid", label: "Navy Mid" },
  ];

  const textFields = [
    { key: "fontSans", label: "Font Sans" },
    { key: "fontMono", label: "Font Mono" },
    { key: "logoIcon", label: "Logo Icon" },
    { key: "logoText", label: "Logo Text" },
    { key: "companyName", label: "Company Name" },
  ];

  const inputStyle = {
    width: "100%", background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, padding: "8px 12px", fontSize: 14,
  };
  const labelStyle = { display: "block", color: C.textMid, fontSize: 13, marginBottom: 4, fontWeight: 600 };

  return (
    <div>
      {toast.Toast}
      <h2 style={{ color: C.text, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>Theme Editor</h2>

      <h3 style={{ color: C.teal, fontSize: 15, marginBottom: 14 }}>Colors</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {colorFields.map(f => (
          <div key={f.key} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <label style={labelStyle}>{f.label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: form[f.key] || "#000",
                border: `2px solid ${C.borderHi}`, flexShrink: 0,
              }} />
              <input value={form[f.key] || ""} onChange={set(f.key)} style={inputStyle} />
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ color: C.teal, fontSize: 15, marginBottom: 14 }}>Fonts & Branding</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        {textFields.map(f => (
          <div key={f.key} style={f.key === "companyName" ? { gridColumn: "1/3" } : {}}>
            <label style={labelStyle}>{f.label}</label>
            <input value={form[f.key] || ""} onChange={set(f.key)} style={inputStyle} />
          </div>
        ))}
      </div>

      <button disabled={saving} onClick={handleSave} style={{
        background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
        padding: "12px 32px", cursor: "pointer", fontWeight: 700, fontSize: 15, opacity: saving ? 0.6 : 1,
      }}>{saving ? "Saving..." : "Save Theme"}</button>
    </div>
  );
}
