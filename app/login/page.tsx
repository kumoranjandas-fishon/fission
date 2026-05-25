"use client";
import { useState, useEffect, useRef } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signOut, ConfirmationResult } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

type Order = {
  id: string;
  name: string;
  phone: string;
  items: string;
  total: number;
  status: string;
  area: string;
  deliveryTime: string;
  address: string;
  createdAt: any;
};

type UserProfile = {
  name: string;
  phone: string;
  flat: string;
  building: string;
  street: string;
  landmark: string;
  pincode: string;
  area: string;
};

const PINCODES: Record<string, string> = {
  '110092': 'Preet Vihar / Mandawali',
  '110091': 'IP Extension / Patparganj',
  '110096': 'Mayur Vihar Phase 1 & 2',
  '110051': 'Gandhi Nagar / Geeta Colony',
  '110031': 'Shakarpur / Laxmi Nagar',
  '110032': 'Vivek Vihar / Karkardooma',
  '110093': 'Pandav Nagar / Ganesh Nagar',
  '110053': 'Krishna Nagar',
  '110033': 'Mother Dairy / Kosambi',
};

const getStatusColor = (status: string) => {
  if (status === 'delivered') return '#16A34A';
  if (status === 'out_for_delivery' || status === 'preparing') return '#f59e0b';
  if (status === 'confirmed' || status === 'paid') return '#3b82f6';
  return '#64748b';
};

