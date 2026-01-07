import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberDashboard from './pages/MemberDashboard';
import CircleManagement from './pages/CircleManagement';
import BiddingSystem from './pages/BiddingSystem';
import CollectionTracker from './pages/CollectionTracker';
import MemberProfile from './pages/MemberProfile';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import BrowseCircles from './pages/BrowseCircles';
import { AppProvider, useAppContext } from './context/AppContext';
import { Loader2, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading, error } = useAppContext();

  if (isLoading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
              <p className="font-bold text-sm">กำลังเชื่อมต่อฐานข้อมูล...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50 p-6 text-center">
              <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                      <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">การเชื่อมต่อผิดพลาด</h3>
                  <p className="text-slate-500 mb-6 leading-relaxed text-sm">{error}</p>
                  
                  <div className="text-xs text-slate-400 mb-6 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                    <p className="font-bold text-slate-500 mb-1">คำแนะนำ:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>ตรวจสอบค่า VITE_SUPABASE_URL ในการตั้งค่า Deployment</li>
                        <li>ตรวจสอบค่า VITE_SUPABASE_ANON_KEY</li>
                        <li>ตรวจสอบว่า Project Supabase ไม่ได้ถูก Pause</li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10"
                  >
                      ลองเชื่อมต่อใหม่
                  </button>
              </div>
          </div>
      );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const RoleBasedDashboard = () => {
    const { user } = useAppContext();
    return user?.role === 'ADMIN' ? <Dashboard /> : <MemberDashboard />;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
          <Route path="/circles" element={<ProtectedRoute><CircleManagement /></ProtectedRoute>} />
          <Route path="/bidding" element={<ProtectedRoute><BiddingSystem /></ProtectedRoute>} />
          <Route path="/collection" element={<ProtectedRoute><CollectionTracker /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowseCircles /></ProtectedRoute>} />
          <Route path="/my-circles" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;