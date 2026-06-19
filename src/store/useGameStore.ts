import { create } from 'zustand';
import type { UrgentGame, Enrollment, EnrollmentStatus, GameStatus } from '@/types/game';
import { mockGames, mockEnrollments } from '@/data/mockData';

interface GameState {
  games: UrgentGame[];
  enrollments: Enrollment[];
  addGame: (game: UrgentGame) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus) => void;
  updateGameStatus: (gameId: string, status: GameStatus) => void;
  getGameEnrollments: (gameId: string) => Enrollment[];
}

export const useGameStore = create<GameState>((set, get) => ({
  games: mockGames,
  enrollments: mockEnrollments,
  addGame: (game) => set((state) => ({ games: [...state.games, game] })),
  addEnrollment: (enrollment) => set((state) => ({ enrollments: [...state.enrollments, enrollment] })),
  updateEnrollmentStatus: (enrollmentId, status) => set((state) => ({
    enrollments: state.enrollments.map((e) =>
      e.id === enrollmentId ? { ...e, status, repliedAt: new Date().toISOString() } : e
    ),
  })),
  updateGameStatus: (gameId, status) => set((state) => ({
    games: state.games.map((g) =>
      g.id === gameId ? { ...g, status } : g
    ),
  })),
  getGameEnrollments: (gameId) => get().enrollments.filter((e) => e.gameId === gameId),
}));
