import { Member, ShareCircle, ShareType, MemberStatus, SharePeriod } from './types';

export const MOCK_MEMBERS: Member[] = [
  // 1. ท้าวแชร์ (เล่นทั้ง 2 วง)
  { id: 'm1', name: 'เจ๊แต๋ว ตลาดสด', phone: '081-111-1111', riskScore: 'A', status: MemberStatus.ACTIVE, role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  
  // 2. ขาใหญ่ เครดิตดี (เล่นทั้ง 2 วง)
  { id: 'm2', name: 'เฮียชัย ร้านทอง', phone: '081-222-2222', riskScore: 'A', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  
  // สมาชิกวง 1 เท่านั้น
  { id: 'm3', name: 'ครูน้อย โรงเรียนวัด', phone: '081-333-3333', riskScore: 'A', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=100&h=100&fit=crop' },
  { id: 'm4', name: 'น้องดา พยาบาล', phone: '081-444-4444', riskScore: 'B', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
  { id: 'm5', name: 'ป้าสมศรี ข้าวแกง', phone: '081-555-5555', riskScore: 'B', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop' },
  { id: 'm6', name: 'ช่างโจ อู่ซ่อมรถ', phone: '081-666-6666', riskScore: 'C', status: MemberStatus.WATCHLIST, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },

  // สมาชิกวง 2 เท่านั้น
  { id: 'm7', name: 'น้องมายด์ นักศึกษา', phone: '081-777-7777', riskScore: 'C', status: MemberStatus.WATCHLIST, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 'm8', name: 'คุณวิชัย อบต.', phone: '081-888-8888', riskScore: 'A', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: 'm9', name: 'เจ๊หงส์ เสริมสวย', phone: '081-999-9999', riskScore: 'B', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 'm10', name: 'บังฮาซัน โรตี', phone: '080-000-0000', riskScore: 'B', status: MemberStatus.ACTIVE, role: 'USER', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
];

export const MOCK_CIRCLES: ShareCircle[] = [
  {
    id: 'c1',
    name: 'วงแม่มณี V.1 (ดอกหัก)',
    principal: 2000,
    totalSlots: 6,
    type: ShareType.DOK_HAK,
    period: SharePeriod.MONTHLY,
    startDate: '2023-10-01',
    nextDueDate: '2023-12-01',
    members: [
      { memberId: 'm1', slotNumber: 1, status: 'DEAD', wonRound: 1, bidAmount: 0 }, // ท้าวแชร์ (เจ๊แต๋ว)
      { memberId: 'm3', slotNumber: 2, status: 'DEAD', wonRound: 2, bidAmount: 250 }, // ครูน้อย ร้อนเงิน
      { memberId: 'm2', slotNumber: 3, status: 'ALIVE' }, // เฮียชัย รอเปียท้ายๆ
      { memberId: 'm4', slotNumber: 4, status: 'ALIVE' },
      { memberId: 'm5', slotNumber: 5, status: 'ALIVE' },
      { memberId: 'm6', slotNumber: 6, status: 'ALIVE' },
    ],
    rounds: [
        { roundNumber: 1, date: '2023-10-01', winnerId: 'm1', bidAmount: 0, status: 'COMPLETED', totalPot: 10000 },
        { roundNumber: 2, date: '2023-11-01', winnerId: 'm3', bidAmount: 250, status: 'COMPLETED', totalPot: 9000 }, // 2000*5 - 250*4
        { roundNumber: 3, date: '2023-12-01', status: 'OPEN', bidAmount: 0, totalPot: 0 }
    ]
  },
  {
    id: 'c2',
    name: 'วงเสี่ยสั่งลุย (ดอกตาม)',
    principal: 5000,
    totalSlots: 6,
    type: ShareType.DOK_TAM,
    period: SharePeriod.WEEKLY,
    startDate: '2023-11-01',
    nextDueDate: '2023-11-22',
    members: [
      { memberId: 'm1', slotNumber: 1, status: 'DEAD', wonRound: 1, bidAmount: 0 }, // ท้าวแชร์ (เจ๊แต๋ว) - Overlap
      { memberId: 'm7', slotNumber: 2, status: 'DEAD', wonRound: 2, bidAmount: 600 }, // น้องมายด์ บิทสู้ตาย
      { memberId: 'm9', slotNumber: 3, status: 'DEAD', wonRound: 3, bidAmount: 450 }, // เจ๊หงส์
      { memberId: 'm2', slotNumber: 4, status: 'ALIVE' }, // เฮียชัย - Overlap
      { memberId: 'm8', slotNumber: 5, status: 'ALIVE' },
      { memberId: 'm10', slotNumber: 6, status: 'ALIVE' },
    ],
    rounds: [
        { roundNumber: 1, date: '2023-11-01', winnerId: 'm1', bidAmount: 0, status: 'COMPLETED', totalPot: 25000 },
        { roundNumber: 2, date: '2023-11-08', winnerId: 'm7', bidAmount: 600, status: 'COMPLETED', totalPot: 25000 },
        { roundNumber: 3, date: '2023-11-15', winnerId: 'm9', bidAmount: 450, status: 'COMPLETED', totalPot: 25600 }, // ได้ดอกจา m7
        { roundNumber: 4, date: '2023-11-22', status: 'OPEN', bidAmount: 0, totalPot: 0 }
    ]
  }
];