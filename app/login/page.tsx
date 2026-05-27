"use client";
import { useState, useEffect, useRef } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged, ConfirmationResult } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

// ── TYPES ──────────────────────────────────────────────
type Order = {
  id: string; name: string; phone: string; items: string; total: number;
  status: string; area: string; deliveryTime: string; address: string;
  paymentMethod?: string; createdAt: any;
};

type SavedAddress = {
  id: string; label: string; flat: string; building: string;
  street: string; landmark: string; pincode: string; area: string; isDefault: boolean;
};

type UserProfile = {
  name: string; phone: string; addresses: SavedAddress[];
};

// ── PINCODES ──────────────────────────────────────────
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

// ── STATUS HELPERS ────────────────────────────────────
const getStatusColor = (s: string) =>
  s === 'delivered' ? '#16A34A' : s === 'preparing' || s === 'out_for_delivery' ? '#f59e0b' :
  s === 'confirmed' || s === 'paid' ? '#3b82f6' : s === 'cancelled' ? '#ef4444' : '#64748b';

const getStatusLabel = (s: string) =>
  s === 'delivered' ? '✅ Delivered' : s === 'out_for_delivery' ? '🚚 Out for Delivery' :
  s === 'preparing' ? '🔪 Preparing' : s === 'confirmed' ? '✔️ Confirmed' :
  s === 'paid' ? '💳 Paid' : s === 'cancelled' ? '❌ Cancelled' : '🕐 Processing';

