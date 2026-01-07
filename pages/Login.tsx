import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, KeyRound, Phone, User, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type Mode = 'LOGIN' | 'REGISTER';
type Role = 'ADMIN' | 'USER';

const Login = () => {
  const [mode, setMode] = useState<Mode>('LOGIN');
  const [role, setRole] = useState<Role>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // UI State
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(''); // เก็บ Email ไว้โชว์ตอนสำเร็จ

  const { login, register, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }
    try {
        await login(email, password);
        navigate('/');
    } catch (err) {
        // Error handled in context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!regEmail || !regName || !regPassword) return;

      const result = await register({
          email: regEmail,
          password: regPassword,
          name: regName,
          phone: regPhone,
          role: role,
          inviteCode: inviteCode
      });

      if (result.success) {
          setSubmittedEmail(regEmail); // เก็บ Email ไว้แสดงผลก่อนเคลียร์
          setRegisterSuccess(true);
          
          // เคลียร์ค่าในฟอร์มทั้งหมด
          setRegName('');
          setRegPhone('');
          setRegEmail('');
          setRegPassword('');
          setInviteCode('');
      }
  };

  if (registerSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">ลงทะเบียนสำเร็จ!</h2>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <p className="text-slate-500 text-sm mb-2">กรุณาตรวจสอบอีเมลของคุณที่</p>
                    <p className="text-blue-600 font-bold text-lg">{submittedEmail}</p>
                    <p className="text-slate-400 text-xs mt-2">กดลิงก์ในอีเมลเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ</p>
                </div>
                <button 
                    onClick={() => { setRegisterSuccess(false); setMode('LOGIN'); }}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                    กลับไปหน้าเข้าสู่ระบบ
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
          {mode === 'REGISTER' && (
              <button 
                onClick={() => setMode('LOGIN')}
                className="absolute top-8 left-8 text-slate-400 hover:text-slate-800 flex items-center gap-1 text-xs font-bold transition-colors"
              >
                  <ArrowLeft size={14} /> กลับ
              </button>
          )}

          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                {mode === 'LOGIN' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </h1>
            <p className="text-slate-500 text-sm">
                {mode === 'LOGIN' ? 'ยินดีต้อนรับกลับสู่ ThaoPro' : 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้'}
            </p>
          </div>

          {mode === 'LOGIN' ? (
              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">อีเมล</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                            type="email"
                            required
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-300 bg-white text-slate-900"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">รหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                            type="password"
                            required
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-300 bg-white text-slate-900"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="text-xs font-bold text-blue-600 hover:underline">
                            ลืมรหัสผ่าน?
                        </button>
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>เข้าสู่ระบบ</span>}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <button 
                        type="button"
                        onClick={() => setMode('REGISTER')}
                        className="text-slate-500 hover:text-blue-600 font-bold text-xs transition-colors"
                    >
                        ยังไม่มีบัญชี? <span className="underline decoration-slate-300 underline-offset-4">สมัครสมาชิกใหม่</span>
                    </button>
                </div>
              </div>
          ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex gap-3 mb-4 p-1 bg-slate-50 rounded-2xl">
                      <button type="button" onClick={() => setRole('ADMIN')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          ท้าวแชร์
                      </button>
                      <button type="button" onClick={() => setRole('USER')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'USER' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          ลูกแชร์
                      </button>
                  </div>

                  {role === 'USER' && (
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-3.5 text-emerald-500" size={18} />
                        <input
                          type="text"
                          className="w-full pl-11 pr-4 py-3 border border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm placeholder:text-emerald-400/70 font-bold text-emerald-800"
                          placeholder="รหัสเข้าวง (Invite Code)"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        />
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input type="text" required className="w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium bg-white text-slate-900" placeholder="ชื่อ-สกุล" value={regName} onChange={(e) => setRegName(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input type="tel" required className="w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium bg-white text-slate-900" placeholder="เบอร์โทร" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input type="email" required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium bg-white text-slate-900" placeholder="อีเมล" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input type="password" required className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium bg-white text-slate-900" placeholder="รหัสผ่าน" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 mt-2 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'สมัครสมาชิก'}
                  </button>
              </form>
          )}
        </div>

        {/* Right Side: Reverted to Dark Theme (Slate-900) */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 text-white flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight">
                ThaoPro<span className="text-blue-500">.</span>
            </h2>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-xs font-medium">
                ระบบจัดการวงแชร์ครบวงจร<br/>
                คำนวณแม่นยำ ปลอดภัย และใช้งานง่าย
            </p>
            
            <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-xs border border-slate-700 shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
               <h3 className="font-bold text-lg mb-3 flex items-center justify-center gap-2 text-white">
                 <ShieldCheck className="text-emerald-400" /> 
                 Secure & Reliable
               </h3>
               <p className="text-xs text-slate-400 leading-relaxed">
                 ระบบมีความปลอดภัยสูง ข้อมูลถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย<br/>
                 พร้อมทีมงานดูแลตลอด 24 ชม.
               </p>
               <div className="mt-4 pt-4 border-t border-slate-700 flex justify-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;