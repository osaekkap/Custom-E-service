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

function SectionEditForm({ section, saving, onSave, onError }) {
  const [title, setTitle] = useState(section.title || "");
  const [subtitle, setSubtitle] = useState(section.subtitle || "");
  const [tagText, setTagText] = useState(section.tagText || "");
  const [tagColor, setTagColor] = useState(section.tagColor || "");
  const [metadata, setMetadata] = useState(JSON.stringify(section.metadata || {}, null, 2));

  const inputStyle = {
    width: "100%", background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, padding: "8px 12px", fontSize: 14,
  };
  const labelStyle = { display: "block", color: C.textMid, fontSize: 13, marginBottom: 4, fontWeight: 600 };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ gridColumn: "1/3" }}>
        <label style={labelStyle}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ gridColumn: "1/3" }}>
        <label style={labelStyle}>Subtitle</label>
        <input value={subtitle} onChange={e => setSubtitle(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Tag Text</label>
        <input value={tagText} onChange={e => setTagText(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Tag Color</label>
        <input value={tagColor} onChange={e => setTagColor(e.target.value)} style={inputStyle} placeholder="#2563EB" />
      </div>
      <div style={{ gridColumn: "1/3" }}>
        <label style={labelStyle}>Metadata (JSON)</label>
        <textarea value={metadata} onChange={e => setMetadata(e.target.value)}
          style={{ ...inputStyle, minHeight: 100, fontFamily: C.mono, fontSize: 12 }} />
      </div>
      <div style={{ gridColumn: "1/3" }}>
        <button disabled={saving} onClick={() => {
          let meta;
          try { meta = JSON.parse(metadata); } catch { onError?.("Invalid JSON in metadata"); return; }
          onSave({ title, subtitle: subtitle || null, tagText: tagText || null, tagColor: tagColor || null, metadata: meta });
        }} style={{
          background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
          padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: saving ? 0.6 : 1,
        }}>{saving ? "Saving..." : "Save Section"}</button>
      </div>
    </div>
  );
}

function CardEditModal({ card, saving, onSave, onClose, onError }) {
  const [icon, setIcon] = useState(card?.icon || "");
  const [title, setTitle] = useState(card?.title || "");
  const [desc, setDesc] = useState(card?.description || "");
  const [color, setColor] = useState(card?.color || "");
  const [visible, setVisible] = useState(card?.isVisible ?? true);
  const [metadata, setMetadata] = useState(JSON.stringify(card?.metadata || {}, null, 2));

  const inputStyle = {
    width: "100%", background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, padding: "8px 12px", fontSize: 14,
  };
  const labelStyle = { display: "block", color: C.textMid, fontSize: 13, marginBottom: 4, fontWeight: 600 };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 500,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg1, border: `1px solid ${C.borderHi}`, borderRadius: 14,
        padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
      }}>
        <h3 style={{ margin: "0 0 18px", color: C.text, fontSize: 18 }}>{card?.id ? "Edit Card" : "New Card"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Icon</label>
            <input value={icon} onChange={e => setIcon(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ ...inputStyle, minHeight: 70 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Color</label>
            <input value={color} onChange={e => setColor(e.target.value)} style={inputStyle} placeholder="#2563EB" />
          </div>
          <div>
            <label style={labelStyle}>Visible</label>
            <button onClick={() => setVisible(v => !v)} style={{
              ...inputStyle, cursor: "pointer", textAlign: "center",
              background: visible ? C.greenBg : C.redBg, color: visible ? C.green : C.red,
              border: `1px solid ${visible ? C.green : C.red}`,
            }}>{visible ? "✓ Visible" : "✗ Hidden"}</button>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Metadata (JSON)</label>
          <textarea value={metadata} onChange={e => setMetadata(e.target.value)}
            style={{ ...inputStyle, minHeight: 70, fontFamily: C.mono, fontSize: 12 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={saving || !title.trim()} onClick={() => {
            let meta;
            try { meta = JSON.parse(metadata); } catch { onError?.("Invalid JSON in metadata"); return; }
            onSave({
              icon: icon || null, title, description: desc || null,
              color: color || null, isVisible: visible, metadata: meta,
            });
          }} style={{
            background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
            padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: saving ? 0.6 : 1,
          }}>{saving ? "Saving..." : "Save"}</button>
          <button onClick={onClose} style={{
            background: C.bg3, color: C.textMid, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function LandingPageManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // section being edited
  const [cardEdit, setCardEdit] = useState(null);  // { sectionId, card } or { sectionId, card: null } for new
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getSections();
      setSections(data);
    } catch (e) { console.error("CMS load error", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleVisible = async (sec) => {
    try {
      await cmsApi.updateSection(sec.id, { isVisible: !sec.isVisible });
      setSections(prev => prev.map(s => s.id === sec.id ? { ...s, isVisible: !s.isVisible } : s));
      toast.show(sec.isVisible ? "Section hidden" : "Section visible");
    } catch (e) { toast.show("Error: " + e.message, "error"); }
  };

  const handleSaveSection = async (id, data) => {
    setSaving(true);
    try {
      await cmsApi.updateSection(id, data);
      await load();
      setEditing(null);
      toast.show("Section saved!");
    } catch (e) { toast.show("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleSaveCard = async (sectionId, card, data) => {
    setSaving(true);
    try {
      if (card?.id) {
        await cmsApi.updateCard(sectionId, card.id, data);
      } else {
        await cmsApi.createCard(sectionId, data);
      }
      await load();
      setCardEdit(null);
      toast.show(card?.id ? "Card updated!" : "Card created!");
    } catch (e) { toast.show("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDeleteCard = async (sectionId, cardId) => {
    if (!confirm("ลบ card นี้?")) return;
    try {
      await cmsApi.deleteCard(sectionId, cardId);
      await load();
      toast.show("Card deleted");
    } catch (e) { toast.show("Error: " + e.message, "error"); }
  };

  const handleMoveSection = async (idx, dir) => {
    const arr = [...sections];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    const items = arr.map((s, i) => ({ id: s.id, sortOrder: i }));
    setSections(arr);
    try { await cmsApi.reorderSections(items); } catch (e) { await load(); }
  };

  if (loading) return <div style={{ color: C.textDim, padding: 40 }}>Loading CMS data...</div>;

  // ─── Section Editor Modal ───
  if (editing) {
    const sec = editing;
    return (
      <div>
        {toast.Toast}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setEditing(null)} style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.textMid, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>← Back</button>
          <h2 style={{ margin: 0, color: C.text, fontSize: 20 }}>Edit: {sec.slug}</h2>
        </div>
        <SectionEditForm section={sec} saving={saving} onSave={(data) => handleSaveSection(sec.id, data)} onError={(msg) => toast.show(msg, "error")} />
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: C.text, fontSize: 16 }}>Cards ({sec.cards?.length || 0})</h3>
            <button onClick={() => setCardEdit({ sectionId: sec.id, card: null })} style={{
              background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
              padding: "6px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>+ Add Card</button>
          </div>
          {sec.cards?.map((card, ci) => (
            <div key={card.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 6,
            }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{card.icon || "□"}</span>
              <span style={{ flex: 1, color: C.text, fontSize: 14 }}>{card.title}</span>
              <span style={{ fontSize: 12, color: C.textDim }}>{card.isVisible ? "👁" : "🚫"}</span>
              <button onClick={() => setCardEdit({ sectionId: sec.id, card })} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: 13 }}>✏️</button>
              <button onClick={() => handleDeleteCard(sec.id, card.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13 }}>🗑️</button>
            </div>
          ))}
        </div>
        {cardEdit && cardEdit.sectionId === sec.id && (
          <CardEditModal card={cardEdit.card} saving={saving}
            onSave={(data) => handleSaveCard(sec.id, cardEdit.card, data)}
            onClose={() => setCardEdit(null)}
            onError={(msg) => toast.show(msg, "error")} />
        )}
      </div>
    );
  }

  // ─── Section List ───
  return (
    <div>
      {toast.Toast}
      <h2 style={{ color: C.text, fontSize: 22, marginBottom: 20, fontWeight: 700 }}>Landing Page Manager</h2>
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {sections.map((sec, idx) => (
          <div key={sec.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            borderBottom: idx < sections.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => handleMoveSection(idx, -1)} disabled={idx === 0}
                style={{ background: "none", border: "none", color: idx === 0 ? C.border : C.textMid, cursor: idx === 0 ? "default" : "pointer", fontSize: 11, padding: 0 }}>▲</button>
              <button onClick={() => handleMoveSection(idx, 1)} disabled={idx === sections.length - 1}
                style={{ background: "none", border: "none", color: idx === sections.length - 1 ? C.border : C.textMid, cursor: idx === sections.length - 1 ? "default" : "pointer", fontSize: 11, padding: 0 }}>▼</button>
            </div>
            <span style={{ fontFamily: C.mono, fontSize: 12, color: C.textDim, width: 24, textAlign: "right" }}>{idx + 1}.</span>
            <span style={{ fontFamily: C.mono, fontSize: 13, color: C.teal, minWidth: 130 }}>{sec.slug}</span>
            <span style={{ flex: 1, color: C.text, fontSize: 14 }}>{sec.title}</span>
            <span style={{ fontSize: 12, color: C.textDim }}>{sec.cards?.length || 0} cards</span>
            <button onClick={() => handleToggleVisible(sec)} title={sec.isVisible ? "Hide" : "Show"} style={{
              background: sec.isVisible ? C.greenBg : C.redBg,
              color: sec.isVisible ? C.green : C.red,
              border: `1px solid ${sec.isVisible ? C.green : C.red}`,
              borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>{sec.isVisible ? "👁 On" : "🚫 Off"}</button>
            <button onClick={() => setEditing(sec)} style={{
              background: C.bg3, border: `1px solid ${C.borderHi}`, color: C.teal,
              borderRadius: 6, padding: "3px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>✏️ Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
