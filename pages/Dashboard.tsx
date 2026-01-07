import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, Wallet, TrendingUp, Users, X, ChevronRight, Coins, ArrowUpRight, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShareType } from '../types';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#10B981', '#EF4444'];

const Dashboard = () => {
  const { circles, members } = useAppContext();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const navigate = useNavigate();

  // Derived stats
  const totalMembers = members.length;
  const activeCirclesCount = circles.length;
  
  // Calculate alive vs dead hands across all circles
  let aliveHands = 0;
  let deadHands = 0;
  let totalAdminFees = 0; // ค่าตง (Commission)

  circles.forEach(c => {
    // Assuming admin fee is 5% of principal per circle for demo purposes
    totalAdminFees += (c.principal * 0.05); 
    c.members.forEach(m => {
      if (m.status === 'ALIVE') aliveHands++;
      if (m.status === 'DEAD') deadHands++;
    });
  });

  const pieData = [
    { name: 'มือเป็น (รอเปีย)', value: aliveHands },
    { name: 'มือตาย (เปียแล้ว)', value: deadHands },
  ];

  const duePayments = circles.flatMap(circle => {
     return circle.members.map(cm => {
        const memberProfile = members.find(m => m.id === cm.memberId);
        let amount = circle.principal;
        let note = '';
        
        if (cm.status === 'DEAD') {
            if (circle.type === ShareType.DOK_TAM) {
                amount += (cm.bidAmount || 0);
                note = 'ต้น + ดอกตาม';
            } else {
                note = 'จ่ายเต็ม (มือตาย)';
            }
        } else {
             note = 'เงินต้น (รอหักดอก)';
        }

        return {
            id: `${circle.id}-${cm.memberId}`,
            circleName: circle.name,
            memberId: cm.memberId,
            memberName: memberProfile?.name || 'Unknown',
            avatar: memberProfile?.avatarUrl,
            amount: amount,
            status: cm.status,
            note: note,
            circleType: circle.type
        };
     });
  });

  const totalExpectedCollection = duePayments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">แผงควบคุมท้าวแชร์</h2>
          <p className="text-slate-500 mt-1">ภาพรวมการเงินและสถานะความเสี่ยงประจำวัน</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </div>
            <button onClick={() => navigate('/circles')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30 font-bold text-sm flex items-center gap-2 transition-all">
                <Plus size={18} /> สร้างวงใหม่
            </button>
        </div>
      </div>

      {/* Summary Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Expected Collection */}
        <div 
            onClick={() => setShowCollectionModal(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <Wallet size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">วันนี้</span>
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">ยอดที่ต้องเก็บ</p>
                <h3 className="text-3xl font-bold tracking-tight">฿{totalExpectedCollection.toLocaleString()}</h3>
                <div className="mt-4 flex items-center text-xs font-medium text-blue-100 group-hover:text-white transition-colors">
                    ดูรายการทั้งหมด <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>

        {/* Card 2: Admin Fees */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Coins size={24} />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} className="mr-1" /> +12%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">รายได้ค่าตงรวม</p>
          <h3 className="text-3xl font-bold text-slate-800">฿{totalAdminFees.toLocaleString()}</h3>
        </div>

        {/* Card 3: Active Circles */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-purple-100 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} />
             </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">วงแชร์ที่ดูแล</p>
          <h3 className="text-3xl font-bold text-slate-800">{activeCirclesCount} <span className="text-base font-medium text-slate-400">วง</span></h3>
        </div>

        {/* Card 4: Issues */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-red-100 transition-all duration-300 group">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <AlertCircle size={24} />
             </div>
             <span className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Action Req.
            </span>
           </div>
           <p className="text-slate-500 text-sm font-medium mb-1">ลูกแชร์ค้างยอด</p>
           <h3 className="text-3xl font-bold text-slate-800">2 <span className="text-base font-medium text-slate-400">คน</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Analysis Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">สถานะความเสี่ยง</h3>
          <p className="text-sm text-slate-500 mb-6">สัดส่วนมือเป็น vs มือตาย ทั้งระบบ</p>
          
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-slate-800">{aliveHands + deadHands}</span>
                 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">มือทั้งหมด</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
             <div className="bg-emerald-50 rounded-xl p-3 text-center">
                 <p className="text-emerald-600 font-bold text-xl">{aliveHands}</p>
                 <p className="text-xs text-emerald-600/80 font-medium">มือเป็น (ปลอดภัย)</p>
             </div>
             <div className="bg-red-50 rounded-xl p-3 text-center">
                 <p className="text-red-500 font-bold text-xl">{deadHands}</p>
                 <p className="text-xs text-red-500/80 font-medium">มือตาย (เสี่ยง)</p>
             </div>
          </div>
        </div>

        {/* Collection Table */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-slate-800">รายการ "ต้องตามเงิน" (Watchlist)</h3>
                <p className="text-sm text-slate-500">สมาชิกที่มียอดค้างชำระหรือมีความเสี่ยง</p>
             </div>
             <button className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                ส่งแจ้งเตือนทั้งหมด
             </button>
          </div>
          
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 font-bold uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">สมาชิก</th>
                  <th className="px-6 py-4 text-left">วงแชร์</th>
                  <th className="px-6 py-4 text-right">ยอดเงิน</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'ช่างโจ อู่ซ่อมรถ', circle: 'วงแม่มณี V.1', amount: 2000, risk: 'WATCHLIST' },
                  { name: 'น้องมายด์ นักศึกษา', circle: 'วงเสี่ยสั่งลุย', amount: 5600, risk: 'ACTIVE' },
                  { name: 'คุณวิชัย อบต.', circle: 'วงเสี่ยสั่งลุย', amount: 5000, risk: 'ACTIVE' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.risk === 'WATCHLIST' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`}></div>
                            <span className="font-bold text-slate-800">{item.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{item.circle}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">฿{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          รอโอน
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collection Details Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCollectionModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">ยืนยันยอดเงิน</h3>
                        <p className="text-slate-500 text-sm mt-1">รายการรอตรวจสอบหลักฐานการโอนวันนี้</p>
                    </div>
                    <button onClick={() => setShowCollectionModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-3 bg-slate-50/50">
                    {duePayments.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all group">
                            <div className="flex items-center gap-4">
                                <img src={item.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                                <div>
                                    <h4 className="font-bold text-slate-800">{item.memberName}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold uppercase tracking-wide">{item.circleName}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">฿{item.amount.toLocaleString()}</p>
                                <button className="text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded-lg mt-1 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">ยืนยัน</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;