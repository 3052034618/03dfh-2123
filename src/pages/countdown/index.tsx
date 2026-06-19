import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import dayjs from 'dayjs';
import { useGameStore } from '@/store/useGameStore';
import CountdownCard from '@/components/CountdownCard';
import styles from './index.module.scss';

function CountdownPage() {
  const [now, setNow] = useState(dayjs());
  const { games, enrollments } = useGameStore();

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

  const sortedGames = [...games]
    .filter((g) => g.status === 'recruiting')
    .sort((a, b) => {
      const aRemain = getRemainingSeconds(a.latestArrival);
      const bRemain = getRemainingSeconds(b.latestArrival);
      return aRemain - bRemain;
    });

  const urgentCount = sortedGames.filter((g) => {
    const remain = getRemainingSeconds(g.latestArrival);
    return remain > 0 && remain <= 1800;
  }).length;

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        {urgentCount > 0 && (
          <View className={styles.alertBar}>
            <Text className={styles.alertText}>
              有{urgentCount}场即将开始，请尽快确认！
            </Text>
          </View>
        )}

        {sortedGames.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyText}>暂无急招场次</Text>
          </View>
        ) : (
          <View className={styles.cardList}>
            {sortedGames.map((game) => {
              const remaining = getRemainingSeconds(game.latestArrival);
              const gameEnrollments = enrollments.filter((e) => e.gameId === game.id);
              const pendingCount = gameEnrollments.filter(
                (e) => e.status === 'pending'
              ).length;
              return (
                <View key={game.id}>
                  {pendingCount > 0 && remaining > 0 && remaining <= 1800 && (
                    <View className={styles.remindTip}>
                      <Text className={styles.remindTipText}>
                        {pendingCount}人未确认，建议立即电话联系
                      </Text>
                    </View>
                  )}
                  <CountdownCard
                    game={game}
                    enrollments={gameEnrollments}
                    remainingSeconds={remaining}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default CountdownPage;
