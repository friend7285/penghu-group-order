import { useState } from "react";

function generateOrderId(deliveryDate) {
  const dateStr = deliveryDate ? deliveryDate.replace(/-/g, "") : new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * 26)]).join("");
  return `${dateStr}${rand}`;
}

const PRODUCTS = [
  {
    cat: "黑糖糕系列商品",
    items: [
      { name: "黑妞黑糖糕", price: 100, origPrice: 110 },
      { name: "黑妞黑糖糕(條)", price: 70 },
      { name: "黑妞紅豆糕", price: 100, origPrice: 110 },
      { name: "黑妞堅果糕", price: 90 },
      { name: "愛戀滋味(巧克力)", price: 90 },
      { name: "愛戀滋味(起司)", price: 90 },
      { name: "愛戀滋味(花生)", price: 90 },
    ],
  },
  {
    cat: "花生系列商品",
    items: [
      { name: "麻酥酥", price: 100 },
      { name: "花生酥", price: 100 },
      { name: "花生糖", price: 200 },
    ],
  },
  {
    cat: "黑妞系列商品",
    items: [
      { name: "麻花捲(原味)", price: 80 },
      { name: "麻花捲(黑糖)", price: 80 },
      { name: "麻花捲(梅子)", price: 80 },
      { name: "麻花捲(海苔)", price: 80 },
      { name: "麻花捲(椒鹽)", price: 80 },
      { name: "鹹咖餅(花生)", price: 150 },
      { name: "鹹咖餅(仙人掌)", price: 150 },
      { name: "QQ餅(原味)", price: 160 },
      { name: "QQ餅(蔓越莓)", price: 160 },
      { name: "牛軋餅(原味)", price: 160 },
      { name: "牛軋餅(蔓越莓)", price: 160 },
    ],
  },
  {
    cat: "海鮮加工系列商品",
    items: [
      { name: "魷魚絲(原味)", price: 140 },
      { name: "魷魚絲(炭燒)", price: 140 },
      { name: "魷魚片(原味)", price: 140 },
      { name: "魷魚片(炭燒)", price: 140 },
      { name: "蔥花豆魚蝦(罐)", price: 250 },
    ],
  },
  {
    cat: "手工醬系列商品",
    items: [
      { name: "黑妞純干貝醬", price: 380 },
      { name: "黑妞純干貝絲", price: 350 },
      { name: "黑妞小管醬", price: 250 },
      { name: "黑妞魚卵醬", price: 300 },
      { name: "黑妞海鮮頂級醬(小辣)", price: 250 },
      { name: "黑妞海鮮頂級醬(中辣)", price: 250 },
      { name: "黑妞仙果醬", price: 180 },
      { name: "黑妞紫金醬", price: 180 },
    ],
  },
  {
    cat: "黑妞冷凍系列商品",
    frozen: true,
    items: [
      { name: "黑妞黑糖冰心糕", price: 140 },
      { name: "黑妞微晶黑糖糕", price: 110 },
      { name: "黑妞微晶紅豆糕", price: 110 },
      { name: "黑妞微晶堅果糕", price: 90 },
      { name: "花枝丸(500g)", price: 280 },
      { name: "花枝排(500g)", price: 300 },
    ],
  },
  {
    cat: "手工茶系列商品",
    items: [
      { name: "黑妞風茄茶", price: 150 },
      { name: "黑妞仙果茶", price: 200 },
    ],
  },
];

const DELIVERY_OPTIONS = [
  { key: "home", label: "宅配到府", icon: "🏠" },
  { key: "airport", label: "機場取貨", icon: "✈️" },
  { key: "dock", label: "碼頭取貨", icon: "⚓" },
];

const UPLOAD_ENDPOINT = import.meta.env.VITE_ORDER_UPLOAD_ENDPOINT;

