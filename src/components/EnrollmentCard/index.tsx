import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Enrollment, EnrollmentStatus } from '@/types/game';
import styles from './index.module.scss';

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onStatusChange?: (id: string, status: EnrollmentStatus) => void;
  showActions?: boolean;
}

const statusMap: Record<EnrollmentStatus, { label: string; styleKey: string }> = {
  pending: { label: '待确认', styleKey: 'statusPending' },
  confirmed: { label: '已确认', styleKey: 'statusConfirmed' },
  waitlist: { label: '候补', styleKey: 'statusWaitlist' },
  unsuitable: { label: '不合适', styleKey: 'statusUnsuitable' },
};

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  onStatusChange,
  showActions = true,
}) => {
  const statusInfo = statusMap[enrollment.status];

  return (
    <View className={styles.card}>
      <View className={styles.cardTop}>
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>{enrollment.nickname}</Text>
          <View className={classnames(styles.statusBadge, styles[statusInfo.styleKey])}>
            <Text className={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        <Text className={styles.distance}>{enrollment.distance}</Text>
      </View>
      <View className={styles.cardMid}>
        <Text className={styles.phone}>{enrollment.phone}</Text>
        {enrollment.canCrossGender && (
          <View className={styles.crossTag}>
            <Text className={styles.crossTagText}>可反串</Text>
          </View>
        )}
      </View>
      {showActions && enrollment.status === 'pending' && onStatusChange && (
        <View className={styles.cardActions}>
          <View
            className={classnames(styles.actionBtn, styles.actionConfirm)}
            onClick={() => onStatusChange(enrollment.id, 'confirmed')}
          >
            <Text className={styles.actionConfirmText}>已确认</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.actionWaitlist)}
            onClick={() => onStatusChange(enrollment.id, 'waitlist')}
          >
            <Text className={styles.actionWaitlistText}>候补</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.actionUnsuit)}
            onClick={() => onStatusChange(enrollment.id, 'unsuitable')}
          >
            <Text className={styles.actionUnsuitText}>不合适</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default EnrollmentCard;
