"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

type Order = {
  id: string;
  name: string;
  phone: string;
  items: string;
  total: number;
  pincode: string;
  area: string;
  status: "new" | "confirmed" | "out" | "delivered";
  source: "website" | "whatsapp";
  createdAt: Timestamp;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Naya",
  confirmed: "Confirm",
  out: "Delivery mein",
  delivered: "Deliver",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: "#E6F1FB", color: "#0C447C" },
  confirmed: { bg: "#EAF3DE", color: "#27500A" },
  out: { bg: "#FAEEDA", color: "#633806" },
  delivered: { bg: "#E1F5EE", color: "#085041" },
};

const NEXT_STATUS: Record<string, string> = {
  new: "confirmed",
  confirmed: "out",
  out: "delivered",
};

const NEXT_LABEL: Record<string, string> = {
  new: "✅ Confirm Karo",
  confirmed: "🚚 Out for Delivery",
  out: "📦 Delivered Mark Karo",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), { status });
    if (selected?.id === id) setSelected({ ...selected, status: status as Order["status"] });
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    pending: orders.filter((o) => o.status !== "delivered").length,
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
  };

  return (
    <main style={{ fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ background: "#111", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🐟</span>
          <span style={{ color: "#DC2626", fontWeight: 900, fontSize: "18px" }}>Fish</span>
          <span style={{ color: "#16A34A", fontWeight: 900, fontSize: "18px", fontStyle: "italic" }}>on</span>
          <span style={{ color: "#888", fontSize: "13px", marginLeft: "8px" }}>Admin Dashboard</span>
        </div>
        <a href="/" style={{ color: "#888", fontSize: "12px", textDecoration: "none" }}>← Website</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Aaj ke orders", value: stats.total, color: "#333" },
            { label: "Deliver ho gaye", value: stats.delivered, color: "#16A34A" },
            { label: "Pending", value: stats.pending, color: "#F59E0B" },
            { label: "Aaj ki kamai", value: `₹${stats.revenue}`, color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: "24px", fontWeight: 900, margin: 0, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
          {["all", "new", "confirmed", "out", "delivered"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", background: filter === f ? "#DC2626" : "white", color: filter === f ? "white" : "#555", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              {f === "all" ? "Sab" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            {loading && <p style={{ color: "#888", textAlign: "center" }}>Loading...</p>}
            {!loading && filtered.length === 0 && (
              <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#aaa" }}>
                <p style={{ fontSize: "32px" }}>📋</p>
                <p>Koi order nahi</p>
              </div>
            )}
            {filtered.map((o) => (
              <div key={o.id} onClick={() => setSelected(o)}
                style={{ background: "white", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", cursor: "pointer", border: selected?.id === o.id ? "2px solid #DC2626" : "2px solid transparent", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>{o.name}</span>
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555" }}>
                  <span>{o.items?.slice(0, 30)}...</span>
                  <span style={{ fontWeight: 900, color: "#DC2626" }}>₹{o.total}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "#aaa" }}>
                  <span>📍 {o.area}</span>
                  <span>{o.source === "whatsapp" ? "💬 WhatsApp" : "🌐 Website"}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            {!selected ? (
              <div style={{ background: "white", borderRadius: "12px", padding: "60px 20px", textAlign: "center", color: "#aaa", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: "40px" }}>📋</p>
                <p>Koi order select karo</p>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>{selected.name}</h3>
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color }}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "12px 0" }} />
                <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["📞 Phone", selected.phone],
                      ["🛒 Items", selected.items],
                      ["💰 Total", `₹${selected.total}`],
                      ["📍 Area", selected.area],
                      ["🏠 Address", selected.address],
                      ["📱 Source", selected.source === "whatsapp" ? "WhatsApp" : "Website"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ color: "#888", padding: "6px 0", width: "100px" }}>{label}</td>
                        <td style={{ fontWeight: 500, padding: "6px 0" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "12px 0" }} />
                {NEXT_STATUS[selected.status] && (
                  <button onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.status])}
                    style={{ width: "100%", background: "#DC2626", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", marginBottom: "10px" }}>
                    {NEXT_LABEL[selected.status]}
                  </button>
                )}
                {selected.status === "delivered" && (
                  <div style={{ textAlign: "center", color: "#16A34A", fontWeight: "bold", padding: "10px" }}>✅ Order Complete!</div>
                )}
                <a href={`https://wa.me/91${selected.phone}`}
                  style={{ display: "block", background: "#25D366", color: "white", textDecoration: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>
                  💬 Customer ko WhatsApp karo
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}