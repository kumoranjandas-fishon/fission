"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'orders'), where('phone', '==', phone));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No orders found with this phone number.');
      } else {
        // Redirect to orders page or show orders
        window.location.href = `/orders?phone=${phone}`;
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* Logo */}
      <a href="/" style={{textDecoration:'none',marginBottom:'40px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'8px'}}>
          <div style={{width:'48px',height:'48px',background:'#DC2626',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px'}}>🐟</div>
          <div>
            <span style={{color:'#DC2626',fontWeight:900,fontSize:'28px'}}>Fish</span>
            <span style={{color:'#16A34A',fontWeight:900,fontSize:'28px',fontStyle:'italic'}}>on</span>
          </div>
        </div>
        <div style={{color:'#64748b',fontSize:'12px',letterSpacing:'2px',fontWeight:600}}>FRESH CATCH DAILY</div>
      </a>

      {/* Card */}
      <div style={{background:'white',borderRadius:'24px',padding:'36px 32px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
        <h1 style={{margin:'0 0 6px',fontSize:'24px',fontWeight:800,color:'#0f172a',textAlign:'center'}}>Welcome Back! 👋</h1>
        <p style={{margin:'0 0 28px',color:'#64748b',fontSize:'14px',textAlign:'center'}}>Enter your phone number to track your orders</p>

        {/* Phone Input */}
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',fontSize:'13px',fontWeight:600,color:'#334155',marginBottom:'8px'}}>Phone Number</label>
          <div style={{display:'flex',alignItems:'center',border:'2px solid #e2e8f0',borderRadius:'12px',overflow:'hidden',transition:'border-color 0.2s'}}>
            <span style={{padding:'12px 14px',background:'#f8fafc',borderRight:'2px solid #e2e8f0',color:'#64748b',fontSize:'14px',fontWeight:600}}>🇮🇳 +91</span>
            <input
              type="number"
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={e => { setPhone(e.target.value.slice(0,10)); setError(''); }}
              style={{flex:1,padding:'12px 16px',border:'none',outline:'none',fontSize:'15px',color:'#0f172a',background:'white'}}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',color:'#dc2626',fontSize:'13px',fontWeight:500}}>
            ⚠️ {error}
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1,marginBottom:'16px'}}>
          {loading ? '⏳ Checking...' : '🔍 Track My Orders'}
        </button>

        {/* Divider */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
          <div style={{flex:1,height:'1px',background:'#e2e8f0'}}></div>
          <span style={{color:'#94a3b8',fontSize:'12px',fontWeight:500}}>OR</span>
          <div style={{flex:1,height:'1px',background:'#e2e8f0'}}></div>
        </div>

        {/* WhatsApp Login */}
        <a
          href="https://wa.me/918287000582?text=Hi! I want to check my order status"
          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',background:'#16A34A',color:'white',textDecoration:'none',padding:'14px',borderRadius:'12px',fontWeight:700,fontSize:'15px',boxSizing:'border-box'}}>
          💬 Check via WhatsApp
        </a>

        {/* Back to home */}
        <div style={{textAlign:'center',marginTop:'24px'}}>
          <a href="/" style={{color:'#64748b',fontSize:'13px',textDecoration:'none',fontWeight:500}}>
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Admin link */}
      <div style={{marginTop:'24px',textAlign:'center'}}>
        <a href="/admin" style={{color:'#475569',fontSize:'12px',textDecoration:'none'}}>Admin Panel →</a>
      </div>
    </main>
  );
}
