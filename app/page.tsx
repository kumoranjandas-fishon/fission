"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Script from "next/script";

const ITEMS = [
  {n:'Rohu Fish',b:'রুই মাছ',h:'रोहू मछली',t:'ரோஹு மீன்',s:'500g • Cleaned & Cut',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://img.clevup.in/224989/SKU-0930_0-1712380773022.png?width=600&format=webp',imgs:['https://img.clevup.in/224989/SKU-0930_0-1712380773022.png?width=600&format=webp','https://m.media-amazon.com/images/I/51vddLa1uUL._AC_UF894,1000_QL80_.jpg','https://5.imimg.com/data5/SELLER/Default/2020/12/PK/QF/UV/58226302/rohu-fish-cut.jpg'],desc:'Fresh Rohu from local market, cleaned and cut into pieces. Rich in Omega-3, perfect for curry.',storage:'Store under refrigeration at 4°C or below',weight:'Pre-cleaned: ~650g | Final: 500g | Pieces: 6-8',tags:['High Protein','Omega-3','Best Seller']},
  {n:'Ilish Hilsa',b:'ইলিশ মাছ',h:'इलिश हिलसा',t:'இலிஷ் ஹில்சா',s:'500g • Whole Cleaned',p:380,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://www.bazaarkgp.com/product_image/11751194251.jpg',imgs:['https://www.bazaarkgp.com/product_image/11751194251.jpg','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsAE-dcxhCpCPz4_fr7Wlar2aCNZ4Y4O5NyQ&s'],desc:'Premium Ilish Hilsa — the king of fish. Sourced fresh every morning.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 500g | Cleaned & gutted',tags:['Premium','Seasonal','Bengali Favourite']},
  {n:'Tiger Prawns',b:'বাঘা চিংড়ি',h:'टाइगर झींगा',t:'புலி இறால்',s:'250g • Deveined',p:320,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://www.bbassets.com/media/uploads/p/l/800448132_1-ak-daily-bazaar-fish-bagda-chingri-tiger-prawn.jpg',imgs:['https://www.bbassets.com/media/uploads/p/l/800448132_1-ak-daily-bazaar-fish-bagda-chingri-tiger-prawn.jpg'],desc:'Large Tiger Prawns, deveined and cleaned. Great for grilling, frying or curry.',storage:'Store under refrigeration at 4°C or below',weight:'250g deveined | Count: 8-12 pieces',tags:['Deveined','Ready to Cook']},
  {n:'Golda Chingdi',b:'গলদা চিংড়ি',h:'गोल्डा झींगा',t:'கோல்டா இறால்',s:'250g • Whole',p:450,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Macrobrachium_rosenbergii.jpg/400px-Macrobrachium_rosenbergii.jpg',desc:'Fresh water Golda Prawns — a Bengali delicacy.',storage:'Store under refrigeration at 4°C or below',weight:'250g whole with shell | Count: 4-6 pieces',tags:['Delicacy','Bengali Special']},
  {n:'Pink Perch / Kilimeen',b:'কিলিমিন',h:'पिंक पर्च',t:'கிலிமீன்',s:'500g • Whole Cleaned',p:280,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lutjanus_campechanus.jpg/400px-Lutjanus_campechanus.jpg',desc:'Pink Perch from coastal waters. Tender white flesh.',storage:'Store under refrigeration at 4°C or below',weight:'500g whole cleaned',tags:['Coastal Catch','Tender Flesh']},
  {n:'River Sole / Vaka Varal',b:'ভাকা ভারাল',h:'रिवर सोल',t:'வாக்கா வரால்',s:'500g • Whole Cleaned',p:260,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Solea_solea.jpg/400px-Solea_solea.jpg',desc:'River Sole — flat fish with delicate flavour.',storage:'Store under refrigeration at 4°C or below',weight:'500g whole cleaned',tags:['Delicate Flavour']},
  {n:'Kolkata Bhetki / Barramundi',b:'ভেটকী মাছ',h:'भेटकी / बारामुंडी',t:'பெட்கி மீன்',s:'Whole Fish 1kg-2kg',p:520,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lates_calcarifer.jpg/400px-Lates_calcarifer.jpg',desc:'Premium Bhetki from Kolkata markets.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 1kg-2kg | Cleaned',tags:['Premium','Firm Flesh','Bengali Classic']},
  {n:'Black Pomfret / Halwa Fish',b:'কালো পমফ্রেট',h:'काला पॉमफ्रेट',t:'கருப்பு பாம்ஃப்ரெட்',s:'Whole Fish 1.5kg-4kg',p:580,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Parastromateus_niger.jpg/400px-Parastromateus_niger.jpg',desc:'Black Pomfret — a premium sea fish.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 1.5kg-4kg',tags:['Sea Fish','Premium','Mild Flavour']},
  {n:'White Pomfret / Silver Pomfret',b:'রূপালী পমফ্রেট',h:'सफेद पॉमफ्रेट',t:'வெள்ளை பாம்ஃப்ரெட்',s:'Whole Fish 200g-300g',p:650,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pampus_argenteus.jpg/400px-Pampus_argenteus.jpg',desc:'Silver Pomfret — the most prized sea fish.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 200g-300g per piece',tags:['Most Prized','Buttery','Sea Fish']},
  {n:'Seer Fish / Surmai',b:'সুরমাই মাছ',h:'सुरमई मछली',t:'வஞ்சரம் மீன்',s:'Whole Fish 5kg+',p:750,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Scomberomorus_commerson.jpg/400px-Scomberomorus_commerson.jpg',desc:'King Mackerel / Surmai — firm steaks with rich flavour.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 5kg+ | Steaks available',tags:['King Fish','Firm Steak']},
  {n:'Mackerel / Bangda',b:'ম্যাকেরেল',h:'मैकेरल / बांगड़ा',t:'அயலா மீன்',s:'5-9 Count/kg • Whole',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Rastrelliger_kanagurta.jpg/400px-Rastrelliger_kanagurta.jpg',desc:'Fresh Mackerel — affordable and nutritious.',storage:'Store under refrigeration at 4°C or below',weight:'5-9 count per kg | Whole',tags:['Omega-3','Affordable','Nutritious']},
];

const AVAILABLE_ITEMS = [
  {n:'Rohu',h:'Labeo rohita',p:180,u:'/500g',e:'🐟',c:'▲₹10',up:true,img:'https://img.clevup.in/224989/SKU-0930_0-1712380773022.png?width=600&format=webp',desc:'Fresh Rohu fish, cleaned and ready.',tags:['Same Day','Freshwater']},
  {n:'Katla',h:'Catla catla',p:160,u:'/500g',e:'🐡',c:'▲₹5',up:true,img:'',desc:'Fresh Katla fish. Excellent for mustard curry.',tags:['Same Day','Freshwater']},
  {n:'Indian Baasa',h:'Pangasius',p:200,u:'/500g',e:'🐠',c:'▼₹10',up:false,img:'',desc:'Mild flavoured Baasa, boneless cuts available.',tags:['Mild Flavour','Same Day']},
  {n:'Prawns',h:'Penaeus',p:320,u:'/500g',e:'🦐',c:'▼₹15',up:false,img:'https://www.bbassets.com/media/uploads/p/l/800448132_1-ak-daily-bazaar-fish-bagda-chingri-tiger-prawn.jpg',desc:'Fresh sea prawns. Cleaned and deveined on request.',tags:['Same Day','Sea Fresh']},
  {n:'Hilsa',h:'Tenualosa ilisha',p:380,u:'/500g',e:'🐠',c:'▲₹30',up:true,img:'https://www.bazaarkgp.com/product_image/11751194251.jpg',desc:'Fresh Hilsa — limited stock daily.',tags:['Limited Stock','Premium']},
  {n:'Tilapia',h:'Oreochromis',p:140,u:'/500g',e:'🐡',c:'▼₹5',up:false,img:'',desc:'Farm-raised Tilapia. Affordable and protein-rich.',tags:['Farm Fresh','Affordable']},
  {n:'Rupchanda',h:'Pampus argenteus',p:420,u:'/500g',e:'🐠',c:'▲₹20',up:true,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pampus_argenteus.jpg/400px-Pampus_argenteus.jpg',desc:'Silver Pomfret — premium quality available today.',tags:['Premium','Limited']},
  {n:'Mourala',h:'Amblypharyngodon',p:120,u:'/500g',e:'🐟',c:'▲₹5',up:true,img:'',desc:'Small freshwater Mourala. Perfect for crispy fry.',tags:['Bengali Favourite','Crispy Fry']},
];

const PINCODES: Record<string, {area:string, time:string}> = {
  '110092': {area:'Preet Vihar / Mandawali', time:'9 AM - 12 PM'},
  '110091': {area:'IP Extension / Patparganj', time:'9 AM - 12 PM'},
  '110096': {area:'Mayur Vihar Phase 1 & 2', time:'9 AM - 12 PM'},
  '110051': {area:'Gandhi Nagar / Geeta Colony', time:'9 AM - 12 PM'},
  '110031': {area:'Shakarpur / Laxmi Nagar', time:'9 AM - 12 PM'},
  '110032': {area:'Vivek Vihar / Karkardooma', time:'9 AM - 12 PM'},
  '110093': {area:'Pandav Nagar / Ganesh Nagar', time:'9 AM - 12 PM'},
  '110053': {area:'Krishna Nagar', time:'9 AM - 12 PM'},
  '110033': {area:'Mother Dairy / Kosambi', time:'9 AM - 12 PM'},
};

type CartItem = {n:string, p:number, e:string, qty:number};
type Address = {name:string; phone:string; flat:string; building:string; street:string; landmark:string; instructions:string;};
type ModalItem = {n:string; b?:string; h?:string; t?:string; s?:string; p:number; e:string; desc?:string; tags?:string[]; img?:string; imgs?:string[]; badge?:string; u?:string; storage?:string; weight?:string; type:'preorder'|'available'};
type PaymentMethod = 'cod' | 'online';

const inputStyle: React.CSSProperties = {width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1.5px solid #e2e8f0',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none',color:'#0f172a'};

function ScrollingTicker({ availableItems, preorderItems }: { availableItems: typeof AVAILABLE_ITEMS, preorderItems: typeof ITEMS }) {
  const tickerItems = [
    ...availableItems.map(i => ({ label: `${i.e} ${i.n} ₹${i.p}${i.u}`, type: 'available' as const, delivery: '90 min delivery' })),
    ...preorderItems.map(i => ({ label: `${i.e} ${i.n} ₹${i.p}`, type: 'preorder' as const, delivery: 'Tomorrow morning' })),
  ];
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div style={{ background: '#0f172a', overflow: 'hidden', height: '36px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.ticker-track{display:flex;animation:ticker 40s linear infinite;width:max-content;will-change:transform}.ticker-track:hover{animation-play-state:paused}`}</style>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 24px', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: item.type === 'available' ? '#4ade80' : '#fb923c' }}>{item.label}</span>
            <span style={{ fontSize: '10px', color: item.type === 'available' ? 'rgba(74,222,128,0.6)' : 'rgba(251,146,60,0.6)', fontWeight: 500 }}>• {item.delivery}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SearchBar({ allItems, onSelect }: { allItems: any[], onSelect: (item: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const q = query.toLowerCase();
    const found = allItems.filter(item => item.n?.toLowerCase().includes(q) || item.b?.toLowerCase().includes(q) || item.h?.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q) || item.tags?.some((t: string) => t.toLowerCase().includes(q))).slice(0, 8);
    setResults(found);
  }, [query, allItems]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '9px 16px', gap: '8px', border: focused ? '1.5px solid #DC2626' : '1.5px solid #e2e8f0', transition: 'border 0.2s' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>🔍</span>
        <input placeholder="Search fish, prawns, seafood..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#334155' }} />
        {query && <button onClick={() => { setQuery(''); setResults([]); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: 0 }}>✕</button>}
      </div>
      {focused && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', zIndex: 500, overflow: 'hidden', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ padding: '8px 14px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{results.length} RESULT{results.length > 1 ? 'S' : ''} FOUND</div>
          {results.map((item, i) => (
            <div key={i} onClick={() => { onSelect(item); setQuery(''); setResults([]); setFocused(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: item.bg || '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.img || item.imgs?.[0] ? <img src={item.img || item.imgs?.[0]} alt={item.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span style={{ fontSize: '24px' }}>{item.e}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.n}</div>
                {item.b && <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>{item.b}</div>}
                <div style={{ fontSize: '11px', color: '#64748b' }}>{item.s || item.u || ''}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '14px', color: '#DC2626' }}>₹{item.p}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: item.badge ? '#0B4F6C' : '#16A34A', background: item.badge ? '#EBF5FA' : '#dcfce7', padding: '2px 7px', borderRadius: '10px', marginTop: '2px' }}>{item.badge || 'Available'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {focused && query.length > 0 && results.length === 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', zIndex: 500, padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          🐟 No fish found for "{query}"
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pinResult, setPinResult] = useState<null|'valid'|'invalid'|'short'>(null);
  const [notifyName, setNotifyName] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart'|'pincode'|'address'|'payment'|'confirm'|'done'>('cart');
  const [address, setAddress] = useState<Address>({name:'',phone:'',flat:'',building:'',street:'',landmark:'',instructions:''});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [modalPhoto, setModalPhoto] = useState(0);
  const [modalItem, setModalItem] = useState<ModalItem|null>(null);
  const [liveAvailableItems, setLiveAvailableItems] = useState(AVAILABLE_ITEMS);
  const [livePreorderItems, setLivePreorderItems] = useState(ITEMS);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'items'));
        if (snap.exists()) {
          const firebaseItems = snap.data().list;
          const newAvailable = AVAILABLE_ITEMS.map(ai => { const fi = firebaseItems.find((f: any) => f.name.toLowerCase().includes(ai.n.toLowerCase()) || ai.n.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])); if (fi) return {...ai, p: fi.price}; return ai; }).filter(ai => { const fi = firebaseItems.find((f: any) => f.name.toLowerCase().includes(ai.n.toLowerCase()) || ai.n.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])); return !fi || fi.type === 'available'; });
          setLiveAvailableItems(newAvailable);
          const newPreorder = ITEMS.map(pi => { const fi = firebaseItems.find((f: any) => f.name.toLowerCase().includes(pi.n.toLowerCase().split(' ')[0]) || pi.n.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])); if (fi) return {...pi, p: fi.price}; return pi; }).filter(pi => { const fi = firebaseItems.find((f: any) => f.name.toLowerCase().includes(pi.n.toLowerCase().split(' ')[0]) || pi.n.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])); return !fi || fi.type === 'preorder'; });
          setLivePreorderItems(newPreorder);
        }
      } catch(e) { console.error('Items load error:', e); }
    };
    fetchItems();
  }, []);

  const allSearchItems = [...liveAvailableItems.map(i => ({ ...i, type: 'available', badge: null })), ...livePreorderItems.map(i => ({ ...i, type: 'preorder' }))];

  const handleSearchSelect = (item: any) => {
    setModalPhoto(0);
    if (item.type === 'available') setModalItem({ n: item.n, h: item.h, p: item.p, e: item.e, desc: item.desc, tags: item.tags, u: item.u, img: item.img, type: 'available' });
    else setModalItem({ n: item.n, b: item.b, h: item.h, t: item.t, s: item.s, p: item.p, e: item.e, desc: item.desc, tags: item.tags, img: item.img, imgs: item.imgs, badge: item.badge, storage: item.storage, weight: item.weight, type: 'preorder' });
  };

  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  const totalPrice = cart.reduce((s,i)=>s+i.p*i.qty,0);

  const addToCart = (item: {n:string, p:number, e:string}) => { setCart(prev => { const exists = prev.find(c=>c.n===item.n); if(exists) return prev.map(c=>c.n===item.n?{...c,qty:c.qty+1}:c); return [...prev, {n:item.n, p:item.p, e:item.e, qty:1}]; }); };
  const removeFromCart = (name: string) => { setCart(prev => { const exists = prev.find(c=>c.n===name); if(exists && exists.qty > 1) return prev.map(c=>c.n===name?{...c,qty:c.qty-1}:c); return prev.filter(c=>c.n!==name); }); };
  const getQty = (name: string) => cart.find(c=>c.n===name)?.qty || 0;
  const checkPincode = () => { if(pincode.length !== 6) { setPinResult('short'); return; } if(PINCODES[pincode]) setPinResult('valid'); else setPinResult('invalid'); };
  const isAddressValid = () => address.name && address.phone.length === 10 && address.flat && address.building && address.street;

  // ── RAZORPAY ONLINE PAYMENT ──
  const handleOnlinePayment = async () => {
    setOrderLoading(true);
    try {
      // 1. Backend se order create karo
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice, name: address.name, phone: address.phone }),
      });
      const order = await res.json();

      // 2. Razorpay checkout open karo
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Fishon 🐟',
        description: 'Fresh Fish Delivery',
        order_id: order.id,
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#DC2626' },
        handler: async (response: any) => {
          // 3. Payment verify karo
          const verify = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await verify.json();
          if (data.success) {
            // 4. Firebase mein order save karo
            await saveOrderToFirebase('online', response.razorpay_payment_id);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => setOrderLoading(false) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert('Payment failed. Please try again.');
      setOrderLoading(false);
    }
  };

  // ── FIREBASE MEIN ORDER SAVE ──
  const saveOrderToFirebase = async (method: string, paymentId?: string) => {
    try {
      const itemsText = cart.map(i=>`${i.e} ${i.n} x${i.qty} = ₹${i.p*i.qty}`).join(', ');
      const fullAddress = `${address.flat}, ${address.building}, ${address.street}${address.landmark ? ', Near ' + address.landmark : ''}, ${PINCODES[pincode]?.area}, ${pincode}`;
      const docRef = await addDoc(collection(db, 'orders'), {
        name: address.name, phone: address.phone, items: itemsText, total: totalPrice,
        pincode, area: PINCODES[pincode]?.area, address: fullAddress,
        flat: address.flat, building: address.building, street: address.street,
        landmark: address.landmark, instructions: address.instructions,
        paymentMethod: method, paymentId: paymentId || null,
        status: method === 'online' ? 'paid' : 'new',
        source: 'website', deliveryTime: PINCODES[pincode]?.time,
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id.slice(0,8).toUpperCase());
      setCheckoutStep('done');
      setCart([]);
    } catch(e) { console.error(e); alert('Order save failed.'); }
    setOrderLoading(false);
  };

  const placeCODOrder = async () => {
    if(!isAddressValid()) return;
    setOrderLoading(true);
    await saveOrderToFirebase('cod');
  };

  return (
    <main style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',minHeight:'100vh',background:'#f9fafb'}}>

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <ScrollingTicker availableItems={liveAvailableItems} preorderItems={livePreorderItems} />

      {/* HEADER */}
      <header style={{background:'white',borderBottom:'1px solid #f1f5f9',padding:'12px 24px',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',minWidth:'140px'}}>
            <div style={{width:'38px',height:'38px',background:'#DC2626',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🐟</div>
            <div>
              <div style={{fontWeight:900,fontSize:'20px',lineHeight:1}}><span style={{color:'#DC2626'}}>Fish</span><span style={{color:'#16A34A',fontStyle:'italic'}}>on</span></div>
              <div style={{fontSize:'9px',color:'#94a3b8',fontWeight:600,letterSpacing:'1px'}}>FRESH CATCH DAILY</div>
            </div>
          </div>
          <SearchBar allItems={allSearchItems} onSelect={handleSearchSelect} />
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <div style={{fontSize:'12px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px',background:'#f1f5f9',padding:'6px 12px',borderRadius:'8px'}}>📍 <span style={{fontWeight:600,color:'#334155'}}>Delhi NCR</span></div>
            <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}} style={{background:'#DC2626',color:'white',border:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
              🛒 Cart
              {totalItems > 0 && <span style={{background:'white',color:'#DC2626',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>{totalItems}</span>}
            </button>
            <a href="https://wa.me/918287000582" style={{background:'#16A34A',color:'white',textDecoration:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>💬 WhatsApp</a>
            <a href="/login" style={{background:'#0f172a',color:'white',textDecoration:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700}}>👤 Login</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{background:'linear-gradient(180deg,#0a1628 0%,#0d2137 40%,#0a1628 100%)',padding:'80px 24px',position:'relative',overflow:'hidden'}}>
        <style>{`@keyframes fishSwim1{0%{transform:translateX(-120px) translateY(0px) scaleX(1);opacity:0}10%{opacity:0.18}90%{opacity:0.18}100%{transform:translateX(110vw) translateY(-30px) scaleX(1);opacity:0}}@keyframes fishSwim2{0%{transform:translateX(110vw) translateY(0px) scaleX(-1);opacity:0}10%{opacity:0.13}90%{opacity:0.13}100%{transform:translateX(-120px) translateY(20px) scaleX(-1);opacity:0}}@keyframes bubble{0%{transform:translateY(0px);opacity:0.4}100%{transform:translateY(-80px);opacity:0}}@keyframes glow{0%,100%{opacity:0.15}50%{opacity:0.25}}`}</style>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(ellipse at 20% 60%,rgba(0,100,200,0.2) 0%,transparent 55%),radial-gradient(ellipse at 80% 40%,rgba(0,60,120,0.15) 0%,transparent 50%)',animation:'glow 4s ease-in-out infinite'}}></div>
        {[{t:'20%',f:'48px',a:'fishSwim1',d:'0s',dir:'left'},{t:'55%',f:'36px',a:'fishSwim2',d:'3s',dir:'right'},{t:'70%',f:'24px',a:'fishSwim1',d:'7s',dir:'left'},{t:'35%',f:'30px',a:'fishSwim2',d:'11s',dir:'right'},{t:'80%',f:'40px',a:'fishSwim1',d:'5s',dir:'left'},{t:'15%',f:'28px',a:'fishSwim2',d:'9s',dir:'right'}].map((f,i)=>(<div key={i} style={{position:'absolute',top:f.t,[f.dir === 'left' ? 'left' : 'right']:0,fontSize:f.f,animation:`${f.a} ${12+i*2}s linear infinite`,animationDelay:f.d,pointerEvents:'none'}}>{['🐟','🐠','🐡','🦐'][i%4]}</div>))}
        {[{l:'10%',d:'0s',s:'3px'},{l:'25%',d:'1.5s',s:'5px'},{l:'45%',d:'0.8s',s:'4px'},{l:'60%',d:'2s',s:'3px'},{l:'75%',d:'0.3s',s:'6px'},{l:'88%',d:'1.2s',s:'4px'}].map((b,i)=>(<div key={i} style={{position:'absolute',bottom:'10%',left:b.l,width:b.s,height:b.s,borderRadius:'50%',background:'rgba(100,180,255,0.3)',animation:`bubble ${3+i*0.5}s ease-out infinite`,animationDelay:b.d,pointerEvents:'none'}}></div>))}
        <div style={{maxWidth:'860px',margin:'0 auto',position:'relative',zIndex:2,textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.35)',padding:'7px 18px',borderRadius:'30px',marginBottom:'28px'}}>
            <span style={{color:'#fca5a5',fontSize:'12px',fontWeight:700,letterSpacing:'0.5px'}}>⏰ ORDER BY 11 PM — DELIVERED FRESH TOMORROW</span>
          </div>
          <h1 style={{color:'white',fontSize:'clamp(36px,5vw,64px)',fontWeight:900,margin:'0 0 20px',lineHeight:1.1,letterSpacing:'-1.5px'}}>Fresh Fish, <span style={{color:'#DC2626'}}>Delivered</span> to Your Doorstep 🐟</h1>
          <p style={{color:'#94a3b8',fontSize:'17px',maxWidth:'560px',lineHeight:1.75,margin:'0 auto 40px'}}>Sourced fresh from the market every morning. Delivered to your home <strong style={{color:'white'}}>9 AM – 12 PM</strong>. No chemicals, no preservatives.</p>
          <div style={{display:'flex',justifyContent:'center',gap:'40px',marginBottom:'44px',flexWrap:'wrap'}}>
            {[{n:'100%',l:'Chemical Free'},{n:'15+',l:'Fish Varieties'},{n:'9–12 AM',l:'Delivery Window'},{n:'₹499+',l:'Free Delivery'}].map(s=>(<div key={s.l} style={{textAlign:'center'}}><div style={{color:'white',fontWeight:900,fontSize:'22px'}}>{s.n}</div><div style={{color:'#64748b',fontSize:'12px',marginTop:'4px',fontWeight:500}}>{s.l}</div></div>))}
          </div>
          <div style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="#menu" style={{background:'#DC2626',color:'white',textDecoration:'none',padding:'15px 32px',borderRadius:'12px',fontWeight:700,fontSize:'15px',display:'flex',alignItems:'center',gap:'8px',boxShadow:'0 4px 24px rgba(220,38,38,0.4)'}}>🛒 Order Now</a>
            <a href="https://wa.me/918287000582?text=Hi! I want to order fish" style={{background:'rgba(255,255,255,0.08)',color:'white',textDecoration:'none',padding:'15px 32px',borderRadius:'12px',fontWeight:700,fontSize:'15px',border:'1px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',gap:'8px'}}>💬 WhatsApp Order</a>
          </div>
        </div>
      </section>

      {/* AVAILABLE NOW */}
      <section style={{background:'white',padding:'32px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div><h2 style={{fontSize:'22px',fontWeight:800,margin:'0 0 4px',color:'#0f172a'}}>Available Now</h2><p style={{fontSize:'13px',color:'#64748b',margin:0}}>In stock • Same day delivery possible</p></div>
            <span style={{background:'#dcfce7',color:'#16A34A',padding:'4px 12px',borderRadius:'20px',fontWeight:700,fontSize:'12px'}}>✓ Fresh Stock</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'12px'}}>
            {liveAvailableItems.map(i=>{ const qty = getQty(i.n); return (
              <div key={i.n} onClick={()=>setModalItem({n:i.n,h:i.h,p:i.p,e:i.e,desc:i.desc,tags:i.tags,u:i.u,img:i.img,type:'available'})} style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',textAlign:'center',border:'1.5px solid #e2e8f0',cursor:'pointer'}}>
                <div style={{width:'60px',height:'60px',margin:'0 auto 8px',borderRadius:'10px',overflow:'hidden',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {i.img ? <img src={i.img} alt={i.n} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/> : <span style={{fontSize:'28px'}}>{i.e}</span>}
                </div>
                <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a'}}>{i.n}</div>
                <div style={{fontSize:'10px',color:'#94a3b8',marginBottom:'6px',fontStyle:'italic'}}>{i.h}</div>
                <div style={{fontSize:'18px',fontWeight:900,color:'#0f172a'}}>{i.p}</div>
                <div style={{fontSize:'10px',color:'#64748b'}}>{i.u}</div>
                <div style={{fontSize:'11px',fontWeight:700,color:i.up?'#DC2626':'#16A34A',marginTop:'4px',marginBottom:'8px'}}>{i.c}</div>
                <div onClick={e=>e.stopPropagation()}>
                  {qty === 0 ? <button onClick={()=>addToCart({n:i.n,p:i.p,e:i.e})} style={{background:'#DC2626',color:'white',border:'none',padding:'6px 14px',borderRadius:'8px',fontSize:'11px',fontWeight:700,cursor:'pointer',width:'100%'}}>+ Add</button>
                  : <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><button onClick={()=>removeFromCart(i.n)} style={{background:'#f1f5f9',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px',color:'#334155'}}>−</button><span style={{fontWeight:900,fontSize:'14px',minWidth:'18px',textAlign:'center',color:'#0f172a'}}>{qty}</span><button onClick={()=>addToCart({n:i.n,p:i.p,e:i.e})} style={{background:'#DC2626',color:'white',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>+</button></div>}
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* PRE ORDER STRIP */}
      <div style={{background:'#fffbeb',borderBottom:'2px solid #f59e0b',padding:'12px 24px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}><span style={{fontSize:'18px'}}>⏰</span><div><span style={{fontWeight:700,fontSize:'13px',color:'#92400e'}}>Pre-Order Closes at 11 PM! </span><span style={{fontSize:'12px',color:'#b45309'}}>Tomorrow morning 9 AM - 12 PM • Free on orders above ₹499</span></div></div>
        <a href="https://wa.me/918287000582?text=I want to pre-order" style={{background:'#f59e0b',color:'white',textDecoration:'none',padding:'8px 18px',borderRadius:'8px',fontWeight:700,fontSize:'13px',whiteSpace:'nowrap'}}>Pre-Order Now →</a>
      </div>

      {/* PRE-ORDER MENU */}
      <section id="menu" style={{background:'#f9fafb',padding:'32px 24px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{marginBottom:'20px'}}><h2 style={{fontSize:'22px',fontWeight:800,margin:'0 0 4px',color:'#0f172a'}}>🛒 Fresh Catch — Pre-Order</h2><p style={{fontSize:'13px',color:'#64748b',margin:0}}>Order by 11 PM • Delivered fresh next morning 9 AM - 12 PM</p></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'16px'}}>
            {livePreorderItems.map(i=>{ const qty = getQty(i.n); return (
              <div key={i.n} onClick={()=>{setModalPhoto(0);setModalItem({n:i.n,b:i.b,h:(i as any).h,t:(i as any).t,s:i.s,p:i.p,e:i.e,desc:i.desc,tags:i.tags,img:(i as any).img,imgs:(i as any).imgs,badge:i.badge,storage:(i as any).storage,weight:(i as any).weight,type:'preorder'})}} style={{background:'white',borderRadius:'14px',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',border:'1px solid #f1f5f9',cursor:'pointer'}}>
                <div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:i.bg}}>
                  {(i as any).img ? <img src={(i as any).img} alt={i.n} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/> : <span style={{fontSize:'50px'}}>{i.e}</span>}
                  <span style={{position:'absolute',top:'8px',left:'8px',background:'#0B4F6C',color:'white',fontSize:'9px',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>{i.badge}</span>
                </div>
                <div style={{padding:'12px'}}>
                  <div style={{fontWeight:700,fontSize:'13px',color:'#0f172a',marginBottom:'2px'}}>{i.n}</div>
                  <div style={{color:'#16A34A',fontSize:'11px',marginBottom:'2px'}}>{i.b}</div>
                  <div style={{color:'#94a3b8',fontSize:'11px',marginBottom:'10px'}}>{i.s}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:900,fontSize:'16px',color:'#0f172a'}}>₹{i.p}</span>
                    <div onClick={e=>e.stopPropagation()}>
                      {qty === 0 ? <button onClick={()=>addToCart(i)} style={{background:'#DC2626',color:'white',border:'none',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>+ Add</button>
                      : <div style={{display:'flex',alignItems:'center',gap:'8px'}}><button onClick={()=>removeFromCart(i.n)} style={{background:'#f1f5f9',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px',color:'#334155'}}>−</button><span style={{fontWeight:900,fontSize:'14px',minWidth:'18px',textAlign:'center',color:'#0f172a'}}>{qty}</span><button onClick={()=>addToCart(i)} style={{background:'#DC2626',color:'white',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>+</button></div>}
                    </div>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{background:'white',padding:'40px 24px',borderTop:'1px solid #f1f5f9'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'22px',fontWeight:800,marginBottom:'8px',color:'#0f172a'}}>Why Choose Fishon?</h2>
          <p style={{color:'#64748b',fontSize:'14px',marginBottom:'28px'}}>We bring the freshest catch straight to your kitchen</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'20px'}}>
            {[{icon:'🌅',title:'Farm Fresh Daily',desc:'Sourced every morning from trusted suppliers'},{icon:'⏰',title:'Pre-Order by 11 PM',desc:'Secure your catch the night before'},{icon:'🚚',title:'Morning Delivery',desc:'Delivered 9 AM - 12 PM at your doorstep'},{icon:'💰',title:'Market Best Price',desc:'Direct pricing, no middlemen'},{icon:'🧼',title:'Hygienically Cleaned',desc:'Properly cleaned and packed'},{icon:'📦',title:'Secure Packaging',desc:'Leak-proof, odour-free packing'}].map(i=>(<div key={i.title} style={{padding:'20px 16px',background:'#f8fafc',borderRadius:'14px',border:'1px solid #e2e8f0'}}><div style={{fontSize:'32px',marginBottom:'10px'}}>{i.icon}</div><div style={{fontWeight:700,fontSize:'14px',marginBottom:'4px',color:'#0f172a'}}>{i.title}</div><div style={{color:'#64748b',fontSize:'12px',lineHeight:1.5}}>{i.desc}</div></div>))}
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section style={{background:'linear-gradient(135deg,#16A34A,#15803d)',padding:'40px 24px',textAlign:'center'}}>
        <h2 style={{color:'white',fontWeight:800,fontSize:'24px',marginBottom:'8px'}}>📱 Order via WhatsApp</h2>
        <p style={{color:'rgba(255,255,255,0.85)',marginBottom:'20px',fontSize:'14px'}}>Message us directly — confirmed within 10 minutes!</p>
        <a href="https://wa.me/918287000582?text=Hi Fishon! I want to order fish" style={{background:'white',color:'#16A34A',textDecoration:'none',padding:'14px 32px',borderRadius:'10px',fontWeight:800,fontSize:'15px',display:'inline-block'}}>💬 Chat on WhatsApp</a>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0f172a',color:'white',padding:'32px 24px',textAlign:'center'}}>
        <div style={{marginBottom:'8px'}}><span style={{color:'#DC2626',fontWeight:800,fontSize:'22px'}}>Fish</span><span style={{color:'#16A34A',fontWeight:800,fontSize:'22px',fontStyle:'italic'}}>on</span></div>
        <p style={{color:'#475569',fontSize:'12px',margin:'0 0 16px'}}>📍 Delhi NCR • 🕐 7:30 AM - 11:00 PM Daily • © 2026 Fishon. All rights reserved.</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:'10px',background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'10px 20px'}}>
          <div style={{background:'white',borderRadius:'4px',padding:'4px 8px'}}>
            <svg width="60" height="28" viewBox="0 0 120 56" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="56" fill="white"/><text x="4" y="22" fontSize="13" fontWeight="bold" fill="#1a5276" fontFamily="Arial">FSSAI</text><text x="4" y="38" fontSize="7" fill="#666" fontFamily="Arial">Food Safety and Standards</text><text x="4" y="48" fontSize="7" fill="#666" fontFamily="Arial">Authority of India</text><rect x="78" y="4" width="38" height="48" rx="4" fill="#f39c12"/><text x="82" y="20" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial">GOVT</text><text x="82" y="30" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial">OF</text><text x="82" y="40" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial">INDIA</text></svg>
          </div>
          <div style={{textAlign:'left'}}><div style={{fontSize:'9px',color:'#94a3b8',fontWeight:600,letterSpacing:'0.5px'}}>LICENSED BY</div><div style={{fontSize:'12px',color:'white',fontWeight:700}}>FSSAI Reg. No: <span style={{color:'#16A34A'}}>23326003001887</span></div></div>
        </div>
      </footer>

      {/* FLOATING CART */}
      {totalItems > 0 && !showCart && (
        <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}} style={{position:'fixed',bottom:'24px',right:'24px',background:'#DC2626',color:'white',border:'none',padding:'14px 22px',borderRadius:'50px',fontWeight:700,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 24px rgba(220,38,38,0.4)',zIndex:200,display:'flex',alignItems:'center',gap:'10px'}}>
          🛒 {totalItems} item{totalItems>1?'s':''} • ₹{totalPrice}
        </button>
      )}

      {/* PRODUCT MODAL */}
      {modalItem && (
        <div onClick={()=>setModalItem(null)} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.75)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'20px',width:'100%',maxWidth:'480px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{height:'220px',background:modalItem.type==='preorder'?'#EBF5FA':'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              {modalItem.imgs && modalItem.imgs.length > 0 ? (<><img src={modalItem.imgs[modalPhoto]} alt={modalItem.n} style={{width:'100%',height:'100%',objectFit:'cover'}}/>{modalItem.imgs.length > 1 && (<><div style={{position:'absolute',bottom:'10px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'6px'}}>{modalItem.imgs.map((_,idx)=>(<div key={idx} onClick={e=>{e.stopPropagation();setModalPhoto(idx);}} style={{width:'8px',height:'8px',borderRadius:'50%',background:idx===modalPhoto?'white':'rgba(255,255,255,0.5)',cursor:'pointer'}}/>))}</div><button onClick={e=>{e.stopPropagation();setModalPhoto(p=>p===0?modalItem.imgs!.length-1:p-1);}} style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.8)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',fontWeight:700}}>‹</button><button onClick={e=>{e.stopPropagation();setModalPhoto(p=>p===modalItem.imgs!.length-1?0:p+1);}} style={{position:'absolute',right:'44px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.8)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',fontWeight:700}}>›</button></>)}</>) : modalItem.img ? <img src={modalItem.img} alt={modalItem.n} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:'80px'}}>{modalItem.e}</span>}
              {modalItem.badge && <span style={{position:'absolute',top:'12px',left:'12px',background:'#0B4F6C',color:'white',fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>{modalItem.badge}</span>}
              <button onClick={()=>setModalItem(null)} style={{position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',fontWeight:700,color:'#334155'}}>✕</button>
            </div>
            <div style={{padding:'20px 24px 24px',maxHeight:'60vh',overflowY:'auto'}}>
              <h2 style={{margin:'0 0 4px',fontSize:'20px',fontWeight:800,color:'#0f172a'}}>{modalItem.n}</h2>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'4px'}}>{modalItem.b && <span style={{fontSize:'13px',color:'#16A34A',fontWeight:600}}>{modalItem.b}</span>}{modalItem.h && <span style={{fontSize:'13px',color:'#DC2626',fontWeight:600}}>• {modalItem.h}</span>}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'12px'}}>{modalItem.s || modalItem.u}</div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',padding:'12px',background:'#f8fafc',borderRadius:'10px'}}><div><div style={{fontSize:'28px',fontWeight:900,color:'#DC2626'}}>₹{modalItem.p}</div><div style={{fontSize:'11px',color:'#64748b'}}>per {modalItem.s || '500g'}</div></div>{modalItem.badge && <span style={{background:'#0B4F6C',color:'white',fontSize:'11px',fontWeight:700,padding:'4px 12px',borderRadius:'20px'}}>{modalItem.badge}</span>}</div>
              {modalItem.desc && <p style={{color:'#475569',fontSize:'13px',lineHeight:1.7,margin:'0 0 14px',padding:'12px',background:'#f0fdf4',borderRadius:'10px',borderLeft:'3px solid #16A34A'}}>{modalItem.desc}</p>}
              {modalItem.tags && <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>{modalItem.tags.map(tag=><span key={tag} style={{background:'#f0fdf4',color:'#16A34A',fontSize:'11px',fontWeight:600,padding:'3px 10px',borderRadius:'20px',border:'1px solid #bbf7d0'}}>{tag}</span>)}</div>}
              {(() => { const qty = getQty(modalItem.n); return qty === 0 ? (<button onClick={()=>{ addToCart({n:modalItem.n,p:modalItem.p,e:modalItem.e}); setModalItem(null); }} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>🛒 Add to Cart — ₹{modalItem.p}</button>) : (<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8fafc',borderRadius:'12px',padding:'10px 16px',border:'1.5px solid #e2e8f0'}}><button onClick={()=>removeFromCart(modalItem.n)} style={{background:'white',border:'1.5px solid #e2e8f0',width:'36px',height:'36px',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'18px',color:'#334155'}}>−</button><div style={{textAlign:'center'}}><div style={{fontWeight:900,fontSize:'18px',color:'#0f172a'}}>{qty} in cart</div><div style={{fontSize:'12px',color:'#DC2626',fontWeight:600}}>₹{modalItem.p*qty} total</div></div><button onClick={()=>addToCart({n:modalItem.n,p:modalItem.p,e:modalItem.e})} style={{background:'#DC2626',color:'white',border:'none',width:'36px',height:'36px',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'18px'}}>+</button></div>); })()}
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCart && (
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.7)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div style={{background:'white',width:'100%',maxWidth:'540px',borderRadius:'20px 20px 0 0',padding:'24px',maxHeight:'90vh',overflowY:'auto'}}>

            {/* STEP: CART */}
            {checkoutStep === 'cart' && (<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}><h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>Your Cart</h3><button onClick={()=>setShowCart(false)} style={{background:'#f1f5f9',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',color:'#334155'}}>✕</button></div>
              {cart.length === 0 ? (<div style={{textAlign:'center',padding:'40px 0',color:'#94a3b8'}}><div style={{fontSize:'48px',marginBottom:'12px'}}>🛒</div><p style={{fontWeight:500}}>Your cart is empty</p></div>) : (<>
                {cart.map(item=>(<div key={item.n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f1f5f9'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><span style={{fontSize:'24px'}}>{item.e}</span><div><div style={{fontWeight:600,fontSize:'13px',color:'#0f172a'}}>{item.n}</div><div style={{color:'#DC2626',fontSize:'12px',fontWeight:600}}>₹{item.p} × {item.qty} = ₹{item.p*item.qty}</div></div></div><div style={{display:'flex',alignItems:'center',gap:'8px'}}><button onClick={()=>removeFromCart(item.n)} style={{background:'#f1f5f9',border:'none',width:'28px',height:'28px',borderRadius:'7px',fontWeight:700,cursor:'pointer',color:'#334155'}}>−</button><span style={{fontWeight:900,minWidth:'20px',textAlign:'center',color:'#0f172a'}}>{item.qty}</span><button onClick={()=>addToCart(ITEMS.find(i=>i.n===item.n) || item)} style={{background:'#DC2626',color:'white',border:'none',width:'28px',height:'28px',borderRadius:'7px',fontWeight:700,cursor:'pointer'}}>+</button></div></div>))}
                <div style={{marginTop:'16px',padding:'14px',background:'#f8fafc',borderRadius:'12px',border:'1px solid #e2e8f0'}}><div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'16px',color:'#0f172a'}}><span>Total</span><span style={{color:'#DC2626'}}>₹{totalPrice}</span></div>{totalPrice >= 499 ? <div style={{color:'#16A34A',fontSize:'12px',marginTop:'4px',fontWeight:600}}>🎉 Free Delivery!</div> : <div style={{color:'#64748b',fontSize:'12px',marginTop:'4px'}}>Add ₹{499-totalPrice} more for free delivery</div>}</div>
                <button onClick={()=>setCheckoutStep('pincode')} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>Check Delivery →</button>
              </>)}
            </>)}

            {/* STEP: PINCODE */}
            {checkoutStep === 'pincode' && (<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}><h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>📍 Check Delivery</h3><button onClick={()=>setCheckoutStep('cart')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button></div>
              <p style={{color:'#64748b',fontSize:'13px',marginBottom:'16px'}}>Enter your pincode to check if we deliver to your area</p>
              <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}><input type="number" placeholder="Enter 6 digit pincode" value={pincode} onChange={e=>setPincode(e.target.value.slice(0,6))} style={{flex:1,padding:'12px 16px',borderRadius:'10px',border:'1.5px solid #e2e8f0',fontSize:'14px',outline:'none',color:'#0f172a'}}/><button onClick={checkPincode} style={{background:'#DC2626',color:'white',border:'none',padding:'12px 20px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>Check</button></div>
              {pinResult === 'short' && <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'12px',color:'#dc2626',fontSize:'13px',fontWeight:500}}>Please enter a valid 6-digit pincode</div>}
              {pinResult === 'valid' && (<div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:'10px',padding:'14px',fontSize:'13px',lineHeight:1.8}}><div style={{color:'#16A34A',fontWeight:700,marginBottom:'4px'}}>✅ Delivery Available!</div><div style={{color:'#334155'}}>📍 {PINCODES[pincode].area}</div><div style={{color:'#334155'}}>🕐 Delivery: <strong>{PINCODES[pincode].time}</strong></div></div>)}
              {pinResult === 'invalid' && (<div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'14px',fontSize:'13px',lineHeight:1.8}}><div style={{color:'#DC2626',fontWeight:700,marginBottom:'8px'}}>⚠️ Delivery not available in this area yet</div><div style={{color:'#64748b',marginBottom:'12px',fontSize:'12px'}}>We are expanding soon! Get notified when we arrive.</div><input placeholder="Your name" value={notifyName} onChange={e=>setNotifyName(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box',outline:'none'}}/>{!notifySent ? (<a href={`https://wa.me/918287000582?text=Please notify me: Name ${notifyName || 'Customer'}, Pincode ${pincode}`} onClick={()=>setNotifySent(true)} style={{display:'block',background:'#16A34A',color:'white',textDecoration:'none',padding:'10px',borderRadius:'8px',fontWeight:700,fontSize:'13px',textAlign:'center'}}>🔔 Notify Me on WhatsApp</a>) : (<div style={{background:'#f0fdf4',color:'#16A34A',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:700,fontSize:'13px'}}>✅ We will notify you!</div>)}</div>)}
              {pinResult === 'valid' && <button onClick={()=>setCheckoutStep('address')} style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>Enter Delivery Address →</button>}
            </>)}

            {/* STEP: ADDRESS */}
            {checkoutStep === 'address' && (<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}><h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>🏠 Delivery Address</h3><button onClick={()=>setCheckoutStep('pincode')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button></div>
              <input placeholder="Full Name *" value={address.name} onChange={e=>setAddress({...address,name:e.target.value})} style={inputStyle}/>
              <input placeholder="Phone Number (10 digits) *" type="number" value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value.slice(0,10)})} style={inputStyle}/>
              <input placeholder="Flat / House No. + Floor *" value={address.flat} onChange={e=>setAddress({...address,flat:e.target.value})} style={inputStyle}/>
              <input placeholder="Building / Society Name *" value={address.building} onChange={e=>setAddress({...address,building:e.target.value})} style={inputStyle}/>
              <input placeholder="Street / Gali *" value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} style={inputStyle}/>
              <input placeholder="Landmark (optional)" value={address.landmark} onChange={e=>setAddress({...address,landmark:e.target.value})} style={inputStyle}/>
              <textarea placeholder="Special Instructions (optional)" value={address.instructions} onChange={e=>setAddress({...address,instructions:e.target.value})} style={{...inputStyle,height:'70px',resize:'none'}}/>
              <div style={{background:'#f0fdf4',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',fontSize:'13px',color:'#16A34A',fontWeight:500}}>📍 {PINCODES[pincode]?.area} • 🕐 {PINCODES[pincode]?.time}</div>
              <button onClick={()=>{ if(isAddressValid()) setCheckoutStep('payment'); else alert('Please fill all required fields!'); }} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>Choose Payment →</button>
            </>)}

            {/* STEP: PAYMENT METHOD ── NEW! */}
            {checkoutStep === 'payment' && (<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}><h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>💳 Payment Method</h3><button onClick={()=>setCheckoutStep('address')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button></div>

              {/* Total */}
              <div style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',marginBottom:'16px',border:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'14px',color:'#64748b',fontWeight:600}}>Order Total</span>
                <span style={{fontSize:'22px',fontWeight:900,color:'#DC2626'}}>₹{totalPrice}</span>
              </div>

              {/* COD Option */}
              <div onClick={()=>setPaymentMethod('cod')} style={{border:`2px solid ${paymentMethod==='cod'?'#16A34A':'#e2e8f0'}`,borderRadius:'14px',padding:'16px',marginBottom:'12px',cursor:'pointer',background:paymentMethod==='cod'?'#f0fdf4':'white',transition:'all 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{fontSize:'32px'}}>💵</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'15px',color:'#0f172a'}}>Cash on Delivery</div>
                    <div style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>Delivery ke waqt cash dena hoga</div>
                  </div>
                  <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${paymentMethod==='cod'?'#16A34A':'#cbd5e1'}`,background:paymentMethod==='cod'?'#16A34A':'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {paymentMethod==='cod' && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'white'}}/>}
                  </div>
                </div>
              </div>

              {/* Online Payment Option */}
              <div onClick={()=>setPaymentMethod('online')} style={{border:`2px solid ${paymentMethod==='online'?'#DC2626':'#e2e8f0'}`,borderRadius:'14px',padding:'16px',marginBottom:'20px',cursor:'pointer',background:paymentMethod==='online'?'#fef2f2':'white',transition:'all 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{fontSize:'32px'}}>📱</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'15px',color:'#0f172a'}}>UPI / Card / Net Banking</div>
                    <div style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>GPay, PhonePe, Paytm, Credit/Debit Card</div>
                    <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
                      {['UPI','GPay','PhonePe','Visa','Mastercard'].map(m=><span key={m} style={{background:'#f1f5f9',color:'#475569',fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'6px'}}>{m}</span>)}
                    </div>
                  </div>
                  <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${paymentMethod==='online'?'#DC2626':'#cbd5e1'}`,background:paymentMethod==='online'?'#DC2626':'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {paymentMethod==='online' && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'white'}}/>}
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              {paymentMethod === 'cod' ? (
                <button onClick={()=>setCheckoutStep('confirm')} style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>
                  Continue with COD →
                </button>
              ) : (
                <button onClick={handleOnlinePayment} disabled={orderLoading} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:orderLoading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  {orderLoading ? '⏳ Processing...' : `💳 Pay ₹${totalPrice} Online`}
                </button>
              )}
            </>)}

            {/* STEP: CONFIRM (COD only) */}
            {checkoutStep === 'confirm' && (<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}><h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>✅ Order Summary</h3><button onClick={()=>setCheckoutStep('payment')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button></div>
              {cart.map(item=>(<div key={item.n} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px',color:'#334155'}}><span>{item.e} {item.n} × {item.qty}</span><span style={{fontWeight:700,color:'#0f172a'}}>₹{item.p*item.qty}</span></div>))}
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'16px',marginTop:'12px',padding:'12px 0',borderTop:'2px solid #e2e8f0',color:'#0f172a'}}><span>Total</span><span style={{color:'#DC2626'}}>₹{totalPrice}</span></div>
              <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:'12px',padding:'14px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'12px'}}><div style={{fontSize:'28px'}}>💵</div><div><div style={{fontWeight:700,fontSize:'14px',color:'#15803d'}}>Cash on Delivery</div><div style={{fontSize:'12px',color:'#16A34A'}}>Delivery ke waqt cash dena hoga</div></div><div style={{marginLeft:'auto',background:'#16A34A',color:'white',fontSize:'11px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>✓ Selected</div></div>
              <div style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'13px',border:'1px solid #e2e8f0',lineHeight:1.8,color:'#334155'}}><div style={{fontWeight:700,color:'#0f172a',marginBottom:'6px'}}>📦 Delivery Details</div><div>👤 {address.name} • 📱 {address.phone}</div><div>🏢 {address.flat}, {address.building}</div><div>🛣️ {address.street}{address.landmark ? `, Near ${address.landmark}` : ''}</div><div>📮 {PINCODES[pincode]?.area}, {pincode}</div><div>🕐 {PINCODES[pincode]?.time}</div></div>
              <button onClick={placeCODOrder} disabled={orderLoading} style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:orderLoading?0.7:1}}>
                {orderLoading ? '⏳ Placing Order...' : '✅ Place Order — Cash on Delivery'}
              </button>
            </>)}

            {/* STEP: DONE */}
            {checkoutStep === 'done' && (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>🎉</div>
                <h3 style={{fontSize:'22px',fontWeight:800,color:'#16A34A',marginBottom:'8px'}}>Order Placed!</h3>
                <div style={{background:'#f0fdf4',borderRadius:'14px',padding:'16px',marginBottom:'16px',border:'1px solid #86efac'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px',fontWeight:500}}>Order ID</div><div style={{fontSize:'24px',fontWeight:900,color:'#16A34A',letterSpacing:'3px'}}>#{orderId}</div></div>
                {paymentMethod === 'online' && <div style={{background:'#eff6ff',borderRadius:'12px',padding:'12px',marginBottom:'16px',border:'1px solid #bfdbfe',fontSize:'13px',color:'#1e40af',fontWeight:600}}>✅ Payment Successful!</div>}
                <p style={{color:'#64748b',fontSize:'14px',marginBottom:'20px',lineHeight:1.6}}>Your order will be delivered tomorrow<br/><strong style={{color:'#0f172a'}}>{PINCODES[pincode]?.time}</strong><br/>We will call you to confirm.</p>
                <button onClick={()=>{setShowCart(false);setCheckoutStep('cart');}} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>Continue Shopping 🛒</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
