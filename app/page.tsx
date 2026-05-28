"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Script from "next/script";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// ── COLORS ──────────────────────────────────────────────
const C = {
  red: '#DC2626',
  green: '#16A34A',
  bg: '#f7f8fa',
  white: '#ffffff',
  border: '#e8edf2',
  text: '#1a2332',
  sub: '#64748b',
  light: '#f1f5f9',
  card: '#ffffff',
};

// ── FISH ITEMS ───────────────────────────────────────────
const ITEMS = [
  {n:'Rohu Fish',b:'রুই মাছ',h:'रोहू मछली',t:'ரோஹு மீன்',s:'Cleaned & Cut',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://img.clevup.in/224989/SKU-0930_0-1712380773022.png?width=600&format=webp',imgs:['https://img.clevup.in/224989/SKU-0930_0-1712380773022.png?width=600&format=webp','https://m.media-amazon.com/images/I/51vddLa1uUL._AC_UF894,1000_QL80_.jpg'],desc:'Fresh Rohu from local market, cleaned and cut into pieces. Rich in Omega-3, perfect for curry.',storage:'Store under refrigeration at 4°C or below',weight:'Pre-cleaned: ~650g | Final: 500g | Pieces: 6-8',tags:['High Protein','Omega-3','Best Seller'],weights:[{label:'500g',price:180},{label:'1kg',price:340}],cuts:['Curry Cut','Whole Fish','Steak Cut'],nutrition:{Protein:'22g','Omega-3':'1.2g',Calories:'150kcal',Fat:'4g'},origin:'Local Delhi Market',freshness:'Caught today'},
  {n:'Ilish Hilsa',b:'ইলিশ মাছ',h:'इलिश हिलसा',t:'இலிஷ் ஹில்சா',s:'Whole Cleaned',p:380,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://www.bazaarkgp.com/product_image/11751194251.jpg',imgs:['https://www.bazaarkgp.com/product_image/11751194251.jpg'],desc:'Premium Ilish Hilsa — the king of fish. Sourced fresh every morning.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 500g | Cleaned & gutted',tags:['Premium','Seasonal','Bengali Favourite'],weights:[{label:'500g',price:380},{label:'1kg',price:720}],cuts:['Whole Fish','Steak Cut'],nutrition:{Protein:'19g','Omega-3':'2.1g',Calories:'170kcal',Fat:'8g'},origin:'Kolkata Market',freshness:'Fresh today'},
  {n:'Tiger Prawns',b:'বাঘা চিংড়ি',h:'टाइगर झींगा',t:'புலி இறால்',s:'Deveined',p:320,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://www.bbassets.com/media/uploads/p/l/800448132_1-ak-daily-bazaar-fish-bagda-chingri-tiger-prawn.jpg',imgs:['https://www.bbassets.com/media/uploads/p/l/800448132_1-ak-daily-bazaar-fish-bagda-chingri-tiger-prawn.jpg'],desc:'Large Tiger Prawns, deveined and cleaned. Great for grilling, frying or curry.',storage:'Store under refrigeration at 4°C or below',weight:'250g deveined | Count: 8-12 pieces',tags:['Deveined','Ready to Cook'],weights:[{label:'250g',price:320},{label:'500g',price:600}],cuts:['Deveined','With Shell'],nutrition:{Protein:'24g','Omega-3':'0.5g',Calories:'99kcal',Fat:'1g'},origin:'Coastal India',freshness:'Fresh today'},
  {n:'Golda Chingdi',b:'গলদা চিংড়ি',h:'गोल्डा झींगा',t:'கோல்டா இறால்',s:'Whole',p:450,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Macrobrachium_rosenbergii.jpg/400px-Macrobrachium_rosenbergii.jpg',desc:'Fresh water Golda Prawns — a Bengali delicacy.',storage:'Store under refrigeration at 4°C or below',weight:'250g whole with shell | Count: 4-6 pieces',tags:['Delicacy','Bengali Special'],weights:[{label:'250g',price:450},{label:'500g',price:850}],cuts:['Whole','Cleaned'],nutrition:{Protein:'21g','Omega-3':'0.4g',Calories:'110kcal',Fat:'2g'},origin:'West Bengal',freshness:'Fresh today'},
  {n:'Pink Perch / Kilimeen',b:'কিলিমিন',h:'पिंक पर्च',t:'கிலிமீன்',s:'Whole Cleaned',p:280,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lutjanus_campechanus.jpg/400px-Lutjanus_campechanus.jpg',desc:'Pink Perch from coastal waters. Tender white flesh.',storage:'Store under refrigeration at 4°C or below',weight:'500g whole cleaned',tags:['Coastal Catch','Tender Flesh'],weights:[{label:'500g',price:280},{label:'1kg',price:530}],cuts:['Whole Fish','Curry Cut','Fillet'],nutrition:{Protein:'20g','Omega-3':'0.8g',Calories:'130kcal',Fat:'3g'},origin:'Arabian Sea',freshness:'Caught today'},
  {n:'River Sole / Vaka Varal',b:'ভাকা ভারাল',h:'रिवर सोल',t:'வாக்கா வரால்',s:'Whole Cleaned',p:260,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Solea_solea.jpg/400px-Solea_solea.jpg',desc:'River Sole — flat fish with delicate flavour.',storage:'Store under refrigeration at 4°C or below',weight:'500g whole cleaned',tags:['Delicate Flavour'],weights:[{label:'500g',price:260},{label:'1kg',price:490}],cuts:['Whole Fish','Fillet'],nutrition:{Protein:'18g','Omega-3':'0.6g',Calories:'120kcal',Fat:'2g'},origin:'River Catch',freshness:'Fresh today'},
  {n:'Kolkata Bhetki / Barramundi',b:'ভেটকী মাছ',h:'भेटकी / बारामुंडी',t:'பெட்கி மீன்',s:'Whole Fish 1kg-2kg',p:520,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lates_calcarifer.jpg/400px-Lates_calcarifer.jpg',desc:'Premium Bhetki from Kolkata markets.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 1kg-2kg | Cleaned',tags:['Premium','Firm Flesh','Bengali Classic'],weights:[{label:'1kg',price:520},{label:'2kg',price:980}],cuts:['Whole Fish','Curry Cut','Steak'],nutrition:{Protein:'23g','Omega-3':'1.0g',Calories:'145kcal',Fat:'5g'},origin:'Kolkata Market',freshness:'Fresh today'},
  {n:'Black Pomfret / Halwa Fish',b:'কালো পমফ্রেট',h:'काला पॉमफ्रेट',t:'கருப்பு பாம்ஃப்ரெட்',s:'Whole Fish 1.5kg-4kg',p:580,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Parastromateus_niger.jpg/400px-Parastromateus_niger.jpg',desc:'Black Pomfret — a premium sea fish.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 1.5kg-4kg',tags:['Sea Fish','Premium','Mild Flavour'],weights:[{label:'1kg',price:580},{label:'2kg',price:1100}],cuts:['Whole Fish','Curry Cut'],nutrition:{Protein:'21g','Omega-3':'1.5g',Calories:'160kcal',Fat:'6g'},origin:'Arabian Sea',freshness:'Caught today'},
  {n:'White Pomfret / Silver Pomfret',b:'রূপালী পমফ্রেট',h:'सफेद पॉमफ्रेट',t:'வெள்ளை பாம்ஃப்ரெட்',s:'Whole Fish 200g-300g',p:650,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pampus_argenteus.jpg/400px-Pampus_argenteus.jpg',desc:'Silver Pomfret — the most prized sea fish.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 200g-300g per piece',tags:['Most Prized','Buttery','Sea Fish'],weights:[{label:'250g',price:650},{label:'500g',price:1200}],cuts:['Whole Fish','Fillet'],nutrition:{Protein:'20g','Omega-3':'1.8g',Calories:'155kcal',Fat:'7g'},origin:'Arabian Sea',freshness:'Caught today'},
  {n:'Seer Fish / Surmai',b:'সুরমাই মাছ',h:'सुरमई मछली',t:'வஞ்சரம் மீன்',s:'Whole Fish 5kg+',p:750,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Scomberomorus_commerson.jpg/400px-Scomberomorus_commerson.jpg',desc:'King Mackerel / Surmai — firm steaks with rich flavour.',storage:'Store under refrigeration at 4°C or below',weight:'Whole fish 5kg+ | Steaks available',tags:['King Fish','Firm Steak'],weights:[{label:'500g',price:750},{label:'1kg',price:1400}],cuts:['Steak Cut','Curry Cut','Whole'],nutrition:{Protein:'26g','Omega-3':'1.3g',Calories:'175kcal',Fat:'6g'},origin:'Bay of Bengal',freshness:'Caught today'},
  {n:'Mackerel / Bangda',b:'ম্যাকেরেল',h:'मैकेरल / बांगड़ा',t:'அயலா மீன்',s:'5-9 Count/kg • Whole',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Rastrelliger_kanagurta.jpg/400px-Rastrelliger_kanagurta.jpg',desc:'Fresh Mackerel — affordable and nutritious.',storage:'Store under refrigeration at 4°C or below',weight:'5-9 count per kg | Whole',tags:['Omega-3','Affordable','Nutritious'],weights:[{label:'500g',price:180},{label:'1kg',price:340}],cuts:['Whole Fish','Curry Cut'],nutrition:{Protein:'19g','Omega-3':'2.2g',Calories:'165kcal',Fat:'8g'},origin:'Coastal India',freshness:'Fresh today'},
];;

const AVAILABLE_ITEMS: any[] = [];

// ── PINCODES ─────────────────────────────────────────────
const PINCODES: Record<string,{area:string,time:string}> = {
  '110092':{area:'Preet Vihar / Mandawali',time:'9 AM - 12 PM'},
  '110091':{area:'IP Extension / Patparganj',time:'9 AM - 12 PM'},
  '110096':{area:'Mayur Vihar Phase 1 & 2',time:'9 AM - 12 PM'},
  '110051':{area:'Gandhi Nagar / Geeta Colony',time:'9 AM - 12 PM'},
  '110031':{area:'Shakarpur / Laxmi Nagar',time:'9 AM - 12 PM'},
  '110032':{area:'Vivek Vihar / Karkardooma',time:'9 AM - 12 PM'},
  '110093':{area:'Pandav Nagar / Ganesh Nagar',time:'9 AM - 12 PM'},
  '110053':{area:'Krishna Nagar',time:'9 AM - 12 PM'},
  '110033':{area:'Mother Dairy / Kosambi',time:'9 AM - 12 PM'},
};

// ── TYPES ────────────────────────────────────────────────
type CartItem = { n:string; e:string; p:number; qty:number; img?:string };
type Address = { name:string; phone:string; flat:string; building:string; street:string; landmark:string; instructions:string };
type PaymentMethod = 'cod'|'online';
type SavedAddress = { id:string; label:string; flat:string; building:string; street:string; landmark:string; pincode:string; area:string; isDefault:boolean };
type ModalItem = typeof ITEMS[0] & { available?: boolean };

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'11px 14px', borderRadius:'10px',
  border:`1.5px solid ${C.border}`, fontSize:'14px', marginBottom:'10px',
  boxSizing:'border-box', outline:'none', color:C.text, background:'white',
};

// ── SCROLLING TICKER ─────────────────────────────────────
function ScrollingTicker({ availableItems, preorderItems }: { availableItems: typeof AVAILABLE_ITEMS, preorderItems: typeof ITEMS }) {
  const tickerItems = [
    ...availableItems.map(i => ({ label: `${i.e} ${i.n} ₹${i.p}${i.u}`, type: 'available' as const, delivery: '90 min delivery' })),
    ...preorderItems.map(i => ({ label: `${i.e} ${i.n} ₹${i.p}`, type: 'preorder' as const, delivery: 'Tomorrow morning' })),
  ];
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div style={{ background: C.red, overflow: 'hidden', height: '34px', display: 'flex', alignItems: 'center' }}>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.ticker-track{display:flex;animation:ticker 40s linear infinite;width:max-content;will-change:transform}.ticker-track:hover{animation-play-state:paused}`}</style>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 20px', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{item.label}</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>• {item.delivery}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── SEARCH BAR ───────────────────────────────────────────
function SearchBar({ allItems, onSelect }: { allItems: any[], onSelect: (item: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const q = query.toLowerCase();
    const found = allItems.filter(item =>
      item.n?.toLowerCase().includes(q) || item.b?.toLowerCase().includes(q) ||
      item.h?.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q) ||
      item.tags?.some((t: string) => t.toLowerCase().includes(q))
    ).slice(0, 8);
    setResults(found);
  }, [query, allItems]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', padding: '9px 16px', gap: '8px', border: focused ? `1.5px solid ${C.red}` : `1.5px solid ${C.border}`, transition: 'border 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>🔍</span>
        <input placeholder="Search fish, prawns, seafood..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: C.text }} />
        {query && <button onClick={() => { setQuery(''); setResults([]); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: 0 }}>✕</button>}
      </div>
      {focused && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`, zIndex: 500, overflow: 'hidden', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ padding: '8px 14px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{results.length} RESULT{results.length > 1 ? 'S' : ''} FOUND</div>
          {results.map((item, i) => (
            <div key={i} onClick={() => { onSelect(item); setQuery(''); setResults([]); setFocused(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${C.light}` }} onMouseEnter={e => (e.currentTarget.style.background = C.light)} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: item.bg || '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.img ? <img src={item.img} alt={item.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span style={{ fontSize: '24px' }}>{item.e}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: C.text }}>{item.n}</div>
                {item.b && <div style={{ fontSize: '11px', color: C.green, fontWeight: 600 }}>{item.b}</div>}
                <div style={{ fontSize: '11px', color: C.sub }}>{item.s || ''}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '14px', color: C.red }}>₹{item.p}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#0B4F6C', background: '#EBF5FA', padding: '2px 7px', borderRadius: '10px', marginTop: '2px' }}>Pre-Order</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {focused && query.length > 0 && results.length === 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`, zIndex: 500, padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          🐟 No fish found for "{query}"
        </div>
      )}
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────
function ProgressBar({ step }: { step: string }) {
  const steps = ['cart', 'address', 'payment', 'done'];
  const labels = ['Cart', 'Address', 'Payment', 'Done'];
  const curr = steps.indexOf(step === 'pincode' ? 'address' : step === 'confirm' ? 'payment' : step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', background: 'white', borderBottom: `1px solid ${C.border}` }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: i <= curr ? C.red : C.light, color: i <= curr ? 'white' : C.sub, transition: 'all 0.3s' }}>
              {i < curr ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: i <= curr ? C.red : C.sub, whiteSpace: 'nowrap' }}>{labels[i]}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 40, height: 2, background: i < curr ? C.red : C.border, margin: '0 4px', marginBottom: 16, transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pinResult, setPinResult] = useState<null|'valid'|'invalid'|'short'>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart'|'pincode'|'address'|'payment'|'confirm'|'done'>('cart');
  const [address, setAddress] = useState<Address>({name:'',phone:'',flat:'',building:'',street:'',landmark:'',instructions:''});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [modalItem, setModalItem] = useState<ModalItem|null>(null);
  const [modalPhoto, setModalPhoto] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [selectedCut, setSelectedCut] = useState(0);
  const [currentUser, setCurrentUser] = useState<{name:string,phone:string,addresses?:any[]}|null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState<string|null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Auth state
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.phoneNumber) {
        const ph = user.phoneNumber.replace('+91','');
        try {
          const pd = await getDoc(doc(db,'users',ph));
          if (pd.exists()) {
            const data = pd.data();
            setCurrentUser({name:data.name||'',phone:ph,addresses:data.addresses||[]});
            setSavedAddresses(data.addresses||[]);
            // Auto select default address
            const def = (data.addresses||[]).find((a:any)=>a.isDefault);
            if (def) { setSelectedSavedAddr(def.id); setPincode(def.pincode); setPinResult('valid'); }
          } else {
            setCurrentUser({name:'',phone:ph,addresses:[]});
          }
        } catch(e) { setCurrentUser(null); }
      } else {
        setCurrentUser(null);
        setSavedAddresses([]);
      }
    });
    return () => unsub();
  }, []);

  const totalPrice = cart.reduce((s,i)=>s+i.p*i.qty,0);
  const totalItems = cart.reduce((s,i)=>s+i.qty,0);

  const addToCart = (item: any) => {
    setCart(prev => {
      const ex = prev.find(c=>c.n===item.n);
      if (ex) return prev.map(c=>c.n===item.n?{...c,qty:c.qty+1}:c);
      return [...prev, {n:item.n,e:item.e,p:item.p,qty:1,img:item.img}];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => {
      const ex = prev.find(c=>c.n===name);
      if (ex && ex.qty > 1) return prev.map(c=>c.n===name?{...c,qty:c.qty-1}:c);
      return prev.filter(c=>c.n!==name);
    });
  };

  const checkPincode = (val: string) => {
    setPincode(val);
    if (val.length === 6) setPinResult(PINCODES[val] ? 'valid' : 'invalid');
    else if (val.length > 0) setPinResult('short');
    else setPinResult(null);
  };

  const isAddressValid = () => {
    if (selectedSavedAddr && !useNewAddress) {
      const sa = savedAddresses.find(a=>a.id===selectedSavedAddr);
      return sa && address.name && address.phone.length===10;
    }
    return address.name && address.phone.length===10 && address.flat && address.building && address.street && pinResult==='valid';
  };

  // Fill address from saved
  const applySelectedAddress = (id: string) => {
    setSelectedSavedAddr(id);
    setUseNewAddress(false);
    const sa = savedAddresses.find(a=>a.id===id);
    if (sa) {
      setPincode(sa.pincode);
      setPinResult('valid');
      setAddress(prev=>({...prev,flat:sa.flat,building:sa.building,street:sa.street,landmark:sa.landmark||''}));
    }
  };

  // Razorpay
  const handleOnlinePayment = async () => {
    if(!isAddressValid()) return;
    setOrderLoading(true);
    try {
      const res = await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:totalPrice,name:address.name,phone:address.phone})});
      const orderData = await res.json();
      if(!orderData.id) { alert('Order creation failed'); setOrderLoading(false); return; }
      const options = {
        key: 'rzp_live_SsO85o950hY9hk',
        amount: orderData.amount,
        currency: 'INR',
        name: 'Fishon 🐟',
        description: 'Fresh Fish Delivery',
        order_id: orderData.id,
        prefill: { name: address.name, contact: `+91${address.phone}` },
        theme: { color: C.red },
        handler: async (response: any) => {
          const verify = await fetch('/api/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(response)});
          const data = await verify.json();
          if(data.success) { await saveOrderToFirebase('online',response.razorpay_payment_id); }
          else { alert('Payment verification failed.'); }
        },
        modal: { ondismiss: () => setOrderLoading(false) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch(e) { console.error(e); alert('Payment failed. Please try again.'); setOrderLoading(false); }
  };

  const saveOrderToFirebase = async (method: string, paymentId?: string) => {
    try {
      const itemsText = cart.map(i=>`${i.e} ${i.n} x${i.qty} = ₹${i.p*i.qty}`).join(', ');
      let fullAddress = '';
      let area = '';
      let deliveryTime = '';
      if (selectedSavedAddr && !useNewAddress) {
        const sa = savedAddresses.find(a=>a.id===selectedSavedAddr);
        if (sa) {
          fullAddress = `${sa.flat}, ${sa.building}, ${sa.street}${sa.landmark?', Near '+sa.landmark:''}, ${sa.area}, ${sa.pincode}`;
          area = sa.area; deliveryTime = PINCODES[sa.pincode]?.time || '9 AM - 12 PM';
        }
      } else {
        fullAddress = `${address.flat}, ${address.building}, ${address.street}${address.landmark?', Near '+address.landmark:''}, ${PINCODES[pincode]?.area}, ${pincode}`;
        area = PINCODES[pincode]?.area || ''; deliveryTime = PINCODES[pincode]?.time || '9 AM - 12 PM';
      }
      const docRef = await addDoc(collection(db,'orders'),{
        name:address.name, phone:address.phone, items:itemsText, total:totalPrice,
        pincode, area, address:fullAddress, flat:address.flat, building:address.building,
        street:address.street, landmark:address.landmark, instructions:address.instructions,
        paymentMethod:method, paymentId:paymentId||null,
        status:method==='online'?'paid':'new',
        source:'website', deliveryTime, createdAt:serverTimestamp(),
      });
      setOrderId(docRef.id.slice(0,8).toUpperCase());
      fetch('/api/notify-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:address.name,phone:address.phone,items:itemsText,total:totalPrice,area,address:fullAddress,deliveryTime,paymentMethod:method,instructions:address.instructions,orderId:docRef.id.slice(0,8).toUpperCase()})});
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

  const allItems = [...AVAILABLE_ITEMS, ...ITEMS];

  return (
    <main style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',minHeight:'100vh',background:C.bg}}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* ── TICKER ── */}
      <ScrollingTicker availableItems={AVAILABLE_ITEMS} preorderItems={ITEMS} />

      {/* ── HEADER ── */}
      <header style={{background:'white',borderBottom:`1px solid ${C.border}`,position:'sticky',top:0,zIndex:200,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginRight:'8px'}}>
            <div style={{width:38,height:38,background:C.red,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🐟</div>
            <div>
              <span style={{color:C.red,fontWeight:900,fontSize:20}}>Fish</span>
              <span style={{color:C.green,fontWeight:900,fontSize:20,fontStyle:'italic'}}>on</span>
            </div>
          </div>

          {/* Search */}
          <SearchBar allItems={allItems} onSelect={(item)=>{addToCart(item);setShowCart(true);setCheckoutStep('cart');}} />

          {/* Delivery badge */}
          <div style={{display:'flex',alignItems:'center',gap:'6px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:20,padding:'6px 12px',whiteSpace:'nowrap'}}>
            <span style={{fontSize:12}}>📍</span>
            <span style={{fontSize:12,fontWeight:700,color:C.green}}>Delhi NCR</span>
          </div>

          {/* Cart button */}
          <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}} style={{background:C.red,color:'white',border:'none',padding:'9px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',boxShadow:'0 2px 8px rgba(220,38,38,0.25)'}}>
            🛒 Cart{totalItems>0&&<span style={{background:'white',color:C.red,borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900}}>{totalItems}</span>}
          </button>

          {/* WhatsApp */}
          <a href="https://wa.me/918287000582" target="_blank" rel="noreferrer" style={{background:C.green,color:'white',textDecoration:'none',padding:'9px 14px',borderRadius:'10px',fontSize:'13px',fontWeight:700,display:'flex',alignItems:'center',gap:'5px',boxShadow:'0 2px 8px rgba(22,163,74,0.25)'}}>
            💬 WhatsApp
          </a>

          {/* Login/Logout */}
          {currentUser ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <a href="/login" style={{display:'flex',alignItems:'center',gap:'6px',background:C.light,border:`1px solid ${C.border}`,color:C.text,textDecoration:'none',padding:'8px 14px',borderRadius:'10px',fontSize:'13px',fontWeight:700}}>
                <div style={{width:24,height:24,background:C.red,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white'}}>{currentUser.name?currentUser.name[0].toUpperCase():'U'}</div>
                {currentUser.name||'Profile'}
              </a>
              <button onClick={()=>signOut(getAuth()).then(()=>setCurrentUser(null))} style={{background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',color:C.red,padding:'8px 12px',borderRadius:'10px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" style={{background:C.text,color:'white',textDecoration:'none',padding:'9px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:700,display:'flex',alignItems:'center',gap:'5px'}}>
              👤 Login
            </a>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{background:`linear-gradient(135deg, ${C.red} 0%, #b91c1c 100%)`,color:'white',padding:'32px 20px',textAlign:'center'}}>
        <div style={{maxWidth:600,margin:'0 auto'}}>
          <div style={{fontSize:36,marginBottom:8}}>🐟</div>
          <h1 style={{fontSize:'clamp(22px,5vw,32px)',fontWeight:900,margin:'0 0 8px',letterSpacing:'-0.5px'}}>Fresh Fish, Delivered Daily</h1>
          <p style={{fontSize:14,opacity:0.9,margin:'0 0 16px'}}>Pre-order by 11 PM • Delivered 9 AM–12 PM • Delhi NCR</p>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            {['✅ No Chemicals','🧊 Always Fresh','🚚 Home Delivery','⭐ FSSAI Certified'].map(t=>(
              <span key={t} style={{background:'rgba(255,255,255,0.15)',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FISH GRID ── */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:800,color:C.text,margin:0}}>🐟 Pre-Order Fish</h2>
          <span style={{fontSize:12,color:C.sub,background:C.light,padding:'4px 12px',borderRadius:20,fontWeight:600}}>Order by 11 PM</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
          {ITEMS.map((item,idx)=>{
            const cartItem = cart.find(c=>c.n===item.n);
            return (
              <div key={idx} style={{background:'white',borderRadius:14,overflow:'hidden',border:`1px solid ${C.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',transition:'box-shadow 0.2s,transform 0.2s',cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)';e.currentTarget.style.transform='translateY(0)';}}
              >
                <div onClick={()=>{setModalItem(item);setModalPhoto(0);}} style={{position:'relative'}}>
                  <div style={{height:130,background:item.bg||'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    {item.img?<img src={item.img} alt={item.n} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>:<span style={{fontSize:40}}>{item.e}</span>}
                  </div>
                  <div style={{position:'absolute',top:8,left:8,background:'#EBF5FA',color:'#0B4F6C',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:10,letterSpacing:0.5}}>PRE-ORDER</div>
                </div>
                <div style={{padding:'10px 10px 12px'}}>
                  <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2,lineHeight:1.2}}>{item.n}</div>
                  <div style={{fontSize:11,color:C.green,fontWeight:700,marginBottom:2}}>{item.b}</div>
                  <div style={{fontSize:11,color:C.sub,marginBottom:8}}>{item.s}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{fontWeight:900,fontSize:15,color:C.red}}>₹{item.p}</div>
                    {cartItem ? (
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <button onClick={()=>removeFromCart(item.n)} style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${C.border}`,background:'white',cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:C.text}}>−</button>
                        <span style={{fontWeight:800,fontSize:13,color:C.text,minWidth:16,textAlign:'center'}}>{cartItem.qty}</span>
                        <button onClick={()=>addToCart(item)} style={{width:26,height:26,borderRadius:'50%',border:'none',background:C.red,cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>+</button>
                      </div>
                    ) : (
                      <button onClick={()=>addToCart(item)} style={{background:C.red,color:'white',border:'none',padding:'5px 12px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>Add</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div style={{marginTop:32,background:'white',borderRadius:16,border:`1px solid ${C.border}`,padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:20}}>
          {[{e:'🧊',t:'Always Fresh',d:'Sourced every morning from market'},
            {e:'🚫',t:'No Chemicals',d:'No preservatives or artificial agents'},
            {e:'🚚',t:'Home Delivery',d:'9 AM – 12 PM, Delhi NCR'},
            {e:'⭐',t:'FSSAI Certified',d:'Reg: 23326003001887'},
          ].map(({e,t,d})=>(
            <div key={t} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:24}}>{e}</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.text}}>{t}</div>
                <div style={{fontSize:12,color:C.sub,marginTop:2}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING CART BUTTON ── */}
      {totalItems > 0 && !showCart && (
        <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}} style={{position:'fixed',bottom:'24px',right:'24px',background:C.red,color:'white',border:'none',padding:'14px 22px',borderRadius:'50px',fontWeight:700,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 24px rgba(220,38,38,0.4)',zIndex:200,display:'flex',alignItems:'center',gap:'10px'}}>
          🛒 {totalItems} item{totalItems>1?'s':''} • ₹{totalPrice}
        </button>
      )}

      {/* ── CART / CHECKOUT MODAL ── */}
      {showCart && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={e=>{if(e.target===e.currentTarget){setShowCart(false);}}}>
          <div style={{background:'white',width:'100%',maxWidth:540,borderRadius:'20px 20px 0 0',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 -4px 40px rgba(0,0,0,0.15)'}}>

            {/* Progress bar */}
            {checkoutStep !== 'cart' && checkoutStep !== 'done' && <ProgressBar step={checkoutStep} />}

            {/* Header */}
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'white',zIndex:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                {checkoutStep !== 'cart' && checkoutStep !== 'done' && (
                  <button onClick={()=>{
                    if(checkoutStep==='address'||checkoutStep==='pincode') setCheckoutStep('cart');
                    else if(checkoutStep==='payment') setCheckoutStep('address');
                    else if(checkoutStep==='confirm') setCheckoutStep('payment');
                  }} style={{background:C.light,border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
                )}
                <div style={{fontWeight:800,fontSize:17,color:C.text}}>
                  {checkoutStep==='cart'?`My Cart (${totalItems})`
                  :checkoutStep==='pincode'||checkoutStep==='address'?'Delivery Address'
                  :checkoutStep==='payment'||checkoutStep==='confirm'?'Payment'
                  :'Order Placed! 🎉'}
                </div>
              </div>
              <button onClick={()=>setShowCart(false)} style={{background:C.light,border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:C.sub}}>✕</button>
            </div>

            <div style={{padding:'16px 20px'}}>

              {/* ── CART STEP ── */}
              {checkoutStep==='cart' && (
                <>
                  {cart.length===0?(
                    <div style={{textAlign:'center',padding:'40px 0',color:C.sub}}>
                      <div style={{fontSize:40,marginBottom:12}}>🛒</div>
                      <div style={{fontWeight:600,marginBottom:16}}>Your cart is empty</div>
                      <button onClick={()=>setShowCart(false)} style={{background:C.red,color:'white',border:'none',padding:'10px 24px',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Browse Fish</button>
                    </div>
                  ):(
                    <>
                      {cart.map(item=>(
                        <div key={item.n} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:`1px solid ${C.light}`}}>
                          <div style={{width:50,height:50,borderRadius:10,overflow:'hidden',background:C.light,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            {item.img?<img src={item.img} alt={item.n} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:24}}>{item.e}</span>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:14,color:C.text}}>{item.n}</div>
                            <div style={{fontWeight:800,fontSize:14,color:C.red}}>₹{item.p*item.qty}</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <button onClick={()=>removeFromCart(item.n)} style={{width:28,height:28,borderRadius:'50%',border:`1.5px solid ${C.border}`,background:'white',cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:C.text}}>−</button>
                            <span style={{fontWeight:800,minWidth:16,textAlign:'center',color:C.text}}>{item.qty}</span>
                            <button onClick={()=>addToCart(item)} style={{width:28,height:28,borderRadius:'50%',border:'none',background:C.red,cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>+</button>
                          </div>
                        </div>
                      ))}
                      <div style={{background:C.light,borderRadius:12,padding:14,margin:'12px 0'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontWeight:700,fontSize:15,color:C.text}}>Total</span>
                          <span style={{fontWeight:900,fontSize:20,color:C.red}}>₹{totalPrice}</span>
                        </div>
                        <div style={{fontSize:12,color:C.sub,marginTop:4}}>🕐 Delivered tomorrow 9 AM–12 PM</div>
                      </div>
                      <button onClick={()=>setCheckoutStep('address')} style={{width:'100%',background:C.red,color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 12px rgba(220,38,38,0.3)'}}>
                        Proceed to Address →
                      </button>
                    </>
                  )}
                </>
              )}

              {/* ── ADDRESS STEP ── */}
              {(checkoutStep==='address'||checkoutStep==='pincode') && (
                <>
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && !useNewAddress && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.sub,marginBottom:10,textTransform:'uppercase' as const,letterSpacing:0.5}}>Saved Addresses</div>
                      {savedAddresses.map(sa=>(
                        <div key={sa.id} onClick={()=>applySelectedAddress(sa.id)} style={{border:`2px solid ${selectedSavedAddr===sa.id?C.red:C.border}`,borderRadius:12,padding:'12px 14px',marginBottom:8,cursor:'pointer',background:selectedSavedAddr===sa.id?'#fff5f5':'white',transition:'all 0.2s'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                            <span style={{fontSize:14}}>{sa.label==='Home'?'🏠':sa.label==='Work'?'🏢':'📍'}</span>
                            <span style={{fontWeight:700,fontSize:13,color:C.text}}>{sa.label}</span>
                            {sa.isDefault&&<span style={{fontSize:10,color:C.green,background:'#dcfce7',padding:'2px 7px',borderRadius:10,fontWeight:700}}>Default</span>}
                            {selectedSavedAddr===sa.id&&<span style={{marginLeft:'auto',color:C.red,fontWeight:800,fontSize:16}}>✓</span>}
                          </div>
                          <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{sa.flat}, {sa.building}, {sa.street}{sa.landmark?`, Near ${sa.landmark}`:''}<br/>{sa.area}, {sa.pincode}</div>
                        </div>
                      ))}
                      <button onClick={()=>{setUseNewAddress(true);setSelectedSavedAddr(null);}} style={{width:'100%',background:'white',border:`1.5px dashed ${C.border}`,color:C.sub,padding:12,borderRadius:12,fontWeight:600,fontSize:13,cursor:'pointer',marginTop:4}}>
                        + Use a Different Address
                      </button>
                      <div style={{marginTop:16}}>
                        <input placeholder="Your Name *" value={address.name} onChange={e=>setAddress(a=>({...a,name:e.target.value}))} style={inputStyle}/>
                        <input placeholder="Phone Number *" type="number" value={address.phone} onChange={e=>setAddress(a=>({...a,phone:e.target.value.slice(0,10)}))} style={inputStyle}/>
                      </div>
                    </div>
                  )}

                  {/* New address form */}
                  {(useNewAddress || savedAddresses.length===0) && (
                    <>
                      {useNewAddress && (
                        <button onClick={()=>{setUseNewAddress(false);setSelectedSavedAddr(savedAddresses.find(a=>a.isDefault)?.id||null);}} style={{background:C.light,border:'none',color:C.sub,padding:'8px 14px',borderRadius:8,fontWeight:600,fontSize:12,cursor:'pointer',marginBottom:12}}>
                          ← Use Saved Address
                        </button>
                      )}
                      <input placeholder="Your Name *" value={address.name} onChange={e=>setAddress(a=>({...a,name:e.target.value}))} style={inputStyle}/>
                      <input placeholder="Phone Number *" type="number" value={address.phone} onChange={e=>setAddress(a=>({...a,phone:e.target.value.slice(0,10)}))} style={inputStyle}/>
                      <div style={{position:'relative'}}>
                        <input placeholder="Pincode *" type="number" value={pincode} onChange={e=>checkPincode(e.target.value.slice(0,6))} style={{...inputStyle,borderColor:pinResult==='valid'?C.green:pinResult==='invalid'?C.red:C.border}}/>
                        {pinResult==='valid'&&<div style={{marginTop:-8,marginBottom:8,fontSize:12,color:C.green,fontWeight:600}}>✅ {PINCODES[pincode]?.area} — Delivery Available!</div>}
                        {pinResult==='invalid'&&<div style={{marginTop:-8,marginBottom:8,fontSize:12,color:C.red}}>❌ Delivery not available in this area</div>}
                      </div>
                      <input placeholder="Flat / House No. *" value={address.flat} onChange={e=>setAddress(a=>({...a,flat:e.target.value}))} style={inputStyle}/>
                      <input placeholder="Building / Society Name *" value={address.building} onChange={e=>setAddress(a=>({...a,building:e.target.value}))} style={inputStyle}/>
                      <input placeholder="Street / Lane *" value={address.street} onChange={e=>setAddress(a=>({...a,street:e.target.value}))} style={inputStyle}/>
                      <input placeholder="Landmark (optional)" value={address.landmark} onChange={e=>setAddress(a=>({...a,landmark:e.target.value}))} style={inputStyle}/>
                    </>
                  )}

                  <input placeholder="Special instructions (optional)" value={address.instructions} onChange={e=>setAddress(a=>({...a,instructions:e.target.value}))} style={inputStyle}/>

                  <button onClick={()=>{if(isAddressValid())setCheckoutStep('payment');}} disabled={!isAddressValid()} style={{width:'100%',background:isAddressValid()?C.red:'#cbd5e1',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:isAddressValid()?'pointer':'not-allowed',marginTop:4}}>
                    Continue to Payment →
                  </button>
                </>
              )}

              {/* ── PAYMENT STEP ── */}
              {(checkoutStep==='payment'||checkoutStep==='confirm') && (
                <>
                  {/* Order summary */}
                  <div style={{background:C.light,borderRadius:12,padding:14,marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.sub,marginBottom:8,textTransform:'uppercase' as const,letterSpacing:0.5}}>Order Summary</div>
                    {cart.map(i=>(
                      <div key={i.n} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:C.text,marginBottom:4}}>
                        <span>{i.e} {i.n} × {i.qty}</span>
                        <span style={{fontWeight:700}}>₹{i.p*i.qty}</span>
                      </div>
                    ))}
                    <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:8,display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontWeight:800,color:C.text}}>Total</span>
                      <span style={{fontWeight:900,fontSize:18,color:C.red}}>₹{totalPrice}</span>
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:12,marginBottom:16,fontSize:13,color:C.green,fontWeight:600}}>
                    🚚 Delivery tomorrow 9 AM–12 PM • {selectedSavedAddr&&!useNewAddress?(savedAddresses.find(a=>a.id===selectedSavedAddr)?.area||''):PINCODES[pincode]?.area}
                  </div>

                  {/* Payment options */}
                  <div style={{fontSize:13,fontWeight:700,color:C.sub,marginBottom:10,textTransform:'uppercase' as const,letterSpacing:0.5}}>Payment Method</div>
                  {[
                    {val:'cod',label:'💵 Cash on Delivery',sub:'Pay when your order arrives'},
                    {val:'online',label:'💳 Pay Online',sub:'UPI, Card, Net Banking — Secure & Instant'},
                  ].map(opt=>(
                    <div key={opt.val} onClick={()=>setPaymentMethod(opt.val as PaymentMethod)} style={{border:`2px solid ${paymentMethod===opt.val?C.red:C.border}`,borderRadius:12,padding:'12px 14px',marginBottom:10,cursor:'pointer',background:paymentMethod===opt.val?'#fff5f5':'white',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                      <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${paymentMethod===opt.val?C.red:C.border}`,background:paymentMethod===opt.val?C.red:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {paymentMethod===opt.val&&<div style={{width:8,height:8,borderRadius:'50%',background:'white'}}/>}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:C.text}}>{opt.label}</div>
                        <div style={{fontSize:12,color:C.sub}}>{opt.sub}</div>
                      </div>
                    </div>
                  ))}

                  <button onClick={()=>{paymentMethod==='online'?handleOnlinePayment():placeCODOrder();}} disabled={orderLoading} style={{width:'100%',background:orderLoading?'#cbd5e1':C.red,color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:orderLoading?'not-allowed':'pointer',marginTop:8,boxShadow:'0 4px 12px rgba(220,38,38,0.3)'}}>
                    {orderLoading?'⏳ Processing...':`${paymentMethod==='online'?'💳 Pay ₹'+totalPrice:'✅ Place COD Order'}`}
                  </button>
                </>
              )}

              {/* ── DONE STEP ── */}
              {checkoutStep==='done' && (
                <div style={{textAlign:'center',padding:'32px 0'}}>
                  <div style={{fontSize:56,marginBottom:16}}>🎉</div>
                  <h2 style={{fontSize:22,fontWeight:900,color:C.text,margin:'0 0 8px'}}>Order Placed!</h2>
                  <div style={{fontSize:16,color:C.sub,marginBottom:8}}>Order #{orderId}</div>
                  <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:14,margin:'16px 0',fontSize:14,color:C.green,fontWeight:600}}>
                    🚚 Delivery tomorrow 9 AM – 12 PM<br/>
                    📲 You'll receive a confirmation shortly
                  </div>
                  <button onClick={()=>{setShowCart(false);setCheckoutStep('cart');}} style={{background:C.red,color:'white',border:'none',padding:'12px 28px',borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 12px rgba(220,38,38,0.3)'}}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ITEM DETAIL MODAL (FreshToHome Style) ── */}
      {modalItem && (
        <div onClick={()=>setModalItem(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:400,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white',width:'100%',maxWidth:520,borderRadius:'20px 20px 0 0',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}}>

            {/* Photo */}
            <div style={{position:'relative',height:260,background:'#f1f5f9',overflow:'hidden'}}>
              {(modalItem.imgs?.[modalPhoto]||modalItem.img)?<img src={modalItem.imgs?.[modalPhoto]||modalItem.img} alt={modalItem.n} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:80}}>{modalItem.e}</div>}
              <button onClick={()=>setModalItem(null)} style={{position:'absolute',top:12,right:12,background:'rgba(255,255,255,0.95)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)',color:'#334155'}}>✕</button>
              {modalItem.badge&&<span style={{position:'absolute',top:12,left:12,background:'#0B4F6C',color:'white',fontSize:10,fontWeight:800,padding:'4px 12px',borderRadius:20,letterSpacing:0.5}}>PRE-ORDER</span>}
              {(modalItem as any).freshness&&<div style={{position:'absolute',bottom:12,left:12,background:'rgba(22,163,74,0.95)',color:'white',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>🟢 {(modalItem as any).freshness}</div>}
              {modalItem.imgs&&modalItem.imgs.length>1&&(<>
                <button onClick={e=>{e.stopPropagation();setModalPhoto(p=>p===0?modalItem.imgs!.length-1:p-1);}} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:18,fontWeight:700}}>‹</button>
                <button onClick={e=>{e.stopPropagation();setModalPhoto(p=>p===modalItem.imgs!.length-1?0:p+1);}} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:18,fontWeight:700}}>›</button>
                <div style={{position:'absolute',bottom:12,right:12,display:'flex',gap:5}}>{modalItem.imgs.map((_:any,i:number)=><div key={i} onClick={e=>{e.stopPropagation();setModalPhoto(i);}} style={{width:7,height:7,borderRadius:'50%',cursor:'pointer',background:i===modalPhoto?'white':'rgba(255,255,255,0.5)'}}/>)}</div>
              </>)}
            </div>

            {/* Thumbnails */}
            {modalItem.imgs&&modalItem.imgs.length>1&&(
              <div style={{display:'flex',gap:8,padding:'10px 16px',borderBottom:'1px solid #f1f5f9',overflowX:'auto'}}>
                {modalItem.imgs.map((img:string,i:number)=>(
                  <div key={i} onClick={()=>setModalPhoto(i)} style={{width:52,height:52,borderRadius:10,overflow:'hidden',flexShrink:0,border:`2px solid ${i===modalPhoto?'#DC2626':'#e2e8f0'}`,cursor:'pointer'}}>
                    <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ))}
              </div>
            )}

            <div style={{padding:'16px 20px'}}>
              {/* Name + Price */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <h2 style={{margin:'0 0 4px',fontSize:20,fontWeight:900,color:'#0f172a'}}>{modalItem.n}</h2>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                    {modalItem.b&&<span style={{fontSize:12,color:'#16A34A',fontWeight:700}}>{modalItem.b}</span>}
                    {modalItem.h&&<span style={{fontSize:12,color:'#DC2626',fontWeight:600}}>• {modalItem.h}</span>}
                  </div>
                  {(modalItem as any).origin&&<div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>📍 {(modalItem as any).origin}</div>}
                </div>
                <div style={{textAlign:'right' as const}}>
                  <div style={{fontSize:26,fontWeight:900,color:'#DC2626'}}>₹{((modalItem as any).weights?.[selectedWeight]?.price)||modalItem.p}</div>
                  <div style={{fontSize:11,color:'#94a3b8'}}>per {((modalItem as any).weights?.[selectedWeight]?.label)||'500g'}</div>
                </div>
              </div>

              {/* Weight Selector */}
              {(modalItem as any).weights&&(modalItem as any).weights.length>1&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase' as const,letterSpacing:0.5}}>Select Weight</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                    {(modalItem as any).weights.map((w:any,i:number)=>(
                      <button key={i} onClick={()=>setSelectedWeight(i)} style={{padding:'8px 18px',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',border:'none',background:selectedWeight===i?'#DC2626':'#f1f5f9',color:selectedWeight===i?'white':'#334155',transition:'all 0.2s'}}>
                        {w.label}<span style={{display:'block',fontSize:10,fontWeight:600,opacity:0.8}}>₹{w.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cut Type Selector */}
              {(modalItem as any).cuts&&(modalItem as any).cuts.length>1&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase' as const,letterSpacing:0.5}}>Cutting Style</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                    {(modalItem as any).cuts.map((cut:string,i:number)=>(
                      <button key={i} onClick={()=>setSelectedCut(i)} style={{padding:'7px 14px',borderRadius:10,fontWeight:600,fontSize:12,cursor:'pointer',border:selectedCut===i?'2px solid #DC2626':'1.5px solid #e2e8f0',background:selectedCut===i?'#fff5f5':'white',color:selectedCut===i?'#DC2626':'#334155',transition:'all 0.2s'}}>
                        {cut==='Curry Cut'?'🔪':cut==='Whole Fish'?'🐟':cut==='Fillet'?'🍽️':'✂️'} {cut}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition */}
              {(modalItem as any).nutrition&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase' as const,letterSpacing:0.5}}>Nutrition (per 100g)</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                    {Object.entries((modalItem as any).nutrition).map(([key,val]:any)=>(
                      <div key={key} style={{background:'#f8fafc',borderRadius:10,padding:'8px',textAlign:'center' as const,border:'1px solid #e2e8f0'}}>
                        <div style={{fontSize:14,fontWeight:900,color:'#0f172a'}}>{val}</div>
                        <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {modalItem.desc&&<div style={{marginBottom:14,padding:'12px 14px',background:'#f0fdf4',borderRadius:12,borderLeft:'3px solid #16A34A'}}><div style={{fontSize:12,fontWeight:700,color:'#16A34A',marginBottom:4}}>About This Fish</div><p style={{color:'#475569',fontSize:13,lineHeight:1.7,margin:0}}>{modalItem.desc}</p></div>}

              {/* Storage & Weight */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                {[{icon:'🧊',label:'Storage',val:modalItem.storage},{icon:'⚖️',label:'Weight Info',val:modalItem.weight}].filter(x=>x.val).map(({icon,label,val})=>(
                  <div key={label} style={{background:'#f8fafc',borderRadius:10,padding:'10px 12px',border:'1px solid #e2e8f0'}}>
                    <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:4}}>{icon} {label}</div>
                    <div style={{fontSize:12,color:'#334155',fontWeight:600,lineHeight:1.4}}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {modalItem.tags&&<div style={{display:'flex',gap:6,flexWrap:'wrap' as const,marginBottom:14}}>{modalItem.tags.map((tag:string)=><span key={tag} style={{background:'#EBF5FA',color:'#0B4F6C',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{tag}</span>)}</div>}

              {/* Quality badges */}
              <div style={{display:'flex',gap:12,marginBottom:16,padding:'10px 14px',background:'#f0fdf4',borderRadius:12}}>
                {['✅ No Chemicals','🧊 Always Fresh','🚚 Home Delivery'].map(b=><span key={b} style={{fontSize:11,fontWeight:600,color:'#16A34A'}}>{b}</span>)}
              </div>

              {/* Add to Cart */}
              {(()=>{
                const currentPrice = ((modalItem as any).weights?.[selectedWeight]?.price)||modalItem.p;
                const qty = cart.find(c=>c.n===modalItem.n)?.qty||0;
                return qty===0?(
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>{addToCart({...modalItem,p:currentPrice});setModalItem(null);setSelectedWeight(0);setSelectedCut(0);}} style={{flex:1,background:'#DC2626',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 12px rgba(220,38,38,0.3)'}}>
                      🛒 Add to Cart — ₹{currentPrice}
                    </button>
                    <button onClick={()=>{addToCart({...modalItem,p:currentPrice});setModalItem(null);setSelectedWeight(0);setSelectedCut(0);setShowCart(true);setCheckoutStep('cart');}} style={{background:'#0f172a',color:'white',border:'none',padding:'14px 16px',borderRadius:12,fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      Buy Now
                    </button>
                  </div>
                ):(
                  <div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8fafc',borderRadius:12,padding:'10px 16px',border:'1.5px solid #e2e8f0',marginBottom:10}}>
                      <button onClick={()=>removeFromCart(modalItem.n)} style={{background:'white',border:'1.5px solid #e2e8f0',width:36,height:36,borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:18,color:'#334155'}}>−</button>
                      <div style={{textAlign:'center' as const}}>
                        <div style={{fontWeight:900,fontSize:18,color:'#0f172a'}}>{qty} in cart</div>
                        <div style={{fontSize:12,color:'#DC2626',fontWeight:600}}>₹{currentPrice*qty} total</div>
                      </div>
                      <button onClick={()=>addToCart({...modalItem,p:currentPrice})} style={{background:'#DC2626',color:'white',border:'none',width:36,height:36,borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:18}}>+</button>
                    </div>
                    <button onClick={()=>{setModalItem(null);setShowCart(true);setCheckoutStep('cart');}} style={{width:'100%',background:'#0f172a',color:'white',border:'none',padding:13,borderRadius:12,fontWeight:700,fontSize:14,cursor:'pointer'}}>
                      View Cart & Checkout →
                    </button>
                  </div>
                );
              })()}

              <div style={{marginTop:12,textAlign:'center' as const,fontSize:12,color:'#94a3b8'}}>🔒 Secure checkout • 📦 Fresh guarantee</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
