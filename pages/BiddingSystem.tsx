import React, { useState, useEffect } from 'react';
import { ShareType, CircleMember } from '../types';
import { Calculator, ArrowRight, Wallet, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const BiddingSystem = () => {
  const { circles, members, recordBid } = useAppContext();
  const navigate = useNavigate();
  const [selectedCircleId, setSelectedCircleId] = useState('');
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [bidderId, setBidderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update selected circle default when circles change
  useEffect(() => {
    if (circles.length > 0 && !selectedCircleId) {
      setSelectedCircleId(circles[0].id);
    } else if (circles.length === 0) {
        setSelectedCircleId('');
    }
  }, [circles, selectedCircleId]);

  const circle = circles.find(c => c.id === selectedCircleId);
  const aliveMembers = circle ? circle.members.filter(m => m.status === 'ALIVE') : [];

  // Calculation Logic
  const calculateResult = () => {
    if (!bidAmount && bidAmount !== 0) return null;
    if (!bidderId || !circle) return null;

    const bid = Number(bidAmount);
    const principal = circle.principal;

    let totalPot = 0;
    
    const memberDetails = circle.members.map(cm => {
      const memberInfo = members.find(m => m.id === cm.memberId);
      let payAmount = 0;
      let note = '';

      if (cm.memberId === bidderId) {
        // The Winner - doesn't "pay" into the pot effectively for the calculation of what they RECEIVE, 
        // but traditionally we calculate what others pay TO the winner.
        // But for the "Total Pot" logic (Net received):
        // It is Sum(Others Pay) + Own Principal (conceptually).
        
        // However, standard display usually shows what OTHERS pay.
        payAmount = principal; 
        note = 'ผู้ชนะประมูล (รับเงินก้อน)';
      } else if (cm.status === 'DEAD') {
         // DEAD HAND
         if (circle.type === ShareType.DOK_HAK) {
            payAmount = principal;
            note = 'มือตาย (จ่ายเต็ม)';
         } else {
            // DOK TAM
            payAmount = principal + (cm.bidAmount || 0);
            note = `มือตาย (ต้น ${principal} + ดอก ${cm.bidAmount})`;
         }
      } else {
         // ALIVE HAND
         if (circle.type === ShareType.DOK_HAK) {
            payAmount = Math.max(0, principal - bid);
            note = `มือเป็น (หักดอก ${bid})`;
         } else {
            // DOK TAM
            payAmount = principal;
            note = 'มือเป็น (จ่ายเต็ม)';
         }
      }

      // Add to pot only if it's NOT the winner (Since the pot is what the winner takes home from OTHERS + OWN)
      // Wait, standard accounting:
      // Winner gets: (Dead * Pay) + (Alive * Pay) + (Own Principal)
      // If we use the list to show "What everyone pays":
      // Winner "pays" principal (conceptually) to themselves.
      // So Sum of all payAmounts = Total Pot.
      totalPot += payAmount;

      return {
        ...cm,
        name: memberInfo?.name || 'Unknown',
        avatarUrl: memberInfo?.avatarUrl,
        payAmount,
        note,
        isWinner: cm.memberId === bidderId
      };
    });

    return { memberDetails, totalPot };
  };

  const calculation = calculateResult();

  const handleConfirmBidding = () => {
    if (!circle || !bidderId || !calculation) return;
    
    const winnerName = members.find(m => m.id === bidderId)?.name;
    const confirmMsg = `ยืนยันผลการเปียแชร์?\n\nวง: ${circle.name}\nผู้ชนะ: ${winnerName}\nดอกเบี้ย: ${bidAmount} บาท\nยอดรับสุทธิ: ฿${calculation.totalPot.toLocaleString()}`;

    if (window.confirm(confirmMsg)) {
        setIsSubmitting(true);
        // Simulate network delay
        setTimeout(() => {
            recordBid(circle.id, bidderId, Number(bidAmount), calculation.totalPot);
            alert('บันทึกผลการเปียเรียบร้อยแล้ว! ระบบได้สร้างงวดใหม่ให้แล้ว');
            setIsSubmitting(false);
            
            // Reset fields
            setBidAmount('');
            setBidderId('');
            
            // Optional: Redirect to Dashboard to see changes
            navigate('/');
        }, 1000);
    }
  };

  if (circles.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-10 text-slate-400">
              <Calculator size={64} className="mb-4 opacity-50" />
              <p className="text-xl">ไม่พบข้อมูลวงแชร์</p>
              <p>กรุณาสร้างวงแชร์ก่อนเริ่มการประมูล</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-xl text-white">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ศูนย์กลางการประมูล (Pia System)</h2>
          <p className="text-slate-500">คำนวณยอดเงินและบันทึกผลการเปียประจำงวด</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 text-slate-800">ตั้งค่าการเปีย (งวดที่ {circle?.rounds.length})</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เลือกวงแชร์</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={selectedCircleId}
                  onChange={(e) => {
                    setSelectedCircleId(e.target.value);
                    setBidderId(''); // Reset bidder
                  }}
                >
                  {circles.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type === ShareType.DOK_HAK ? 'ดอกหัก' : 'ดอกตาม'})</option>
                  ))}
                </select>
              </div>

              {circle && (
              <>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ผู้เสนอราคา (ผู้เปีย)</label>
                    <select 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={bidderId}
                    onChange={(e) => setBidderId(e.target.value)}
                    >
                    <option value="">-- เลือกผู้เปีย --</option>
                    {aliveMembers.map(m => {
                        const member = members.find(mem => mem.id === m.memberId);
                        return <option key={m.memberId} value={m.memberId}>{member?.name} (มือที่ {m.slotNumber})</option>
                    })}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ยอดดอกเบี้ยที่เสนอ (บาท)</label>
                    <div className="relative">
                    <input 
                        type="number" 
                        className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-bold"
                        placeholder="0.00"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                    />
                    <DollarSign size={18} className="absolute left-3 top-4 text-slate-400" />
                    </div>
                </div>

                {circle.type === ShareType.DOK_TAM && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex gap-2 text-blue-800">
                        <AlertTriangle size={18} />
                        <p className="text-sm font-semibold">ข้อควรระวัง (ดอกตาม)</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                        ผู้เปียจะต้องจ่ายคืน {circle.principal} + {bidAmount || 0} บาท ในทุกงวดถัดไป
                    </p>
                    </div>
                )}
              </>
              )}
            </div>
          </div>
        </div>

        {/* Calculation Result Section */}
        <div className="lg:col-span-2">
          {calculation && circle ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 z-0"></div>
                
                <div className="relative z-10">
                  <p className="text-slate-500 mb-1 font-medium">ยอดเงินรวมที่ผู้เปียจะได้รับ (Total Pot)</p>
                  <h3 className="text-4xl font-bold text-emerald-600">฿{calculation.totalPot.toLocaleString()}</h3>
                </div>
                <div className="mt-4 sm:mt-0 text-right relative z-10">
                    <p className="text-sm text-slate-500">ดอกเบี้ย: <span className="text-slate-900 font-bold">{Number(bidAmount).toLocaleString()}</span> บาท</p>
                    <p className="text-sm text-slate-500">รูปแบบ: <span className="text-slate-900 font-bold">{circle.type === ShareType.DOK_HAK ? 'หักดอกทันที' : 'จ่ายดอกตามหลัง'}</span></p>
                </div>
              </div>

              {/* Detail Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-800">
                  รายละเอียดการจ่ายเงินของสมาชิก
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 bg-slate-50/50">
                        <th className="px-6 py-3">สมาชิก</th>
                        <th className="px-6 py-3">สถานะ (ก่อนเปีย)</th>
                        <th className="px-6 py-3 text-right">ยอดที่ต้องจ่าย</th>
                        <th className="px-6 py-3">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculation.memberDetails.map((item, idx) => (
                        <tr key={idx} className={item.isWinner ? 'bg-emerald-50' : 'hover:bg-slate-50'}>
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                <img src={item.avatarUrl || `https://picsum.photos/seed/${item.memberId}/200`} alt="avatar" />
                             </div>
                             {item.name} {item.isWinner && <span className="text-emerald-600 font-bold">(ผู้ชนะ)</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              item.status === 'DEAD' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {item.status === 'DEAD' ? 'มือตาย' : 'มือเป็น'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                             ฿{item.payAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                             {item.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={handleConfirmBidding}
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 font-bold text-lg transition-all transform hover:scale-[1.01]"
              >
                {isSubmitting ? 'กำลังบันทึก...' : (
                    <>
                        <Save size={24} />
                        <span>ยืนยันและบันทึกผลการเปีย</span>
                    </>
                )}
              </button>

            </div>
          ) : (
             <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12">
               <Calculator size={48} className="mb-4 opacity-50" />
               <p className="text-lg font-medium">กรุณาเลือกผู้เปียและใส่ยอดดอกเบี้ย</p>
               <p className="text-sm">ระบบจะคำนวณยอดเงินและแสดงปุ่มบันทึกผล</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icon helper
const DollarSign = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export default BiddingSystem;