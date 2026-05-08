export default function Home() {
  return (
    <main style={{fontFamily:'sans-serif',margin:0,padding:0}}>

      {/* HEADER */}
      <header style={{background:'#111',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{background:'white',borderRadius:'10px',padding:'4px',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="30" height="36" viewBox="0 0 100 120" fill="none">
              <path d="M40 8 C40 8 86 8 90 42 C94 74 68 88 44 82 C28 77 18 64 20 50" stroke="#DC2626" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
              <rect x="32" y="5" width="15" height="100" rx="5" fill="#DC2626"/>
              <rect x="18" y="56" width="50" height="13" rx="5" fill="#DC2626"/>
              <path d="M32 105 C24 116 10 114 6 106 C18 102 30 96 32 87" fill="#DC2626"/>
              <rect x="60" y="14" width="28" height="22" rx="7" fill="#16A34A"/>
            </svg>
          </div>
          <div>
            <span style={{color:'#DC2626',fontWeight:900,fontSize:'22px'}}>Fish</span>
            <span style={{color:'#22C55E',fontWeight:900,fontSize:'22px',fontStyle:'italic'}}>on</span>
            <div style={{color:'#888',fontSize:'10px',letterSpacing:'1px'}}>FRESH CATCH DAILY</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <a href="tel:+918287000582" style={{color:'white',textDecoration:'none',fontSize:'13px',background:'#222',padding:'8px 12px',borderRadius:'8px'}}>
            📞 Call
          </a>
          <a href="https://wa.me/918287000582" style={{color:'white',textDecoration:'none',fontSize:'13px',background:'#25D366',padding:'8px 12px',borderRadius:'8px'}}>
            💬 WhatsApp
          </a>
        </div>
      </header>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#1a1a1a,#2d0a0a)',color:'white',padding:'50px 20px',textAlign:'center'}}>
        <div style={{background:'#DC2626',display:'inline-block',padding:'4px 14px',borderRadius:'20px',fontSize:'11px',fontWeight:'bold',marginBottom:'14px',letterSpacing:'2px'}}>
          ⏰ PRE-ORDER OPEN — ORDER BY 10 PM
        </div>
        <h1 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:900,margin:'0 0 14px',lineHeight:1.2}}>
          East Delhi Ki<br/>
          <span style={{color:'#DC2626'}}>Tazii Maach</span> 🐟
        </h1>
        <p style={{color:'#aaa',fontSize:'clamp(14px,2vw,18px)',marginBottom:'28px',maxWidth:'500px',margin:'0 auto 28px'}}>
          Roz subah fresh delivery • Order tonight, get tomorrow 7-9 AM
        </p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
          <a href="https://wa.me/918287000582?text=Hi, I want to order from Fishon!" 
             style={{background:'#25D366',color:'white',textDecoration:'none',padding:'14px 28px',borderRadius:'12px',fontWeight:'bold',fontSize:'16px'}}>
            💬 Order on WhatsApp
          </a>
          <a href="#menu" style={{background:'transparent',color:'white',textDecoration:'none',border:'2px solid #555',padding:'14px 28px',borderRadius:'12px',fontWeight:'bold',fontSize:'16px'}}>
            View Menu
          </a>
        </div>
      </section>

      {/* PRE ORDER STRIP */}
      <div style={{background:'#FFF8E7',borderTop:'2px solid #F4A623',borderBottom:'2px solid #F4A623',padding:'12px 20px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
        <span style={{fontSize:'24px'}}>⏰</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:'bold',fontSize:'14px',color:'#333'}}>Pre-Order Closes at 10 PM Tonight!</div>
          <div style={{fontSize:'12px',color:'#666'}}>Kal subah 7-9 AM fresh delivery • Free delivery on ₹499+</div>
        </div>
        <a href="https://wa.me/918287000582?text=Pre-order karna hai" 
           style={{background:'#F4A623',color:'white',textDecoration:'none',padding:'8px 16px',borderRadius:'8px',fontWeight:'bold',fontSize:'13px',whiteSpace:'nowrap'}}>
          Pre-Order Now →
        </a>
      </div>

      {/* RATES */}
      <section style={{background:'white',padding:'30px 20px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'10px'}}>
            <h2 style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:900,margin:0}}>⚡ Aaj Ka Rate</h2>
            <span style={{background:'#E8F8EE',color:'#16A34A',padding:'4px 12px',borderRadius:'20px',fontWeight:'bold',fontSize:'12px'}}>🟢 Live Price</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'12px'}}>
            {[
              {name:'Rohu',hindi:'रोहू',price:'₹180',per:'/500g',emoji:'🐟',change:'▲₹10',up:true},
              {name:'Chicken',hindi:'चिकन',price:'₹220',per:'/kg',emoji:'🐔',change:'▼₹5',up:false},
              {name:'Mutton',hindi:'मटन',price:'₹680',per:'/kg',emoji:'🐑',change:'▲₹20',up:true},
              {name:'Prawns',hindi:'झींगा',price:'₹320',per:'/500g',emoji:'🦐',change:'▼₹15',up:false},
              {name:'Hilsa',hindi:'इलिश',price:'₹380',per:'/500g',emoji:'🐠',change:'▲₹30',up:true},
              {name:'Crab',hindi:'केकड़ा',price:'₹450',per:'/kg',emoji:'🦀',change:'▲₹25',up:true},
            ].map((item)=>(
              <div key={item.name} style={{background:'#f9f9f9',borderRadius:'14px',padding:'14px',textAlign:'center',border:'1.5px solid #eee'}}>
                <div style={{fontSize:'32px',marginBottom:'6px'}}>{item.emoji}</div>
                <div style={{fontSize:'13px',fontWeight:'bold',color:'#333'}}>{item.name}</div>
                <div style={{fontSize:'11px',color:'#999',marginBottom:'4px'}}>{item.hindi}</div>
                <div style={{fontSize:'18px',fontWeight:900,color:'#111'}}>{item.price}</div>
                <div style={{fontSize:'10px',color:'#999'}}>{item.per}</div>
                <div style={{fontSize:'11px',fontWeight:'bold',color:item.up?'#DC2626':'#16A34A',marginTop:'4px'}}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ITEMS */}
      <section id="menu" style={{background:'#f5f5f5',padding:'30px 20px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <h2 style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:900,marginBottom:'20px'}}>🛒 Hamare Items</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'16px'}}>
            {[
              {name:'Rohu Fish',bengali:'রুই মাছ',sub:'500g • Cleaned',price:'₹180',emoji:'🐟',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
              {name:'Hilsa (Ilish)',bengali:'ইলিশ মাছ',sub:'500g • Seasonal',price:'₹380',emoji:'🐠',badge:'⚡ Limited',badgeColor:'#DC2626',bg:'#FFF0ED',stock:'Only 3kg!'},
              {name:'Chicken Curry',bengali:'চিকেন',sub:'1kg • With Skin',price:'₹220',emoji:'🐔',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#FFF0ED'},
              {name:'Mutton Cut',bengali:'মাটন',sub:'500g • Bone-in',price:'₹340',emoji:'🐑',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#F0FFF4'},
              {name:'Tiger Prawns',bengali:'চিংড়ি',sub:'250g • Deveined',price:'₹320',emoji:'🦐',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
              {name:'Fresh Crab',bengali:'কাঁকড়া',sub:'1pc • Live',price:'₹450',emoji:'🦀',badge:'⚡ Limited',badgeColor:'#DC2626',bg:'#FFFBEB',stock:'Only 5!'},
              {name:'Katla Fish',bengali:'কাতলা মাছ',sub:'500g • Cleaned',price:'₹160',emoji:'🐡',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
              {name:'Chicken Keema',bengali:'কিমা',sub:'500g • Boneless',price:'₹180',emoji:'🍖',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#FFF0ED'},
            ].map((item)=>(
              <div key={item.name} style={{background:'white',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                <div style={{background:item.bg,height:'100px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px',position:'relative'}}>
                  {item.emoji}
                  <span style={{position:'absolute',top:'6px',left:'6px',background:item.badgeColor,color:'white',fontSize:'9px',fontWeight:'bold',padding:'2px 6px',borderRadius:'5px'}}>
                    {item.badge}
                  </span>
                </div>
                <div style={{padding:'10px'}}>
                  {item.stock && <div style={{color:'#DC2626',fontSize:'9px',fontWeight:'bold',marginBottom:'3px'}}>🔥 {item.stock}</div>}
                  <div style={{fontWeight:'bold',fontSize:'13px'}}>{item.name}</div>
                  <div style={{color:'#16A34A',fontSize:'11px',marginBottom:'2px'}}>{item.bengali}</div>
                  <div style={{color:'#999',fontSize:'11px',marginBottom:'8px'}}>{item.sub}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:900,fontSize:'15px'}}>{item.price}</span>
                    <a href={`https://wa.me/918287000582?text=I want to order ${item.name} - ${item.price}`}
                       style={{background:'#25D366',color:'white',textDecoration:'none',padding:'5px 10px',borderRadius:'7px',fontSize:'11px',fontWeight:'bold'}}>
                      Order
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{background:'white',padding:'30px 20px',textAlign:'center'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <h2 style={{fontSize:'clamp(20px,3vw,26px)',fontWeight:900,marginBottom:'24px'}}>Kyun Chunein Fishon? 🤔</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'20px'}}>
            {[
              {icon:'🌅',title:'Roz Taza',desc:'Subah 5 baje market se'},
              {icon:'⏰',title:'Pre-Order',desc:'Raat 10 baje tak order karo'},
              {icon:'🚚',title:'Fast Delivery',desc:'7-9 AM delivery'},
              {icon:'💰',title:'Best Rate',desc:'Market rate pe seedha'},
            ].map((item)=>(
              <div key={item.title} style={{padding:'16px',background:'#f9f9f9',borderRadius:'14px'}}>
                <div style={{fontSize:'36px',marginBottom:'8px'}}>{item.icon}</div>
                <div style={{fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>{item.title}</div>
                <div style={{color:'#666',fontSize:'12px'}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP ORDER */}
      <section style={{background:'#25D366',padding:'30px 20px',textAlign:'center'}}>
        <h2 style={{color:'white',fontWeight:900,fontSize:'clamp(20px,3vw,28px)',marginBottom:'10px'}}>
          📱 WhatsApp Pe Order Karo!
        </h2>
        <p style={{color:'rgba(255,255,255,0.9)',marginBottom:'20px',fontSize:'14px'}}>
          Seedha WhatsApp pe message karo — 10 min mein confirm!
        </p>
        <a href="https://wa.me/918287000582?text=Hi Fishon! Main order karna chahta hoon" 
           style={{background:'white',color:'#25D366',textDecoration:'none',padding:'14px 32px',borderRadius:'12px',fontWeight:'bold',fontSize:'16px',display:'inline-block'}}>
          💬 Chat Now on WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#111',color:'white',padding:'24px 20px',textAlign:'center'}}>
        <div style={{marginBottom:'8px'}}>
          <span style={{color:'#DC2626',fontWeight:900,fontSize:'22px'}}>Fish</span>
          <span style={{color:'#22C55E',fontWeight:900,fontSize:'22px',fontStyle:'italic'}}>on</span>
        </div>
        <p style={{color:'#666',fontSize:'12px',marginBottom:'8px'}}>
          📍 East Delhi • 🕐 Delivery: 7-9 AM Daily
        </p>
        <p style={{color:'#444',fontSize:'11px'}}>© 2026 Fishon. Fresh Catch Daily.</p>
      </footer>

    </main>
  );
}