function getShipDate(form) {
  if (form.delivery === "home" && form.arrivalDate) return form.arrivalDate;
  if ((form.delivery === "airport" || form.delivery === "dock") && form.deliveryTime) return form.deliveryTime.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function buildTextSummary(form, ordered, normalTotal, frozenTotal, orderId) {
  const total = normalTotal + frozenTotal;
  const normalItems = ordered.filter((o) => !o.frozen);
  const frozenItems = ordered.filter((o) => o.frozen);

  let shipDateStr = "";
  if (form.delivery === "home" && form.arrivalDate) {
    shipDateStr = form.arrivalDate;
  } else if (form.deliveryTime) {
    const dt = new Date(form.deliveryTime);
    shipDateStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  }

  let locationLine = "";
  if (form.delivery === "home") locationLine = form.addr;
  else if (form.delivery === "airport") locationLine = "✈️機場自取";
  else if (form.delivery === "dock") locationLine = "🚢碼頭自取";

  const normalShip = normalTotal === 0 ? "" : normalTotal >= 2500 ? "免運" : `差 $${(2500 - normalTotal).toLocaleString()} 免運`;

  const L = [];
  L.push("═══════════════════");
  L.push("TOP黑妞原味小舖 預購單");
  L.push("═══════════════════");
  L.push(`📒單號：${orderId}`);
  L.push(`👤 訂購人：${form.name}`);
  L.push(`📞 電話：${form.phone}`);
  if (shipDateStr) L.push(`📅出貨日：${shipDateStr}`);
  L.push(`🚚收件位置：${locationLine}`);
  if (form.note) L.push(`📝 備註：${form.note}`);
  L.push("═══════════════════");

  if (normalItems.length > 0) {
    L.push("📦 常溫商品：");
    normalItems.forEach((o) => L.push(`  ${o.name}  ${o.price}×${o.qty}=${o.subtotal.toLocaleString()}`));
    L.push(`常溫小計：${normalTotal.toLocaleString()}`);
    L.push("───────────────────");
  }

  if (frozenItems.length > 0) {
    L.push("🧊 冷凍商品：");
    frozenItems.forEach((o) => L.push(`  ${o.name}  ${o.price}×${o.qty}`));
    L.push(`冷凍小計：${frozenTotal.toLocaleString()}`);
  }

  L.push("═══════════════════");
  L.push(`💰 總金額：$${total.toLocaleString()}`);
  if (normalTotal > 0) L.push(`🚚 常溫差：${normalShip}`);
  if (frozenTotal > 0) L.push("❄️ 冷凍運費依數量另外報價");
  L.push("══════════════════");

  return L.join("\n");
}

function buildDBRow(form, ordered, normalTotal, frozenTotal, orderId) {
  return buildDBCells(form, ordered, normalTotal, frozenTotal, orderId).map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
}

function buildDBCells(form, ordered, normalTotal, frozenTotal, orderId) {
  const total = normalTotal + frozenTotal;
  const shipDate = getShipDate(form);
  const dLabel = { home: "宅配", airport: "機場取貨", dock: "碼頭取貨" }[form.delivery] || "";
  const location = form.delivery === "home" ? form.addr : form.delivery === "airport" ? "機場自取" : "碼頭自取";
  const itemsStr = ordered.map((o) => `${o.name}×${o.qty}`).join("、");
  const now = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  return [orderId, now, form.name, form.phone, dLabel, location, shipDate, normalTotal, frozenTotal, total, normalTotal >= 2500 ? "免運" : `差$${2500 - normalTotal}`, itemsStr, form.note || ""];
}

const DB_HEADER_CELLS = ["訂單編號", "建立時間", "訂購人", "電話", "取貨方式", "收件位置", "出貨日", "常溫小計", "冷凍小計", "總金額", "常溫運費狀態", "商品明細", "備註"];
const DB_HEADER = DB_HEADER_CELLS.map((c) => `"${c}"`).join(",");

function downloadCsv(orderId, dbRow) {
  const blob = new Blob([`\ufeff${DB_HEADER}\n${dbRow}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `訂單-${orderId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [qtys, setQtys] = useState({});
  const [form, setForm] = useState({ name: "", phone: "", delivery: "", addr: "", arrivalDate: "", deliveryTime: "", note: "" });
  const [step, setStep] = useState("form");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [textSummary, setTextSummary] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const ordered = [];
  let normalTotal = 0;
  let frozenTotal = 0;
  PRODUCTS.forEach((cat) => {
    cat.items.forEach((item) => {
      const key = `${cat.cat}::${item.name}`;
      const qty = qtys[key] || 0;
      if (qty > 0) {
        const subtotal = qty * item.price;
        if (cat.frozen) frozenTotal += subtotal;
        else normalTotal += subtotal;
        ordered.push({ cat: cat.cat, name: item.name, price: item.price, qty, subtotal, frozen: !!cat.frozen });
      }
    });
  });
  const total = normalTotal + frozenTotal;

  const changeQty = (key, delta) => setQtys((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }));
  const setDelivery = (key) => setForm((f) => ({ ...f, delivery: key, addr: "", arrivalDate: "", deliveryTime: "" }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("請填寫姓名與聯絡電話！");
      return;
    }
    if (!form.delivery) {
      setError("請選擇取貨方式！");
      return;
    }
    if (form.delivery === "home" && !form.addr.trim()) {
      setError("宅配請填寫地址！");
      return;
    }
    if ((form.delivery === "airport" || form.delivery === "dock") && !form.deliveryTime.trim()) {
      setError("請填寫希望送達時間！");
      return;
    }
    if (ordered.length === 0) {
      setError("請至少選擇一項商品！");
      return;
    }
    setError("");
    const oid = generateOrderId(getShipDate(form));
    setOrderId(oid);
    setTextSummary(buildTextSummary(form, ordered, normalTotal, frozenTotal, oid));
    setStep("confirm");
  };

  const handleUpload = async () => {
    setUploading(true);
    setError("");
    const dbRow = buildDBRow(form, ordered, normalTotal, frozenTotal, orderId);
    const dbCells = buildDBCells(form, ordered, normalTotal, frozenTotal, orderId);

    try {
      if (!UPLOAD_ENDPOINT) {
        downloadCsv(orderId, dbRow);
        setUploadResult(`已下載訂單 CSV：訂單-${orderId}.csv。若要自動寫入 Google Drive，請設定 Apps Script Web App URL。`);
        setStep("done");
        return;
      }

      await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          orderId,
          row: dbRow,
          cells: dbCells,
          header: DB_HEADER,
          headerCells: DB_HEADER_CELLS,
        }),
      });

      setUploadResult(`已送出並寫入 Google Drive 訂單總表：${orderId}`);
      setStep("done");
    } catch (e) {
      setError(`儲存失敗：${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const resetForm = () => {
    setQtys({});
    setForm({ name: "", phone: "", delivery: "", addr: "", arrivalDate: "", deliveryTime: "", note: "" });
    setStep("form");
    setUploadResult(null);
    setTextSummary("");
    setOrderId("");
    setError("");
  };

  const C = { amber: "#F5A623", amberD: "#D4891A", amberL: "#FFF3D6", amberP: "#FFFBF0", teal: "#0B7B8C", dark: "#1A1108", mid: "#5C4A1E", soft: "#8B7355", border: "#E8D5A3" };
  const inp = { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, color: C.dark, background: C.amberP, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, color: C.soft, fontWeight: 600, marginBottom: 5, letterSpacing: 0.5 };
  const card = { background: "white", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "20px", marginBottom: 20, boxShadow: "0 2px 16px rgba(212,137,26,0.07)" };
  const cardTitle = { fontFamily: "'Noto Serif TC',serif", fontSize: 15, fontWeight: 700, color: C.mid, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${C.amberL}`, display: "flex", alignItems: "center", gap: 8 };
  const accent = { display: "block", width: 4, height: 16, background: C.amber, borderRadius: 2, flexShrink: 0 };
  const dCard = (active) => ({
    flex: "1 1 0",
    minWidth: 90,
    border: `2px solid ${active ? C.amber : C.border}`,
    borderRadius: 8,
    padding: "14px 10px",
    textAlign: "center",
    cursor: "pointer",
    background: active ? C.amberL : "white",
    transition: "all 0.18s",
    boxShadow: active ? `0 0 0 3px rgba(245,166,35,0.18)` : "none",
    position: "relative",
  });
  const slide = (show, maxH = 700) => ({
    overflow: "hidden",
    maxHeight: show ? maxH : 0,
    opacity: show ? 1 : 0,
    transition: "max-height 0.35s ease,opacity 0.25s ease",
    marginTop: show ? 14 : 0,
  });

  const Header = ({ sub }) => (
    <div style={{ background: `linear-gradient(135deg,${C.amber} 0%,${C.amberD} 100%)`, padding: "20px 20px 16px", boxShadow: "0 4px 20px rgba(212,137,26,0.35)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.amber, fontWeight: 900, fontSize: 18, flexShrink: 0 }}>黑妞</div>
      <div>
        <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: 22, fontWeight: 900, color: C.dark, letterSpacing: 2 }}>黑妞原味小舖</div>
        <div style={{ fontSize: 12, color: "rgba(26,17,8,0.6)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );

  if (step === "confirm" || step === "done") {
    return (
      <div style={{ fontFamily: "'Noto Sans TC','PingFang TC',sans-serif", background: `linear-gradient(145deg,${C.amberP} 0%,#FFF8E1 100%)`, minHeight: "100vh", paddingBottom: 60 }}>
        <Header sub="訂單確認" />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ background: "#F1F5F9", border: "1px dashed #CBD5E1", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span>🔖</span>
            <span>
              訂單編號：<strong style={{ letterSpacing: 1, color: "#1E40AF" }}>{orderId}</strong>
            </span>
          </div>

          <div style={card}>
            <div style={cardTitle}>
              <span style={accent} />
              ☁️ 儲存訂單資料
            </div>
            {step === "done" && uploadResult && <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 8, padding: "14px 16px", color: "#065F46", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>✅ {uploadResult}</div>}
            {error && <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {step === "confirm" && (
              <button onClick={handleUpload} disabled={uploading} style={{ background: C.teal, color: "white", border: "none", borderRadius: 8, padding: "13px 24px", fontSize: 15, fontWeight: 700, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.7 : 1, width: "100%", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {uploading ? "⏳ 儲存中..." : UPLOAD_ENDPOINT ? "☁️ 確認並寫入 Google Drive 總表" : "⬇️ 下載訂單 CSV"}
              </button>
            )}
          </div>

          <div style={card}>
            <div style={cardTitle}>
              <span style={accent} />
              📋 複製訂單給店家
            </div>
            <textarea readOnly value={textSummary} style={{ background: C.dark, color: "#FFF3D6", borderRadius: 8, padding: 20, fontFamily: "'Courier New',Courier,monospace", fontSize: 13, lineHeight: 1.85, whiteSpace: "pre", marginBottom: 14, border: "none", width: "100%", boxSizing: "border-box", resize: "none", minHeight: 380 }} />
            <button onClick={handleCopy} style={{ background: copied ? "#059669" : `linear-gradient(135deg,${C.amber} 0%,${C.amberD} 100%)`, color: copied ? "white" : C.dark, border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit", transition: "background 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: 1 }}>
              {copied ? "✅ 已複製！" : "📋 一鍵複製訂單文字"}
            </button>
            <div style={{ fontSize: 12, color: C.soft, textAlign: "center", marginTop: 8 }}>複製後貼到 LINE / 訊息傳給店家</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {step === "confirm" && (
              <button onClick={() => setStep("form")} style={{ background: "white", color: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                ← 返回修改
              </button>
            )}
            <button onClick={resetForm} style={{ background: "white", color: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              🔄 重新填寫新訂單
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Noto Sans TC','PingFang TC',sans-serif", background: `linear-gradient(145deg,${C.amberP} 0%,#FFF8E1 100%)`, minHeight: "100vh", paddingBottom: 60 }}>
      <Header sub="團購訂購單" />
      <div style={{ background: C.teal, color: "white", textAlign: "center", padding: "9px 16px", fontSize: 13 }}>
        🚚 訂購滿 <strong style={{ color: "#FFE08A" }}>$2,500</strong> 免運費 ｜ 歡迎公司團體購買
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={card}>
          <div style={cardTitle}>
            <span style={accent} />
            訂購人資料
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px 16px" }}>
            <div>
              <label style={lbl}>姓名 *</label>
              <input style={inp} placeholder="請輸入姓名" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>聯絡電話 *</label>
              <input style={inp} placeholder="請輸入電話" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>備註</label>
              <input style={inp} placeholder="特殊需求等" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>
            <span style={accent} />
            取貨方式 *
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {DELIVERY_OPTIONS.map((opt) => {
              const active = form.delivery === opt.key;
              return (
                <div key={opt.key} style={dCard(active)} onClick={() => setDelivery(opt.key)} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setDelivery(opt.key)}>
                  <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${active ? C.amber : C.border}`, background: active ? C.amber : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" }}>
                    {active && <span style={{ color: "white", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: active ? C.amberD : C.mid, letterSpacing: 0.5 }}>{opt.label}</div>
                </div>
              );
            })}
          </div>

          <div style={slide(form.delivery === "home", 750)}>
            <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 10 }}>📋 宅配注意事項</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                <div style={{ background: "white", borderRadius: 8, padding: "10px 12px", border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#D97706", marginBottom: 6 }}>📦 常溫宅配</div>
                  <div style={{ fontSize: 12, color: "#78350F", lineHeight: 1.7 }}>
                    ✅ 滿 $2,500 免運費
                    <br />
                    📦 約 $250-300 一箱
                    <br />
                    🚚 通常 2 天可到台灣
                  </div>
                  <div style={{ marginTop: 8, background: "#FEF3C7", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "#92400E", lineHeight: 1.6 }}>
                    ⚠️ 黑糖糕宅配期限剩 1 天
                    <br />
                    不建議把黑糖糕宅配
                    <br />
                    除非收到後自行冷凍加熱吃
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: 8, padding: "10px 12px", border: "1px solid #BFDBFE" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", marginBottom: 6 }}>❄️ 冷凍宅配</div>
                  <div style={{ fontSize: 12, color: "#1E3A5F", lineHeight: 1.7 }}>
                    ❌ 冷凍運費不含運
                    <br />
                    📦 約 $310-360 一箱
                    <br />
                    💬 運費送出訂單後另外報價
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px 16px" }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>宅配地址 *</label>
                <input style={inp} placeholder="請輸入完整收貨地址" value={form.addr} onChange={(e) => setForm((f) => ({ ...f, addr: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>📅 希望到貨日期</label>
                <input style={inp} type="date" value={form.arrivalDate} onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={slide(form.delivery === "airport" || form.delivery === "dock", 350)}>
            <div style={{ background: "#DC2626", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>⏰ 重要！請注意送達時間</div>
              <div style={{ color: "#FEE2E2", fontSize: 13, lineHeight: 1.9, fontWeight: 600, whiteSpace: "pre-line" }}>
                {form.delivery === "dock" ? "請填寫「希望收到貨物的時間」\n需在船班啟航前 1 小時以上\n讓店家有足夠時間準備並送達碼頭" : "請填寫「希望收到貨物的時間」\n需在航班起飛前 1 小時以上\n讓店家有足夠時間準備並送達機場"}
              </div>
              <div style={{ marginTop: 10, background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13, fontWeight: 700 }}>📌 例：航班 14:00 起飛 → 請填 13:00 以前</div>
            </div>
            <div>
              <label style={lbl}>{form.delivery === "dock" ? "⚓ 希望送達時間 *" : "✈️ 希望送達時間 *"}</label>
              <input style={{ ...inp, fontSize: 15 }} type="datetime-local" value={form.deliveryTime} onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))} />
            </div>
          </div>
        </div>

        {PRODUCTS.map((cat) => (
          <div key={cat.cat} style={{ marginBottom: 16 }}>
            <div
              style={{
                background: cat.frozen ? "linear-gradient(90deg,#1D4ED8 0%,#1E40AF 100%)" : `linear-gradient(90deg,${C.amber} 0%,${C.amberD} 100%)`,
                borderRadius: "8px 8px 0 0",
                padding: "10px 18px",
                fontFamily: "'Noto Serif TC',serif",
                fontSize: 15,
                fontWeight: 700,
                color: cat.frozen ? "white" : C.dark,
                letterSpacing: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {cat.frozen && <span style={{ fontSize: 16 }}>❄️</span>}
              {cat.cat}
              {cat.frozen && <span style={{ fontSize: 11, fontWeight: 500, marginLeft: "auto", opacity: 0.85 }}>運費另計</span>}
            </div>
            <div style={{ background: "white", border: `1.5px solid ${cat.frozen ? "#BFDBFE" : C.border}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
              {cat.items.map((item, idx) => {
                const key = `${cat.cat}::${item.name}`;
                const qty = qtys[key] || 0;
                const bc = cat.frozen ? "#3B82F6" : C.amber;
                const nc = cat.frozen ? "#1D4ED8" : C.amberD;
                return (
                  <div
                    key={item.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto 110px",
                      alignItems: "center",
                      padding: "11px 18px",
                      background: qty > 0 ? (cat.frozen ? "#EFF6FF" : C.amberL) : "white",
                      borderBottom: idx === cat.items.length - 1 ? "none" : `1px solid ${cat.frozen ? "#DBEAFE" : "#F5EDD8"}`,
                      transition: "background 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                      {item.origPrice && (
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                          原價 <span style={{ textDecoration: "line-through" }}>${item.origPrice}</span>
                          <span style={{ color: "#DC2626", fontWeight: 700, marginLeft: 4 }}>優惠 ${item.price}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: nc, fontWeight: 700, textAlign: "center", padding: "0 12px" }}>${item.price}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => changeQty(key, -1)} aria-label={`${item.name} 減少數量`} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${bc}`, background: "white", color: nc, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        −
                      </button>
                      <div style={{ width: 28, textAlign: "center", fontSize: 15, fontWeight: 700, color: qty > 0 ? nc : C.dark }}>{qty}</div>
                      <button onClick={() => changeQty(key, 1)} aria-label={`${item.name} 增加數量`} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${bc}`, background: "white", color: nc, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ＋
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ background: C.dark, borderRadius: 8, padding: "22px", marginTop: 20, boxShadow: "0 8px 32px rgba(26,17,8,0.22)" }}>
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>📦 常溫商品小計</div>
            <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: 26, fontWeight: 900, color: C.amber }}>${normalTotal.toLocaleString()}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: normalTotal >= 2500 ? "#6EE7B7" : "rgba(255,255,255,0.4)", fontWeight: normalTotal >= 2500 ? 600 : 400 }}>{normalTotal === 0 ? "尚未選購常溫商品" : normalTotal >= 2500 ? "🎉 常溫已達免運費！" : `常溫還差 $${(2500 - normalTotal).toLocaleString()} 免運費`}</div>
          </div>
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>❄️ 冷凍商品小計</div>
            <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: 26, fontWeight: 900, color: "#93C5FD" }}>${frozenTotal.toLocaleString()}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: "rgba(255,255,255,0.4)" }}>{frozenTotal === 0 ? "尚未選購冷凍商品" : "❄️ 冷凍運費將於送出後另外報價"}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>💰 訂單總金額</div>
              <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: 34, fontWeight: 900, color: "white", lineHeight: 1 }}>${total.toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              {error && <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", color: "#DC2626", fontSize: 13, maxWidth: 240 }}>{error}</div>}
              <button onClick={handleSubmit} style={{ background: `linear-gradient(135deg,${C.amber} 0%,${C.amberD} 100%)`, color: C.dark, border: "none", borderRadius: 8, padding: "13px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 1, boxShadow: "0 4px 16px rgba(245,166,35,0.4)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                確認送出訂單 →
              </button>
              <button onClick={() => setQtys({})} style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                清除全部
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
