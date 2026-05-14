"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ITEMS = [
  {n:'Rohu Fish',b:'রুই মাছ',s:'500g • Cleaned & Cut',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',img:'/rohu-whole.jpg',
    desc:'Fresh Rohu from local market, cleaned and cut into pieces. Rich in Omega-3, perfect for curry.',tags:['High Protein','Omega-3','Best Seller']},
  {n:'Ilish Hilsa',b:'ইলিশ মাছ',s:'500g • Whole Cleaned',p:380,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Premium Ilish Hilsa — the king of fish. Sourced fresh every morning. Ideal for Ilish Bhapa or Sorshe Ilish.',tags:['Premium','Seasonal','Bengali Favourite']},
  {n:'Tiger Prawns',b:'বাঘা চিংড়ি',s:'250g • Deveined',p:320,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Large Tiger Prawns, deveined and cleaned. Great for grilling, frying or curry.',tags:['Deveined','Ready to Cook']},
  {n:'Golda Chingdi',b:'গলদা চিংড়ি',s:'250g • Whole',p:450,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Fresh water Golda Prawns — a Bengali delicacy. Whole with shell, perfect for Chingdi Malaikari.',tags:['Delicacy','Bengali Special']},
  {n:'Pink Perch / Kilimeen',b:'কিলিমিন',s:'500g • Whole Cleaned',p:280,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Pink Perch from coastal waters. Tender white flesh, great for fry or gravy.',tags:['Coastal Catch','Tender Flesh']},
  {n:'River Sole / Vaka Varal',b:'ভাকা ভারাল',s:'500g • Whole Cleaned',p:260,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'River Sole — flat fish with delicate flavour. Best for shallow fry with mustard.',tags:['Delicate Flavour']},
  {n:'Singi / Kaari Catfish',b:'সিঙি মাছ',s:'Whole Cleaned',p:220,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Freshwater Catfish known for medicinal properties. Great for light curry or soup.',tags:['Medicinal','Freshwater']},
  {n:'Kolkata Bhetki / Barramundi',b:'ভেটকী মাছ',s:'Whole Fish 1kg-2kg',p:520,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Premium Bhetki from Kolkata markets. Firm white flesh, perfect for Bhetki Paturi or fillet fry.',tags:['Premium','Firm Flesh','Bengali Classic']},
  {n:'Singhara / Aar Catfish',b:'সিঙারা মাছ',s:'Whole Fish 1kg-2kg',p:350,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'River Catfish with rich flavour. Best for spicy curry or mustard gravy.',tags:['River Fresh','Rich Flavour']},
  {n:'Boal Fish / Attu Vaala',b:'বোয়াল মাছ',s:'Whole Fish 1kg-2kg',p:380,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Large freshwater Boal — prized for its fatty, flavourful flesh. Ideal for jhol or bhuna.',tags:['Fatty Fish','Rich Taste']},
  {n:'Black Pomfret / Halwa Fish',b:'কালো পমফ্রেট',s:'Whole Fish 1.5kg-4kg',p:580,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Black Pomfret — a premium sea fish. Mild flavour, ideal for fry or tandoor.',tags:['Sea Fish','Premium','Mild Flavour']},
  {n:'White Pomfret / Silver Pomfret',b:'রূপালী পমফ্রেট',s:'Whole Fish 200g-300g',p:650,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Silver Pomfret — the most prized sea fish. Delicate, buttery texture. Perfect for fry or steam.',tags:['Most Prized','Buttery','Sea Fish']},
  {n:'Seer Fish / Surmai / Vanjaram',b:'সুরমাই মাছ',s:'Whole Fish 5kg+',p:750,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'King Mackerel / Surmai — firm steaks with rich flavour. Great for fry, tikka or curry.',tags:['King Fish','Firm Steak']},
  {n:'Yellow Fin Tuna / Kera',b:'টুনা মাছ',s:'Whole Fish 4kg-9kg',p:820,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Deep sea Yellow Fin Tuna. High protein, low fat. Excellent for sashimi, grilling or curry.',tags:['High Protein','Deep Sea','Rare Catch']},
  {n:'Mackerel / Bangda / Ayala',b:'ম্যাকেরেল',s:'5-9 Count/kg • Whole',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA',
    desc:'Fresh Mackerel — affordable and nutritious. High in Omega-3. Best for fry or curry.',tags:['Omega-3','Affordable','Nutritious']},
];

const AVAILABLE_ITEMS = [
  {n:'Rohu',h:'Labeo rohita',p:180,u:'/500g',e:'🐟',c:'▲₹10',up:true,
    desc:'Fresh Rohu fish, cleaned and ready. Same day delivery possible.',tags:['Same Day','Freshwater']},
  {n:'Katla',h:'Catla catla',p:160,u:'/500g',e:'🐡',c:'▲₹5',up:true,
    desc:'Fresh Katla fish. Excellent for mustard curry or simple jhol.',tags:['Same Day','Freshwater']},
  {n:'Indian Baasa',h:'Pangasius',p:200,u:'/500g',e:'🐠',c:'▼₹10',up:false,
    desc:'Mild flavoured Baasa, boneless cuts available. Great for fry.',tags:['Mild Flavour','Same Day']},
  {n:'Prawns',h:'Penaeus',p:320,u:'/500g',e:'🦐',c:'▼₹15',up:false,
    desc:'Fresh sea prawns. Cleaned and deveined on request.',tags:['Same Day','Sea Fresh']},
  {n:'Hilsa',h:'Tenualosa ilisha',p:380,u:'/500g',e:'🐠',c:'▲₹30',up:true,
    desc:'Fresh Hilsa — limited stock daily. Order early to avoid missing out.',tags:['Limited Stock','Premium']},
  {n:'Tilapia',h:'Oreochromis',p:140,u:'/500g',e:'🐡',c:'▼₹5',up:false,
    desc:'Farm-raised Tilapia. Affordable and protein-rich. Good for light curry.',tags:['Farm Fresh','Affordable']},
  {n:'Rupchanda',h:'Pampus argenteus',p:420,u:'/500g',e:'🐠',c:'▲₹20',up:true,
    desc:'Silver Pomfret — premium quality available today. Order fast.',tags:['Premium','Limited']},
  {n:'Mourala',h:'Amblypharyngodon',p:120,u:'/500g',e:'🐟',c:'▲₹5',up:true,
    desc:'Small freshwater Mourala. Perfect for crispy fry. Bengali favourite.',tags:['Bengali Favourite','Crispy Fry']},
];

const PINCODES: Record<string, {area:string, time:string}> = {
  '110092': {area:'Preet Vihar / Mandawali', time:'9 AM - 12 PM'},
  '110091': {area:'IP Extension / Patparganj', time:'9 AM - 12 PM'},
  '110096': {area:'Mayur Vihar Phase 1 & 2 / Commonwealth Village', time:'9 AM - 12 PM'},
  '110051': {area:'Gandhi Nagar / Geeta Colony', time:'9 AM - 12 PM'},
  '110031': {area:'Shakarpur / Laxmi Nagar', time:'9 AM - 12 PM'},
  '110032': {area:'Vivek Vihar / Karkardooma', time:'9 AM - 12 PM'},
  '110093': {area:'Pandav Nagar / Ganesh Nagar', time:'9 AM - 12 PM'},
  '110053': {area:'Krishna Nagar', time:'9 AM - 12 PM'},
  '110033': {area:'Mother Dairy / Kosambi', time:'9 AM - 12 PM'},
};

type CartItem = {n:string, p:number, e:string, qty:number};
type Address = {name:string; phone:string; flat:string; building:string; street:string; landmark:string; instructions:string;};
type ModalItem = {n:string; b?:string; s?:string; h?:string; p:number; e:string; desc?:string; tags?:string[]; img?:string; badge?:string; u?:string; type:'preorder'|'available'};

const inputStyle: React.CSSProperties = {width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1.5px solid #e2e8f0',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none',color:'#0f172a'};

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pinResult, setPinResult] = useState<null|'valid'|'invalid'|'short'>(null);
  const [notifyName, setNotifyName] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart'|'pincode'|'address'|'confirm'|'done'>('cart');
  const [address, setAddress] = useState<Address>({name:'',phone:'',flat:'',building:'',street:'',landmark:'',instructions:''});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [modalItem, setModalItem] = useState<ModalItem|null>(null);

  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  const totalPrice = cart.reduce((s,i)=>s+i.p*i.qty,0);

  const addToCart = (item: {n:string, p:number, e:string}) => {
    setCart(prev => {
      const exists = prev.find(c=>c.n===item.n);
      if(exists) return prev.map(c=>c.n===item.n?{...c,qty:c.qty+1}:c);
      return [...prev, {n:item.n, p:item.p, e:item.e, qty:1}];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => {
      const exists = prev.find(c=>c.n===name);
      if(exists && exists.qty > 1) return prev.map(c=>c.n===name?{...c,qty:c.qty-1}:c);
      return prev.filter(c=>c.n!==name);
    });
  };

  const getQty = (name: string) => cart.find(c=>c.n===name)?.qty || 0;

  const checkPincode = () => {
    if(pincode.length !== 6) { setPinResult('short'); return; }
    if(PINCODES[pincode]) setPinResult('valid');
    else setPinResult('invalid');
  };

  const isAddressValid = () => address.name && address.phone.length === 10 && address.flat && address.building && address.street;

  const placeOrder = async () => {
    if(!isAddressValid()) return;
    setOrderLoading(true);
    try {
      const itemsText = cart.map(i=>`${i.e} ${i.n} x${i.qty} = ₹${i.p*i.qty}`).join(', ');
      const fullAddress = `${address.flat}, ${address.building}, ${address.street}${address.landmark ? ', Near ' + address.landmark : ''}, ${PINCODES[pincode]?.area}, ${pincode}`;
      const docRef = await addDoc(collection(db, 'orders'), {
        name: address.name, phone: address.phone, items: itemsText, total: totalPrice,
        pincode, area: PINCODES[pincode]?.area, address: fullAddress,
        flat: address.flat, building: address.building, street: address.street,
        landmark: address.landmark, instructions: address.instructions,
        status: 'new', source: 'website', deliveryTime: PINCODES[pincode]?.time,
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id.slice(0,8).toUpperCase());
      setCheckoutStep('done');
      setCart([]);
    } catch(e) { console.error(e); alert('Order failed. Please try again.'); }
    setOrderLoading(false);
  };

  return (
    <main style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',minHeight:'100vh',background:'#f9fafb'}}>

      {/* ANNOUNCEMENT BAR */}
      <div style={{background:'#0f172a',color:'white',textAlign:'center',padding:'8px 16px',fontSize:'12px',fontWeight:500,letterSpacing:'0.3px'}}>
        🎉 Free Delivery on orders above ₹499 &nbsp;•&nbsp; Order by 11 PM for next morning delivery
      </div>

      {/* HEADER */}
      <header style={{background:'white',borderBottom:'1px solid #f1f5f9',padding:'12px 24px',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',minWidth:'140px'}}>
            <div style={{width:'38px',height:'38px',background:'#DC2626',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🐟</div>
            <div>
              <div style={{fontWeight:900,fontSize:'20px',lineHeight:1}}>
                <span style={{color:'#DC2626'}}>Fish</span>
                <span style={{color:'#16A34A',fontStyle:'italic'}}>on</span>
              </div>
              <div style={{fontSize:'9px',color:'#94a3b8',fontWeight:600,letterSpacing:'1px'}}>FRESH CATCH DAILY</div>
            </div>
          </div>

          {/* Search */}
          <div style={{flex:1,minWidth:'200px',display:'flex',alignItems:'center',background:'#f8fafc',borderRadius:'10px',padding:'9px 16px',gap:'8px',border:'1.5px solid #e2e8f0'}}>
            <span style={{fontSize:'14px',color:'#94a3b8'}}>🔍</span>
            <input placeholder="Search fish, prawns, seafood..." style={{border:'none',background:'transparent',outline:'none',fontSize:'14px',width:'100%',color:'#334155'}}/>
          </div>

          {/* Right */}
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <div style={{fontSize:'12px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px',background:'#f1f5f9',padding:'6px 12px',borderRadius:'8px'}}>
              📍 <span style={{fontWeight:600,color:'#334155'}}>East Delhi</span>
            </div>
            <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}}
              style={{background:'#DC2626',color:'white',border:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
              🛒 Cart
              {totalItems > 0 && <span style={{background:'white',color:'#DC2626',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>{totalItems}</span>}
            </button>
            <a href="https://wa.me/918287000582" style={{background:'#16A34A',color:'white',textDecoration:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>
              💬 WhatsApp
            </a>
            <a href="/login" style={{background:'#0f172a',color:'white',textDecoration:'none',padding:'9px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:700}}>
              👤 Login
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)',padding:'80px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 15% 50%,rgba(220,38,38,0.18) 0%,transparent 55%),radial-gradient(circle at 85% 50%,rgba(22,163,74,0.1) 0%,transparent 50%)'}}></div>
        <div style={{maxWidth:'860px',margin:'0 auto',position:'relative',zIndex:2,textAlign:'center'}}>

          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.35)',padding:'7px 18px',borderRadius:'30px',marginBottom:'28px'}}>
            <span style={{color:'#fca5a5',fontSize:'12px',fontWeight:700,letterSpacing:'0.5px'}}>⏰ ORDER BY 11 PM — DELIVERED FRESH TOMORROW</span>
          </div>

          {/* Heading */}
          <h1 style={{color:'white',fontSize:'clamp(36px,5vw,64px)',fontWeight:900,margin:'0 0 20px',lineHeight:1.1,letterSpacing:'-1.5px'}}>
            Fresh Fish,{' '}
            <span style={{color:'#DC2626'}}>Delivered</span>{' '}
            to Your Doorstep 🐟
          </h1>

          {/* Subtext */}
          <p style={{color:'#94a3b8',fontSize:'17px',marginBottom:'40px',maxWidth:'560px',lineHeight:1.75,margin:'0 auto 40px'}}>
            Sourced fresh from the market every morning. Delivered to your home <strong style={{color:'white'}}>9 AM – 12 PM</strong>. No chemicals, no preservatives.
          </p>

          {/* Stats */}
          <div style={{display:'flex',justifyContent:'center',gap:'40px',marginBottom:'44px',flexWrap:'wrap'}}>
            {[{n:'100%',l:'Chemical Free'},{n:'15+',l:'Fish Varieties'},{n:'9–12 AM',l:'Delivery Window'},{n:'₹499+',l:'Free Delivery'}].map(s=>(
              <div key={s.l} style={{textAlign:'center'}}>
                <div style={{color:'white',fontWeight:900,fontSize:'22px'}}>{s.n}</div>
                <div style={{color:'#64748b',fontSize:'12px',marginTop:'4px',fontWeight:500}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="#menu" style={{background:'#DC2626',color:'white',textDecoration:'none',padding:'15px 32px',borderRadius:'12px',fontWeight:700,fontSize:'15px',display:'flex',alignItems:'center',gap:'8px',boxShadow:'0 4px 24px rgba(220,38,38,0.4)'}}>
              🛒 Order Now
            </a>
            <a href="https://wa.me/918287000582?text=Hi! I want to order fish" style={{background:'rgba(255,255,255,0.08)',color:'white',textDecoration:'none',padding:'15px 32px',borderRadius:'12px',fontWeight:700,fontSize:'15px',border:'1px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',gap:'8px'}}>
              💬 WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* RATES — Available Items */}
      <section style={{background:'white',padding:'32px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div>
              <h2 style={{fontSize:'22px',fontWeight:800,margin:'0 0 4px',color:'#0f172a'}}>Available Now</h2>
              <p style={{fontSize:'13px',color:'#64748b',margin:0}}>In stock • Same day delivery possible</p>
            </div>
            <span style={{background:'#dcfce7',color:'#16A34A',padding:'4px 12px',borderRadius:'20px',fontWeight:700,fontSize:'12px'}}>✓ Fresh Stock</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'12px'}}>
            {AVAILABLE_ITEMS.map(i=>{
              const qty = getQty(i.n);
              return (
                <div key={i.n}
                  onClick={()=>setModalItem({n:i.n,h:i.h,p:i.p,e:i.e,desc:i.desc,tags:i.tags,u:i.u,type:'available'})}
                  style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',textAlign:'center',border:'1.5px solid #e2e8f0',cursor:'pointer',transition:'box-shadow 0.2s',position:'relative'}}>
                  <div style={{fontSize:'30px',marginBottom:'6px'}}>{i.e}</div>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a'}}>{i.n}</div>
                  <div style={{fontSize:'10px',color:'#94a3b8',marginBottom:'6px',fontStyle:'italic'}}>{i.h}</div>
                  <div style={{fontSize:'18px',fontWeight:900,color:'#0f172a'}}>{i.p}</div>
                  <div style={{fontSize:'10px',color:'#64748b'}}>{i.u}</div>
                  <div style={{fontSize:'11px',fontWeight:700,color:i.up?'#DC2626':'#16A34A',marginTop:'4px',marginBottom:'8px'}}>{i.c}</div>
                  {/* Add to cart inline - stop propagation */}
                  <div onClick={e=>e.stopPropagation()}>
                    {qty === 0 ? (
                      <button onClick={()=>addToCart({n:i.n,p:i.p,e:i.e})}
                        style={{background:'#DC2626',color:'white',border:'none',padding:'6px 14px',borderRadius:'8px',fontSize:'11px',fontWeight:700,cursor:'pointer',width:'100%'}}>+ Add</button>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                        <button onClick={()=>removeFromCart(i.n)} style={{background:'#f1f5f9',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px',color:'#334155'}}>−</button>
                        <span style={{fontWeight:900,fontSize:'14px',minWidth:'18px',textAlign:'center',color:'#0f172a'}}>{qty}</span>
                        <button onClick={()=>addToCart({n:i.n,p:i.p,e:i.e})} style={{background:'#DC2626',color:'white',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRE ORDER STRIP — "Fresh Catch Pre-Order" heading ke bilkul upar */}
      <div style={{background:'#fffbeb',borderBottom:'2px solid #f59e0b',padding:'12px 24px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}>
          <span style={{fontSize:'18px'}}>⏰</span>
          <div>
            <span style={{fontWeight:700,fontSize:'13px',color:'#92400e'}}>Pre-Order Closes at 11 PM! </span>
            <span style={{fontSize:'12px',color:'#b45309'}}>Tomorrow morning 9 AM - 12 PM delivery • Free on orders above ₹499</span>
          </div>
        </div>
        <a href="https://wa.me/918287000582?text=I want to pre-order" style={{background:'#f59e0b',color:'white',textDecoration:'none',padding:'8px 18px',borderRadius:'8px',fontWeight:700,fontSize:'13px',whiteSpace:'nowrap'}}>
          Pre-Order Now →
        </a>
      </div>

      {/* PRE-ORDER MENU */}
      <section id="menu" style={{background:'#f9fafb',padding:'32px 24px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{marginBottom:'20px'}}>
            <h2 style={{fontSize:'22px',fontWeight:800,margin:'0 0 4px',color:'#0f172a'}}>🛒 Fresh Catch — Pre-Order</h2>
            <p style={{fontSize:'13px',color:'#64748b',margin:0}}>Order by 11 PM • Delivered fresh next morning 9 AM - 12 PM</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'16px'}}>
            {ITEMS.map(i=>{
              const qty = getQty(i.n);
              return (
                <div key={i.n}
                  onClick={()=>setModalItem({n:i.n,b:i.b,s:i.s,p:i.p,e:i.e,desc:i.desc,tags:i.tags,img:(i as any).img,badge:i.badge,type:'preorder'})}
                  style={{background:'white',borderRadius:'14px',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',border:'1px solid #f1f5f9',cursor:'pointer',transition:'box-shadow 0.2s'}}>
                  <div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'50px',position:'relative',overflow:'hidden',background:i.bg}}>
                    {('img' in i && (i as any).img) ?
                      <img src={(i as any).img} alt={i.n} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/> :
                      <span style={{fontSize:'50px'}}>{i.e}</span>
                    }
                    <span style={{position:'absolute',top:'8px',left:'8px',background:'#0B4F6C',color:'white',fontSize:'9px',fontWeight:700,padding:'3px 8px',borderRadius:'20px',letterSpacing:'0.5px'}}>{i.badge}</span>
                  </div>
                  <div style={{padding:'12px'}}>
                    <div style={{fontWeight:700,fontSize:'13px',color:'#0f172a',marginBottom:'2px'}}>{i.n}</div>
                    <div style={{color:'#16A34A',fontSize:'11px',marginBottom:'2px'}}>{i.b}</div>
                    <div style={{color:'#94a3b8',fontSize:'11px',marginBottom:'10px'}}>{i.s}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:900,fontSize:'16px',color:'#0f172a'}}>₹{i.p}</span>
                      <div onClick={e=>e.stopPropagation()}>
                        {qty === 0 ? (
                          <button onClick={()=>addToCart(i)} style={{background:'#DC2626',color:'white',border:'none',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>+ Add</button>
                        ) : (
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <button onClick={()=>removeFromCart(i.n)} style={{background:'#f1f5f9',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px',color:'#334155'}}>−</button>
                            <span style={{fontWeight:900,fontSize:'14px',minWidth:'18px',textAlign:'center',color:'#0f172a'}}>{qty}</span>
                            <button onClick={()=>addToCart(i)} style={{background:'#DC2626',color:'white',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{background:'white',padding:'40px 24px',borderTop:'1px solid #f1f5f9'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'22px',fontWeight:800,marginBottom:'8px',color:'#0f172a'}}>Why Choose Fishon?</h2>
          <p style={{color:'#64748b',fontSize:'14px',marginBottom:'28px'}}>We bring the freshest catch straight to your kitchen</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'20px'}}>
            {[
              {icon:'🌅',title:'Farm Fresh Daily',desc:'Sourced every morning from trusted suppliers'},
              {icon:'⏰',title:'Pre-Order by 11 PM',desc:'Secure your catch the night before'},
              {icon:'🚚',title:'Morning Delivery',desc:'Delivered 9 AM - 12 PM at your doorstep'},
              {icon:'💰',title:'Market Best Price',desc:'Direct pricing, no middlemen'},
              {icon:'🧼',title:'Hygienically Cleaned',desc:'Properly cleaned and packed'},
              {icon:'📦',title:'Secure Packaging',desc:'Leak-proof, odour-free packing'},
            ].map(i=>(
              <div key={i.title} style={{padding:'20px 16px',background:'#f8fafc',borderRadius:'14px',border:'1px solid #e2e8f0'}}>
                <div style={{fontSize:'32px',marginBottom:'10px'}}>{i.icon}</div>
                <div style={{fontWeight:700,fontSize:'14px',marginBottom:'4px',color:'#0f172a'}}>{i.title}</div>
                <div style={{color:'#64748b',fontSize:'12px',lineHeight:1.5}}>{i.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section style={{background:'linear-gradient(135deg,#16A34A,#15803d)',padding:'40px 24px',textAlign:'center'}}>
        <h2 style={{color:'white',fontWeight:800,fontSize:'24px',marginBottom:'8px'}}>📱 Order via WhatsApp</h2>
        <p style={{color:'rgba(255,255,255,0.85)',marginBottom:'20px',fontSize:'14px'}}>Message us directly — confirmed within 10 minutes!</p>
        <a href="https://wa.me/918287000582?text=Hi Fishon! I want to order fish" style={{background:'white',color:'#16A34A',textDecoration:'none',padding:'14px 32px',borderRadius:'10px',fontWeight:800,fontSize:'15px',display:'inline-block',letterSpacing:'-0.3px'}}>
          💬 Chat on WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0f172a',color:'white',padding:'24px',textAlign:'center'}}>
        <div style={{marginBottom:'6px'}}>
          <span style={{color:'#DC2626',fontWeight:800,fontSize:'20px'}}>Fish</span>
          <span style={{color:'#16A34A',fontWeight:800,fontSize:'20px',fontStyle:'italic'}}>on</span>
        </div>
        <p style={{color:'#475569',fontSize:'12px',margin:0}}>📍 East Delhi • 🕐 9 AM - 12 PM Daily • © 2026 Fishon. All rights reserved.</p>
      </footer>

      {/* FLOATING CART */}
      {totalItems > 0 && !showCart && (
        <button onClick={()=>{setShowCart(true);setCheckoutStep('cart');}}
          style={{position:'fixed',bottom:'24px',right:'24px',background:'#DC2626',color:'white',border:'none',padding:'14px 22px',borderRadius:'50px',fontWeight:700,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 24px rgba(220,38,38,0.4)',zIndex:200,display:'flex',alignItems:'center',gap:'10px'}}>
          🛒 {totalItems} item{totalItems>1?'s':''} • ₹{totalPrice}
        </button>
      )}

      {/* ============ PRODUCT DETAIL MODAL ============ */}
      {modalItem && (
        <div onClick={()=>setModalItem(null)}
          style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.75)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:'white',borderRadius:'20px',width:'100%',maxWidth:'480px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>

            {/* Image / Emoji area */}
            <div style={{height:'220px',background: modalItem.type==='preorder' ? '#EBF5FA' : '#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              {modalItem.img ?
                <img src={modalItem.img} alt={modalItem.n} style={{width:'100%',height:'100%',objectFit:'cover'}}/> :
                <span style={{fontSize:'80px'}}>{modalItem.e}</span>
              }
              {modalItem.badge && (
                <span style={{position:'absolute',top:'12px',left:'12px',background:'#0B4F6C',color:'white',fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>{modalItem.badge}</span>
              )}
              <button onClick={()=>setModalItem(null)}
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',fontWeight:700,color:'#334155'}}>✕</button>
            </div>

            {/* Content */}
            <div style={{padding:'20px 24px 24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                <div>
                  <h2 style={{margin:'0 0 2px',fontSize:'20px',fontWeight:800,color:'#0f172a'}}>{modalItem.n}</h2>
                  {modalItem.b && <div style={{color:'#16A34A',fontSize:'13px',fontWeight:500}}>{modalItem.b}</div>}
                  {modalItem.h && <div style={{color:'#94a3b8',fontSize:'12px',fontStyle:'italic'}}>{modalItem.h}</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'24px',fontWeight:900,color:'#DC2626'}}>₹{modalItem.p}</div>
                  <div style={{fontSize:'11px',color:'#94a3b8'}}>{modalItem.s || modalItem.u || '/500g'}</div>
                </div>
              </div>

              {modalItem.desc && (
                <p style={{color:'#475569',fontSize:'13px',lineHeight:1.7,margin:'12px 0'}}>{modalItem.desc}</p>
              )}

              {modalItem.tags && modalItem.tags.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'16px'}}>
                  {modalItem.tags.map(tag=>(
                    <span key={tag} style={{background:'#f0fdf4',color:'#16A34A',fontSize:'11px',fontWeight:600,padding:'3px 10px',borderRadius:'20px',border:'1px solid #bbf7d0'}}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Add to cart in modal */}
              {(() => {
                const qty = getQty(modalItem.n);
                return qty === 0 ? (
                  <button
                    onClick={()=>{ addToCart({n:modalItem.n,p:modalItem.p,e:modalItem.e}); setModalItem(null); }}
                    style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>
                    🛒 Add to Cart — ₹{modalItem.p}
                  </button>
                ) : (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8fafc',borderRadius:'12px',padding:'10px 16px',border:'1.5px solid #e2e8f0'}}>
                    <button onClick={()=>removeFromCart(modalItem.n)} style={{background:'white',border:'1.5px solid #e2e8f0',width:'36px',height:'36px',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'18px',color:'#334155'}}>−</button>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontWeight:900,fontSize:'18px',color:'#0f172a'}}>{qty} in cart</div>
                      <div style={{fontSize:'12px',color:'#DC2626',fontWeight:600}}>₹{modalItem.p*qty} total</div>
                    </div>
                    <button onClick={()=>addToCart({n:modalItem.n,p:modalItem.p,e:modalItem.e})} style={{background:'#DC2626',color:'white',border:'none',width:'36px',height:'36px',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'18px'}}>+</button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCart && (
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.7)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div style={{background:'white',width:'100%',maxWidth:'540px',borderRadius:'20px 20px 0 0',padding:'24px',maxHeight:'90vh',overflowY:'auto'}}>

            {/* STEP 1: CART */}
            {checkoutStep === 'cart' && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>Your Cart</h3>
                  <button onClick={()=>setShowCart(false)} style={{background:'#f1f5f9',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px',color:'#334155'}}>✕</button>
                </div>
                {cart.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px 0',color:'#94a3b8'}}>
                    <div style={{fontSize:'48px',marginBottom:'12px'}}>🛒</div>
                    <p style={{fontWeight:500}}>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {cart.map(item=>(
                      <div key={item.n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f1f5f9'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                          <span style={{fontSize:'24px'}}>{item.e}</span>
                          <div>
                            <div style={{fontWeight:600,fontSize:'13px',color:'#0f172a'}}>{item.n}</div>
                            <div style={{color:'#DC2626',fontSize:'12px',fontWeight:600}}>₹{item.p} × {item.qty} = ₹{item.p*item.qty}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <button onClick={()=>removeFromCart(item.n)} style={{background:'#f1f5f9',border:'none',width:'28px',height:'28px',borderRadius:'7px',fontWeight:700,cursor:'pointer',color:'#334155'}}>−</button>
                          <span style={{fontWeight:900,minWidth:'20px',textAlign:'center',color:'#0f172a'}}>{item.qty}</span>
                          <button onClick={()=>addToCart(ITEMS.find(i=>i.n===item.n) || item)} style={{background:'#DC2626',color:'white',border:'none',width:'28px',height:'28px',borderRadius:'7px',fontWeight:700,cursor:'pointer'}}>+</button>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:'16px',padding:'14px',background:'#f8fafc',borderRadius:'12px',border:'1px solid #e2e8f0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'16px',color:'#0f172a'}}>
                        <span>Total</span>
                        <span style={{color:'#DC2626'}}>₹{totalPrice}</span>
                      </div>
                      {totalPrice >= 499 ? <div style={{color:'#16A34A',fontSize:'12px',marginTop:'4px',fontWeight:600}}>🎉 Free Delivery!</div> :
                        <div style={{color:'#64748b',fontSize:'12px',marginTop:'4px'}}>Add ₹{499-totalPrice} more for free delivery</div>}
                    </div>
                    <button onClick={()=>setCheckoutStep('pincode')} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>
                      Check Delivery →
                    </button>
                  </>
                )}
              </>
            )}

            {/* STEP 2: PINCODE */}
            {checkoutStep === 'pincode' && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>📍 Check Delivery</h3>
                  <button onClick={()=>setCheckoutStep('cart')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button>
                </div>
                <p style={{color:'#64748b',fontSize:'13px',marginBottom:'16px'}}>Enter your pincode to check if we deliver to your area</p>
                <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
                  <input type="number" placeholder="Enter 6 digit pincode" value={pincode}
                    onChange={e=>setPincode(e.target.value.slice(0,6))}
                    style={{flex:1,padding:'12px 16px',borderRadius:'10px',border:'1.5px solid #e2e8f0',fontSize:'14px',outline:'none',color:'#0f172a'}}/>
                  <button onClick={checkPincode} style={{background:'#DC2626',color:'white',border:'none',padding:'12px 20px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>Check</button>
                </div>
                {pinResult === 'short' && <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'12px',color:'#dc2626',fontSize:'13px',fontWeight:500}}>Please enter a valid 6-digit pincode</div>}
                {pinResult === 'valid' && (
                  <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:'10px',padding:'14px',fontSize:'13px',lineHeight:1.8}}>
                    <div style={{color:'#16A34A',fontWeight:700,marginBottom:'4px'}}>✅ Delivery Available!</div>
                    <div style={{color:'#334155'}}>📍 {PINCODES[pincode].area}</div>
                    <div style={{color:'#334155'}}>🕐 Delivery: <strong>{PINCODES[pincode].time}</strong></div>
                  </div>
                )}
                {pinResult === 'invalid' && (
                  <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'14px',fontSize:'13px',lineHeight:1.8}}>
                    <div style={{color:'#DC2626',fontWeight:700,marginBottom:'8px'}}>⚠️ Delivery not available in this area yet</div>
                    <div style={{color:'#64748b',marginBottom:'12px',fontSize:'12px'}}>We are expanding soon! Get notified when we arrive.</div>
                    <input placeholder="Your name" value={notifyName} onChange={e=>setNotifyName(e.target.value)}
                      style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #e2e8f0',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box',outline:'none'}}/>
                    {!notifySent ? (
                      <a href={`https://wa.me/918287000582?text=Please notify me: Name ${notifyName || 'Customer'}, Pincode ${pincode}`}
                        onClick={()=>setNotifySent(true)}
                        style={{display:'block',background:'#16A34A',color:'white',textDecoration:'none',padding:'10px',borderRadius:'8px',fontWeight:700,fontSize:'13px',textAlign:'center'}}>
                        🔔 Notify Me on WhatsApp
                      </a>
                    ) : (
                      <div style={{background:'#f0fdf4',color:'#16A34A',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:700,fontSize:'13px'}}>✅ We will notify you!</div>
                    )}
                  </div>
                )}
                {pinResult === 'valid' && (
                  <button onClick={()=>setCheckoutStep('address')} style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>
                    Enter Delivery Address →
                  </button>
                )}
              </>
            )}

            {/* STEP 3: ADDRESS */}
            {checkoutStep === 'address' && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>🏠 Delivery Address</h3>
                  <button onClick={()=>setCheckoutStep('pincode')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button>
                </div>
                <input placeholder="Full Name *" value={address.name} onChange={e=>setAddress({...address,name:e.target.value})} style={inputStyle}/>
                <input placeholder="Phone Number (10 digits) *" type="number" value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value.slice(0,10)})} style={inputStyle}/>
                <input placeholder="Flat / House No. + Floor * (e.g. Flat 203, 2nd Floor)" value={address.flat} onChange={e=>setAddress({...address,flat:e.target.value})} style={inputStyle}/>
                <input placeholder="Building / Society Name * (e.g. Sunrise Apartments)" value={address.building} onChange={e=>setAddress({...address,building:e.target.value})} style={inputStyle}/>
                <input placeholder="Street / Gali * (e.g. Gali No. 5, IP Extension)" value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} style={inputStyle}/>
                <input placeholder="Landmark (e.g. Near Metro Station)" value={address.landmark} onChange={e=>setAddress({...address,landmark:e.target.value})} style={inputStyle}/>
                <textarea placeholder="Special Instructions (optional)" value={address.instructions} onChange={e=>setAddress({...address,instructions:e.target.value})} style={{...inputStyle,height:'70px',resize:'none'}}/>
                <div style={{background:'#f0fdf4',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',fontSize:'13px',color:'#16A34A',fontWeight:500}}>
                  📍 {PINCODES[pincode]?.area} • 🕐 {PINCODES[pincode]?.time}
                </div>
                <button onClick={()=>{ if(isAddressValid()) setCheckoutStep('confirm'); else alert('Please fill all required fields!'); }}
                  style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>
                  Review Order →
                </button>
              </>
            )}

            {/* STEP 4: CONFIRM */}
            {checkoutStep === 'confirm' && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#0f172a'}}>✅ Order Summary</h3>
                  <button onClick={()=>setCheckoutStep('address')} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>← Back</button>
                </div>
                {cart.map(item=>(
                  <div key={item.n} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px',color:'#334155'}}>
                    <span>{item.e} {item.n} × {item.qty}</span>
                    <span style={{fontWeight:700,color:'#0f172a'}}>₹{item.p*item.qty}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'16px',marginTop:'12px',padding:'12px 0',borderTop:'2px solid #e2e8f0',color:'#0f172a'}}>
                  <span>Total</span>
                  <span style={{color:'#DC2626'}}>₹{totalPrice}</span>
                </div>
                <div style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'13px',border:'1px solid #e2e8f0',lineHeight:1.8,color:'#334155'}}>
                  <div style={{fontWeight:700,color:'#0f172a',marginBottom:'6px'}}>📦 Delivery Details</div>
                  <div>👤 {address.name} • 📱 {address.phone}</div>
                  <div>🏢 {address.flat}, {address.building}</div>
                  <div>🛣️ {address.street}{address.landmark ? `, Near ${address.landmark}` : ''}</div>
                  <div>📮 {PINCODES[pincode]?.area}, {pincode}</div>
                  <div>🕐 {PINCODES[pincode]?.time}</div>
                  {address.instructions && <div>🗒️ {address.instructions}</div>}
                </div>
                <button onClick={placeOrder} disabled={orderLoading}
                  style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:orderLoading?0.7:1}}>
                  {orderLoading ? '⏳ Placing Order...' : '✅ Place Order'}
                </button>
              </>
            )}

            {/* STEP 5: DONE */}
            {checkoutStep === 'done' && (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>🎉</div>
                <h3 style={{fontSize:'22px',fontWeight:800,color:'#16A34A',marginBottom:'8px'}}>Order Placed!</h3>
                <div style={{background:'#f0fdf4',borderRadius:'14px',padding:'16px',marginBottom:'20px',border:'1px solid #86efac'}}>
                  <div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px',fontWeight:500}}>Order ID</div>
                  <div style={{fontSize:'24px',fontWeight:900,color:'#16A34A',letterSpacing:'3px'}}>#{orderId}</div>
                </div>
                <p style={{color:'#64748b',fontSize:'14px',marginBottom:'20px',lineHeight:1.6}}>
                  Your order will be delivered tomorrow<br/>
                  <strong style={{color:'#0f172a'}}>{PINCODES[pincode]?.time}</strong><br/>
                  We will call you to confirm.
                </p>
                <button onClick={()=>{setShowCart(false);setCheckoutStep('cart');}}
                  style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:700,fontSize:'15px',cursor:'pointer'}}>
                  Continue Shopping 🛒
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
