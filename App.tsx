import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
              <p className="font-bold text-sm">กำลังเชื่อมต่อฐานข้อมูล...</p>
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