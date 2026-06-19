import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useGameStore } from '@/store/useGameStore';
import type { UrgentGame, Enrollment, EnrollmentStatus } from '@/types/game';
import styles from './index.module.scss';

interface PlayerRow {
  enrollment: Enrollment;
  game: UrgentGame;
  remainingSeconds: number;
}

const statusPriority: Record<EnrollmentStatus, number> = {
  pending: 0,
  waitlist: 1,
  confirmed: 2,
  unsuitable: 3,
};

const statusLabelMap: Record<EnrollmentStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  waitlist: '候补',
  unsuitable: '不合适',
};

function CountdownPage() {
  const [now, setNow] = useState(dayjs());
  const { games, enrollments, initStore } = useGameStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingSeconds = useCallback(
    (latestArrival: string): number => {
      const parts = latestArrival.split(':').map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const deadline = now.startOf('day').add(h, 'hour').add(m, 'minute');
      return deadline.diff(now, 'second');
    },
    [now]
  );

  const playerRows = useMemo<PlayerRow[]>(() => {
    const activeGamesMap = new Map(
      games
        .filter((g) => g.status === 'recruiting')
        .map((g) => [g.id, g])
    );
    const rows: PlayerRow[] = [];
    for (const enr of enrollments) {
      const game = activeGamesMap.get(enr.gameId);
      if (game) {
        rows.push({
          enrollment: enr,
          game,
          remainingSeconds: getRemainingSeconds(game.latestArrival),
        });
      }
    }
    rows.sort((a, b) => {
      const sp = statusPriority[a.enrollment.status] - statusPriority[b.enrollment.status];
      if (sp !== 0) return sp;
      return a.remainingSeconds - b.remainingSeconds;
    });
    return rows;
  }, [games, enrollments, getRemainingSeconds]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '已逾期';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}时${String(m).padStart(2, '0')}分`;
    if (m > 0) return `${m}分${String(s).padStart(2, '0')}秒`;
    return `${s}秒`;
  };

  const urgencyLevel = (sec: number, status: EnrollmentStatus): string => {
    if (status !== 'pending') return 'safe';
    if (sec <= 0) return 'expired';
    if (sec <= 1800) return 'urgent';
    if (sec <= 3600) return 'warning';
    return 'safe';
  };

  const handleCall = (phone: string) => {
    const real = phone.replace(/\*/g, '');
    Taro.makePhoneCall({ phoneNumber: real }).catch((err) => {
      console.error('[Countdown] makePhoneCall error', err);
    });
  };

  const pendingUrgentCount = playerRows.filter(
    (r) =>
      r.enrollment.status === 'pending' && r.remainingSeconds > 0 && r.remainingSeconds <= 1800
  ).length;

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        {pendingUrgentCount > 0 && (
          <View className={styles.alertBar}>
            <Text className={styles.alertText}>
              有{pendingUrgentCount}人马上到点还没确认，请尽快打电话！
            </Text>
          </View>
        )}

        <View className={styles.cardList}>
          {playerRows.length === 0 ? (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无报名玩家</Text>
            </View>
          ) : (
            playerRows.map((row) => {
              const level = urgencyLevel(row.remainingSeconds, row.enrollment.status);
              const statusLabel = statusLabelMap[row.enrollment.status];
              return (
                <View
                  key={row.enrollment.id}
                  className={classnames(
                    styles.playerCard,
                    row.enrollment.status === 'pending' && level === 'urgent' && styles.playerCardUrgent
                  )}
                >
                  <View className={styles.cardHeader}>
                    <View className={styles.headerLeft}>
                      <Text className={styles.playerName}>{row.enrollment.nickname}</Text>
                      <View
                        className={classnames(
                          styles.statusBadge,
                          row.enrollment.status === 'pending' && styles.statusPending,
                          row.enrollment.status === 'confirmed' && styles.statusConfirmed,
                          row.enrollment.status === 'waitlist' && styles.statusWaitlist,
                          row.enrollment.status === 'unsuitable' && styles.statusUnsuitable
                        )}
                      >
                        <Text className={styles.statusText}>{statusLabel}</Text>
                      </View>
                    </View>
                    <View
                      className={classnames(
                        styles.countdownBox,
                        level === 'urgent' && styles.countdownUrgent,
                        level === 'warning' && styles.countdownWarning,
                        level === 'safe' && styles.countdownSafe,
                        level === 'expired' && styles.countdownExpired
                      )}
                    >
                      <Text
                        className={classnames(
                          styles.countdownText,
                          level === 'urgent' && styles.countdownTextUrgent,
                          level === 'warning' && styles.countdownTextWarning,
                          level === 'safe' && styles.countdownTextSafe,
                          level === 'expired' && styles.countdownTextExpired
                        )}
                      >
                        {formatTime(row.remainingSeconds)}
                      </Text>
                    </View>
                  </View>

                  <View className={styles.gameInfo}>
                    <Text className={styles.gameName}>{row.game.scriptName}</Text>
                    <Text className={styles.gameSession}>{row.game.sessionTime}场</Text>
                    <Text className={styles.publisherText}>· 发布：{row.game.publisherName}</Text>
                  </View>

                  <View className={styles.phoneRow}>
                    <View className={styles.phoneBox}>
                      <Text className={styles.phoneLabel}>电话</Text>
                      <Text className={styles.phoneNumber}>{row.enrollment.phone}</Text>
                    </View>
                    <View className={styles.distanceTag}>
                      <Text className={styles.distanceText}>{row.enrollment.distance}</Text>
                    </View>
                  </View>

                  <View className={styles.extraRow}>
                    {row.enrollment.canCrossGender && (
                      <View className={styles.crossTag}>
                        <Text className={styles.crossTagText}>可反串</Text>
                      </View>
                    )}
                  </View>

                  {row.enrollment.status === 'pending' && (
                    <View
                      className={classnames(
                        styles.callBigBtn,
                        level === 'urgent' && styles.callBigBtnUrgent
                      )}
                      onClick={() => handleCall(row.enrollment.phone)}
                    >
                      <Text className={styles.callBigBtnText}>📞 立即拨打</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default CountdownPage;
