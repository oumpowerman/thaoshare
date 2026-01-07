import React, { useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Notifications = () => {
  const { notifications, markNotificationsAsRead } = useAppContext();

  useEffect(() => {
    // Mark as read when entering the page
    return () => {
      markNotificationsAsRead();
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ศูนย์แจ้งเตือน</h2>
          <p className="text-slate-500">ติดตามทุกความเคลื่อนไหวในวงแชร์ของคุณ</p>
        </div>
        <button 
            onClick={markNotificationsAsRead}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition-colors"
        >
            <Check size={14} /> อ่านทั้งหมดแล้ว
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-6 flex gap-4 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                    ${n.type === 'SUCCESS' ? 'bg-emerald-50' : n.type === 'WARNING' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold truncate ${!n.isRead ? 'text-blue-900' : 'text-slate-800'}`}>{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(n.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                </div>
                {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;