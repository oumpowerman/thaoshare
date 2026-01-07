import React, { useState } from 'react';
import { Plus, Users, Calendar, Trash2, X, Check, AlertCircle, Trophy, Clock, ChevronRight, Download, FileText, UserPlus } from 'lucide-react';
import { ShareType, ShareCircle, SharePeriod, CircleMember } from '../types';
import { useAppContext } from '../context/AppContext';

const CircleManagement = () => {
  const { circles, members, addCircle, deleteCircle } = useAppContext();
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingCircle, setViewingCircle] = useState<ShareCircle | null>(null);
  
  // Create Form State
  const [newCircleName, setNewCircleName] = useState('');
  const [newCirclePrincipal, setNewCirclePrincipal] = useState<number | ''>('');
  const [targetSlots, setTargetSlots] = useState<number>(5);
  const [newCircleType, setNewCircleType] = useState<ShareType>(ShareType.DOK_HAK);
  const [newCirclePeriod, setNewCirclePeriod] = useState<SharePeriod>(SharePeriod.MONTHLY);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`คุณต้องการลบวงแชร์ "${name}" ใช่หรือไม่?`)) {
      deleteCircle(id);
      if (viewingCircle?.id === id) setViewingCircle(null);
    }
  };

  const exportCircleToCSV = (circle: ShareCircle) => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ลำดับ,ชื่อสมาชิก,สถานะ,ดอกเบี้ยที่สู้,งวดที่ชนะ\n";
      
      // We need to loop through all slots, not just existing members
      for (let i = 1; i <= circle.totalSlots; i++) {
          const m = circle.members.find(mem => mem.slotNumber === i);
          const mInfo = m ? members.find(mem => mem.id === m.memberId) : null;
          
          const row = [
              i,
              mInfo?.name || 'ว่าง (Waiting)',
              m ? (m.status === 'DEAD' ? 'เปียแล้ว' : 'รอเปีย') : 'ว่าง',
              m?.bidAmount || 0,
              m?.wonRound || '-'
          ].join(",");
          csvContent += row + "\n";
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `สรุปวง_${circle.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(id)) return prev.filter(mid => mid !== id);
      if (prev.length >= targetSlots) {
        alert(`ครบจำนวน ${targetSlots} มือแล้ว!`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName || !newCirclePrincipal) return;

    // Logic: Map selected members to slots 1...N. Remaining slots are just implicit or logic-handled.
    // In our type system, `members` array only contains actual members.
    // The UI will render empty slots based on `totalSlots`.
    
    const initialMembers: CircleMember[] = selectedMemberIds.map((mid, index) => ({
        memberId: mid,
        slotNumber: index + 1,
        status: 'ALIVE',
    }));

    const newCircle: ShareCircle = {
      id: `c-${Date.now()}`,
      name: newCircleName,
      principal: Number(newCirclePrincipal),
      totalSlots: targetSlots, // Total slots defined here
      type: newCircleType,
      period: newCirclePeriod,
      startDate: startDate,
      nextDueDate: startDate,
      members: initialMembers,
      rounds: [
        { roundNumber: 1, date: startDate, status: 'OPEN', bidAmount: 0, totalPot: 0 }
      ]
    };

    addCircle(newCircle);
    setIsCreateModalOpen(false);
    
    // Reset
    setNewCircleName('');
    setNewCirclePrincipal('');
    setSelectedMemberIds([]);
  };

  const getPeriodLabel = (p: SharePeriod) => {
    switch(p) {
        case SharePeriod.DAILY: return 'รายวัน';
        case SharePeriod.WEEKLY: return 'รายสัปดาห์';
        case SharePeriod.MONTHLY: return 'รายเดือน';
        default: return p;
    }
  };

  const getMemberInfo = (id: string) => members.find(m => m.id === id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">จัดการวงแชร์</h2>
          <p className="text-slate-500 mt-1">สร้างวงแชร์และติดตามความคืบหน้าของสมาชิก</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 font-bold"
        >
          <Plus size={20} />
          <span>สร้างวงใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {circles.map((circle) => {
          const deadCount = circle.members.filter(m => m.status === 'DEAD').length;
          const filledSlots = circle.members.length;
          const vacantSlots = circle.totalSlots - filledSlots;
          
          return (
            <div 
              key={circle.id} 
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer group"
              onClick={() => setViewingCircle(circle)}
            >
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={(e) => { e.stopPropagation(); exportCircleToCSV(circle); }}
                    className="p-2 bg-white/90 backdrop-blur text-slate-400 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                    title="ส่งออกรายงาน CSV"
                 >
                   <Download size={18} />
                 </button>
                 <button 
                    onClick={(e) => handleDelete(circle.id, circle.name, e)}
                    className="p-2 bg-white/90 backdrop-blur text-slate-400 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    title="ลบวงแชร์"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>

              <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800 pr-16 leading-tight">{circle.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${circle.type === ShareType.DOK_HAK ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                        {circle.type === ShareType.DOK_HAK ? 'ดอกหัก' : 'ดอกตาม'}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                        {getPeriodLabel(circle.period)}
                    </span>
                    {vacantSlots > 0 && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                            ว่าง {vacantSlots} ที่
                        </span>
                    )}
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">เงินต้นต่อมือ</p>
                    <p className="text-2xl font-bold text-slate-900">฿{circle.principal.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ขนาดวง</p>
                    <p className="text-2xl font-bold text-slate-900">{circle.totalSlots} <span className="text-sm font-medium text-slate-400">มือ</span></p>
                  </div>
              </div>

              <div className="px-8 pb-8">
                <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="text-slate-600">ความคืบหน้า</span>
                    <span className="text-blue-600">{Math.round((deadCount / circle.totalSlots) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex shadow-inner">
                    <div 
                        className="bg-blue-600 h-full transition-all duration-700 ease-out rounded-full" 
                        style={{ width: `${(deadCount / circle.totalSlots) * 100}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">เปียแล้ว {deadCount} / {circle.totalSlots} งวด</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Circle Detail Modal */}
      {viewingCircle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setViewingCircle(null)} />
           <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-white z-10">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800">{viewingCircle.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
                       <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg"><Users size={14}/> {viewingCircle.totalSlots} มือ</span>
                       <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">ต้น ฿{viewingCircle.principal.toLocaleString()}</span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setViewingCircle(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                 </div>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50/50">
                 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                       <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                          <tr>
                             <th className="px-6 py-4 text-left">มือที่</th>
                             <th className="px-6 py-4 text-left">สมาชิก</th>
                             <th className="px-6 py-4 text-center">สถานะ</th>
                             <th className="px-6 py-4 text-right">ดอกเบี้ยสู้</th>
                             <th className="px-6 py-4 text-center">งวดที่ชนะ</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {Array.from({ length: viewingCircle.totalSlots }).map((_, index) => {
                               const slotNum = index + 1;
                               const m = viewingCircle.members.find(mem => mem.slotNumber === slotNum);
                               const mInfo = m ? getMemberInfo(m.memberId) : null;
                               
                               const isVacant = !m;

                               return (
                                  <tr key={slotNum} className={`transition-colors ${isVacant ? 'bg-slate-50/30' : 'hover:bg-slate-50'}`}>
                                     <td className="px-6 py-4">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isVacant ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {slotNum}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         {isVacant ? (
                                             <div className="flex items-center gap-2 text-slate-400 italic">
                                                 <UserPlus size={16} />
                                                 <span>ว่าง (Waiting)</span>
                                             </div>
                                         ) : (
                                             <div className="flex items-center gap-3">
                                                 <img src={mInfo?.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                                                 <span className="font-bold text-slate-800">{mInfo?.name}</span>
                                             </div>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        {isVacant ? (
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-400 border border-slate-200">ว่าง</span>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${m.status === 'DEAD' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {m.status === 'DEAD' ? 'เปียแล้ว' : 'รอเปีย'}
                                            </span>
                                        )}
                                     </td>
                                     <td className="px-6 py-4 text-right font-bold text-slate-700">
                                        {m?.status === 'DEAD' ? `฿${m.bidAmount?.toLocaleString()}` : '-'}
                                     </td>
                                     <td className="px-6 py-4 text-center text-slate-400">
                                        {m?.status === 'DEAD' ? <span className="font-bold text-slate-800">#{m.wonRound}</span> : '-'}
                                     </td>
                                  </tr>
                               );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative bg-white text-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800">สร้างวงแชร์ใหม่</h3>
                <p className="text-xs text-slate-400 mt-1">กรอกข้อมูลเพื่อเปิดวงแชร์ใหม่</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50/50">
              <form id="create-circle-form" onSubmit={handleCreateCircle} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ชื่อวงแชร์</label>
                        <input type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:font-normal" placeholder="เช่น วงเศรษฐีใหม่ V.1" value={newCircleName} onChange={(e) => setNewCircleName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">เงินต้น (บาท/มือ)</label>
                        <input type="number" required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0" value={newCirclePrincipal} onChange={(e) => setNewCirclePrincipal(Number(e.target.value))} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">จำนวนมือทั้งหมด</label>
                        <input
                        type="number"
                        min="2"
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={targetSlots}
                        onChange={(e) => setTargetSlots(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ประเภทแชร์</label>
                        <select 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                            value={newCircleType}
                            onChange={(e) => setNewCircleType(e.target.value as ShareType)}
                        >
                            <option value={ShareType.DOK_HAK}>ดอกหัก (รับเงิน = ต้น - ดอก)</option>
                            <option value={ShareType.DOK_TAM}>ดอกตาม (รับเงินเต็ม จ่ายดอกทีหลัง)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ระยะเวลา</label>
                        <select 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                            value={newCirclePeriod}
                            onChange={(e) => setNewCirclePeriod(e.target.value as SharePeriod)}
                        >
                            <option value={SharePeriod.DAILY}>รายวัน</option>
                            <option value={SharePeriod.WEEKLY}>รายสัปดาห์</option>
                            <option value={SharePeriod.MONTHLY}>รายเดือน</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">เริ่มงวดแรกวันที่</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                        type="date"
                        required
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          เลือกลูกแชร์ลงผัง (ไม่บังคับ)
                        </label>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {selectedMemberIds.length} / {targetSlots} ที่นั่ง
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                        {members.map(member => (
                            <div 
                                key={member.id}
                                onClick={() => toggleMemberSelection(member.id)}
                                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedMemberIds.includes(member.id) 
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' 
                                    : 'border-slate-200 bg-white hover:border-blue-300'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md border mr-3 flex items-center justify-center transition-colors ${
                                    selectedMemberIds.includes(member.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-slate-50'
                                }`}>
                                    {selectedMemberIds.includes(member.id) && <Check size={12} className="text-white" />}
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={member.avatarUrl} className="w-8 h-8 rounded-full bg-slate-100 shrink-0" alt="" />
                                    <span className="text-sm font-bold text-slate-900 truncate">{member.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">* หากเลือกไม่ครบ ระบบจะเว้นช่องว่าง (Waiting) ไว้ให้เพิ่มทีหลังได้</p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 bg-white z-10">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="create-circle-form"
                className="flex-1 py-3 bg-blue-600 rounded-2xl text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02]"
              >
                ยืนยันสร้างวง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircleManagement;