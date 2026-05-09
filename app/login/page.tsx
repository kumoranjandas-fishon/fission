"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendOTP = async () => {
    setError("");
    if (phone.length < 10) { setError("Sahi phone number dalो"); return; }
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const phoneNumber = "+91" + phone;
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      window.confirmationResult = result;
      setOtpSent(true);
      setSuccess("OTP bheja gaya! Check karo.");
    } catch (e: unknown) {
      setError("OTP send nahi hua. Dobara try karo.");
      console.error(e);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setError("");
    if (otp.length !== 6) { setError("6 digit OTP dalो"); return; }
    setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
      setSuccess("✅ Login ho gaya! Welcome to Fishon!");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch {
      setError("OTP galat hai. Dobara try karo.");
    }
    setLoading(false);
  };

  const handleEmail = async () => {
    setError("");
    if (!email || !password) { setError("Email aur password dalो"); return; }
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setSuccess("✅ Login ho gaya! Welcome to Fishon!");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message.includes("user-not-found")) setError("Account nahi hai. Sign up karo.");
        else if (e.message.includes("wrong-password")) setError("Password galat hai.");
        else if (e.message.includes("email-already-in-use")) setError("Email already registered hai.");
        else setError("Kuch error aaya. Dobara try karo.");
      }
    }
    setLoading(false);
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#111 0%,#1a0505 60%,#0a1505 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{fontSize:'40px',marginBottom:'8px'}}>🐟</div>
          <span style={{color:'#DC2626',fontWeight:900,fontSize:'28px'}}>Fish</span>
          <span style={{color:'#16A34A',fontWeight:900,fontSize:'28px',fontStyle:'italic'}}>on</span>
          <p style={{color:'#888',fontSize:'13px',marginTop:'4px'}}>Login karke order karo!</p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'#f5f5f5',borderRadius:'12px',padding:'4px',marginBottom:'24px'}}>
          <button
            onClick={()=>{setTab('phone');setError('');setSuccess('');}}
            style={{flex:1,padding:'10px',border:'none',borderRadius:'10px',fontWeight:'bold',fontSize:'13px',cursor:'pointer',
              background: tab==='phone' ? 'white' : 'transparent',
              color: tab==='phone' ? '#DC2626' : '#888',
              boxShadow: tab==='phone' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}>
            📱 Phone OTP
          </button>
          <button
            onClick={()=>{setTab('email');setError('');setSuccess('');}}
            style={{flex:1,padding:'10px',border:'none',borderRadius:'10px',fontWeight:'bold',fontSize:'13px',cursor:'pointer',
              background: tab==='email' ? 'white' : 'transparent',
              color: tab==='email' ? '#DC2626' : '#888',
              boxShadow: tab==='email' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}>
            📧 Email
          </button>
        </div>

        {/* Phone OTP */}
        {tab === 'phone' && (
          <div>
            {!otpSent ? (
              <>
                <label style={{fontSize:'13px',fontWeight:'bold',color:'#333',display:'block',marginBottom:'6px'}}>Phone Number</label>
                <div style={{display:'flex',alignItems:'center',border:'2px solid #eee',borderRadius:'10px',overflow:'hidden',marginBottom:'16px'}}>
                  <span style={{padding:'12px',background:'#f5f5f5',fontWeight:'bold',color:'#333',fontSize:'14px'}}>+91</span>
                  <input
                    type="number"
                    placeholder="10 digit number"
                    value={phone}
                    onChange={e=>setPhone(e.target.value.slice(0,10))}
                    style={{flex:1,padding:'12px',border:'none',outline:'none',fontSize:'14px'}}
                  />
                </div>
                <div id="recaptcha-container"></div>
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1}}>
                  {loading ? '⏳ Bhej raha hai...' : '📤 OTP Bhejo'}
                </button>
              </>
            ) : (
              <>
                <label style={{fontSize:'13px',fontWeight:'bold',color:'#333',display:'block',marginBottom:'6px'}}>OTP Enter Karo</label>
                <input
                  type="number"
                  placeholder="6 digit OTP"
                  value={otp}
                  onChange={e=>setOtp(e.target.value.slice(0,6))}
                  style={{width:'100%',padding:'12px 16px',border:'2px solid #eee',borderRadius:'10px',fontSize:'18px',letterSpacing:'8px',textAlign:'center',outline:'none',marginBottom:'16px',boxSizing:'border-box'}}
                />
                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  style={{width:'100%',background:'#16A34A',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1}}>
                  {loading ? '⏳ Verify ho raha hai...' : '✅ Verify Karo'}
                </button>
                <button
                  onClick={()=>{setOtpSent(false);setOtp('');setError('');setSuccess('');}}
                  style={{width:'100%',background:'transparent',color:'#888',border:'none',padding:'10px',fontSize:'13px',cursor:'pointer',marginTop:'8px'}}>
                  ← Wapas
                </button>
              </>
            )}
          </div>
        )}

        {/* Email */}
        {tab === 'email' && (
          <div>
            <label style={{fontSize:'13px',fontWeight:'bold',color:'#333',display:'block',marginBottom:'6px'}}>Email</label>
            <input
              type="email"
              placeholder="aapka@email.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',padding:'12px 16px',border:'2px solid #eee',borderRadius:'10px',fontSize:'14px',outline:'none',marginBottom:'12px',boxSizing:'border-box'}}
            />
            <label style={{fontSize:'13px',fontWeight:'bold',color:'#333',display:'block',marginBottom:'6px'}}>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',padding:'12px 16px',border:'2px solid #eee',borderRadius:'10px',fontSize:'14px',outline:'none',marginBottom:'16px',boxSizing:'border-box'}}
            />
            <button
              onClick={handleEmail}
              disabled={loading}
              style={{width:'100%',background:'#DC2626',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontWeight:'bold',fontSize:'15px',cursor:'pointer',opacity:loading?0.7:1,marginBottom:'12px'}}>
              {loading ? '⏳ Loading...' : isSignup ? '✅ Account Banao' : '🔑 Login Karo'}
            </button>
            <button
              onClick={()=>{setIsSignup(!isSignup);setError('');}}
              style={{width:'100%',background:'transparent',color:'#DC2626',border:'1.5px solid #DC2626',padding:'12px',borderRadius:'10px',fontWeight:'bold',fontSize:'13px',cursor:'pointer'}}>
              {isSignup ? 'Already account hai? Login karo' : 'Naya account? Sign up karo'}
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div style={{marginTop:'14px',background:'#FFF0ED',border:'2px solid #DC2626',borderRadius:'10px',padding:'12px',color:'#DC2626',fontSize:'13px',fontWeight:'bold'}}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{marginTop:'14px',background:'#E8F8EE',border:'2px solid #16A34A',borderRadius:'10px',padding:'12px',color:'#16A34A',fontSize:'13px',fontWeight:'bold'}}>
            {success}
          </div>
        )}

        {/* Back to home */}
        <div style={{textAlign:'center',marginTop:'20px'}}>
          <a href="/" style={{color:'#888',fontSize:'13px',textDecoration:'none'}}>← Wapas Home Pe Jao</a>
        </div>

      </div>
    </main>
  );
}