const getStatusLabel = (status: string) => {
  if (status === 'delivered') return '✅ Delivered';
  if (status === 'out_for_delivery') return '🚚 Out for Delivery';
  if (status === 'preparing') return '🔪 Preparing';
  if (status === 'confirmed') return '✔️ Confirmed';
  if (status === 'paid') return '💳 Paid';
  if (status === 'cancelled') return '❌ Cancelled';
  return '🕐 New Order';
};

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
  color: '#0f172a', boxSizing: 'border-box', marginBottom: '12px',
};

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone'|'otp'|'profile'|'dashboard'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationResult|null>(null);
  const [activeTab, setActiveTab] = useState<'orders'|'profile'|'address'>('orders');
  const [profile, setProfile] = useState<UserProfile>({ name:'',phone:'',flat:'',building:'',street:'',landmark:'',pincode:'',area:'' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [pincodeValid, setPincodeValid] = useState<boolean|null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.phoneNumber) {
        const ph = user.phoneNumber.replace('+91','');
        setPhone(ph);
        await loadUserData(ph);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size:'invisible', callback:()=>{} });
      } catch(e) {}
    }
  }, []);

  const loadUserData = async (ph: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', ph));
      if (profileDoc.exists()) { setProfile(profileDoc.data() as UserProfile); setStep('dashboard'); }
      else { setStep('profile'); }
      const q = query(collection(db, 'orders'), where('phone','==',ph));
      const snap = await getDocs(q);
      const orderList = snap.docs.map(d => ({id:d.id,...d.data()} as Order)).sort((a,b) => { const at = a.createdAt?.toDate?.()?.getTime()||0; const bt = b.createdAt?.toDate?.()?.getTime()||0; return bt-at; });
      setOrders(orderList);
    } catch(e) { console.error(e); }
  };

  const sendOTP = async () => {
    if (phone.length !== 10) { setError('Valid 10-digit number daalo'); return; }
    setLoading(true); setError('');
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, (window as any).recaptchaVerifier);
      setConfirmation(result); setStep('otp');
    } catch(e:any) {
      setError('OTP send nahi hua. Dobara try karo.');
      try { (window as any).recaptchaVerifier?.clear(); (window as any).recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container',{size:'invisible',callback:()=>{}}); } catch(e2) {}
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) { setError('6 digit OTP daalo'); return; }
    if (!confirmation) return;
    setLoading(true); setError('');
    try { await confirmation.confirm(otp); await loadUserData(phone); }
    catch(e) { setError('OTP galat hai.'); }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!profile.name) { setError('Naam zaroori hai'); return; }
    setLoading(true);
    try {
      await setDoc(doc(db,'users',phone), {...profile,phone,updatedAt:new Date()});
      setProfileSaved(true);
      setTimeout(() => { setProfileSaved(false); setStep('dashboard'); }, 1500);
    } catch(e) { setError('Save nahi hua.'); }
    setLoading(false);
  };

  const handlePincode = (val: string) => {
    setProfile(p => ({...p, pincode:val, area:PINCODES[val]||''}));
    if (val.length === 6) setPincodeValid(!!PINCODES[val]);
    else setPincodeValid(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStep('phone'); setPhone(''); setOtp(''); setOrders([]);
    setProfile({name:'',phone:'',flat:'',building:'',street:'',landmark:'',pincode:'',area:''});
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div id="recaptcha-container" ref={recaptchaRef}/>

      {step === 'phone' && (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:24}}>
          <a href="/" style={{textDecoration:'none',marginBottom:32,textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:6}}>
              <div style={{width:44,height:44,background:'#DC2626',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🐟</div>
              <div><span style={{color:'#DC2626',fontWeight:900,fontSize:26}}>Fish</span><span style={{color:'#16A34A',fontWeight:900,fontSize:26,fontStyle:'italic'}}>on</span></div>
            </div>
            <div style={{color:'#64748b',fontSize:11,letterSpacing:2,fontWeight:600}}>FRESH CATCH DAILY</div>
          </a>
          <div style={{background:'white',borderRadius:24,padding:'36px 32px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
            <h1 style={{margin:'0 0 6px',fontSize:24,fontWeight:800,color:'#0f172a',textAlign:'center'}}>Welcome! 👋</h1>
            <p style={{margin:'0 0 28px',color:'#64748b',fontSize:14,textAlign:'center'}}>Phone number pe OTP bhejenge</p>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#334155',marginBottom:8}}>Phone Number</label>
            <div style={{display:'flex',alignItems:'center',border:'2px solid #e2e8f0',borderRadius:12,overflow:'hidden',marginBottom:16}}>
              <span style={{padding:'12px 14px',background:'#f8fafc',borderRight:'2px solid #e2e8f0',color:'#64748b',fontSize:14,fontWeight:600}}>🇮🇳 +91</span>
              <input type="number" placeholder="10-digit number" value={phone} onChange={e=>{setPhone(e.target.value.slice(0,10));setError('');}} onKeyDown={e=>e.key==='Enter'&&sendOTP()} style={{flex:1,padding:'12px 16px',border:'none',outline:'none',fontSize:15,color:'#0f172a'}}/>
            </div>
            {error && <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:10,padding:'10px 14px',marginBottom:16,color:'#dc2626',fontSize:13}}>{error}</div>}
            <button onClick={sendOTP} disabled={loading} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',opacity:loading?0.7:1}}>
              {loading?'⏳ Sending...':'📲 Send OTP'}
            </button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:24}}>
          <div style={{background:'white',borderRadius:24,padding:'36px 32px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
            <h1 style={{margin:'0 0 6px',fontSize:24,fontWeight:800,color:'#0f172a',textAlign:'center'}}>OTP Verify Karo 🔐</h1>
            <p style={{margin:'0 0 28px',color:'#64748b',fontSize:14,textAlign:'center'}}>+91 {phone} pe OTP bheja gaya</p>
            <input type="number" placeholder="______" value={otp} onChange={e=>{setOtp(e.target.value.slice(0,6));setError('');}} onKeyDown={e=>e.key==='Enter'&&verifyOTP()} style={{...inp,fontSize:24,letterSpacing:8,textAlign:'center'}}/>
            {error && <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:10,padding:'10px 14px',marginBottom:16,color:'#dc2626',fontSize:13}}>{error}</div>}
            <button onClick={verifyOTP} disabled={loading} style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',marginBottom:12,opacity:loading?0.7:1}}>
              {loading?'⏳ Verifying...':'✅ Verify OTP'}
            </button>
            <button onClick={()=>{setStep('phone');setOtp('');setError('');}} style={{width:'100%',background:'#f1f5f9',color:'#64748b',border:'none',padding:12,borderRadius:12,fontWeight:600,fontSize:14,cursor:'pointer'}}>
              ← Wapas Jao
            </button>
          </div>
        </div>
      )}

      {step === 'profile' && (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:24}}>
          <div style={{background:'white',borderRadius:24,padding:'36px 32px',width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
            <h1 style={{margin:'0 0 6px',fontSize:22,fontWeight:800,color:'#0f172a',textAlign:'center'}}>Profile Complete Karo 👤</h1>
            <p style={{margin:'0 0 24px',color:'#64748b',fontSize:13,textAlign:'center'}}>Ek baar daalo — bar bar nahi daalna padega!</p>
            <input placeholder="Aapka Naam *" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={inp}/>
            <input placeholder="Pincode *" type="number" value={profile.pincode} onChange={e=>handlePincode(e.target.value.slice(0,6))} style={{...inp,borderColor:pincodeValid===false?'#ef4444':pincodeValid===true?'#16A34A':'#e2e8f0'}}/>
            {pincodeValid===true && <div style={{color:'#16A34A',fontSize:12,marginTop:-8,marginBottom:12,fontWeight:600}}>✅ {profile.area}</div>}
            {pincodeValid===false && <div style={{color:'#ef4444',fontSize:12,marginTop:-8,marginBottom:12}}>❌ Delivery nahi milti is area mein abhi</div>}
            <input placeholder="Flat / House No. *" value={profile.flat} onChange={e=>setProfile(p=>({...p,flat:e.target.value}))} style={inp}/>
            <input placeholder="Building / Society Name *" value={profile.building} onChange={e=>setProfile(p=>({...p,building:e.target.value}))} style={inp}/>
            <input placeholder="Street / Gali *" value={profile.street} onChange={e=>setProfile(p=>({...p,street:e.target.value}))} style={inp}/>
            <input placeholder="Landmark (optional)" value={profile.landmark} onChange={e=>setProfile(p=>({...p,landmark:e.target.value}))} style={inp}/>
            {error && <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:10,padding:'10px 14px',marginBottom:12,color:'#dc2626',fontSize:13}}>{error}</div>}
            {profileSaved && <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:10,padding:'10px 14px',marginBottom:12,color:'#16A34A',fontSize:13,fontWeight:700}}>✅ Profile save ho gayi!</div>}
            <button onClick={saveProfile} disabled={loading} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',opacity:loading?0.7:1}}>
              {loading?'⏳ Saving...':'💾 Save Profile'}
            </button>
          </div>
        </div>
      )}

      {step === 'dashboard' && (
        <div style={{maxWidth:600,margin:'0 auto',minHeight:'100vh'}}>
          <div style={{background:'rgba(255,255,255,0.05)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <a href="/" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:36,height:36,background:'#DC2626',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🐟</div>
              <span style={{color:'#DC2626',fontWeight:900,fontSize:18}}>Fish<span style={{color:'#16A34A',fontStyle:'italic'}}>on</span></span>
            </a>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{textAlign:'right'}}>
                <div style={{color:'white',fontWeight:700,fontSize:14}}>{profile.name||'User'}</div>
                <div style={{color:'#64748b',fontSize:12}}>+91 {phone}</div>
              </div>
              <button onClick={handleLogout} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',padding:'8px 14px',borderRadius:10,fontWeight:700,fontSize:12,cursor:'pointer'}}>
                Logout
              </button>
            </div>
          </div>

          <div style={{display:'flex',background:'rgba(255,255,255,0.04)',margin:'16px 16px 0',borderRadius:12,padding:4}}>
            {[['orders','📦 My Orders'],['address','📍 Address'],['profile','👤 Profile']].map(([key,label])=>(
              <button key={key} onClick={()=>setActiveTab(key as any)} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:activeTab===key?700:500,borderRadius:9,background:activeTab===key?'#DC2626':'transparent',color:activeTab===key?'white':'rgba(255,255,255,0.5)',border:'none',cursor:'pointer'}}>
                {label}
              </button>
            ))}
          </div>

          <div style={{padding:16}}>
            {activeTab==='orders' && (
              <>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:12,fontWeight:600}}>{orders.length} order{orders.length!==1?'s':''}</div>
                {orders.length===0 ? (
                  <div style={{textAlign:'center',padding:'60px 0',color:'rgba(255,255,255,0.2)'}}>
                    <div style={{fontSize:48,marginBottom:12}}>🐟</div>
                    <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>Koi order nahi abhi</div>
                    <a href="/" style={{display:'inline-block',background:'#DC2626',color:'white',textDecoration:'none',padding:'12px 24px',borderRadius:12,fontWeight:700}}>Order Karo →</a>
                  </div>
                ) : orders.map(order=>(
                  <div key={order.id} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:16,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:16,color:'#fff',letterSpacing:1}}>#{order.id.slice(0,8).toUpperCase()}</div>
                        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{order.createdAt?.toDate?.()?.toLocaleDateString('en-IN')||''}</div>
                      </div>
                      <span style={{background:getStatusColor(order.status)+'20',color:getStatusColor(order.status),fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{getStatusLabel(order.status)}</span>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,marginBottom:10,fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:1.6}}>{order.items}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontSize:13,color:'#64748b'}}>📍 {order.area}<br/>🕐 {order.deliveryTime}</div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:11,color:'#94a3b8'}}>Total</div>
                        <div style={{fontSize:20,fontWeight:900,color:'#DC2626'}}>₹{order.total}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{textAlign:'center',marginTop:8}}>
                  <a href="/" style={{color:'#94a3b8',fontSize:13,textDecoration:'none'}}>← Back to Home</a>
                </div>
              </>
            )}

            {activeTab==='address' && (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20}}>
                <div style={{fontSize:15,fontWeight:800,color:'#fff',marginBottom:16}}>📍 Saved Address</div>
                {profile.flat ? (
                  <>
                    <div style={{background:'rgba(0,212,170,0.08)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,padding:16,marginBottom:16}}>
                      <div style={{color:'#00d4aa',fontWeight:700,fontSize:13,marginBottom:8}}>🏠 Default Address</div>
                      <div style={{color:'rgba(255,255,255,0.8)',fontSize:14,lineHeight:1.8}}>
                        {profile.flat}, {profile.building}<br/>
                        {profile.street}{profile.landmark?`, Near ${profile.landmark}`:''}<br/>
                        {profile.area}, {profile.pincode}
                      </div>
                    </div>
                    <button onClick={()=>setActiveTab('profile')} style={{width:'100%',background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.15)',padding:12,borderRadius:12,fontWeight:600,fontSize:14,cursor:'pointer'}}>
                      ✏️ Address Edit Karo
                    </button>
                  </>
                ) : (
                  <div style={{textAlign:'center',padding:'40px 0',color:'rgba(255,255,255,0.3)'}}>
                    <div style={{fontSize:40,marginBottom:12}}>📍</div>
                    <div style={{marginBottom:16}}>Koi address save nahi hai</div>
                    <button onClick={()=>setActiveTab('profile')} style={{background:'#DC2626',color:'white',border:'none',padding:'12px 24px',borderRadius:12,fontWeight:700,cursor:'pointer'}}>Address Add Karo</button>
                  </div>
                )}
              </div>
            )}

            {activeTab==='profile' && (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20}}>
                <div style={{fontSize:15,fontWeight:800,color:'#fff',marginBottom:16}}>👤 Profile Edit Karo</div>
                <input placeholder="Aapka Naam *" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={{...inp,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)',color:'white'}}/>
                <input placeholder="Pincode *" type="number" value={profile.pincode} onChange={e=>handlePincode(e.target.value.slice(0,6))} style={{...inp,background:'rgba(255,255,255,0.06)',border:`1.5px solid ${pincodeValid===false?'#ef4444':pincodeValid===true?'#16A34A':'rgba(255,255,255,0.1)'}`,color:'white'}}/>
                {pincodeValid===true && <div style={{color:'#16A34A',fontSize:12,marginTop:-8,marginBottom:12,fontWeight:600}}>✅ {profile.area}</div>}
                {pincodeValid===false && <div style={{color:'#ef4444',fontSize:12,marginTop:-8,marginBottom:12}}>❌ Delivery nahi milti is area mein</div>}
                <input placeholder="Flat / House No. *" value={profile.flat} onChange={e=>setProfile(p=>({...p,flat:e.target.value}))} style={{...inp,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)',color:'white'}}/>
                <input placeholder="Building / Society Name *" value={profile.building} onChange={e=>setProfile(p=>({...p,building:e.target.value}))} style={{...inp,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)',color:'white'}}/>
                <input placeholder="Street / Gali *" value={profile.street} onChange={e=>setProfile(p=>({...p,street:e.target.value}))} style={{...inp,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)',color:'white'}}/>
                <input placeholder="Landmark (optional)" value={profile.landmark} onChange={e=>setProfile(p=>({...p,landmark:e.target.value}))} style={{...inp,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)',color:'white'}}/>
                {error && <div style={{background:'#fef2f2',borderRadius:10,padding:'10px 14px',marginBottom:12,color:'#dc2626',fontSize:13}}>{error}</div>}
                {profileSaved && <div style={{background:'rgba(22,163,74,0.15)',borderRadius:10,padding:'10px 14px',marginBottom:12,color:'#16A34A',fontSize:13,fontWeight:700}}>✅ Saved!</div>}
                <button onClick={saveProfile} disabled={loading} style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,fontSize:15,cursor:'pointer',opacity:loading?0.7:1}}>
                  {loading?'⏳ Saving...':'💾 Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
