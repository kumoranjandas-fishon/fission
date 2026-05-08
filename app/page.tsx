"use client";
export default function Home() {
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
          <div style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
            <div style={{background:'#111',borderRadius:'10px',padding:'4px',width:'38px',height:'38px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="26" height="32" viewBox="0 0 100 120" fill="none">
                <path d="M40 8 C40 8 86 8 90 42 C94 74 68 88 44 82 C28 77 18 64 20 50" stroke="#DC2626" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
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

          {/* Location + WhatsApp */}
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{fontSize:'12px',color:'#666',display:'flex',alignItems:'center',gap:'4px'}}>
              📍 <span style={{fontWeight:'bold',color:'#333'}}>East Delhi</span>
            </div>
            <a href="https://wa.me/918287000582" style={{background:'#25D366',color:'white',textDecoration:'none',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'bold',display:'flex',alignItems:'center',gap:'4px'}}>
              💬 Order
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
              textDecoration:'none',
              padding:'8px 16px',
              borderRadius:'20px',
              fontSize:'13px',
              fontWeight:'600',
              whiteSpace:'nowrap',
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
              <span style={{color:'#ffaaaa',fontSize:'12px',fontWeight:'bold'}}>⏰ ORDER BY 10 PM — FRESH TOMORROW</span>
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
              <a href="https://wa.me/918287000582?text=Hi! Order karna hai" style={{background:'#25D366',color:'white',textDecoration:'none',padding:'12px 24px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px'}}>
                💬 WhatsApp Order
              </a>
              <a href="#menu" style={{background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',padding:'12px 24px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px',border:'1px solid rgba(255,255,255,0.2)'}}>
                Menu Dekho →
              </a>
            </div>
          </div>

          {/* Mini cards */}
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
{/* PINCODE CHECKER */}
<section style={{background:'white',padding:'24px 20px',borderBottom:'2px solid #f0f0f0'}}>
  <div style={{maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
    <h3 style={{fontSize:'18px',fontWeight:900,marginBottom:'8px'}}>📍 Apna Pincode Check Karo</h3>
    <p style={{color:'#666',fontSize:'13px',marginBottom:'16px'}}>Delivery available hai ya nahi — abhi check karo!</p>
    <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
      <input 
        id="pincodeInput"
        type="number" 
        placeholder="Apna pincode likho... jaise 110092"
        style={{padding:'12px 16px',borderRadius:'10px',border:'2px solid #eee',fontSize:'14px',width:'250px',outline:'none'}}
      />
      <button 
        onClick={()=>{
          const pin = (document.getElementById('pincodeInput') as HTMLInputElement).value;
          const areas: Record<string, {area:string, time:string}> = {
            '110092': {area:'Preet Vihar / Mandawali', time:'9 AM - 12 PM'},
            '110091': {area:'IP Extension / Patparganj', time:'9 AM - 12 PM'},
            '110096': {area:'Mayur Vihar Phase 1', time:'9 AM - 12 PM'},
            '110095': {area:'Mayur Vihar Phase 2', time:'9 AM - 12 PM'},
            '110051': {area:'Gandhi Nagar / Geeta Colony', time:'9 AM - 12 PM'},
            '110031': {area:'Shakarpur / Laxmi Nagar', time:'9 AM - 12 PM'},
            '110032': {area:'Vivek Vihar / Karkardooma', time:'9 AM - 12 PM'},
            '110093': {area:'Pandav Nagar / Ganesh Nagar', time:'9 AM - 12 PM'},
            '110096': {area:'Commonwealth Village', time:'9 AM - 12 PM'},
          };
          const result = document.getElementById('pinResult');
          if(result) {
            if(areas[pin]) {
              result.innerHTML = `✅ <strong>Delivery Available!</strong><br/>📍 ${areas[pin].area}<br/>🕐 Delivery Time: <strong>${areas[pin].time}</strong>`;
              result.style.background = '#E8F8EE';
              result.style.color = '#16A34A';
              result.style.border = '2px solid #16A34A';
            } else if(pin.length === 6) {
              result.innerHTML = `⚠️ <strong>Abhi Available Nahi</strong><br/>Hum expand kar rahe hain!<br/><a href="https://wa.me/918287000582?text=Mera pincode ${pin} hai — delivery chahiye!" style="color:#DC2626;font-weight:bold;">WhatsApp karo →</a>`;
              result.style.background = '#FFF0ED';
              result.style.color = '#DC2626';
              result.style.border = '2px solid #DC2626';
            } else {
              result.innerHTML = '❌ 6 digit pincode likho!';
              result.style.background = '#f9f9f9';
              result.style.color = '#666';
              result.style.border = '2px solid #eee';
            }
          }
        }}
        style={{background:'#DC2626',color:'white',border:'none',padding:'12px 24px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px',cursor:'pointer'}}
      >
        Check Karo
      </button>
    </div>
    <div id="pinResult" style={{marginTop:'14px',padding:'14px',borderRadius:'10px',fontSize:'14px',lineHeight:1.6,background:'#f9f9f9',border:'2px solid #eee',color:'#666',display:'inline-block',minWidth:'280px'}}>
      Pincode dalke check karo 👆
    </div>
  </div>
</section>
      {/* PRE ORDER STRIP */}
      <div style={{background:'#FFF8E7',borderBottom:'2px solid #F4A623',padding:'10px 20px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
        <span style={{fontSize:'20px'}}>⏰</span>
        <div style={{flex:1}}>
          <span style={{fontWeight:'bold',fontSize:'13px',color:'#333'}}>Pre-Order Closes at 10 PM! </span>
          <span style={{fontSize:'12px',color:'#666'}}>Kal subah 7-9 AM fresh delivery • Free on ₹499+</span>
        </div>
        <a href="https://wa.me/918287000582?text=Pre-order karna hai" style={{background:'#F4A623',color:'white',textDecoration:'none',padding:'7px 14px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px',whiteSpace:'nowrap'}}>
          Pre-Order →
        </a>
      </div>

      {/* RATES */}
      <section style={{background:'white',padding:'28px 20px'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h2 style={{fontSize:'22px',fontWeight:900,margin:0}}>⚡ Aaj Ka Rate</h2>
            <span style={{background:'#E8F8EE',color:'#16A34A',padding:'4px 10px',borderRadius:'20px',fontWeight:'bold',fontSize:'11px'}}>🟢 Live</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'10px'}}>
            {[
              {n:'Rohu',h:'रोहू',p:'₹180',u:'/500g',e:'🐟',c:'▲₹10',up:true},
              {n:'Chicken',h:'चिकन',p:'₹220',u:'/kg',e:'🐔',c:'▼₹5',up:false},
              {n:'Mutton',h:'मटन',p:'₹680',u:'/kg',e:'🐑',c:'▲₹20',up:true},
              {n:'Prawns',h:'झींगा',p:'₹320',u:'/500g',e:'🦐',c:'▼₹15',up:false},
              {n:'Hilsa',h:'इलिश',p:'₹380',u:'/500g',e:'🐠',c:'▲₹30',up:true},
              {n:'Crab',h:'केकड़ा',p:'₹450',u:'/kg',e:'🦀',c:'▲₹25',up:true},
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

      {/* ITEMS */}
      <section id="menu" style={{background:'#f5f5f5',padding:'28px 20px'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'16px'}}>🛒 Fresh Items</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:'14px'}}>
            {[
              {n:'Rohu Fish',b:'রুই মাছ',s:'500g • Cleaned',p:'₹180',e:'🐟',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
              {n:'Hilsa (Ilish)',b:'ইলিশ মাছ',s:'500g • Seasonal',p:'₹380',e:'🐠',badge:'⚡ Limited',bc:'#DC2626',bg:'#FFF0ED',stock:'Only 3kg!'},
              {n:'Chicken Curry',b:'চিকেন',s:'1kg • With Skin',p:'₹220',e:'🐔',badge:'Always Fresh',bc:'#16A34A',bg:'#F0FFF4'},
              {n:'Mutton Cut',b:'মাটন',s:'500g • Bone-in',p:'₹340',e:'🐑',badge:'Always Fresh',bc:'#16A34A',bg:'#F0FFF4'},
              {n:'Tiger Prawns',b:'চিংড়ি',s:'250g • Deveined',p:'₹320',e:'🦐',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
              {n:'Fresh Crab',b:'কাঁকড়া',s:'1pc • Live',p:'₹450',e:'🦀',badge:'⚡ Limited',bc:'#DC2626',bg:'#FFFBEB',stock:'Only 5!'},
              {n:'Katla Fish',b:'কাতলা মাছ',s:'500g • Cleaned',p:'₹160',e:'🐡',badge:'Pre-Order',bc:'#0B4F6C',bg:'#EBF5FA'},
              {n:'Chicken Keema',b:'কিমা',s:'500g • Boneless',p:'₹180',e:'🍖',badge:'Always Fresh',bc:'#16A34A',bg:'#FFF0ED'},
            ].map(i=>(
              <div key={i.n} style={{background:'white',borderRadius:'14px',overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.07)'}}>
                <div style={{background:i.bg,height:'95px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px',position:'relative'}}>
                  {i.e}
                  <span style={{position:'absolute',top:'6px',left:'6px',background:i.bc,color:'white',fontSize:'8px',fontWeight:'bold',padding:'2px 6px',borderRadius:'4px'}}>
                    {i.badge}
                  </span>
                </div>
                <div style={{padding:'10px'}}>
                  {i.stock && <div style={{color:'#DC2626',fontSize:'9px',fontWeight:'bold',marginBottom:'2px'}}>🔥 {i.stock}</div>}
                  <div style={{fontWeight:'bold',fontSize:'13px'}}>{i.n}</div>
                  <div style={{color:'#16A34A',fontSize:'10px'}}>{i.b}</div>
                  <div style={{color:'#aaa',fontSize:'10px',marginBottom:'7px'}}>{i.s}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:900,fontSize:'14px'}}>{i.p}</span>
                    <a href={`https://wa.me/918287000582?text=Order: ${i.n} ${i.p}`}
                       style={{background:'#25D366',color:'white',textDecoration:'none',padding:'5px 10px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>
                      Order
                    </a>
                  </div>
                </div>{/* DELIVERY AREAS */}
<section style={{background:'#f0f9ff',padding:'28px 20px'}}>
  <div style={{maxWidth:'1100px',margin:'0 auto'}}>
    <h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'8px'}}>📍 Delivery Areas</h2>
    <p style={{color:'#666',fontSize:'13px',marginBottom:'16px'}}>Hum in areas mein deliver karte hain — East Delhi</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'10px'}}>
      {[
        'IP Extension','Mother Dairy','Pandav Nagar',
        'Ganesh Nagar','Mandawali','Commonwealth Village',
        'Mayur Vihar','Kosambi','Laxmi Nagar',
        'Preet Vihar','Karkardooma','Vivek Vihar',
        'Shakarpur','Patparganj','Krishna Nagar',
        'Gandhi Nagar','Geeta Colony',
      ].map(area=>(
        <div key={area} style={{background:'white',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',fontWeight:'600',color:'#333',border:'1.5px solid #e0f0ff',display:'flex',alignItems:'center',gap:'6px'}}>
          ✅ {area}
        </div>
      ))}
    </div>
    <p style={{color:'#DC2626',fontSize:'12px',marginTop:'14px',fontWeight:'bold'}}>
      ⚠️ Aapka area nahi hai? WhatsApp karo — hum expand kar rahe hain!
    </p>
  </div>
</section>
              </div>
            ))}
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

    </main>
  );
}