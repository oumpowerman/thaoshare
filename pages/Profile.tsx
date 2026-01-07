import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Shield, CreditCard, Save, QrCode } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
  const { user, updateProfile } = useAppContext();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [bankAccount, setBankAccount] = useState(user?.bankAccount || '');
  const [promptPay, setPromptPay] = useState(user?.promptPay || '');

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfile({ name, email, bankName, bankAccount, promptPay });
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ข้อมูลส่วนตัว & บัญชีธนาคาร</h2>
          <p className="text-slate-500">จัดการข้อมูลของคุณเพื่อความสะดวกในการรับ-โอนเงิน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-600/20 ${user?.role === 'ADMIN' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                <UserIcon size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-slate-400 text-sm mb-4 capitalize">{user?.role?.toLowerCase()}</p>
              
              <div className="w-full pt-4 border-t border-slate-50 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">สถานะ</span>
                    <span className="text-emerald-600 font-bold">ยืนยันตัวตนแล้ว</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Credit Rating</span>
                    <span className="text-blue-600 font-bold">A+</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
               <h4 className="font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-widest text-blue-400">
                  <Shield size={16} /> ระบบความปลอดภัย
               </h4>
               <p className="text-xs text-slate-400 mb-4">ข้อมูลบัญชีธนาคารของคุณจะแสดงเฉพาะในวงแชร์ที่คุณเข้าร่วมเท่านั้น</p>
               <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                  เปลี่ยนรหัสผ่าน
               </button>
           </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2">
           <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 space-y-8">
                 <section>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <UserIcon size={20} className="text-blue-500" />
                       ข้อมูลทั่วไป
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">ชื่อ-นามสกุล</label>
                          <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">อีเมล</label>
                          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" />
                       </div>
                    </div>
                 </section>

                 <section>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <CreditCard size={20} className="text-emerald-500" />
                       ช่องทางรับเงิน (Bank / PromptPay)
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">ธนาคาร</label>
                                <select value={bankName} onChange={e=>setBankName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium">
                                    <option value="">เลือกธนาคาร</option>
                                    <option value="กสิกรไทย">กสิกรไทย (KBank)</option>
                                    <option value="ไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                                    <option value="กรุงเทพ">กรุงเทพ (BBL)</option>
                                    <option value="กรุงไทย">กรุงไทย (KTB)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">เลขบัญชี</label>
                                <input type="text" placeholder="XXX-X-XXXXX-X" value={bankAccount} onChange={e=>setBankAccount(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PromptPay (เบอร์โทร/เลขบัตร)</label>
                            <div className="relative">
                               <input type="text" value={promptPay} onChange={e=>setPromptPay(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" placeholder="08X-XXX-XXXX" />
                               <QrCode size={18} className="absolute left-3 top-3 text-slate-400" />
                            </div>
                        </div>
                    </div>
                 </section>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95">
                    <Save size={20} />
                    บันทึกข้อมูล
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;