"use client";
import { useState } from "react";
const ITEMS = [
  {n:'Ilish Hilsa',b:'ইলিশ মাছ',s:'500g • Whole Cleaned',p:380,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Tiger Prawns',b:'বাঘা চিংড়ি',s:'250g • Deveined',p:320,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Golda Chingdi',b:'গলদা চিংড়ি',s:'250g • Whole',p:450,e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Pink Perch / Kilimeen',b:'কিলিমিন',s:'500g • Whole Cleaned',p:280,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'River Sole / Vaka Varal',b:'ভাকা ভারাল',s:'500g • Whole Cleaned',p:260,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Singi / Kaari Catfish',b:'সিঙি মাছ',s:'Whole Cleaned',p:220,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Kolkata Bhetki / Barramundi',b:'ভেটকী মাছ',s:'Whole Fish 1kg-2kg',p:520,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Singhara / Aar Catfish',b:'সিঙারা মাছ',s:'Whole Fish 1kg-2kg',p:350,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Boal Fish / Attu Vaala',b:'বোয়াল মাছ',s:'Whole Fish 1kg-2kg',p:380,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Black Pomfret / Halwa Fish',b:'কালো পমফ্রেট',s:'Whole Fish 1.5kg-4kg',p:580,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'White Pomfret / Silver Pomfret',b:'রূপালী পমফ্রেট',s:'Whole Fish 200g-300g',p:650,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Seer Fish / Surmai / Vanjaram',b:'সুরমাই মাছ',s:'Whole Fish 5kg+',p:750,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Yellow Fin Tuna / Kera',b:'টুনা মাছ',s:'Whole Fish 4kg-9kg',p:820,e:'🐠',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
  {n:'Mackerel / Bangda / Ayala',b:'ম্যাকেরেল',s:'5-9 Count/kg • Whole',p:180,e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
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
export default function Home() {
const [cart, setCart] = useState<CartItem[]>([]);
const [showCart, setShowCart] = useState(false);
const [pincode, setPincode] = useState('');
const [pinResult, setPinResult] = useState<null|'valid'|'invalid'|'short'>(null);
const [notifyPin, setNotifyPin] = useState('');
const [notifyName, setNotifyName] = useState('');
const [notifySent, setNotifySent] = useState(false);
const [checkoutStep, setCheckoutStep] = useState<'cart'|'pincode'|'confirm'|'done'>('cart');
const totalItems = cart.reduce((s,i)=>s+i.qty,0);
const totalPrice = cart.reduce((s,i)=>s+i.p*i.qty,0);
const addToCart = (item: typeof ITEMS[0]) => {
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
const buildWhatsAppMsg = () => {
const items = cart.map(i=>`${i.e} ${i.n} x${i.qty} = ₹${i.p*i.qty}`).join('\n');
const area = PINCODES[pincode]?.area || '';
return encodeURIComponent(`Hi Fishon! Order karna hai:\n\n${items}\n\nTotal: ₹${totalPrice}\nPincode: ${pincode} (${area})\nDelivery: ${PINCODES[pincode]?.time}`);
  };
return (
<main style={{fontFamily:'sans-serif',margin:0,padding:0,background:'#f8f8f8'}}>
{/* TOP BAR */}
<div style={{background:'#DC2626',padding:'6px 20px',textAlign:'center'}}>
<span style={{color:'white',fontSize:'12px',fontWeight:'bold'}}>
          🎉 Free Delivery on orders above ₹499 • Order by 10 PM for next morning delivery!
</span>
</div>
{/* HEADER */}
<header style={{background:'white',padding:'12px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',position:'sticky',top:0,zIndex:100}}>
<div style={{maxWidth:'1100px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
{/* Logo */}
<div style={{display:'flex',alignItems:'center',gap:'8px'}}>
<div style={{background:'#111',borderRadius:'10px',padding:'4px',width:'38px',height:'38px',display:'flex',alignItems:'center',justifyContent:'center'}}>
<svg width="26" height="32" viewBox="0 0 100 120" fill="none">
<rect x="32" y="5" width="15" height="100" rx="5" fill="#DC2626"/>
<rect x="18" y="56" width="50" height="13" rx="5" fill="#DC2626"/>
<path d="M32 105 C24 116 10 114 6 106 C18 102 30 96 32 87" fill="#DC2626"/>
<rect x="60" y="14" width="28" height="22" rx="7" fill="#16A34A"/>
</svg>
</div>
<div>
<span style={{color:'#DC2626',fontWeight:900,fontSize:'20px'}}>Fish</span>
<span style={{color:'#16A34A',fontWeight:900,fontSize:'20px',fontStyle:'italic'}}>on</span>
<div style={{color:'#999',fontSize:'9px',letterSpacing:'1px'}}>FRESH CATCH DAILY</div>
</div>
</div>
{/* Search */}
<div style={{flex:1,minWidth:'200px',display:'flex',alignItems:'center',background:'#f5f5f5',borderRadius:'10px',padding:'8px 14px',gap:'8px',border:'1.5px solid #eee'}}>
<span style={{fontSize:'16px'}}>🔍</span>
<input placeholder="Search fish, chicken, mutton..." style={{border:'none',background:'transparent',outline:'none',fontSize:'14px',width:'100%',color:'#333'}}/>
</div>
{/* Cart + WhatsApp */}
<div style={{display:'flex',gap:'10px',alignItems:'center'}}>
<div style={{fontSize:'12px',color:'#666',display:'flex',alignItems:'center',gap:'4px'}}>
              📍 <span style={{fontWeight:'bold',color:'#333'}}>East Delhi</span>
</div>
{/* Cart Button */}
<button 
onClick={()=>{setShowCart(true);setCheckoutStep('cart');}}
style={{background:'#DC2626',color:'white',border:'none',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'bold',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',position:'relative'}}>
              🛒 Cart
{totalItems > 0 && (
<span style={{background:'white',color:'#DC2626',borderRadius:'50%',width:'18px',height:'18px',fontSize:'10px',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>
{totalItems}
</span>
              )}
</button>
<a href="https://wa.me/918287000582" style={{background:'#25D366',color:'white',textDecoration:'none',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'bold',display:'flex',alignItems:'center',gap:'4px'}}>
              💬 Order
</a>
<a href="/login" style={{background:'#111',color:'white',textDecoration:'none',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'bold'}}>
              👤 Login
</a>
</div>
</div>
{/* Category Nav */}
<div style={{maxWidth:'1100px',margin:'10px auto 0',display:'flex',gap:'4px',overflowX:'auto',paddingBottom:'4px'}}>
{[
            {emoji:'🐟',name:'Fish & Seafood'},
            {emoji:'🐔',name:'Chicken'},
            {emoji:'🐑',name:'Mutton'},
            {emoji:'🦐',name:'Prawns'},
            {emoji:'⚡',name:'Flash Sale'},
            {emoji:'📦',name:'Pre-Order'},
          ].map((cat,i)=>(
<a key={cat.name} href="#menu" style={{
textDecoration:'none',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',whiteSpace:'nowrap',
background: i===0 ? '#DC2626' : 'transparent',
color: i===0 ? 'white' : '#555',
border: i===0 ? 'none' : '1.5px solid #eee',
            }}>
{cat.emoji} {cat.name}
</a>
          ))}
</div>
</header>
{/* HERO BANNER */}
<section style={{background:'linear-gradient(135deg,#111 0%,#1a0505 60%,#0a1505 100%)',padding:'48px 20px',position:'relative',overflow:'hidden'}}>
<div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 15% 50%,rgba(220,38,38,0.2) 0%,transparent 50%),radial-gradient(circle at 85% 50%,rgba(34,197,94,0.12) 0%,transparent 50%)'}}></div>
<div style={{maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'32px',flexWrap:'wrap'}}>
<div style={{flex:'1',minWidth:'260px'}}>
<div style={{display:'inline-block',background:'rgba(220,38,38,0.25)',border:'1px solid rgba(220,38,38,0.5)',padding:'5px 14px',borderRadius:'20px',marginBottom:'16px'}}>
<span style={{color:'#ffaaaa',fontSize:'12px',fontWeight:'bold'}}>⏰ ORDER BY 11 PM — FRESH TOMORROW</span>
</div>
<h1 style={{color:'white',fontSize:'clamp(28px,4vw,50px)',fontWeight:900,margin:'0 0 14px',lineHeight:1.2}}>
              Fresh Fish<br/>
<span style={{color:'#DC2626'}}>Delivery</span><br/>
              in Delhi NCR! 🐟
</h1>
<p style={{color:'#bbb',fontSize:'15px',marginBottom:'24px',maxWidth:'420px',lineHeight:1.6}}>
              Roz subah market se fresh — aapke ghar 9 AM - 12 PM. Koi chemical nahi, sirf taza!
</p>
<div style={{display:'flex',gap:'16px',marginBottom:'28px'}}>
{[{n:'500+',l:'Customers'},{n:'15+',l:'Varieties'},{n:'7AM',l:'Delivery'}].map(s=>(
<div key={s.l}>
<div style={{color:'#DC2626',fontWeight:900,fontSize:'20px'}}>{s.n}</div>
<div style={{color:'#888',fontSize:'11px'}}>{s.l}</div>
</div>
              ))}
</div>
<div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
<a href="#menu" style={{background:'#DC2626',color:'white',textDecoration:'none',padding:'12px 24px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px'}}>
                🛒 Menu Dekho
</a>
<a href="https://wa.me/918287000582?text=Hi! Order karna hai" style={{background:'#25D366',color:'white',textDecoration:'none',padding:'12px 24px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px'}}>
                💬 WhatsApp Order
</a>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',flex:'1',minWidth:'240px',maxWidth:'320px'}}>
{[
              {e:'🐟',n:'Rohu',p:'₹180',t:'Pre-Order'},
              {e:'🐠',n:'Hilsa',p:'₹380',t:'Limited!'},
              {e:'🐔',n:'Chicken',p:'₹220',t:'Fresh'},
              {e:'🦐',n:'Prawns',p:'₹320',t:'Pre-Order'},
            ].map(i=>(
<div key={i.n} style={{background:'rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.1)'}}>
<div style={{fontSize:'32px',marginBottom:'4px'}}>{i.e}</div>
<div style={{color:'white',fontWeight:'bold',fontSize:'12px'}}>{i.n}</div>
<div style={{color:'#DC2626',fontWeight:900,fontSize:'15px'}}>{i.p}</div>
<div style={{background:'rgba(34,197,94,0.2)',color:'#22C55E',fontSize:'9px',padding:'2px 6px',borderRadius:'8px',marginTop:'3px',display:'inline-block'}}>{i.t}</div>
</div>
            ))}
</div>
</div>
</section>
{/* RATES */}
<section style={{background:'white',padding:'28px 20px'}}>
<div style={{maxWidth:'1100px',margin:'0 auto'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
<h2 style={{fontSize:'22px',fontWeight:900,margin:0}}>Available</h2>
<span style={{background:'#E8F8EE',color:'#16A34A',padding:'4px 10px',borderRadius:'20px',fontWeight:'bold',fontSize:'11px'}}></span>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'10px'}}>
{[
              {n:'Rohu',h:'রুই',p:'₹180',u:'/500g',e:'🐟',c:'▲₹10',up:true},
              {n:'Katla',h:'কাতলা',p:'₹160',u:'/500g',e:'🐡',c:'▲₹5',up:true},
              {n:'Fresh Indian Baasa',h:'ভাসা',p:'₹200',u:'/500g',e:'🐠',c:'▼₹10',up:false},
              {n:'Indian Prawns',h:'চিংড়ি',p:'₹320',u:'/500g',e:'🦐',c:'▼₹15',up:false},
              {n:'Mathi',h:'মাথি',p:'₹150',u:'/500g',e:'🐟',c:'▲₹5',up:true},
              {n:'Tilapia',h:'তেলাপিয়া',p:'₹140',u:'/500g',e:'🐡',c:'▼₹5',up:false},
              {n:'Rupchanda',h:'রূপচাঁদা',p:'₹420',u:'/500g',e:'🐠',c:'▲₹20',up:true},
              {n:'Mourala',h:'মৌরলা',p:'₹120',u:'/500g',e:'🐟',c:'▲₹5',up:true},
            ].map(i=>(
<div key={i.n} style={{background:'#f9f9f9',borderRadius:'12px',padding:'12px',textAlign:'center',border:'1.5px solid #eee'}}>
<div style={{fontSize:'28px',marginBottom:'4px'}}>{i.e}</div>
<div style={{fontSize:'12px',fontWeight:'bold',color:'#333'}}>{i.n}</div>
<div style={{fontSize:'10px',color:'#aaa',marginBottom:'3px'}}>{i.h}</div>
<div style={{fontSize:'16px',fontWeight:900}}>{i.p}</div>
<div style={{fontSize:'10px',color:'#aaa'}}>{i.u}</div>
<div style={{fontSize:'10px',fontWeight:'bold',color:i.up?'#DC2626':'#16A34A',marginTop:'3px'}}>{i.c}</div>
</div>
            ))}
</div>
</div>
</section>
{/* PRE ORDER STRIP */}
<div style={{background:'#FFF8E7',borderBottom:'2px solid #F4A623',padding:'10px 20px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
<span style={{fontSize:'20px'}}>⏰</span>
<div style={{flex:1}}>
<span style={{fontWeight:'bold',fontSize:'13px',color:'#333'}}>Pre-Order Closes at 11 PM! </span>
<span style={{fontSize:'12px',color:'#666'}}>Tomorrow morning 9 to 12 fresh delivery • Free on ₹499+</span>
</div>
<a href="https://wa.me/918287000582?text=Pre-order karna hai" style={{background:'#F4A623',color:'white',textDecoration:'none',padding:'7px 14px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px',whiteSpace:'nowrap'}}>
          Pre-Order →
</a>
</div>
{/* ITEMS */}
<section id="menu" style={{background:'#f5f5f5',padding:'28px 20px'}}>
<div style={{maxWidth:'1100px',margin:'0 auto'}}>
<h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'16px'}}>🛒 Fresh Items (Pre-Order)</h2>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:'14px'}}>
{ITEMS.map(i=>{
const qty = getQty(i.n);
return (
<div key={i.n} style={{background:'white',borderRadius:'14px',overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.07)'}}>
<div style={{background:i.bg,height:'95px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px',position:'relative'}}>
{i.e}
<span style={{position:'absolute',top:'6px',left:'6px',background:i.bc,color:'white',fontSize:'8px',fontWeight:'bold',padding:'2px 6px',borderRadius:'4px'}}>
{i.badge}
</span>
</div>
<div style={{padding:'10px'}}>
{('stock' in i) && (i as any).stock && <div style={{color:'#DC2626',fontSize:'9px',fontWeight:'bold',marginBottom:'2px'}}>🔥 {(i as any).stock}</div>}
<div style={{fontWeight:'bold',fontSize:'13px'}}>{i.n}</div>
<div style={{color:'#16A34A',fontSize:'10px'}}>{i.b}</div>
<div style={{color:'#aaa',fontSize:'10px',marginBottom:'7px'}}>{i.s}</div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<span style={{fontWeight:900,fontSize:'14px'}}>₹{i.p}</span>
{qty === 0 ? (
<button 
onClick={()=>addToCart(i)}
style={{background:'#DC2626',color:'white',border:'none',padding:'5px 12px',borderRadius:'6px',fontSize:'11px',fontWeight:'bold',cursor:'pointer'}}>
                          + Add
</button>
                      ) : (
<div style={{display:'flex',alignItems:'center',gap:'6px'}}>
<button onClick={()=>removeFromCart(i.n)} style={{background:'#f0f0f0',border:'none',width:'24px',height:'24px',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>−</button>
<span style={{fontWeight:900,fontSize:'13px',minWidth:'16px',textAlign:'center'}}>{qty}</span>
<button onClick={()=>addToCart(i)} style={{background:'#DC2626',color:'white',border:'none',width:'24px',height:'24px',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>+</button>
</div>
                      )}
</div>
</div>
</div>
              );
            })}
</div>
</div>
</section>
{/* WHY US */}
<section style={{background:'white',padding:'28px 20px',textAlign:'center'}}>
<div style={{maxWidth:'1100px',margin:'0 auto'}}>
<h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'20px'}}>Kyun Chunein Fishon? 🤔</h2>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'16px'}}>
{[
              {icon:'🌅',title:'Roz Taza',desc:'Subah 5 baje market se'},
              {icon:'⏰',title:'Pre-Order',desc:'Raat 10 baje tak order'},
              {icon:'🚚',title:'Fast Delivery',desc:'7-9 AM delivery'},
              {icon:'💰',title:'Best Rate',desc:'Market rate seedha'},
            ].map(i=>(
<div key={i.title} style={{padding:'16px',background:'#f9f9f9',borderRadius:'12px'}}>
<div style={{fontSize:'32px',marginBottom:'6px'}}>{i.icon}</div>
<div style={{fontWeight:'bold',fontSize:'13px',marginBottom:'3px'}}>{i.title}</div>
<div style={{color:'#666',fontSize:'11px'}}>{i.desc}</div>
</div>
            ))}
</div>
</div>
</section>
{/* WHATSAPP */}
<section style={{background:'#25D366',padding:'28px 20px',textAlign:'center'}}>
<h2 style={{color:'white',fontWeight:900,fontSize:'22px',marginBottom:'8px'}}>📱 WhatsApp Pe Order Karo!</h2>
<p style={{color:'rgba(255,255,255,0.9)',marginBottom:'16px',fontSize:'13px'}}>Seedha message karo — 10 min mein confirm!</p>
<a href="https://wa.me/918287000582?text=Hi Fishon! Order karna hai" 
style={{background:'white',color:'#25D366',textDecoration:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',display:'inline-block'}}>
          💬 Chat on WhatsApp
</a>
</section>
{/* FOOTER */}
<footer style={{background:'#111',color:'white',padding:'20px',textAlign:'center'}}>
<span style={{color:'#DC2626',fontWeight:900,fontSize:'20px'}}>Fish</span>
<span style={{color:'#16A34A',fontWeight:900,fontSize:'20px',fontStyle:'italic'}}>on</span>
<p style={{color:'#555',fontSize:'11px',marginTop:'6px'}}>📍 East Delhi • 🕐 7-9 AM Daily • © 2026</p>
</footer>
{/* FLOATING CART BUTTON */}
{totalItems > 0 && !showCart && (
<button
onClick={()=>{setShowCart(true);setCheckoutStep('cart');}}
style={{position:'fixed',bottom:'24px',right:'24px',background:'#DC2626',color:'white',border:'none',padding:'14px 20px',borderRadius:'50px',fontWeight:'bold',fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 20px rgba(220,38,38,0.4)',zIndex:200,display:'flex',alignItems:'center',gap:'8px'}}>
          🛒 {totalItems} items • ₹{totalPrice}
</button>
      )}
{/* CART MODAL */}
{showCart && (
<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
<div style={{background:'white',width:'100%',maxWidth:'540px',borderRadius:'20px 20px 0 0',padding:'24px',maxHeight:'90vh',overflowY:'auto'}}>
{/* STEP 1: CART */}
{checkoutStep === 'cart' && (
<>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
<h3 style={{margin:0,fontSize:'18px',fontWeight:900}}>🛒 Aapka Cart</h3>
<button onClick={()=>setShowCart(false)} style={{background:'#f0f0f0',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'16px'}}>✕</button>
</div>
{cart.length === 0 ? (
<div style={{textAlign:'center',padding:'40px 0',color:'#aaa'}}>
<div style={{fontSize:'48px',marginBottom:'12px'}}>🛒</div>
<p>Cart khali hai!</p>
</div>
                ) : (
<>
{cart.map(item=>(
<div key={item.n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f0f0f0'}}>
<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
<span style={{fontSize:'24px'}}>{item.e}</span>
<div>
<div style={{fontWeight:'bold',fontSize:'13px'}}>{item.n}</div>
<div style={{color:'#DC2626',fontSize:'12px'}}>₹{item.p} × {item.qty} = ₹{item.p*item.qty}</div>
</div>
</div>
<div style={{display:'flex',alignItems:'center',gap:'6px'}}>
<button onClick={()=>removeFromCart(item.n)} style={{background:'#f0f0f0',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:'bold',cursor:'pointer'}}>−</button>
<span style={{fontWeight:900,minWidth:'20px',textAlign:'center'}}>{item.qty}</span>
<button onClick={()=>addToCart(ITEMS.find(i=>i.n===item.n)!)} style={{background:'#DC2626',color:'white',border:'none',width:'26px',height:'26px',borderRadius:'6px',fontWeight:'bold',cursor:'pointer'}}>+</button>
</div>
</div>
                    ))}
<div style={{marginTop:'16px',padding:'14px',background:'#f9f9f9',borderRadius:'10px'}}>
<div style={{display:'flex',justifyContent:'space-between',fontWeight:900,fontSize:'16px'}}>
<span>Total</span>
<span style={{color:'#DC2626'}}>₹{totalPrice}</span>
</div>
{totalPrice >= 499 && <div style={{color:'#16A34A',fontSize:'11px',marginTop:'4px'}}>🎉 Free Delivery!</div>}
{totalPrice < 499 && <div style={{color:'#888',fontSize:'11px',marginTop:'4px'}}>₹{499-totalPrice} aur order karo free delivery ke liye</div>}
</div>
<button
onClick={()=>setCheckoutStep('pincode')}
style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>
                      Aage Badho — Pincode Check Karo →
</button>
</>
                )}
</>
            )}
{/* STEP 2: PINCODE */}
{checkoutStep === 'pincode' && (
<>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
<h3 style={{margin:0,fontSize:'18px',fontWeight:900}}>📍 Delivery Area Check</h3>
<button onClick={()=>setCheckoutStep('cart')} style={{background:'#f0f0f0',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px'}}>← Wapas</button>
</div>
<p style={{color:'#666',fontSize:'13px',marginBottom:'16px'}}>Apna pincode dalke check karo ki delivery available hai ya nahi</p>
<div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
<input 
type="number"
placeholder="6 digit pincode..."
value={pincode}
onChange={e=>setPincode(e.target.value.slice(0,6))}
style={{flex:1,padding:'12px 16px',borderRadius:'10px',border:'2px solid #eee',fontSize:'14px',outline:'none'}}
/>
<button 
onClick={checkPincode}
style={{background:'#DC2626',color:'white',border:'none',padding:'12px 20px',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>
                    Check
</button>
</div>
{pinResult === 'short' && (
<div style={{background:'#f9f9f9',border:'2px solid #eee',borderRadius:'10px',padding:'14px',color:'#666',fontSize:'13px'}}>
                    ❌ 6 digit pincode likho!
</div>
                )}
{pinResult === 'valid' && (
<div style={{background:'#E8F8EE',border:'2px solid #16A34A',borderRadius:'10px',padding:'14px',color:'#16A34A',fontSize:'13px',lineHeight:1.8}}>
                    ✅ <strong>Delivery Available!</strong><br/>
                    📍 {PINCODES[pincode].area}<br/>
                    🕐 Delivery Time: <strong>{PINCODES[pincode].time}</strong>
</div>
                )}
{pinResult === 'invalid' && (
<div style={{background:'#FFF0ED',border:'2px solid #DC2626',borderRadius:'10px',padding:'14px',fontSize:'13px',lineHeight:1.8}}>
<div style={{color:'#DC2626',fontWeight:'bold',marginBottom:'8px'}}>⚠️ Abhi Is Area Mein Delivery Nahi Hai</div>
<div style={{color:'#666',marginBottom:'12px',fontSize:'12px'}}>Hum jald expand kar rahe hain — notify karo jab aapke area mein aayein!</div>
<input 
placeholder="Aapka naam"
value={notifyName}
onChange={e=>setNotifyName(e.target.value)}
style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #eee',fontSize:'13px',marginBottom:'8px',boxSizing:'border-box',outline:'none'}}
/>
{!notifySent ? (
<a 
href={`https://wa.me/918287000582?text=Notify me: Mera naam ${notifyName || 'Customer'} hai. Mera pincode ${pincode} hai — jab deliver karo to batana!`}
onClick={()=>setNotifySent(true)}
style={{display:'block',background:'#25D366',color:'white',textDecoration:'none',padding:'10px',borderRadius:'8px',fontWeight:'bold',fontSize:'13px',textAlign:'center'}}>
                        🔔 Notify Me — WhatsApp Karo
</a>
                    ) : (
<div style={{background:'#E8F8EE',color:'#16A34A',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',fontSize:'13px'}}>
                        ✅ Request Send Ho Gayi! Hum batayenge.
</div>
                    )}
</div>
                )}
{pinResult === 'valid' && (
<button
onClick={()=>setCheckoutStep('confirm')}
style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',cursor:'pointer',marginTop:'14px'}}>
                    Order Confirm Karo ✓
</button>
                )}
</>
            )}
{/* STEP 3: CONFIRM */}
{checkoutStep === 'confirm' && (
<>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
<h3 style={{margin:0,fontSize:'18px',fontWeight:900}}>✅ Order Summary</h3>
<button onClick={()=>setCheckoutStep('pincode')} style={{background:'#f0f0f0',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'13px'}}>← Wapas</button>
</div>
{cart.map(item=>(
<div key={item.n} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f0f0f0',fontSize:'13px'}}>
<span>{item.e} {item.n} × {item.qty}</span>
<span style={{fontWeight:900}}>₹{item.p*item.qty}</span>
</div>
                ))}
<div style={{display:'flex',justifyContent:'space-between',fontWeight:900,fontSize:'16px',marginTop:'12px',padding:'12px 0',borderTop:'2px solid #eee'}}>
<span>Total</span>
<span style={{color:'#DC2626'}}>₹{totalPrice}</span>
</div>
<div style={{background:'#E8F8EE',borderRadius:'10px',padding:'12px',marginBottom:'16px',fontSize:'13px',color:'#16A34A'}}>
                  📍 {PINCODES[pincode]?.area}<br/>
                  🕐 Delivery: {PINCODES[pincode]?.time}
</div>
<a
href={`https://wa.me/918287000582?text=${buildWhatsAppMsg()}`}
style={{display:'block',background:'#25D366',color:'white',textDecoration:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',textAlign:'center'}}>
                  💬 WhatsApp Pe Order Karo
</a>
</>
            )}
</div>
</div>
      )}
</main>
  );
}
