import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Member, ShareCircle, User, Transaction, MemberStatus, AppNotification, ShareType, SharePeriod, CircleMember, ShareRound } from '../types';
import { supabase } from '../lib/supabaseClient';

interface RegisterData {
    email: string;
    password?: string;
    name: string;
    phone: string;
    role: 'ADMIN' | 'USER';
    inviteCode?: string;
}

interface AppContextType {
  user: User | null;
  members: Member[];
  circles: ShareCircle[];
  transactions: Transaction[];
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
  addMember: (member: Member) => Promise<void>;
  addCircle: (circle: ShareCircle) => Promise<void>;
  deleteCircle: (id: string) => Promise<void>;
  recordBid: (circleId: string, winnerId: string, bidAmount: number, totalPot: number) => Promise<void>;
  submitPayment: (circleId: string, amount: number, slipFile: File | null) => Promise<void>;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [circles, setCircles] = useState<ShareCircle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- 1. INITIALIZATION & DATA FETCHING ---

  const fetchData = async () => {
      try {
          // 1. Fetch Profiles (Table: profiles)
          const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .order('name', { ascending: true });
          
          if (profilesError) throw profilesError;
          
          const mappedMembers: Member[] = (profilesData || []).map((p: any) => ({
              id: p.id,
              email: p.email,
              name: p.name,
              phone: p.phone,
              role: p.role as 'ADMIN' | 'USER',
              avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`,
              bankName: p.bank_name,
              bankAccount: p.bank_account,
              promptPay: p.prompt_pay,
              riskScore: p.risk_score as any,
              status: p.status as any
          }));
          setMembers(mappedMembers);

          // 2. Fetch Circles (Table: circles) -> join circle_members, rounds
          const { data: circlesData, error: circlesError } = await supabase
              .from('circles')
              .select(`
                  *,
                  circle_members (*),
                  rounds (*)
              `)
              .order('created_at', { ascending: false });

          if (circlesError) throw circlesError;

          const mappedCircles: ShareCircle[] = (circlesData || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              principal: Number(c.principal),
              totalSlots: c.total_slots,
              type: c.type as ShareType,
              period: c.period as SharePeriod,
              startDate: c.start_date,
              nextDueDate: c.next_due_date || c.start_date,
              members: (c.circle_members || []).map((cm: any) => ({
                  id: cm.id,
                  circleId: cm.circle_id,
                  memberId: cm.member_id,
                  slotNumber: cm.slot_number,
                  status: cm.status,
                  wonRound: cm.won_round,
                  bidAmount: Number(cm.bid_amount)
              })).sort((a: any, b: any) => a.slotNumber - b.slotNumber),
              rounds: (c.rounds || []).map((r: any) => ({
                  id: r.id,
                  circleId: r.circle_id,
                  roundNumber: r.round_number,
                  date: r.date,
                  winnerId: r.winner_id,
                  bidAmount: Number(r.bid_amount),
                  status: r.status,
                  totalPot: Number(r.total_pot)
              })).sort((a: any, b: any) => a.roundNumber - b.roundNumber)
          }));
          setCircles(mappedCircles);

          // 3. Fetch Transactions (Table: transactions)
          const { data: txData, error: txError } = await supabase
              .from('transactions')
              .select('*')
              .order('created_at', { ascending: false });
          
          if (txError) throw txError;

          const mappedTx: Transaction[] = (txData || []).map((t: any) => ({
              id: t.id,
              circleId: t.circle_id,
              roundNumber: t.round_number,
              memberId: t.member_id,
              amountExpected: Number(t.amount_expected),
              amountPaid: Number(t.amount_paid),
              status: t.status,
              slipUrl: t.slip_url,
              timestamp: t.timestamp
          }));
          setTransactions(mappedTx);

      } catch (err: any) {
          console.error("Error fetching data:", err);
          throw err; // Re-throw to be caught by initializeAuth
      }
  };

  const fetchCurrentUserProfile = async (userId: string) => {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      
      if (data) {
          setUser({
              id: data.id,
              email: data.email,
              name: data.name,
              phone: data.phone,
              role: data.role as 'ADMIN' | 'USER',
              avatarUrl: data.avatar_url,
              bankName: data.bank_name,
              bankAccount: data.bank_account,
              promptPay: data.prompt_pay,
              riskScore: data.risk_score as any,
              status: data.status as any
          });
      }
  };

  useEffect(() => {
      const initializeAuth = async () => {
          setIsLoading(true);
          setError(null);
          try {
              // Initial connection check (optional, but good for debugging)
              // If keys are completely wrong, this usually fails fast
              const { data: { session }, error: authError } = await supabase.auth.getSession();
              if (authError) throw authError;

              if (session) {
                  await fetchCurrentUserProfile(session.user.id);
                  await fetchData();
              }
          } catch (err: any) {
              console.error("Initialization Error:", err);
              // Handle specific Supabase error codes if needed
              const msg = err.message || 'ไม่สามารถเชื่อมต่อกับระบบฐานข้อมูลได้';
              // Check if it looks like a missing URL/Key error
              if (msg.includes('supabaseUrl is required') || msg.includes('fetch')) {
                   setError('ไม่พบการตั้งค่าฐานข้อมูล (Supabase) หรือการเชื่อมต่อล้มเหลว กรุณาตรวจสอบ Environment Variables');
              } else {
                   setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${msg}`);
              }
          } finally {
              setIsLoading(false);
          }
      };

      initializeAuth();

      // Auth State Listener
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
              setIsLoading(true);
              try {
                await fetchCurrentUserProfile(session.user.id);
                await fetchData();
              } catch(e) {
                 console.error(e);
              } finally {
                 setIsLoading(false);
              }
          } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setMembers([]);
              setCircles([]);
              setTransactions([]);
          }
      });

      // Realtime Subscription (DB Changes)
      const realtimeChannel = supabase.channel('db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
              console.log('Realtime: Profiles updated');
              fetchData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'circles' }, () => {
              console.log('Realtime: Circles updated');
              fetchData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members' }, () => {
              console.log('Realtime: Circle Members updated');
              fetchData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => {
              console.log('Realtime: Rounds updated');
              fetchData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
              console.log('Realtime: Transactions updated');
              fetchData();
          })
          .subscribe();

      return () => {
          authSubscription.unsubscribe();
          supabase.removeChannel(realtimeChannel);
      };
  }, []);

  // --- 2. AUTHENTICATION ---

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) {
        setIsLoading(false);
        alert(error.message);
        throw error;
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || '12345678',
          options: {
              data: {
                  name: data.name,
                  phone: data.phone,
                  role: data.role,
                  full_name: data.name
              }
          }
      });

      if (authError) {
          setIsLoading(false);
          alert(authError.message);
          return { success: false, message: authError.message };
      }

      if (authData.user) {
          const { error: profileError } = await supabase
              .from('profiles')
              .upsert([{
                  id: authData.user.id,
                  email: data.email,
                  name: data.name,
                  phone: data.phone,
                  role: data.role,
                  risk_score: 'A',
                  status: 'ACTIVE',
                  avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
              }], { onConflict: 'id' });

          if (profileError) {
              console.error("Profile creation error:", profileError);
              if (profileError.code === '23503') { 
                  console.warn("Foreign Key violation ignored. Assuming Auth User created successfully.");
              } else {
                  alert("สร้างโปรไฟล์ไม่สำเร็จ: " + profileError.message);
              }
          }
      }

      setIsLoading(false);
      return { success: true, message: 'กรุณาตรวจสอบ Email เพื่อยืนยันตัวตน' };
  };

  const logout = async () => {
      setIsLoading(true);
      await supabase.auth.signOut();
      setIsLoading(false);
  };

  const updateProfile = async (data: Partial<User>) => {
      if (!user) return;
      
      const { error } = await supabase
          .from('profiles')
          .update({
              name: data.name,
              bank_name: data.bankName,
              bank_account: data.bankAccount,
              prompt_pay: data.promptPay
          })
          .eq('id', user.id);

      if (!error) {
          setUser(prev => prev ? { ...prev, ...data } : null);
          addNotification('บันทึกสำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว', 'SUCCESS');
      }
  };

  // --- 3. DATA MUTATION (CRUD) ---

  const addMember = async (member: Member) => {
     alert("ระบบฐานข้อมูลใหม่: สมาชิกต้องทำการ 'สมัครสมาชิก' ด้วยตนเองเพื่อยืนยันตัวตนผ่านอีเมล");
  };

  const addCircle = async (circle: ShareCircle) => {
      // FIX: Do NOT send 'id' field if it is a manual string like 'c-123456'.
      // Let Supabase generate a proper UUID.
      const { data: circleData, error: circleError } = await supabase
          .from('circles')
          .insert([{
              // id: circle.id,  <-- REMOVED manual ID
              name: circle.name,
              principal: circle.principal,
              total_slots: circle.totalSlots,
              type: circle.type,
              period: circle.period,
              start_date: circle.startDate,
              next_due_date: circle.startDate
          }])
          .select()
          .single();

      if (circleError) {
          console.error('Error creating circle:', circleError);
          // Show the actual error message from Supabase to help debugging
          addNotification('บันทึกไม่สำเร็จ', `Supabase Error: ${circleError.message} (${circleError.code})`, 'WARNING');
          return;
      }

      const realCircleId = circleData.id; // Use the UUID returned from DB

      if (circle.members.length > 0) {
          const membersPayload = circle.members.map(m => ({
              circle_id: realCircleId,
              member_id: m.memberId,
              slot_number: m.slotNumber,
              status: 'ALIVE'
          }));
          const { error: memError } = await supabase.from('circle_members').insert(membersPayload);
          if (memError) console.error('Error adding members:', memError);
      }

      await supabase.from('rounds').insert([{
          circle_id: realCircleId,
          round_number: 1,
          date: circle.startDate,
          status: 'OPEN',
          bid_amount: 0,
          total_pot: 0
      }]);

      addNotification('สร้างวงสำเร็จ', `เริ่มใช้งานวง "${circle.name}" ได้ทันที`, 'SUCCESS');
      // No need to manually update state, realtime subscription will catch it.
  };

  const deleteCircle = async (id: string) => {
      const { error } = await supabase.from('circles').delete().eq('id', id);
      if (!error) {
          addNotification('ลบข้อมูล', 'ลบวงแชร์ออกจากระบบแล้ว', 'WARNING');
      } else {
          console.error(error);
          addNotification('ลบไม่สำเร็จ', error.message, 'WARNING');
      }
  };

  const recordBid = async (circleId: string, winnerId: string, bidAmount: number, totalPot: number) => {
      const circle = circles.find(c => c.id === circleId);
      if (!circle) return;

      const currentRoundNum = circle.rounds.length;

      try {
        const { error: updateError } = await supabase
            .from('circle_members')
            .update({ 
                status: 'DEAD',
                won_round: currentRoundNum,
                bid_amount: bidAmount
            })
            .eq('circle_id', circleId)
            .eq('member_id', winnerId);
        
        if (updateError) throw updateError;

        const currentRoundObj = circle.rounds.find(r => r.roundNumber === currentRoundNum);
        if (currentRoundObj && currentRoundObj.id) {
            await supabase
                .from('rounds')
                .update({
                    winner_id: winnerId,
                    bid_amount: bidAmount,
                    status: 'COMPLETED',
                    total_pot: totalPot
                })
                .eq('id', currentRoundObj.id);
        }

        if (currentRoundNum < circle.totalSlots) {
             const lastDate = new Date(circle.rounds[circle.rounds.length - 1].date);
             const nextDate = new Date(lastDate);
             if (circle.period === 'MONTHLY') nextDate.setMonth(lastDate.getMonth() + 1);
             else if (circle.period === 'WEEKLY') nextDate.setDate(lastDate.getDate() + 7);
             else nextDate.setDate(lastDate.getDate() + 1);

             await supabase.from('rounds').insert([{
                 circle_id: circleId,
                 round_number: currentRoundNum + 1,
                 date: nextDate.toISOString().split('T')[0],
                 status: 'OPEN',
                 bid_amount: 0,
                 total_pot: 0
             }]);
        }

        addNotification('บันทึกผลเปีย', `บันทึกผู้ชนะเรียบร้อยแล้ว`, 'SUCCESS');

      } catch (err: any) {
          console.error(err);
          addNotification('ผิดพลาด', `บันทึกผลการเปียไม่สำเร็จ: ${err.message}`, 'WARNING');
      }
  };

  const submitPayment = async (circleId: string, amount: number, slipFile: File | null) => {
      let slipUrl = '';

      if (slipFile) {
          const fileExt = slipFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('slips')
              .upload(filePath, slipFile);

          if (!uploadError) {
              const { data } = supabase.storage.from('slips').getPublicUrl(filePath);
              slipUrl = data.publicUrl;
          }
      }

      // FIX: Do NOT send 'id' field manually. Let DB generate UUID.
      const { error } = await supabase.from('transactions').insert([{
          // id: `tx-${Date.now()}`, <-- REMOVED
          circle_id: circleId,
          round_number: 0, // Should be current round, but 0 for general payment is ok for now
          member_id: user?.id,
          amount_expected: amount,
          amount_paid: amount,
          status: 'PAID',
          slip_url: slipUrl,
          timestamp: new Date().toLocaleString('th-TH')
      }]);

      if (!error) {
          addNotification('รับยอดโอน', 'ระบบบันทึกสลิปเรียบร้อยแล้ว', 'SUCCESS');
      } else {
          console.error(error);
          addNotification('ผิดพลาด', `บันทึกการโอนเงินไม่สำเร็จ: ${error.message}`, 'WARNING');
      }
  };

  const addNotification = (title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
      const newNotif: AppNotification = {
          id: Date.now().toString(),
          title,
          message,
          type,
          timestamp: new Date().toISOString(),
          isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider value={{ 
      user, members, circles, transactions, notifications, isLoading, error,
      login, register, updateProfile, logout, addMember, addCircle, deleteCircle, recordBid, submitPayment, markNotificationsAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};