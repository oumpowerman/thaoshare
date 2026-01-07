import React, { useState } from 'react';
import { Wallet, CircleDollarSign, CalendarClock, ChevronRight, QrCode, Upload, Clock, X, CheckCircle2, Loader2, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShareType } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: any;
  onSubmit: (file: File | null) => Promise<void>;
}

const PaymentModal = ({ isOpen, onClose, paymentData, onSubmit }: PaymentModalProps) => {
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [transferTime, setTransferTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !paymentData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(slipFile);
    setIsSubmitting(false);
    onClose();
    setSlipFile(null);
    setTransferTime('');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0811111111`; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold text-center">แจ้งชำระเงิน</h3>
          <p className="text-center text-slate-400 text-sm mt-1">{paymentData.circleName}</p>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm mb-1 uppercase font-bold tracking-widest">ยอดที่ต้องโอน</p>
            <h2 className="text-4xl font-bold text-blue-600">฿{paymentData.amount.toLocaleString()}</h2>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 flex flex-col items-center">
            <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
               <img src={qrUrl} alt="QR Code" className="w-40 h-40 object-contain" />
            </div>
            <div className="text-center">
               <p className="font-bold text-slate-800">PromptPay: 081-111-1111</p>
               <p className="text-xs text-slate-500">นายท้าวแชร์ ใจดีมาก</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เวลาที่โอน</label>
              <input type="time" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" value={transferTime} onChange={(e) => setTransferTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">สลิปการโอน</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setSlipFile(e.target.files ? e.target.files[0] : null)} />
                <div className="flex flex-col items-center gap-1">
                   {slipFile ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Upload className="text-slate-400" size={24} />}
                   <span className="text-xs text-slate-500">{slipFile ? 'อัปโหลดแล้ว' : 'แตะเพื่อเลือกไฟล์'}</span>
                </div>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting || !slipFile} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <span>ส่งหลักฐาน</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MemberDashboard = () => {
  const { user, circles, members, submitPayment } = useAppContext();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  const myCircles = circles.filter(c => c.members.some(m => m.memberId === user?.id));
  
  // Financial Summary Logic
  let totalInvested = 0; // ยอดส่งรวม
  let totalReceived = 0; // ยอดรับรวม
  
  myCircles.forEach(c => {
      const myInfo = c.members.find(m => m.memberId === user?.id);
      if (!myInfo) return;
      
      // Calculate what has been paid so far in this circle
      const currentRound = c.rounds.length;
      if (myInfo.status === 'DEAD') {
          // If winner, they got the total pot at that round
          totalReceived += (myInfo.bidAmount || 0); // Simplified for simulation
          // Actually, totalReceived is Total Pot
          const roundWon = c.rounds.find(r => r.roundNumber === myInfo.wonRound);
          totalReceived += roundWon?.totalPot || 0;
      }
      
      // Amount paid is rounds * principal
      totalInvested += (currentRound * c.principal);
  });

  const netProfit = totalReceived - totalInvested;

  const upcomingPayments = myCircles
    .map(c => {
        const myMember = c.members.find(m => m.memberId === user?.id);
        let amountToPay = c.principal;
        if (myMember?.status === 'DEAD') {
            if (c.type === ShareType.DOK_TAM) amountToPay = c.principal + (myMember.bidAmount || 0);
        }
        return { id: c.id, circleName: c.name, dueDate: c.nextDueDate, amount: amountToPay, type: c.type, status: myMember?.status };
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
       {/* New Financial Summary Widget */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                   <h2 className="text-2xl font-bold">สวัสดี, {user?.name}</h2>
                   <p className="text-slate-400 text-sm mt-1">นี่คือสรุปสถานะการเงินของคุณจากทุกวงแชร์</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                   <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">ยอดรับสุทธิรวม</p>
                   <p className="text-xl font-bold text-emerald-400">฿{totalReceived.toLocaleString()}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5 relative z-10">
                <div>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">ยอดส่งไปแล้ว</p>
                   <p className="text-2xl font-bold">฿{totalInvested.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">กำไร/ขาดทุน</p>
                   <div className={`text-2xl font-bold flex items-center justify-end gap-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      ฿{Math.abs(netProfit).toLocaleString()}
                   </div>
                </div>
             </div>
             {/* Decorative Background */}
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                   <ArrowRightLeft className="text-blue-600" size={20} />
                   ตารางจ่ายเงินรวม
                </h4>
                <p className="text-sm text-slate-500">ระบบคำนวณยอดที่ต้องจ่ายในงวดถัดไปของทุกวงรวมกัน</p>
             </div>
             <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ยอดรวมงวดถัดไป</p>
                <p className="text-3xl font-bold text-slate-900">฿{upcomingPayments.reduce((s,p)=>s+p.amount, 0).toLocaleString()}</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarClock className="text-emerald-600" />
                กำหนดชำระเร็วๆ นี้
             </h3>
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {upcomingPayments.map((payment, idx) => (
                   <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-center hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                         <div className="w-12 h-12 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-600 font-bold leading-tight border border-slate-200 shadow-sm">
                            <span className="text-sm">{new Date(payment.dueDate).getDate()}</span>
                            <span className="text-[9px] uppercase">{new Date(payment.dueDate).toLocaleString('th-TH', { month: 'short' })}</span>
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">{payment.circleName}</h4>
                            <p className="text-xs text-slate-400">งวดถัดไป: {new Date(payment.dueDate).toLocaleDateString('th-TH')}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                         <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">ยอดโอน</p>
                            <p className="font-bold text-blue-600 text-xl">฿{payment.amount.toLocaleString()}</p>
                         </div>
                         <button onClick={() => { setSelectedPayment(payment); setPaymentModalOpen(true); }} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">แจ้งโอน</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-4">สถานะวงแชร์ที่เข้าร่วม</h4>
                 <div className="space-y-4">
                    {myCircles.map(circle => {
                       const myInfo = circle.members.find(m => m.memberId === user?.id);
                       const deadCount = circle.members.filter(m => m.status === 'DEAD').length;
                       return (
                          <div key={circle.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 group hover:border-blue-100 transition-all">
                             <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-sm text-slate-800">{circle.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${myInfo?.status === 'DEAD' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{myInfo?.status === 'DEAD' ? 'เปียแล้ว' : 'รอเปีย'}</span>
                             </div>
                             <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mb-1 border border-slate-100">
                                <div className="bg-blue-500 h-full" style={{ width: `${(deadCount / circle.totalSlots) * 100}%` }}></div>
                             </div>
                             <p className="text-[10px] text-slate-400 text-right">ดำเนินการ {deadCount}/{circle.totalSlots} งวด</p>
                          </div>
                       )
                    })}
                 </div>
              </div>
          </div>
       </div>

       <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} paymentData={selectedPayment} onSubmit={async (f) => { await submitPayment(selectedPayment.id, selectedPayment.amount, f); alert('บันทึกยอดโอนแล้ว'); }} />
    </div>
  );
};

export default MemberDashboard;