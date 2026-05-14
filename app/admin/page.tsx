"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, updateDoc, orderBy, query, setDoc, getDoc,
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
  address?: string;
};

type Item = {
  id: string;
  name: string;
  bengali: string;
  price: number;
  unit: string;
  type: "available" | "preorder" | "hidden";
  emoji: string;
};

const DEFAULT_ITEMS: Item[] = [
  {id:'rohu',name:'Rohu Fish',bengali:'রুই মাছ',price:180,unit:'/500g',type:'available',emoji:'🐟'},
  {id:'katla',name:'Katla',bengali:'কাতলা মাছ',price:160,unit:'/500g',type:'available',emoji:'🐡'},
  {id:'baasa',name:'Indian Baasa',bengali:'ভাসা মাছ',price:200,unit:'/500g',type:'available',emoji:'🐠'},
  {id:'prawns',name:'Prawns',bengali:'চিংড়ি',price:320,unit:'/500g',type:'available',emoji:'🦐'},
  {id:'hilsa',name:'Hilsa',bengali:'ইলিশ মাছ',price:380,unit:'/500g',type:'available',emoji:'🐠'},
  {id:'tilapia',name:'Tilapia',bengali:'তেলাপিয়া',price:140,unit:'/500g',type:'available',emoji:'🐡'},
  {id:'rupchanda',name:'Rupchanda',bengali:'রূপচাঁদা',price:420,unit:'/500g',type:'available',emoji:'🐠'},
  {id:'mourala',name:'Mourala',bengali:'মৌরলা মাছ',price:120,unit:'/500g',type:'available',emoji:'🐟'},
  {id:'ilish',name:'Ilish Hilsa',bengali:'ইলিশ মাছ',price:380,unit:'/500g',type:'preorder',emoji:'🐠'},
  {id:'tiger',name:'Tiger Prawns',bengali:'বাঘা চিংড়ি',price:320,unit:'/250g',type:'preorder',emoji:'🦐'},
  {id:'golda',name:'Golda Chingdi',bengali:'গলদা চিংড়ি',price:450,unit:'/250g',type:'preorder',emoji:'🦐'},
  {id:'kilimeen',name:'Pink Perch / Kilimeen',bengali:'কিলিমিন',price:280,unit:'/500g',type:'preorder',emoji:'🐟'},
  {id:'sole',name:'River Sole',bengali:'ভাকা ভারাল',price:260,unit:'/500g',type:'preorder',emoji:'🐟'},
  {id:'singi',name:'Singi Catfish',bengali:'সিঙি মাছ',price:220,unit:'/500g',type:'preorder',emoji:'🐟'},
  {id:'bhetki',name:'Kolkata Bhetki',bengali:'ভেটকী মাছ',price:520,unit:'/kg',type:'preorder',emoji:'🐠'},
  {id:'singhara',name:'Singhara Catfish',bengali:'সিঙারা মাছ',price:350,unit:'/kg',type:'preorder',emoji:'🐟'},
  {id:'boal',name:'Boal Fish',bengali:'বোয়াল মাছ',price:380,unit:'/kg',type:'preorder',emoji:'🐟'},
  {id:'blackpomfret',name:'Black Pomfret',bengali:'কালো পমফ্রেট',price:580,unit:'/kg',type:'preorder',emoji:'🐠'},
  {id:'whitepomfret',name:'White Pomfret',bengali:'রূপালী পমফ্রেট',price:650,unit:'/200g',type:'preorder',emoji:'🐠'},
  {id:'surmai',name:'Seer Fish / Surmai',bengali:'সুরমাই মাছ',price:750,unit:'/kg',type:'preorder',emoji:'🐠'},
  {id:'tuna',name:'Yellow Fin Tuna',bengali:'টুনা মাছ',price:820,unit:'/kg',type:'preorder',emoji:'🐠'},
  {id:'mackerel',name:'Mackerel / Bangda',bengali:'ম্যাকেরেল',price:180,unit:'/kg',type:'preorder',emoji:'🐟'},
];

