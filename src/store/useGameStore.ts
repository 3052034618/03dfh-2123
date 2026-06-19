import { create } from 'zustand';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import type { UrgentGame, Enrollment, EnrollmentStatus, GameStatus } from '@/types/game';
import { mockGames, mockEnrollments } from '@/data/mockData';

const STORAGE_KEY_GAMES = 'lz_games';
const STORAGE_KEY_ENROLLMENTS = 'lz_enrollments';
const STORAGE_KEY_DATE = 'lz_date';

interface GameState {
  games: UrgentGame[];
  enrollments: Enrollment[];
  addGame: (game: UrgentGame) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus) => void;
  updateGameStatus: (gameId: string, status: GameStatus) => void;
  getGameEnrollments: (gameId: string) => Enrollment[];
  initStore: () => void;
}

const saveGames = (games: UrgentGame[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_GAMES, games);
    Taro.setStorageSync(STORAGE_KEY_DATE, dayjs().format('YYYY-MM-DD'));
  } catch (err) {
    console.error('[Store] saveGames error', err);
  }
};

const saveEnrollments = (enrollments: Enrollment[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_ENROLLMENTS, enrollments);
  } catch (err) {
    console.error('[Store] saveEnrollments error', err);
  }
};

const loadInitialData = (): { games: UrgentGame[]; enrollments: Enrollment[] } => {
  try {
    const savedDate = Taro.getStorageSync(STORAGE_KEY_DATE) as string;
    const today = dayjs().format('YYYY-MM-DD');
    if (savedDate === today) {
      const savedGames = Taro.getStorageSync(STORAGE_KEY_GAMES);
      const savedEnrollments = Taro.getStorageSync(STORAGE_KEY_ENROLLMENTS);
      const games: UrgentGame[] =
        Array.isArray(savedGames) && savedGames.length > 0 ? savedGames : mockGames;
      const enrollments: Enrollment[] =
        Array.isArray(savedEnrollments) && savedEnrollments.length > 0
          ? savedEnrollments
          : mockEnrollments;
      return { games, enrollments };
    }
    return { games: mockGames, enrollments: mockEnrollments };
  } catch (err) {
    console.error('[Store] loadInitialData error', err);
    return { games: mockGames, enrollments: mockEnrollments };
  }
};

const initial = loadInitialData();

export const useGameStore = create<GameState>((set, get) => ({
  games: initial.games,
  enrollments: initial.enrollments,

  addGame: (game) =>
    set((state) => {
      const newGames = [...state.games, game];
      saveGames(newGames);
      console.info('[Store] addGame:', game.id);
      return { games: newGames };
    }),

  addEnrollment: (enrollment) =>
    set((state) => {
      const newEnrollments = [...state.enrollments, enrollment];
      saveEnrollments(newEnrollments);
      console.info('[Store] addEnrollment:', enrollment.id);
      return { enrollments: newEnrollments };
    }),

  updateEnrollmentStatus: (enrollmentId, status) =>
    set((state) => {
      const newEnrollments = state.enrollments.map((e) =>
        e.id === enrollmentId
          ? { ...e, status, repliedAt: new Date().toISOString() }
          : e
      );
      saveEnrollments(newEnrollments);
      console.info('[Store] updateEnrollmentStatus:', enrollmentId, status);
      return { enrollments: newEnrollments };
    }),

  updateGameStatus: (gameId, status) =>
    set((state) => {
      const newGames = state.games.map((g) => (g.id === gameId ? { ...g, status } : g));
      saveGames(newGames);
      console.info('[Store] updateGameStatus:', gameId, status);
      return { games: newGames };
    }),

  getGameEnrollments: (gameId) =>
    get().enrollments.filter((e) => e.gameId === gameId),

  initStore: () => {
    const { games, enrollments } = loadInitialData();
    set({ games, enrollments });
  },
}));
