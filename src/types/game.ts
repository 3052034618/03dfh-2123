export type EnrollmentStatus = 'pending' | 'confirmed' | 'waitlist' | 'unsuitable';

export type ScriptType = '推理' | '恐怖' | '情感' | '欢乐' | '阵营' | '机制';

export type GenderPref = '男' | '女' | '不限';

export type GameStatus = 'recruiting' | 'full' | 'expired';

export interface UrgentGame {
  id: string;
  scriptName: string;
  publisherName: string;
  sessionTime: string;
  playerGap: number;
  genderPreference: GenderPref;
  rolePreference: string;
  carpoolPrice: number;
  latestArrival: string;
  scriptType: ScriptType;
  duration: string;
  isNewbieFriendly: boolean;
  currentPlayers: number;
  totalPlayers: number;
  notes: string;
  status: GameStatus;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  gameId: string;
  nickname: string;
  phone: string;
  distance: string;
  canCrossGender: boolean;
  status: EnrollmentStatus;
  enrolledAt: string;
  repliedAt?: string;
}
