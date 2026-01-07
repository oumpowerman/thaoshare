export enum ShareType {
  DOK_HAK = 'DOK_HAK', // ดอกหัก
  DOK_TAM = 'DOK_TAM', // ดอกตาม
}

export enum SharePeriod {
  DAILY = 'DAILY',     // รายวัน
  WEEKLY = 'WEEKLY',   // รายสัปดาห์
  MONTHLY = 'MONTHLY', // รายเดือน
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLACKLIST = 'BLACKLIST',
  WATCHLIST = 'WATCHLIST',
}

// Corresponds to 'profiles' table
export interface Member {
  id: string; // UUID from auth.users
  email?: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string; // mapped from avatar_url
  bankName?: string; // mapped from bank_name
  bankAccount?: string; // mapped from bank_account
  promptPay?: string; // mapped from prompt_pay
  riskScore: 'A' | 'B' | 'C' | 'D'; // mapped from risk_score
  status: MemberStatus;
}

// Alias for User to keep frontend logic consistent
export type User = Member;

// Corresponds to 'circles' table
export interface ShareCircle {
  id: string;
  name: string;
  principal: number;
  totalSlots: number; // mapped from total_slots
  type: ShareType;
  period: SharePeriod;
  startDate: string; // mapped from start_date
  nextDueDate: string; // mapped from next_due_date
  created_at?: string;
  
  // Hydrated fields (joined from other tables)
  members: CircleMember[]; 
  rounds: ShareRound[];
}

// Corresponds to 'circle_members' table
export interface CircleMember {
  id?: string; // UUID
  circleId?: string; // mapped from circle_id
  memberId: string; // mapped from member_id
  slotNumber: number; // mapped from slot_number
  status: 'ALIVE' | 'DEAD';
  wonRound?: number; // mapped from won_round
  bidAmount?: number; // mapped from bid_amount
}

// Corresponds to 'rounds' table
export interface ShareRound {
  id?: string; // UUID
  circleId?: string; // mapped from circle_id
  roundNumber: number; // mapped from round_number
  date: string;
  winnerId?: string; // mapped from winner_id
  bidAmount: number; // mapped from bid_amount
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  totalPot: number; // mapped from total_pot
}

// Corresponds to 'transactions' table
export interface Transaction {
  id: string;
  circleId: string; // mapped from circle_id
  roundNumber: number; // mapped from round_number
  memberId: string; // mapped from member_id
  amountExpected: number; // mapped from amount_expected
  amountPaid: number; // mapped from amount_paid
  status: 'PENDING' | 'PAID' | 'LATE';
  slipUrl?: string; // mapped from slip_url
  timestamp?: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING';
    timestamp: string;
    isRead: boolean;
}