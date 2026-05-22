"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";

type Order = {
  id: string;
  name: string;
  phone: string;
  items: string;
  total: number;
  address: string;
  area: string;
  pincode: string;
  deliveryTime: string;
  paymentMethod: string;
  status: string;
  createdAt: any;
  instructions?: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "#f59e0b", paid: "#3b82f6", confirmed: "#8b5cf6",
  preparing: "#f97316", delivered: "#10b981", cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  new: "🆕 New", paid: "💳 Paid", confirmed: "✅ Confirmed",
  preparing: "🔪 Preparing", delivered: "🚚 Delivered", cancelled: "❌ Cancelled",
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [0, 0.15, 0.3].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = [880, 1100, 1320][i];
      g.gain.setValueAtTime(0.3, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.12);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.12);
    });
  } catch (e) {}
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(p => setNotifEnabled(p === "granted"));
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const newOrders: Order[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      if (!isFirstLoad.current) {
        newOrders.forEach(order => {
          if (!prevOrderIds.current.has(order.id)) {
            playNotificationSound();
            setNewOrderAlert(true);
            setTimeout(() => setNewOrderAlert(false), 5000);
            if (notifEnabled) {
              new Notification("🐟 Fishon — Naya Order!", {
                body: `${order.name} ne ₹${order.total} ka order diya!`,
                icon: "/favicon.ico",
              });
            }
          }
        });
      }
      isFirstLoad.current = false;
      prevOrderIds.current = new Set(newOrders.map(o => o.id));
      setOrders(newOrders);
    });
    return () => unsub();
  }, [notifEnabled]);

  const updateStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  const whatsappOrder = (order: Order) => {
    const msg = `🐟 *FISHON ORDER CONFIRMED*\n\n👤 ${order.name}\n📱 ${order.phone}\n\n🛒 *Items:*\n${order.items}\n\n💰 Total: ₹${order.total} (${order.paymentMethod === 'online' ? '✅ Paid Online' : '💵 COD'})\n\n📍 ${order.address}\n🕐 Delivery: ${order.deliveryTime}`;
    window.open(`https://wa.me/91${order.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const stats = {
    today: orders.filter(o => { if (!o.createdAt) return false; const d = o.createdAt.toDate?.() || new Date(o.createdAt); return d.toDateString() === new Date().toDateString(); }).length,
    pending: orders.filter(o => o.status === "new" || o.status === "paid").length,
    total: orders.length,
    revenue: orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>
      {newOrderAlert && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "linear-gradient(90deg, #f59e0b, #ef4444)", padding: "16px 24px", textAlign: "center", fontSize: "18px", fontWeight: 800, color: "white", boxShadow: "0 4px 30px rgba(245,158,11,0.5)" }}>
          🔔 NAYA ORDER AAYA! 🐟 Neeche dekho!
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "#DC2626", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐟</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Fishon <span style={{ color: "#f59e0b" }}>Orders</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>LIVE DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Live</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, padding: "16px 24px" }}>
        {[
          { label: "Aaj Ke Orders", value: stats.today, color: "#f59e0b", icon: "📅" },
          { label: "Pending", value: stats.pending, color: "#ef4444", icon: "🔔" },
          { label: "Total Orders", value: stats.total, color: "#3b82f6", icon: "📦" },
          { label: "Revenue", value: `₹${stats.revenue}`, color: "#10b981", icon: "💰" },
        ].map(s => (
          <div key={s.label} style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 24px 16px", flexWrap: "wrap" }}>
        {["all", "new", "paid", "confirmed", "preparing", "delivered", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: filter === f ? (STATUS_COLORS[f] || "#f59e0b") : "rgba(255,255,255,0.06)", color: filter === f ? "#fff" : "rgba(255,255,255,0.5)" }}>
            {f === "all" ? "🗂 Sab" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐟</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Koi order nahi abhi</div>
          </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, marginBottom: 10, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: STATUS_COLORS[order.status] || "#64748b", borderRadius: "16px 0 0 16px" }} />
            <div style={{ marginLeft: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{order.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>📱 {order.phone} • 📍 {order.area}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#10b981" }}>₹{order.total}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[order.status], background: `${STATUS_COLORS[order.status]}20`, padding: "2px 8px", borderRadius: 10, marginTop: 4 }}>{STATUS_LABELS[order.status]}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🛒 {order.items}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 8 }}>{order.paymentMethod === "online" ? "💳 Paid" : "💵 COD"}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 8 }}>🕐 {order.deliveryTime}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 8 }}>#{order.id.slice(0,6).toUpperCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f1629", width: "100%", maxWidth: 600, borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Order #{selectedOrder.id.slice(0,6).toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{selectedOrder.createdAt?.toDate?.()?.toLocaleString("en-IN") || ""}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, fontWeight: 700 }}>CUSTOMER</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>👤 {selectedOrder.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>📱 {selectedOrder.phone}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>📍 {selectedOrder.address}</div>
              <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>🕐 {selectedOrder.deliveryTime}</div>
              {selectedOrder.instructions && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>📝 {selectedOrder.instructions}</div>}
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, fontWeight: 700 }}>ITEMS</div>
              {selectedOrder.items.split(", ").map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item}</div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#10b981" }}>₹{selectedOrder.total}</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, fontWeight: 700 }}>STATUS UPDATE KARO</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["confirmed", "preparing", "delivered", "cancelled"].map(s => (
                  <button key={s} onClick={() => updateStatus(selectedOrder.id, s)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: selectedOrder.status === s ? STATUS_COLORS[s] : `${STATUS_COLORS[s]}20`, color: selectedOrder.status === s ? "#fff" : STATUS_COLORS[s] }}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => whatsappOrder(selectedOrder)} style={{ flex: 1, background: "#16A34A", color: "white", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                💬 WhatsApp Customer
              </button>
              <button onClick={() => window.open(`tel:${selectedOrder.phone}`)} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", padding: "14px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                📞 Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
