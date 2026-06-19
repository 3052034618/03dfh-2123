import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { UrgentGame } from '@/types/game';
import styles from './index.module.scss';

interface UrgentCardProps {
  game: UrgentGame;
  onClick?: () => void;
}

const UrgentCard: React.FC<UrgentCardProps> = ({ game, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.scriptName}>{game.scriptName}</Text>
        <View className={styles.typeTag}>
          <Text className={styles.typeTagText}>{game.scriptType}</Text>
        </View>
      </View>
      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>场次</Text>
          <Text className={styles.infoValue}>{game.sessionTime}场</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>缺口</Text>
          <Text className={styles.infoValueUrgent}>还差{game.playerGap}人</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>拼车</Text>
          <Text className={styles.infoValuePrice}>¥{game.carpoolPrice}/人</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>到店</Text>
          <Text className={styles.infoValue}>{game.latestArrival}前</Text>
        </View>
      </View>
      <View className={styles.cardFooter}>
        <View className={styles.genderTag}>
          <Text className={styles.genderTagText}>{game.genderPreference}</Text>
        </View>
        {game.isNewbieFriendly && (
          <View className={styles.newbieTag}>
            <Text className={styles.newbieTagText}>新手友好</Text>
          </View>
        )}
        {game.rolePreference && (
          <Text className={styles.roleText}>{game.rolePreference}</Text>
        )}
      </View>
      {game.status === 'full' && (
        <View className={styles.fullOverlay}>
          <Text className={styles.fullText}>已满员</Text>
        </View>
      )}
    </View>
  );
};

export default UrgentCard;