// ── INPUT STYLE ───────────────────────────────────────
const inp = (dark?: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: `1.5px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
  fontSize: '14px', outline: 'none', color: dark ? 'white' : '#0f172a',
  background: dark ? 'rgba(255,255,255,0.07)' : 'white',
  boxSizing: 'border-box' as const, marginBottom: '12px',
  transition: 'border 0.2s',
});

// ── MAIN COMPONENT ────────────────────────────────────
export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'setup' | 'dashboard'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [profile, setProfile] = useState<UserProfile>({ name: '', phone: '', addresses: [] });
  const [savedMsg, setSavedMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New address form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<SavedAddress, 'id' | 'isDefault'>>({
    label: 'Home', flat: '', building: '', street: '', landmark: '', pincode: '', area: '',
  });
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);

  // Profile name edit
  const [editName, setEditName] = useState('');

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();

  // ── AUTO LOGIN CHECK ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.phoneNumber) {
        const ph = user.phoneNumber.replace('+91', '');
        setPhone(ph);
        await loadUserData(ph);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible', callback: () => {},
        });
      } catch (e) {}
    }
  }, []);

  // ── LOAD USER DATA ──────────────────────────────────
  const loadUserData = async (ph: string) => {
    try {
      const pd = await getDoc(doc(db, 'users', ph));
      if (pd.exists()) {
        const data = pd.data() as UserProfile;
        setProfile({ ...data, addresses: data.addresses || [] });
        setEditName(data.name || '');
        setStep('dashboard');
      } else {
        setEditName('');
        setStep('setup');
      }
      // Load orders
      const snap = await getDocs(query(collection(db, 'orders'), where('phone', '==', ph)));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
        .sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0)));
    } catch (e) { console.error(e); }
  };

  // ── OTP FLOW ─────────────────────────────────────────
  const sendOTP = async () => {
    if (phone.length !== 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const r = await signInWithPhoneNumber(auth, `+91${phone}`, (window as any).recaptchaVerifier);
      setConfirmation(r); setStep('otp');
    } catch (e: any) {
      setError('Failed to send OTP. Please try again.');
      try {
        (window as any).recaptchaVerifier?.clear();
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} });
      } catch (e2) {}
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter 6-digit OTP'); return; }
    if (!confirmation) return;
    setLoading(true); setError('');
    try { await confirmation.confirm(otp); await loadUserData(phone); }
    catch (e) { setError('Invalid OTP. Please try again.'); }
    setLoading(false);
  };

  // ── SAVE PROFILE ─────────────────────────────────────
  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await setDoc(doc(db, 'users', phone), { ...updatedProfile, phone, updatedAt: new Date() });
      setProfile(updatedProfile);
      setSavedMsg('Saved successfully!');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (e) { setError('Could not save. Please try again.'); }
  };

  const handleSetupSave = async () => {
    if (!editName.trim()) { setError('Name is required'); return; }
    setLoading(true);
    await saveProfile({ ...profile, name: editName, phone });
    setStep('dashboard');
    setLoading(false);
  };

  const handleNameSave = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    await saveProfile({ ...profile, name: editName });
    setLoading(false);
  };

  // ── ADDRESS MANAGEMENT ────────────────────────────────
  const handlePincode = (val: string) => {
    setNewAddr(a => ({ ...a, pincode: val, area: PINCODES[val] || '' }));
    if (val.length === 6) setPincodeValid(!!PINCODES[val]);
    else setPincodeValid(null);
  };

  const addAddress = async () => {
    if (!newAddr.flat || !newAddr.building || !newAddr.street || !newAddr.pincode) {
      setError('Please fill all required fields'); return;
    }
    if (!PINCODES[newAddr.pincode]) { setError('Delivery not available in this pincode'); return; }
    setLoading(true);
    const id = Date.now().toString();
    const isFirst = profile.addresses.length === 0;
    const updatedAddresses = [...profile.addresses, { ...newAddr, id, isDefault: isFirst }];
    await saveProfile({ ...profile, addresses: updatedAddresses });
    setNewAddr({ label: 'Home', flat: '', building: '', street: '', landmark: '', pincode: '', area: '' });
    setPincodeValid(null);
    setShowAddAddr(false);
    setLoading(false);
  };

  const deleteAddress = async (id: string) => {
    const updated = profile.addresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.find(a => a.isDefault)) updated[0].isDefault = true;
    await saveProfile({ ...profile, addresses: updated });
  };

  const setDefaultAddress = async (id: string) => {
    const updated = profile.addresses.map(a => ({ ...a, isDefault: a.id === id }));
    await saveProfile({ ...profile, addresses: updated });
  };

  // ── LOGOUT ────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    setStep('phone'); setPhone(''); setOtp(''); setOrders([]);
    setProfile({ name: '', phone: '', addresses: [] }); setEditName('');
  };

  // ── STYLES ────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16, marginBottom: 10,
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1a2e 50%,#0a0f1e 100%)', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div id="recaptcha-container" ref={recaptchaRef} />

      {/* ══ PHONE ══════════════════════════════════════════ */}
      {step === 'phone' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
          <a href="https://www.fishon.co.in" style={{ textDecoration: 'none', marginBottom: 32, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 48, height: 48, background: '#DC2626', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🐟</div>
              <div><span style={{ color: '#DC2626', fontWeight: 900, fontSize: 28 }}>Fish</span><span style={{ color: '#16A34A', fontWeight: 900, fontSize: 28, fontStyle: 'italic' }}>on</span></div>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, letterSpacing: 2, fontWeight: 600 }}>FRESH CATCH DAILY</div>
          </a>
          <div style={{ background: 'white', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Welcome! 👋</h1>
            <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: 14, textAlign: 'center' }}>Login or create your account</p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Phone Number</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <span style={{ padding: '12px 14px', background: '#f8fafc', borderRight: '1.5px solid #e2e8f0', color: '#64748b', fontSize: 14, fontWeight: 600 }}>🇮🇳 +91</span>
              <input type="number" placeholder="10-digit number" value={phone}
                onChange={e => { setPhone(e.target.value.slice(0, 10)); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
                style={{ flex: 1, padding: '12px 16px', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a' }}
              />
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}
            <button onClick={sendOTP} disabled={loading} style={{ width: '100%', background: '#DC2626', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Sending...' : '📲 Send OTP'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="https://www.fishon.co.in" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>← Back to Shopping</a>
            </div>
          </div>
        </div>
      )}

      {/* ══ OTP ════════════════════════════════════════════ */}
      {step === 'otp' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
              <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Verify OTP</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>OTP sent to +91 {phone}</p>
            </div>
            <input type="number" placeholder="_ _ _ _ _ _" value={otp}
              onChange={e => { setOtp(e.target.value.slice(0, 6)); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              style={{ ...inp(), fontSize: 28, letterSpacing: 12, textAlign: 'center', fontWeight: 700 }}
            />
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>{error}</div>}
            <button onClick={verifyOTP} disabled={loading} style={{ width: '100%', background: '#16A34A', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
            </button>
            <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ width: '100%', background: '#f1f5f9', color: '#64748b', border: 'none', padding: 12, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              ← Change Number
            </button>
          </div>
        </div>
      )}

      {/* ══ SETUP (First Time) ═════════════════════════════ */}
      {step === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>👤</div>
              <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Complete Your Profile</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Enter once — no need to fill again!</p>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Your Name *</label>
            <input placeholder="Full Name" value={editName} onChange={e => setEditName(e.target.value)} style={inp()} />

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#16A34A' }}>
              📍 You can add your delivery address after login — from your profile!
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>{error}</div>}
            <button onClick={handleSetupSave} disabled={loading} style={{ width: '100%', background: '#DC2626', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Saving...' : '🐟 Start Shopping'}
            </button>
          </div>
        </div>
      )}

      {/* ══ DASHBOARD ══════════════════════════════════════ */}
      {step === 'dashboard' && (
        <div style={{ maxWidth: 600, margin: '0 auto', minHeight: '100vh' }}>

          {/* Header */}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
            <a href="https://www.fishon.co.in" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#DC2626', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐟</div>
              <div>
                <span style={{ color: '#DC2626', fontWeight: 900, fontSize: 18 }}>Fish</span>
                <span style={{ color: '#16A34A', fontWeight: 900, fontSize: 18, fontStyle: 'italic' }}>on</span>
              </div>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{profile.name || 'User'}</div>
                <div style={{ color: '#64748b', fontSize: 11 }}>+91 {phone}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '7px 14px', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', margin: '16px 16px 0', borderRadius: 14, padding: 4, gap: 2 }}>
            {[['orders', '📦 My Orders'], ['addresses', '📍 Addresses'], ['profile', '👤 Profile']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key as any)} style={{ flex: 1, padding: '10px 4px', textAlign: 'center', fontSize: 13, fontWeight: activeTab === key ? 700 : 500, borderRadius: 10, background: activeTab === key ? '#DC2626' : 'transparent', color: activeTab === key ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16 }}>

            {/* ── ORDERS TAB ─────────────────────────────── */}
            {activeTab === 'orders' && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontWeight: 600 }}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''} total
                </div>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🐟</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>No orders yet</div>
                    <a href="https://www.fishon.co.in" style={{ display: 'inline-block', background: '#DC2626', color: 'white', textDecoration: 'none', padding: '13px 28px', borderRadius: 12, fontWeight: 700 }}>Order Now →</a>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ ...cardStyle, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: getStatusColor(order.status), borderRadius: '16px 0 0 16px' }} />
                    <div style={{ marginLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                            {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || ''}
                          </div>
                        </div>
                        <span style={{ background: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.items}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>📍 {order.area}</div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: '#DC2626' }}>₹{order.total}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Tap to view details →</div>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <a href="https://www.fishon.co.in" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>← Back to Shopping</a>
                </div>
              </>
            )}

            {/* ── ADDRESSES TAB ──────────────────────────── */}
            {activeTab === 'addresses' && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontWeight: 600 }}>
                  {profile.addresses.length} saved address{profile.addresses.length !== 1 ? 'es' : ''}
                </div>

                {profile.addresses.map(addr => (
                  <div key={addr.id} style={{ ...cardStyle, border: addr.isDefault ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.08)', background: addr.isDefault ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍'}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{addr.label}</div>
                          {addr.isDefault && <span style={{ fontSize: 10, color: '#00d4aa', fontWeight: 700 }}>✓ DEFAULT</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!addr.isDefault && (
                          <button onClick={() => setDefaultAddress(addr.id)} style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            Set Default
                          </button>
                        )}
                        <button onClick={() => deleteAddress(addr.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                      {addr.flat}, {addr.building}<br />
                      {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}<br />
                      <span style={{ color: '#64748b' }}>{addr.area}, {addr.pincode}</span>
                    </div>
                  </div>
                ))}

                {/* Add New Address */}
                {!showAddAddr ? (
                  <button onClick={() => setShowAddAddr(true)} style={{ width: '100%', background: 'rgba(220,38,38,0.08)', border: '2px dashed rgba(220,38,38,0.3)', color: '#DC2626', padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginTop: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 16 }}>📍 New Address</div>

                    {/* Label selector */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      {['Home', 'Work', 'Other'].map(l => (
                        <button key={l} onClick={() => setNewAddr(a => ({ ...a, label: l }))} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: newAddr.label === l ? '2px solid #DC2626' : '1.5px solid rgba(255,255,255,0.1)', background: newAddr.label === l ? 'rgba(220,38,38,0.12)' : 'transparent', color: newAddr.label === l ? '#DC2626' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                          {l === 'Home' ? '🏠' : l === 'Work' ? '🏢' : '📍'} {l}
                        </button>
                      ))}
                    </div>

                    <input placeholder="Pincode *" type="number" value={newAddr.pincode}
                      onChange={e => handlePincode(e.target.value.slice(0, 6))}
                      style={{ ...inp(true), borderColor: pincodeValid === false ? '#ef4444' : pincodeValid === true ? '#16A34A' : 'rgba(255,255,255,0.12)' }}
                    />
                    {pincodeValid === true && <div style={{ color: '#16A34A', fontSize: 12, marginTop: -8, marginBottom: 12, fontWeight: 600 }}>✅ {newAddr.area} — Delivery Available!</div>}
                    {pincodeValid === false && <div style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 12 }}>❌ Delivery not available in this area yet</div>}
                    <input placeholder="Flat / House No. *" value={newAddr.flat} onChange={e => setNewAddr(a => ({ ...a, flat: e.target.value }))} style={inp(true)} />
                    <input placeholder="Building / Society Name *" value={newAddr.building} onChange={e => setNewAddr(a => ({ ...a, building: e.target.value }))} style={inp(true)} />
                    <input placeholder="Street / Lane *" value={newAddr.street} onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))} style={inp(true)} />
                    <input placeholder="Landmark (optional)" value={newAddr.landmark} onChange={e => setNewAddr(a => ({ ...a, landmark: e.target.value }))} style={inp(true)} />

                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#ef4444', fontSize: 13 }}>{error}</div>}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={addAddress} disabled={loading} style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? '⏳...' : '💾 Save Address'}
                      </button>
                      <button onClick={() => { setShowAddAddr(false); setError(''); setPincodeValid(null); }} style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '13px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── PROFILE TAB ────────────────────────────── */}
            {activeTab === 'profile' && (
              <>
                <div style={{ ...cardStyle }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' as const }}>Account Details</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#DC2626,#991b1b)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {profile.name ? profile.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{profile.name || 'Add your name'}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>+91 {phone}</div>
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 6 }}>FULL NAME</label>
                  <input placeholder="Your Full Name" value={editName} onChange={e => setEditName(e.target.value)} style={inp(true)} />

                  {savedMsg && <div style={{ background: 'rgba(22,163,74,0.12)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#16A34A', fontSize: 13, fontWeight: 700 }}>✅ {savedMsg}</div>}

                  <button onClick={handleNameSave} disabled={loading} style={{ width: '100%', background: '#DC2626', color: 'white', border: 'none', padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳...' : '💾 Save Changes'}
                  </button>
                </div>

                <div style={{ ...cardStyle }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' as const }}>Quick Stats</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#DC2626' }}>{orders.length}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Total Orders</div>
                    </div>
                    <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#00d4aa' }}>{profile.addresses.length}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Saved Addresses</div>
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle }}>
                  <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🚪 Logout
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <a href="https://www.fishon.co.in" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>← Back to Shopping</a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ ORDER DETAIL MODAL ═════════════════════════════ */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1a2e', width: '100%', maxWidth: 600, borderRadius: '22px 22px 0 0', padding: 24, maxHeight: '88vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {selectedOrder.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: getStatusColor(selectedOrder.status) + '20', color: getStatusColor(selectedOrder.status), fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20 }}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16 }}>✕</button>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ITEMS ORDERED</div>
              {selectedOrder.items.split(', ').map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{item.split(' = ')[0]}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{item.split(' = ')[1] || ''}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '2px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: '#DC2626' }}>₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Payment & Delivery */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 6 }}>PAYMENT</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  {selectedOrder.paymentMethod === 'online' ? '💳 Online Paid' : '💵 Cash on Delivery'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 6 }}>DELIVERY</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>🕐 {selectedOrder.deliveryTime}</div>
              </div>
            </div>

            {/* Address */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>DELIVERY ADDRESS</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
                📍 {selectedOrder.address || selectedOrder.area}
              </div>
            </div>

            <a href="https://www.fishon.co.in" style={{ display: 'block', width: '100%', background: '#DC2626', color: 'white', textDecoration: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, textAlign: 'center', boxSizing: 'border-box' }}>
              🛒 Order Again
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
