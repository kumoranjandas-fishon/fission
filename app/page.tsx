export default function Home() {
  return (
    <main style={{fontFamily:'sans-serif',margin:0,padding:0}}>

      {/* HEADER */}
      <header style={{background:'#111',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'32px'}}>🐟</span>
          <div>
            <span style={{color:'#DC2626',fontWeight:900,fontSize:'26px'}}>Fish</span>
            <span style={{color:'#22C55E',fontWeight:900,fontSize:'26px',fontStyle:'italic'}}>on</span>
            <div style={{color:'#888',fontSize:'11px'}}>Fresh Catch Daily</div>
          </div>
        </div>
        <button style={{background:'#DC2626',color:'white',border:'none',padding:'10px 20px',borderRadius:'10px',fontWeight:'bold',fontSize:'14px',cursor:'pointer'}}>
          Order Now
        </button>
      </header>

      {/* HERO */}
      <section style={{background:'#1a1a1a',color:'white',padding:'60px 24px',textAlign:'center'}}>
        <div style={{background:'#DC2626',display:'inline-block',padding:'4px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'bold',marginBottom:'16px',letterSpacing:'1px'}}>
          ⏰ PRE-ORDER OPEN
        </div>
        <h1 style={{fontSize:'48px',fontWeight:900,margin:'0 0 16px',lineHeight:1.2}}>
          Fresh Fish & Meat<br/>
          <span style={{color:'#DC2626'}}>Delivered Daily</span>
        </h1>
        <p style={{color:'#aaa',fontSize:'18px',marginBottom:'32px'}}>
          Order tonight by 10 PM — Fresh delivery tomorrow 7-9 AM • East Delhi
        </p>
        <div style={{display:'flex',gap:'16px',justifyContent:'center'}}>
          <button style={{background:'#DC2626',color:'white',border:'none',padding:'14px 32px',borderRadius:'12px',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}}>
            🛒 Order Now
          </button>
          <button style={{background:'transparent',color:'white',border:'2px solid #555',padding:'14px 32px',borderRadius:'12px',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}}>
            View Menu
          </button>
        </div>
      </section>

      {/* PRE ORDER STRIP */}
      <section style={{background:'#FFF8E7',borderTop:'2px solid #F4A623',borderBottom:'2px solid #F4A623',padding:'16px 24px',display:'flex',alignItems:'center',gap:'16px'}}>
        <span style={{fontSize:'28px'}}>⏰</span>
        <div>
          <div style={{fontWeight:'bold',fontSize:'15px',color:'#333'}}>Pre-Order Closes at 10 PM Tonight!</div>
          <div style={{fontSize:'13px',color:'#666'}}>Kal subah 7-9 AM tak fresh delivery milegi • Free delivery on ₹499+</div>
        </div>
        <button style={{marginLeft:'auto',background:'#F4A623',color:'white',border:'none',padding:'10px 20px',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',whiteSpace:'nowrap'}}>
          Pre-Order Now
        </button>
      </section>

      {/* RATES */}
      <section style={{background:'white',padding:'40px 24px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 style={{fontSize:'28px',fontWeight:900,margin:0}}>Today&apos;s Rates</h2>
            <span style={{background:'#E8F8EE',color:'#16A34A',padding:'4px 12px',borderRadius:'20px',fontWeight:'bold',fontSize:'13px'}}>🟢 Live</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
            {[
              {name:'Rohu Fish',price:'₹180',per:'/500g',emoji:'🐟',change:'▲₹10',up:true},
              {name:'Chicken',price:'₹220',per:'/kg',emoji:'🐔',change:'▼₹5',up:false},
              {name:'Mutton',price:'₹680',per:'/kg',emoji:'🐑',change:'▲₹20',up:true},
              {name:'Prawns',price:'₹320',per:'/500g',emoji:'🦐',change:'▼₹15',up:false},
              {name:'Crab',price:'₹450',per:'/kg',emoji:'🦀',change:'▲₹30',up:true},
            ].map((item)=>(
              <div key={item.name} style={{background:'#f9f9f9',borderRadius:'16px',padding:'16px',textAlign:'center',border:'1px solid #eee'}}>
                <div style={{fontSize:'36px',marginBottom:'8px'}}>{item.emoji}</div>
                <div style={{fontSize:'13px',color:'#666',marginBottom:'4px'}}>{item.name}</div>
                <div style={{fontSize:'20px',fontWeight:900}}>{item.price}</div>
                <div style={{fontSize:'11px',color:'#999'}}>{item.per}</div>
                <div style={{fontSize:'11px',fontWeight:'bold',color:item.up?'#DC2626':'#16A34A',marginTop:'4px'}}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ITEMS */}
      <section style={{background:'#f5f5f5',padding:'40px 24px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h2 style={{fontSize:'28px',fontWeight:900,marginBottom:'24px'}}>Our Fresh Items</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px'}}>
            {[
              {name:'Rohu Fish',sub:'Cleaned & Cut • 500g',price:'₹180',emoji:'🐟',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
              {name:'Chicken Curry Cut',sub:'With Skin • 1kg',price:'₹220',emoji:'🐔',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#FFF0ED'},
              {name:'Hilsa (Ilish)',sub:'Seasonal • 500g',price:'₹380',emoji:'🐠',badge:'⚡ Limited',badgeColor:'#DC2626',bg:'#EBF5FA',stock:'Only 3kg left!'},
              {name:'Mutton Curry Cut',sub:'Bone-in • 500g',price:'₹340',emoji:'🐑',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#F0FFF4'},
              {name:'Tiger Prawns',sub:'Deveined • 250g',price:'₹320',emoji:'🦐',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
              {name:'Fresh Crab',sub:'Live Catch • 1pc',price:'₹450',emoji:'🦀',badge:'⚡ Limited',badgeColor:'#DC2626',bg:'#FFFBEB',stock:'Only 5 pcs left!'},
              {name:'Chicken Keema',sub:'Boneless • 500g',price:'₹180',emoji:'🍖',badge:'Always Fresh',badgeColor:'#16A34A',bg:'#FFF0ED'},
              {name:'Katla Fish',sub:'Cleaned • 500g',price:'₹160',emoji:'🐡',badge:'Pre-Order',badgeColor:'#0B4F6C',bg:'#EBF5FA'},
            ].map((item)=>(
              <div key={item.name} style={{background:'white',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                <div style={{background:item.bg,height:'110px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'52px',position:'relative'}}>
                  {item.emoji}
                  <span style={{position:'absolute',top:'8px',left:'8px',background:item.badgeColor,color:'white',fontSize:'9px',fontWeight:'bold',padding:'3px 7px',borderRadius:'6px'}}>
                    {item.badge}
                  </span>
                </div>
                <div style={{padding:'12px'}}>
                  {item.stock && <div style={{color:'#DC2626',fontSize:'10px',fontWeight:'bold',marginBottom:'4px'}}>{item.stock}</div>}
                  <div style={{fontWeight:'bold',fontSize:'13px',marginBottom:'2px'}}>{item.name}</div>
                  <div style={{color:'#999',fontSize:'11px',marginBottom:'8px'}}>{item.sub}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:900,fontSize:'15px'}}>{item.price}</span>
                    <button style={{background:'#111',color:'white',border:'none',width:'28px',height:'28px',borderRadius:'8px',fontSize:'18px',cursor:'pointer'}}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#111',color:'white',padding:'32px 24px',textAlign:'center'}}>
        <div>
          <span style={{color:'#DC2626',fontWeight:900,fontSize:'24px'}}>Fish</span>
          <span style={{color:'#22C55E',fontWeight:900,fontSize:'24px',fontStyle:'italic'}}>on</span>
        </div>
        <p style={{color:'#666',fontSize:'13px',marginTop:'8px'}}>Fresh Catch Daily • East Delhi • ©️ 2026</p>
      </footer>

    </main>
  );
}