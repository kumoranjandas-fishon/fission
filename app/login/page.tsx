"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

type Order = {
  id: string;
  name: string;
  phone: string;
  items: string;
  total: number;
  status: string;
  area: string;
  deliveryTime: string;
};

const getStatusColor = (status: string) => {
  if (status === 'delivered') return '#16A34A';
  if (status === 'out_for_delivery') return '#f59e0b';
  if (status === 'confirmed') return '#3b82f6';
  return '#64748b';
};

const getStatusLabel = (status: string) => {
  if (status === 'delivered') return '✅ Delivered';
  if (status === 'out_for_delivery') return '🚚 Out for Delivery';
  if (status === 'confirmed') return '✔️ Confirmed';
  return '🕐 New Order';
};

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone'|'otp'|'orders'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationResult|null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const auth = getAuth();

  useEffect(() => {
    // Setup invisible recaptcha
    if (typeof window !== 'undefined') {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
  }, []);

  const sendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      setConfirmation(confirmationResult);
      setStep('otp');
    } catch (e: any) {
      console.error(e);
      setError('OTP send karne mein problem hui. Dobara try karo.');
      // Reset recaptcha on error
      (window as any).recaptchaVerifier?.clear();
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('6 digit OTP daalo');
      return;
    }
    if (!confirmation) return;
    setLoading(true);
    setError('');
    try {
      await confirmation.confirm(otp);
      // OTP verified — now fetch orders
      const q = query(collection(db, 'orders'), where('phone', '==', phone));
      const snap = await getDocs(q);
      const orderList = snap.docs.map(doc => ({id: doc.id, ...doc.data()} as Order));
      setOrders(orderList);
      setStep('orders');
    } catch (e: any) {
      console.error(e);
      setError('OTP galat hai. Dobara check karo.');
    }
    setLoading(false);
  };

  const logout = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setOrders([]);
    setConfirmation(null);
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" ref={recaptchaRef}></div>

      {/* Logo */}
      <a href="/" style={{textDecoration:'none',marginBottom:'32px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'6px'}}>
          <div style={{width:'44px',height:'44px',background:'#DC2626',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🐟</div>
          <div>
            <span style={{color:'#DC2626',fontWeight:900,fontSize:'26px'}}>Fish</span>
            <span style={{color:'#16A34A',fontWeight:900,fontSize:'26px',fontStyle:'italic'}}>on</span>
          </div>
        </div>
        <div style={{color:'#64748b',fontSize:'11px',letterSpacing:'2px',fontWeight:600}}>FRESH CATCH DAILY</div>
      </a>

      {/* STEP 1: PHONE */}
      {step === 'phone' && (
        <div style={{background:'white',borderRadius:'24px',padding:'36px 32px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
          <h1 style={{margin:'0 0 6px',fontSize:'24px',fontWeight:800,color:'#0f172a',textAlign:'center'}}>Welcome Back! 👋</h1>
          <p style={{margin:'0 0 28px',color:'#64748b',fontSize:'14px',textAlign:'center'}}>Phone number pe OTP bhejenge</p>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:600,color:'#334155',marginBottom:'8px'}}>Phone Number</label>
            <div style={{display:'flex',alignItems:'center',border:'2px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
              <span style={{padding:'12px 14px',background:'#f8fafc',borderRight:'2px solid #e2e8f0',color:'#64748b',fontSize:'14px',fontWeight:600,whiteSpace:'nowrap'}}>🇮🇳 +91</span>
              <input
                type="number"
                placeholder="10-digit number"
                value={phone}
                onChange={e => { setPhone(e.target.value.slice(0,10)); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
                style={{flex:1,padding:'12px 16px',border:'none',outline:'none',fontSize:'15px',color:'#0f172a',background:'white'}}
              />
            </div>
          </div>

          {error && (
            <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',color:'#dc2626',fontSize:'13px',fontWeight:500}}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={sendOTP} disabled={loading}
            style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1,marginBottom:'16px'}}>
            {loading ? '⏳ OTP Bhej Raha Hai...' : '📱 OTP Bhejo'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
            <div style={{flex:1,height:'1px',background:'#e2e8f0'}}></div>
            <span style={{color:'#94a3b8',fontSize:'12px',fontWeight:500}}>OR</span>
            <div style={{flex:1,height:'1px',background:'#e2e8f0'}}></div>
          </div>

          <a href="https://wa.me/918287000582?text=Hi! I want to check my order status"
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',background:'#16A34A',color:'white',textDecoration:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',boxSizing:'border-box'}}>
            💬 WhatsApp Se Check Karo
          </a>

          <div style={{textAlign:'center',marginTop:'20px'}}>
            <a href="/" style={{color:'#64748b',fontSize:'13px',textDecoration:'none',fontWeight:500}}>← Back to Home</a>
          </div>
        </div>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <div style={{background:'white',borderRadius:'24px',padding:'36px 32px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
          <h1 style={{margin:'0 0 6px',fontSize:'24px',fontWeight:800,color:'#0f172a',textAlign:'center'}}>OTP Enter Karo 🔐</h1>
          <p style={{margin:'0 0 28px',color:'#64748b',fontSize:'14px',textAlign:'center'}}>
            +91 {phone} pe 6-digit OTP bheja gaya hai
          </p>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:600,color:'#334155',marginBottom:'8px'}}>OTP</label>
            <input
              type="number"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => { setOtp(e.target.value.slice(0,6)); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              style={{width:'100%',padding:'14px 16px',border:'2px solid #e2e8f0',borderRadius:'12px',fontSize:'20px',outline:'none',color:'#0f172a',letterSpacing:'8px',textAlign:'center',boxSizing:'border-box'}}
            />
          </div>

          {error && (
            <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',color:'#dc2626',fontSize:'13px',fontWeight:500}}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={verifyOTP} disabled={loading}
            style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1,marginBottom:'12px'}}>
            {loading ? '⏳ Verify Ho Raha Hai...' : '✅ Verify Karo'}
          </button>

          <button onClick={()=>{setStep('phone');setOtp('');setError('');}}
            style={{width:'100%',background:'#f1f5f9',color:'#334155',border:'none',padding:'12px',borderRadius:'12px',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>
            ← Number Change Karo
          </button>

          <p style={{textAlign:'center',color:'#94a3b8',fontSize:'12px',marginTop:'16px'}}>
            OTP nahi aaya? 1-2 minute wait karo
          </p>
        </div>
      )}

      {/* STEP 3: ORDERS */}
      {step === 'orders' && (
        <div style={{width:'100%',maxWidth:'520px'}}>
          <div style={{background:'white',borderRadius:'20px',padding:'20px 24px',marginBottom:'16px',boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:'18px',fontWeight:800,color:'#0f172a'}}>My Orders 📦</h2>
                <p style={{margin:0,color:'#64748b',fontSize:'13px'}}>+91 {phone} • {orders.length} order{orders.length!==1?'s':''}</p>
              </div>
              <button onClick={logout}
                style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'8px 14px',cursor:'pointer',fontSize:'13px',color:'#334155',fontWeight:600}}>
                Logout
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div style={{background:'white',borderRadius:'16px',padding:'40px 20px',textAlign:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📭</div>
              <p style={{color:'#64748b',fontSize:'14px',margin:0}}>Is number pe koi order nahi mila</p>
              <a href="/" style={{display:'inline-block',marginTop:'16px',background:'#DC2626',color:'white',textDecoration:'none',padding:'10px 24px',borderRadius:'10px',fontWeight:700,fontSize:'14px'}}>
                Order Karo 🛒
              </a>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{background:'white',borderRadius:'16px',padding:'20px',marginBottom:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                  <div>
                    <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'2px'}}>Order ID</div>
                    <div style={{fontWeight:800,fontSize:'16px',color:'#0f172a',letterSpacing:'1px'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                  </div>
                  <span style={{background:getStatusColor(order.status)+'20',color:getStatusColor(order.status),fontSize:'12px',fontWeight:700,padding:'4px 12px',borderRadius:'20px'}}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div style={{background:'#f8fafc',borderRadius:'10px',padding:'12px',marginBottom:'12px',fontSize:'13px',color:'#334155',lineHeight:1.8}}>
                  {order.items}
                </div>

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontSize:'13px',color:'#64748b'}}>
                    📍 {order.area}<br/>
                    🕐 {order.deliveryTime}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'11px',color:'#94a3b8'}}>Total</div>
                    <div style={{fontSize:'20px',fontWeight:900,color:'#DC2626'}}>₹{order.total}</div>
                  </div>
                </div>
              </div>
            ))
          )}

          <div style={{textAlign:'center',marginTop:'8px'}}>
            <a href="/" style={{color:'#94a3b8',fontSize:'13px',textDecoration:'none'}}>← Back to Home</a>
          </div>
        </div>
      )}

      <div style={{marginTop:'20px',textAlign:'center'}}>
        <a href="/admin" style={{color:'#475569',fontSize:'12px',textDecoration:'none'}}>Admin Panel →</a>
      </div>
    </main>
  );
}
