import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import type { UrgentGame, Enrollment } from '@/types/game';
import styles from './index.module.scss';

interface CountdownCardProps {
  game: UrgentGame;
  enrollments: Enrollment[];
  remainingSeconds: number;
}

const CountdownCard: React.FC<CountdownCardProps> = ({
  game,
  enrollments,
  remainingSeconds,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '已过期';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getUrgencyLevel = (): string => {
    if (remainingSeconds <= 0) return 'expired';
    if (remainingSeconds <= 1800) return 'urgent';
    if (remainingSeconds <= 3600) return 'warning';
    return 'safe';
  };

  const urgencyLevel = getUrgencyLevel();

  const confirmed = enrollments.filter((e) => e.status === 'confirmed').length;
  const waitlist = enrollments.filter((e) => e.status === 'waitlist').length;
  const pending = enrollments.filter((e) => e.status === 'pending').length;

  const handleCall = (phone: string) => {
    const realPhone = phone.replace(/\*/g, '0');
    Taro.makePhoneCall({ phoneNumber: realPhone }).catch((err) => {
      console.error('[CountdownCard] makePhoneCall error', err);
    });
  };

  return (
    <View className={styles.card}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Text className={styles.scriptName}>{game.scriptName}</Text>
          <Text className={styles.sessionTime}>{game.sessionTime}场</Text>
        </View>
        <View
          className={classnames(
            styles.countdown,
            urgencyLevel === 'urgent' && styles.countdownUrgent,
            urgencyLevel === 'warning' && styles.countdownWarning,
            urgencyLevel === 'safe' && styles.countdownSafe,
            urgencyLevel === 'expired' && styles.countdownExpired
          )}
        >
          <Text
            className={classnames(
              styles.countdownText,
              urgencyLevel === 'urgent' && styles.countdownTextUrgent,
              urgencyLevel === 'warning' && styles.countdownTextWarning,
              urgencyLevel === 'safe' && styles.countdownTextSafe,
              urgencyLevel === 'expired' && styles.countdownTextExpired
            )}
          >
            {formatTime(remainingSeconds)}
          </Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statConfirmed}>{confirmed}</Text>
          <Text className={styles.statLabel}>已确认</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statWaitlist}>{waitlist}</Text>
          <Text className={styles.statLabel}>候补</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statPending}>{pending}</Text>
          <Text className={styles.statLabel}>待确认</Text>
        </View>
      </View>

      {enrollments.length > 0 && (
        <View className={styles.playerList}>
          {enrollments.map((enrollment) => (
            <View key={enrollment.id} className={styles.playerItem}>
              <View className={styles.playerInfo}>
                <Text className={styles.playerName}>{enrollment.nickname}</Text>
                <Text
                  className={classnames(
                    styles.playerStatus,
                    enrollment.status === 'confirmed' && styles.playerStatusConfirmed,
                    enrollment.status === 'waitlist' && styles.playerStatusWaitlist,
                    enrollment.status === 'pending' && styles.playerStatusPending,
                    enrollment.status === 'unsuitable' && styles.playerStatusUnsuitable
                  )}
                >
                  {enrollment.status === 'confirmed' && '已确认'}
                  {enrollment.status === 'waitlist' && '候补'}
                  {enrollment.status === 'pending' && '待确认'}
                  {enrollment.status === 'unsuitable' && '不合适'}
                </Text>
                <Text className={styles.playerDistance}>{enrollment.distance}</Text>
              </View>
              {enrollment.status === 'pending' && (
                <View
                  className={styles.callBtn}
                  onClick={() => handleCall(enrollment.phone)}
                >
                  <Text className={styles.callBtnText}>拨打电话</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {urgencyLevel === 'urgent' && pending > 0 && (
        <View className={styles.remindBar}>
          <Text className={styles.remindText}>
            还有{pending}人未确认，请尽快电话联系！
          </Text>
        </View>
      )}
    </View>
  );
};

export default CountdownCard;
