import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Plus, X, User, FileText, ChevronRight, ChevronDown, CheckCircle2, Clock, ExternalLink, AlertCircle, Trophy, Wallet, TrendingUp, Calendar, ArrowUpRight, DollarSign, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MemberStatus, Member } from '../types';

const MemberProfile = () => {
  const { members, circles, transactions, addMember } = useAppContext();
  
  // Detail Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WINNING_HISTORY' | 'PAYMENTS'>('OVERVIEW');
  const [expandedCircleId, setExpandedCircleId] = useState<string | null>(null);
  
  // Slip Viewer State
  const [viewingSlip, setViewingSlip] = useState<{url: string, title: string, amount: number, date: string} | null>(null);

  // Helper Functions
  const getMemberCircles = (memberId: string) => {
    return circles.filter(c => c.members.some(m => m.memberId === memberId));
  };

  const getMemberStats = (memberId: string) => {
      const activeCircles = getMemberCircles(memberId);
      let totalPrincipal = 0;
      let wonCount = 0;
      let totalHands = 0;
      let totalBidsPaid = 0; 

      activeCircles.forEach(c => {
          const mInfo = c.members.find(m => m.memberId === memberId);
          if (mInfo) {
              totalPrincipal += c.principal;
              totalHands++;
              if (mInfo.status === 'DEAD') {
                  wonCount++;
                  totalBidsPaid += (mInfo.bidAmount || 0);
              }
          }
      });

      return { totalPrincipal, wonCount, totalHands, totalBidsPaid };
  };

  const getWinningHistory = (memberId: string) => {
      const wins: any[] = [];
      circles.forEach(c => {
          c.rounds.forEach(r => {
              if (r.winnerId === memberId) {
                  wins.push({
                      circleName: c.name,
                      circleType: c.type,
                      roundNumber: r.roundNumber,
                      date: r.date,
                      bidAmount: r.bidAmount,
                      totalPot: r.totalPot
                  });
              }
          });
      });
      return wins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTransactionForRound = (circleId: string, memberId: string, roundNum: number) => {
      const memberTx = transactions
        .filter(t => t.circleId === circleId && t.memberId === memberId)
        .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      // This is a simplified logic. In real production, match round_number directly.
      return memberTx.find(t => t.roundNumber === roundNum) || memberTx[roundNum - 1]; 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">ฐานข้อมูลสมาชิก</h2>
           <p className="text-slate-500">วิเคราะห์พฤติกรรม ประวัติการเปีย และสถานะการเงิน</p>
        </div>
        
        {/* Note: In this new DB schema, users must register themselves. We removed the "Add Member" button to avoid confusion. */}
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100">
            <Info size={16} />
            สมาชิกใหม่ต้องลงทะเบียนผ่านหน้าเว็บ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map(member => {
           const stats = getMemberStats(member.id);

           return (
           <div 
              key={member.id} 
              onClick={() => {
                  setSelectedMember(member);
                  setActiveTab('OVERVIEW');
              }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
           >
              <div className="relative">
                <img src={member.avatarUrl} alt={member.name} className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-slate-50 group-hover:border-blue-100 transition-colors" />
                <div className={`absolute bottom-3 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-sm
                  ${member.riskScore === 'A' ? 'bg-emerald-500' : 
                    member.riskScore === 'B' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {member.riskScore}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{member.phone}</p>

              <div className="w-full grid grid-cols-2 gap-2 mb-4">
                 <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-xs text-slate-500">วงที่เล่น</p>
                    <p className="font-bold text-slate-800">{stats.totalHands} มือ</p>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-xs text-slate-500">เปียแล้ว</p>
                    <p className="font-bold text-slate-800">{stats.wonCount} ครั้ง</p>
                 </div>
              </div>

              {member.status === 'WATCHLIST' && (
                 <div className="w-full bg-red-50 text-red-600 text-xs p-2 rounded-lg flex items-center justify-center gap-2 mb-2">
                    <ShieldAlert size={14} />
                    <span>เฝ้าระวัง: จ่ายล่าช้า</span>
                 </div>
              )}

              <p className="text-xs text-slate-400 mt-auto flex items-center gap-1">
                 แตะเพื่อดูรายละเอียดเชิงลึก <ChevronRight size={12} />
              </p>
           </div>
        )})}
      </div>

      {/* DETAILED MEMBER MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                
                {/* Header Profile */}
                <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                             <img src={selectedMember.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-800" />
                             <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[10px] font-bold ${selectedMember.riskScore === 'A' ? 'bg-emerald-500' : selectedMember.riskScore === 'B' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                 {selectedMember.riskScore}
                             </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <span>{selectedMember.phone}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                <span className={`${selectedMember.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {selectedMember.status === 'ACTIVE' ? 'สถานะปกติ' : 'เฝ้าระวัง'}
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                <p>Bank: {selectedMember.bankName || '-'} ({selectedMember.bankAccount || '-'})</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
                    <button 
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'OVERVIEW' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <TrendingUp size={16} /> ภาพรวม & วงที่เล่น
                    </button>
                    <button 
                        onClick={() => setActiveTab('WINNING_HISTORY')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'WINNING_HISTORY' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Trophy size={16} /> ประวัติการเปีย (Win)
                    </button>
                    <button 
                        onClick={() => setActiveTab('PAYMENTS')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'PAYMENTS' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileText size={16} /> ประวัติการโอน
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                            {(() => {
                                const stats = getMemberStats(selectedMember.id);
                                return (
                                    <>
                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">เงินต้นหมุนเวียน</p>
                                                <p className="text-xl font-bold text-slate-800">฿{stats.totalPrincipal.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">มือที่ถืออยู่</p>
                                                <p className="text-xl font-bold text-blue-600">{stats.totalHands} มือ</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">ดอกที่จ่ายไปแล้ว</p>
                                                <p className="text-xl font-bold text-orange-500">฿{stats.totalBidsPaid.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Circles List */}
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mt-4">
                                            <Wallet size={20} className="text-slate-400" />
                                            วงแชร์ที่กำลังเล่น
                                        </h4>
                                        <div className="space-y-3">
                                            {getMemberCircles(selectedMember.id).map(circle => {
                                                const mInfo = circle.members.find(m => m.memberId === selectedMember.id);
                                                return (
                                                    <div key={circle.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800">{circle.name}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${mInfo?.status === 'DEAD' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                    {mInfo?.status === 'DEAD' ? 'มือตาย (เปียแล้ว)' : 'มือเป็น (รอเปีย)'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">เงินต้น: ฿{circle.principal.toLocaleString()} | มือที่ {mInfo?.slotNumber}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {mInfo?.status === 'DEAD' ? (
                                                                <div>
                                                                    <p className="text-xs text-slate-400">ชนะงวดที่</p>
                                                                    <p className="font-bold text-slate-800">{mInfo.wonRound}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">ยังไม่เปีย</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* TAB: WINNING HISTORY */}
                    {activeTab === 'WINNING_HISTORY' && (
                        <div className="space-y-4">
                             <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 mb-4">
                                <Trophy size={20} />
                                <p className="text-sm font-medium">ประวัติการเปียทั้งหมดช่วยให้คุณวิเคราะห์กระแสเงินสดของสมาชิกได้</p>
                             </div>

                             {getWinningHistory(selectedMember.id).length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3 text-left">วันที่</th>
                                                <th className="px-4 py-3 text-left">ชื่อวง</th>
                                                <th className="px-4 py-3 text-center">งวดที่</th>
                                                <th className="px-4 py-3 text-right">ดอกเบี้ยสู้</th>
                                                <th className="px-4 py-3 text-right">ยอดรับสุทธิ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {getWinningHistory(selectedMember.id).map((win, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            {new Date(win.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit'})}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        {win.circleName}
                                                        <span className="block text-[10px] text-slate-400 font-normal">{win.circleType === 'DOK_HAK' ? 'ดอกหัก' : 'ดอกตาม'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                                            {win.roundNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-red-500 font-bold">
                                                        -{win.bidAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                                                        ฿{win.totalPot?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                                    <Trophy size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>ยังไม่มีประวัติการเปียแชร์</p>
                                </div>
                             )}
                        </div>
                    )}

                    {/* TAB: PAYMENTS */}
                    {activeTab === 'PAYMENTS' && (
                         <div className="space-y-4">
                            {getMemberCircles(selectedMember.id).map(circle => {
                                const isExpanded = expandedCircleId === circle.id;
                                const txs = transactions.filter(t => t.circleId === circle.id && t.memberId === selectedMember.id);
                                
                                return (
                                    <div key={circle.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div 
                                            onClick={() => setExpandedCircleId(isExpanded ? null : circle.id)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{circle.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    โอนแล้ว {txs.length} / {circle.rounds.length} งวด
                                                </p>
                                            </div>
                                            {isExpanded ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-slate-100 bg-slate-50/50">
                                                {circle.rounds.length > 0 ? (
                                                    <table className="w-full text-sm">
                                                        <thead className="text-xs text-slate-400 bg-slate-100 text-left">
                                                            <tr>
                                                                <th className="px-4 py-2 font-medium">งวดที่</th>
                                                                <th className="px-4 py-2 font-medium">วันที่กำหนด</th>
                                                                <th className="px-4 py-2 font-medium">สถานะ</th>
                                                                <th className="px-4 py-2 font-medium text-right">หลักฐาน</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {circle.rounds.map((round, idx) => {
                                                                const tx = getTransactionForRound(circle.id, selectedMember.id, round.roundNumber);
                                                                return (
                                                                    <tr key={idx} className="bg-white hover:bg-slate-50">
                                                                        <td className="px-4 py-3 font-medium text-slate-700">#{round.roundNumber}</td>
                                                                        <td className="px-4 py-3 text-slate-500">{new Date(round.date).toLocaleDateString('th-TH')}</td>
                                                                        <td className="px-4 py-3">
                                                                            {tx ? (
                                                                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                                                    <CheckCircle2 size={14} /> ชำระแล้ว
                                                                                </span>
                                                                            ) : round.status === 'OPEN' ? (
                                                                                <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold animate-pulse">
                                                                                    <Clock size={14} /> รอชำระ
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-slate-400 text-xs">-</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right">
                                                                            {tx && tx.slipUrl && (
                                                                                <button 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setViewingSlip({
                                                                                            url: tx.slipUrl!,
                                                                                            title: `สลิปงวดที่ ${round.roundNumber} - ${circle.name}`,
                                                                                            amount: tx.amountPaid,
                                                                                            date: tx.timestamp || '-'
                                                                                        });
                                                                                    }}
                                                                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold underline flex items-center justify-end gap-1 ml-auto"
                                                                                >
                                                                                    <FileText size={14} /> ดูสลิป
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-4 text-center text-slate-400 text-sm">ยังไม่มีการเดินงวด</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                         </div>
                    )}

                </div>
            </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingSlip(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="truncate pr-4">
                    <h3 className="font-bold truncate text-sm">{viewingSlip.title}</h3>
                    <p className="text-xs text-slate-300">วันที่โอน: {viewingSlip.date}</p>
                </div>
                <button onClick={() => setViewingSlip(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0">
                    <X size={20} />
                </button>
             </div>
             
             <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
                <img src={viewingSlip.url} alt="Slip" className="max-w-full max-h-full rounded-lg shadow-md object-contain" />
             </div>

             <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500">ยอดเงิน</p>
                    <p className="text-xl font-bold text-blue-600">฿{viewingSlip.amount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                    <a href={viewingSlip.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <ExternalLink size={14} /> เปิดรูป
                    </a>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;