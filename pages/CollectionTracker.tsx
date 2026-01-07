import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Upload, Search, Filter, MoreHorizontal, AlertCircle, X, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CollectionTracker = () => {
  const { circles, members, transactions } = useAppContext();
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Slip Modal State
  const [viewingSlip, setViewingSlip] = useState<{url: string, memberName: string, amount: number} | null>(null);

  // Set default selected circle
  useEffect(() => {
    if (circles.length > 0 && !selectedCircleId) {
      setSelectedCircleId(circles[0].id);
    }
  }, [circles, selectedCircleId]);

  const activeCircle = circles.find(c => c.id === selectedCircleId);
  
  // REAL LOGIC: Map members to their transactions
  const paymentData = activeCircle ? activeCircle.members.map(m => {
    const member = members.find(mem => mem.id === m.memberId);
    
    // Find the LATEST transaction for this user in this circle
    // In a full app, you would also filter by the specific Round Number
    const transaction = transactions
        .filter(t => t.circleId === activeCircle.id && t.memberId === m.memberId)
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))[0]; // Get latest

    return {
      ...m,
      name: member?.name || 'Unknown',
      avatar: member?.avatarUrl,
      amount: activeCircle.principal, // Should ideally be calculated per user (alive/dead logic)
      status: transaction ? 'PAID' : 'PENDING',
      time: transaction ? transaction.timestamp : '-',
      slipUrl: transaction?.slipUrl,
      txId: transaction?.id
    };
  }) : [];

  const filteredData = paymentData.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const paidCount = paymentData.filter(p => p.status === 'PAID').length;
  const totalCount = paymentData.length;
  const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

  if (circles.length === 0) {
      return (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="text-lg">ไม่พบข้อมูลวงแชร์</p>
            <p className="text-sm">กรุณาสร้างวงแชร์ก่อนเริ่มติดตามยอด</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ติดตามการชำระเงิน</h2>
          <p className="text-slate-500">ตรวจสอบสถานะการโอนเงินและหลักฐานสลิป</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           {/* Circle Selector */}
           <div className="relative min-w-[250px]">
             <select 
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium shadow-sm"
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
             >
                <option value="" disabled>-- เลือกวงแชร์ --</option>
                {circles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
             </select>
             <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
               <Filter size={16} />
             </div>
           </div>

           {/* Search Box */}
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="ค้นหาชื่อสมาชิก..." 
               className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      {activeCircle && (
        <>
          {/* Progress Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">ความคืบหน้าการเก็บเงิน (งวดปัจจุบัน)</h3>
                <span className="text-sm font-bold text-blue-600">{paidCount} / {totalCount} คน</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'ALL', label: 'ทั้งหมด' }, 
              { id: 'PENDING', label: 'รอชำระ' }, 
              { id: 'PAID', label: 'ชำระแล้ว' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 text-left">สมาชิก</th>
                    <th className="px-6 py-4 text-left">ยอดที่ต้องชำระ</th>
                    <th className="px-6 py-4 text-left">เวลาโอน</th>
                    <th className="px-6 py-4 text-left">หลักฐาน (Slip)</th>
                    <th className="px-6 py-4 text-center">สถานะ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.avatar || `https://picsum.photos/seed/${p.memberId}/100`} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                            <div>
                              <p className="font-semibold text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-500">มือที่ {p.slotNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">฿{p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500">{p.time}</td>
                        <td className="px-6 py-4">
                          {p.status === 'PAID' && p.slipUrl ? (
                            <button 
                              onClick={() => setViewingSlip({ url: p.slipUrl!, memberName: p.name, amount: p.amount })}
                              className="text-blue-600 text-xs font-bold underline cursor-pointer hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
                            >
                              <Upload size={14} /> ดูสลิป
                            </button>
                          ) : p.status === 'PAID' ? (
                            <span className="text-xs text-slate-400">ไม่พบรูปภาพ</span>
                          ) : (
                             <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {p.status === 'PAID' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              <CheckCircle2 size={14} className="mr-1" /> ชำระแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
                              <Clock size={14} className="mr-1" /> รอชำระ
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        ไม่พบข้อมูลตามเงื่อนไข
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Slip Viewer Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingSlip(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                    <h3 className="font-bold">หลักฐานการโอนเงิน</h3>
                    <p className="text-xs text-slate-300">จาก: {viewingSlip.memberName}</p>
                </div>
                <button onClick={() => setViewingSlip(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
             </div>
             
             <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
                <img src={viewingSlip.url} alt="Slip" className="max-w-full max-h-full rounded-lg shadow-md object-contain" />
             </div>

             <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500">ยอดเงินตรวจสอบ</p>
                    <p className="text-xl font-bold text-blue-600">฿{viewingSlip.amount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                    <a href={viewingSlip.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <ExternalLink size={16} /> เปิดรูปเต็ม
                    </a>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionTracker;