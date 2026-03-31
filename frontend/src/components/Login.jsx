import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Login({ setUser }) {
    const [step, setStep] = useState(0);
    const [roleSelected, setRoleSelected] = useState(null);
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPhone, setIsPhone] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        setMousePos({ x: clientX, y: clientY });

        // Calculate tilt for the card
        const card = document.getElementById('login-card');
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * 10;
            const tiltY = (x - 0.5) * -10;
            setTilt({ x: tiltX, y: tiltY });
        }
    };

    useEffect(() => {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        setIsPhone(identifier && phoneRegex.test(identifier) && identifier.replace(/\D/g, '').length >= 7);
    }, [identifier]);

    useEffect(() => {
        let timer;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (timeLeft === 0) {
            setError('Your verification code has expired. Please request a new one.');
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!identifier) return;
        setIsLoading(true); setError(''); setSuccessMsg('');
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email: identifier });
            setSuccessMsg(isPhone ? 'Mock SMS generated! Check the Python terminal for the OTP.' : response.data.message);
            setTimeLeft(60); setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP to that address.');
        } finally { setIsLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) { setError('Please enter all 6 digits.'); return; }
        setIsLoading(true); setError('');
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email: identifier, otp: otpCode });
            setUser(response.data.user); navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired OTP code.');
        } finally { setIsLoading(false); }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true); setError('');
        try {
            const { email, name, picture } = jwtDecode(credentialResponse.credential);
            if (roleSelected === 'admin' && email.toLowerCase() !== 'hedportal16@gmail.com') {
                throw new Error('Access Blocked: Only hedportal16@gmail.com is authorized for the Admin Portal.');
            }
            setIdentifier(email);
            const response = await axios.post(`${API_BASE_URL}/auth/google`, { email, name, picture });
            setUser(response.data.user); navigate('/dashboard');
        } catch (err) {
            setError(err.message || err.response?.data?.detail || 'Google Authentication failed.');
        } finally { setIsLoading(false); }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== '') element.nextSibling.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && e.target.previousSibling) e.target.previousSibling.focus();
    };

    const features = [
        { emoji: '🤖', label: 'AI Assistant', desc: 'Ask anything, get answers instantly' },
        { emoji: '🔍', label: 'Smart Search', desc: 'Find documents in seconds' },
        { emoji: '📚', label: 'Knowledge Base', desc: 'Policies, schemes & circulars' },
        { emoji: '📊', label: 'Analytics', desc: 'Real-time usage insights' },
    ];

    const stats = [
        { val: '1,240', lbl: 'Documents', emoji: '📄' },
        { val: '98%', lbl: 'Accuracy', emoji: '🎯' },
        { val: '485+', lbl: 'Queries/Day', emoji: '⚡' },
    ];

    return (
        <div className="min-h-screen font-sans flex overflow-hidden relative select-none"
            onMouseMove={handleMouseMove}
            style={{ background: 'linear-gradient(135deg, #020817 0%, #0a1628 40%, #0d1f3c 75%, #0b1730 100%)' }}>

            {/* ── Interactive Mouse Aura ── */}
            <div className="fixed pointer-events-none z-0 transition-opacity duration-1000"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }} />


            {/* ── Ambient glow orbs ── */}
            <div className="absolute pointer-events-none animate-float" style={{ top: '-10%', left: '-8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.42) 0%, transparent 70%)', filter: 'blur(70px)' }} />
            <div className="absolute pointer-events-none animate-float-delayed" style={{ bottom: '-15%', right: '-8%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.32) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            <div className="absolute pointer-events-none animate-float-slow" style={{ top: '38%', left: '32%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)', filter: 'blur(55px)' }} />
            <div className="absolute pointer-events-none animate-pulse opacity-40" style={{ bottom: '20%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />


            {/* ── Top Nav ── */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', boxShadow: '0 0 20px rgba(37,99,235,0.6)' }}>
                        BD
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg tracking-tight">HED </span>
                        <span className="font-light text-white/50 text-lg">Portal</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                    🔒 Secure Connection · TLS 1.3
                </div>
            </div>

            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col justify-center px-14 xl:px-20 w-[52%] relative z-10 pt-28 pb-14">
                <div className="space-y-9 max-w-lg">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: 'rgba(165,180,252,0.9)' }}>
                        🎓 Higher Education Department
                    </div>

                    {/* Headline */}
                    <div>
                        <h1 className="text-5xl xl:text-6xl font-extralight text-white leading-[1.15] tracking-tight">
                            Access<br />Institutional<br />
                            <span className="font-extrabold"
                                style={{ background: 'linear-gradient(90deg, #a5b4fc 0%, #818cf8 50%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Knowledge. ✨
                            </span>
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed max-w-sm"
                            style={{ color: 'rgba(255,255,255,0.44)' }}>
                            🚀 AI-powered access to government policies, scholarship records & institutional guidelines — instantly.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {features.map(f => (
                            <div key={f.label}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-default transition-all duration-200 hover:scale-[1.03]"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                                <span className="text-2xl">{f.emoji}</span>
                                <div>
                                    <p className="text-sm font-semibold text-white/80">{f.label}</p>
                                    <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-10 pt-1">
                        {stats.map(s => (
                            <div key={s.lbl}>
                                <p className="text-3xl font-extralight text-white flex items-baseline gap-1">
                                    {s.val} <span className="text-xl">{s.emoji}</span>
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.lbl}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Panel — Glassmorphism Card ── */}
            <div className="flex flex-1 items-center justify-center px-6 py-28 z-20 relative perspective-[1000px]">
                <div id="login-card" className="w-full max-w-[420px] rounded-[2.5rem] p-10 transition-all duration-300 ease-out"
                    style={{
                        background: 'rgba(255,255,255,0.065)',
                        backdropFilter: 'blur(48px)',
                        WebkitBackdropFilter: 'blur(48px)',
                        border: '1px solid rgba(255,255,255,0.13)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    }}>


                    {/* Card top accent bar */}
                    <div className="w-14 h-1 rounded-full mb-6"
                        style={{ background: 'linear-gradient(90deg, #2563eb, #818cf8)' }} />

                    {/* Heading */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white">
                            {step === 0 && '👋 Welcome back'}
                            {step === 1 && roleSelected === 'admin' && '🔐 Admin Access'}
                            {step === 1 && roleSelected === 'user' && '✉️ Sign In'}
                            {step === 2 && '🔑 Verify Identity'}
                        </h2>
                        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                            {step === 0 && 'Select your portal to continue 👇'}
                            {step === 1 && roleSelected === 'admin' && 'Use your authorised Google account below'}
                            {step === 1 && roleSelected === 'user' && 'Enter your email or phone number'}
                            {step === 2 && `📬 Code sent to ${identifier}`}
                        </p>
                    </div>

                    {/* Alert boxes */}
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                            style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                            style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
                            <CheckCircle2 className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    {/* ── Step 0: Portal Select ── */}
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* User Portal */}
                            <button
                                onClick={() => { setRoleSelected('user'); setStep(1); }}
                                className="w-full flex items-center justify-between p-6 rounded-2xl transition-all group"
                                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.22)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(37,99,235,0.28)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.55), rgba(59,130,246,0.45))', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
                                        👤
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white text-lg">User Portal</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>🤖 AI chatbot · 🔍 Smart search</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.25)' }}>
                                    <ArrowRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            {/* Admin Portal */}
                            <button
                                onClick={() => { setRoleSelected('admin'); setStep(1); }}
                                className="w-full flex items-center justify-between p-6 rounded-2xl transition-all group"
                                style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.28)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,92,246,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.55), rgba(109,40,217,0.45))', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                                        🔐
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white text-lg">Admin Portal</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>📊 Analytics · ⚙️ Management</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.25)' }}>
                                    <ArrowRight className="w-5 h-5 text-violet-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-4 pt-3">
                                {['🛡️ Encrypted', '⚡ Instant', '🎓 Verified'].map(b => (
                                    <span key={b} className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>{b}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 1 Admin ── */}
                    {step === 1 && roleSelected === 'admin' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-full transition-transform hover:scale-[1.02]">
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Authentication Failed.')}
                                    theme="filled_blue" size="large" shape="rectangular" text="signin_with" width="100%" />
                            </div>
                            <button onClick={() => setStep(0)} className="w-full text-sm py-2 text-center"
                                style={{ color: 'rgba(255,255,255,0.35)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                                ← Back to portal selection
                            </button>
                        </div>
                    )}

                    {/* ── Step 1 User ── */}
                    {step === 1 && roleSelected === 'user' && (
                        <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    📧 Email or 📱 Phone
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.28)' }} />
                                    <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-4 rounded-xl text-white text-sm outline-none transition-all"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', placeholder: 'rgba(255,255,255,0.2)' }}
                                        onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.65)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading || !identifier}
                                className="w-full flex justify-center items-center gap-2 py-4 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}>
                                {isLoading
                                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Sending… </>
                                    : <> 🚀 Continue with {isPhone ? 'Phone' : 'Email'} <ArrowRight className="w-4 h-4" /></>}
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>or continue with</span>
                                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            </div>

                            <div className="w-full transition-transform hover:scale-[1.02]">
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Authentication Failed.')}
                                    theme="filled_blue" size="large" shape="rectangular" text="continue_with" width="100%" />
                            </div>

                            <button type="button" onClick={() => setStep(0)} className="w-full text-sm py-1 text-center"
                                style={{ color: 'rgba(255,255,255,0.33)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.33)'}>
                                ← Back to portal selection
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: OTP ── */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <div className="flex justify-between items-center mb-5">
                                    <label className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        🔢 Verification Code
                                    </label>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${timeLeft > 10 ? 'text-indigo-300' : 'text-red-400 animate-pulse'}`}
                                        style={{ background: timeLeft > 10 ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)' }}>
                                        ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="flex justify-center gap-2">
                                    {otp.map((data, index) => (
                                        <input key={index} type="text" name="otp" maxLength="1" value={data}
                                            onChange={e => handleOtpChange(e.target, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onFocus={e => { e.target.select(); e.target.style.border = '1px solid rgba(99,102,241,0.7)'; e.target.style.boxShadow = '0 0 12px rgba(99,102,241,0.3)'; }}
                                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                                            className="w-12 h-16 text-center text-2xl font-black text-white rounded-2xl outline-none transition-all animate-in zoom-in-50 duration-300"
                                            style={{
                                                background: 'rgba(255,255,255,0.07)',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                animationDelay: `${index * 50}ms`
                                            }} />
                                    ))}
                                </div>
                            </div>

                            <button type="button" onClick={timeLeft === 0 ? handleSendOtp : handleVerifyOtp}
                                disabled={isLoading || (timeLeft > 0 && otp.join('').length !== 6)}
                                className="w-full flex justify-center items-center gap-2 py-4 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: timeLeft === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: timeLeft === 0 ? 'none' : '0 4px 24px rgba(37,99,235,0.5)' }}>
                                {isLoading
                                    ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></>
                                    : <>{timeLeft === 0 ? '🔄 Resend Code' : '✅ Verify & Sign In'} <KeyRound className="w-4 h-4" /></>}
                            </button>

                            <button type="button"
                                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); setSuccessMsg(''); setTimeLeft(60); }}
                                className="w-full text-sm text-center font-medium"
                                style={{ color: 'rgba(255,255,255,0.33)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.33)'}>
                                Use a different login method?
                            </button>
                        </form>
                    )}

                    {/* Card footer */}
                    <div className="mt-8 pt-5 border-t flex items-center justify-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 Department of Higher Education</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
