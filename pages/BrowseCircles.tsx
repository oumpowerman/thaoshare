import React, { useState } from 'react';
import { Search, Filter, Users, CircleDollarSign, Calendar, ChevronRight, Info } from 'lucide-react';
import { ShareType, SharePeriod } from '../types';

const BrowseCircles = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockOpenCircles = [
    { id: 'b1', name: 'วงเศรษฐีหน้าใหม่ (รับด่วน)', principal: 3000, slots: 10, type: ShareType.DOK_HAK, period: SharePeriod.MONTHLY, status: 'OPEN' },
    { id: 'b2', name: 'วงแม่บ้านทหารบก', principal: 1000, slots: 15, type: ShareType.DOK_TAM, period: SharePeriod.WEEKLY, status: 'OPEN' },
    { id: 'b3', name: 'วงเพื่อนแท้ (2000)', principal: 2000, slots: 8, type: ShareType.DOK_HAK, period: SharePeriod.DAILY, status: 'OPEN' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ตลาดวงแชร์ (Market)</h2>
          <p className="text-slate-500">เลือกดูวงแชร์ที่เปิดรับสมาชิกใหม่ และสมัครเข้าร่วมได้ทันที</p>
        </div>
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-3 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="ค้นหาชื่อวง หรือชื่อท้าว..." 
             className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm shadow-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-blue-800 items-start">
         <Info size={20} className="shrink-0 mt-0.5" />
         <div>
            <p className="text-sm font-bold">ระบบยืนยันตัวตน</p>
            <p className="text-xs">การสมัครเข้าร่วมวงแชร์ใหม่ ท้าวแชร์จะต้องอนุมัติคำขอของคุณก่อนเพื่อตรวจสอบเครดิตและการยืนยันตัวตน</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {mockOpenCircles.map(circle => (
            <div key={circle.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
               <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${circle.type === ShareType.DOK_HAK ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                        <CircleDollarSign size={24} />
                     </div>
                     <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">รับสมาชิก</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{circle.name}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mb-4">
                     โดย <span className="text-slate-600 font-bold hover:underline cursor-pointer">เจ๊แต๋ว ตลาดสด</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">เงินต้น</p>
                        <p className="font-bold text-slate-800 text-sm">฿{circle.principal.toLocaleString()}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">จำนวนมือ</p>
                        <p className="font-bold text-slate-800 text-sm">{circle.slots} มือ</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={14} className="text-slate-400" />
                        <span>ว่าง 3 มือสุดท้าย</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        <span>ส่งยอดทุกวันจันทร์</span>
                     </div>
                  </div>
               </div>
               
               <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-2">
                     สมัครเข้าวงแชร์ <ChevronRight size={16} />
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default BrowseCircles;