const STATUS_LABELS: Record<string, string> = {
  new: "Naya", confirmed: "Confirm", out: "Delivery mein", delivered: "Deliver",
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: "#E6F1FB", color: "#0C447C" },
  confirmed: { bg: "#EAF3DE", color: "#27500A" },
  out: { bg: "#FAEEDA", color: "#633806" },
  delivered: { bg: "#E1F5EE", color: "#085041" },
};
const NEXT_STATUS: Record<string, string> = {
  new: "confirmed", confirmed: "out", out: "delivered",
};
const NEXT_LABEL: Record<string, string> = {
  new: "✅ Confirm Karo", confirmed: "🚚 Out for Delivery", out: "📦 Delivered Mark Karo",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders'|'items'>('orders');
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [itemsSaving, setItemsSaving] = useState(false);
  const [itemsSaved, setItemsSaved] = useState(false);
  const [editPrice, setEditPrice] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load items from Firestore
  useEffect(() => {
    const loadItems = async () => {
      try {
        const docRef = doc(db, 'settings', 'items');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setItems(snap.data().list as Item[]);
        }
      } catch(e) { console.error(e); }
    };
    loadItems();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), { status });
    if (selected?.id === id) setSelected({ ...selected, status: status as Order["status"] });
  };

  const toggleItemType = (id: string, type: Item['type']) => {
    setItems(prev => prev.map(i => i.id === id ? {...i, type} : i));
  };

  const updateItemPrice = (id: string, price: number) => {
    setItems(prev => prev.map(i => i.id === id ? {...i, price} : i));
  };

  const saveItems = async () => {
    setItemsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'items'), { list: items, updatedAt: new Date() });
      setItemsSaved(true);
      setTimeout(() => setItemsSaved(false), 3000);
    } catch(e) { console.error(e); alert('Save nahi hua, dobara try karo'); }
    setItemsSaving(false);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const stats = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    pending: orders.filter((o) => o.status !== "delivered").length,
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
  };

  const availableItems = items.filter(i => i.type === 'available');
  const preorderItems = items.filter(i => i.type === 'preorder');
  const hiddenItems = items.filter(i => i.type === 'hidden');

  return (
    <main style={{ fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#111", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🐟</span>
          <span style={{ color: "#DC2626", fontWeight: 900, fontSize: "18px" }}>Fish</span>
          <span style={{ color: "#16A34A", fontWeight: 900, fontSize: "18px", fontStyle: "italic" }}>on</span>
          <span style={{ color: "#888", fontSize: "13px", marginLeft: "8px" }}>Admin Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={() => setTab('orders')}
            style={{ background: tab === 'orders' ? '#DC2626' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            📋 Orders
          </button>
          <button onClick={() => setTab('items')}
            style={{ background: tab === 'items' ? '#DC2626' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            🐟 Items Manager
          </button>
          <a href="/" style={{ color: "#888", fontSize: "12px", textDecoration: "none" }}>← Website</a>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

        {/* Stats */}
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

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <>
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
          </>
        )}

        {/* ITEMS MANAGER TAB */}
        {tab === 'items' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800 }}>🐟 Items Manager</h2>
                <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Subah update karo — konsa item aaj available hai</p>
              </div>
              <button onClick={saveItems} disabled={itemsSaving}
                style={{ background: itemsSaved ? '#16A34A' : '#DC2626', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: itemsSaving ? 0.7 : 1 }}>
                {itemsSaved ? '✅ Saved!' : itemsSaving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { color: '#dcfce7', border: '#16A34A', text: '🟢 Available Now — Aaj 90 min mein milega' },
                { color: '#dbeafe', border: '#3b82f6', text: '🔵 Pre-Order — Kal subah 9-12 milega' },
                { color: '#f3f4f6', border: '#9ca3af', text: '⚫ Hidden — Website pe nahi dikhega' },
              ].map(l => (
                <div key={l.text} style={{ background: l.color, border: `1.5px solid ${l.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>{l.text}</div>
              ))}
            </div>

            {/* Available Now */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#16A34A' }}>🟢 Available Now ({availableItems.length} items)</h3>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: '24px', minWidth: '32px' }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.name}</div>
                    <div style={{ color: '#16A34A', fontSize: '12px' }}>{item.bengali}</div>
                  </div>
                  {/* Price input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#888', fontSize: '13px' }}>₹</span>
                    <input type="number" value={item.price}
                      onChange={e => updateItemPrice(item.id, Number(e.target.value))}
                      style={{ width: '70px', padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, outline: 'none' }}/>
                    <span style={{ color: '#888', fontSize: '11px' }}>{item.unit}</span>
                  </div>
                  {/* Type buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => toggleItemType(item.id, 'available')}
                      style={{ padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: item.type === 'available' ? '#16A34A' : '#f0f0f0', color: item.type === 'available' ? 'white' : '#555' }}>
                      🟢 Available
                    </button>
                    <button onClick={() => toggleItemType(item.id, 'preorder')}
                      style={{ padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: item.type === 'preorder' ? '#3b82f6' : '#f0f0f0', color: item.type === 'preorder' ? 'white' : '#555' }}>
                      🔵 Pre-Order
                    </button>
                    <button onClick={() => toggleItemType(item.id, 'hidden')}
                      style={{ padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: item.type === 'hidden' ? '#6b7280' : '#f0f0f0', color: item.type === 'hidden' ? 'white' : '#555' }}>
                      ⚫ Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveItems} disabled={itemsSaving}
              style={{ width: '100%', background: itemsSaved ? '#16A34A' : '#DC2626', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', opacity: itemsSaving ? 0.7 : 1 }}>
              {itemsSaved ? '✅ Changes Saved!' : itemsSaving ? '⏳ Saving...' : '💾 Save All Changes'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
