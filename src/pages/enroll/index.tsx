import React, { useState } from 'react';
import { View, Text, Input, ScrollView, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useGameStore } from '@/store/useGameStore';
import EnrollmentCard from '@/components/EnrollmentCard';
import type { EnrollmentStatus, Enrollment } from '@/types/game';
import styles from './index.module.scss';

interface EnrollFormState {
  nickname: string;
  phone: string;
  distance: string;
  canCrossGender: boolean;
}

const initialEnrollForm: EnrollFormState = {
  nickname: '',
  phone: '',
  distance: '',
  canCrossGender: false,
};

function EnrollPage() {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [enrollForm, setEnrollForm] = useState<EnrollFormState>(initialEnrollForm);
  const { games, enrollments, addEnrollment, updateEnrollmentStatus } = useGameStore();

  const recruitingGames = games.filter((g) => g.status === 'recruiting');
  const selectedGame = recruitingGames.find((g) => g.id === selectedGameId) || recruitingGames[0];
  const selectedId = selectedGame?.id || '';
  const gameEnrollments = enrollments.filter((e) => e.gameId === selectedId);

  const handleEnroll = () => {
    if (!enrollForm.nickname || !enrollForm.phone) {
      Taro.showToast({ title: '请填写昵称和电话', icon: 'none' });
      return;
    }
    const newEnrollment: Enrollment = {
      id: `e${Date.now()}`,
      gameId: selectedId,
      nickname: enrollForm.nickname,
      phone: enrollForm.phone,
      distance: enrollForm.distance ? `${enrollForm.distance}km` : '未填写',
      canCrossGender: enrollForm.canCrossGender,
      status: 'pending',
      enrolledAt: new Date().toISOString(),
    };
    addEnrollment(newEnrollment);
    setEnrollForm(initialEnrollForm);
    console.info('[EnrollPage] enrollment created:', newEnrollment.id);
    Taro.showToast({ title: '报名成功！', icon: 'success' });
  };

  const handleStatusChange = (enrollmentId: string, status: EnrollmentStatus) => {
    updateEnrollmentStatus(enrollmentId, status);
    console.info('[EnrollPage] status changed:', enrollmentId, status);
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.gameSelector}>
          <ScrollView scrollX className={styles.gameScroll}>
            <View className={styles.gameList}>
              {recruitingGames.map((game) => (
                <View
                  key={game.id}
                  className={classnames(
                    styles.gameTab,
                    selectedId === game.id && styles.gameTabActive
                  )}
                  onClick={() => setSelectedGameId(game.id)}
                >
                  <Text
                    className={classnames(
                      styles.gameTabText,
                      selectedId === game.id && styles.gameTabTextActive
                    )}
                  >
                    {game.scriptName}
                  </Text>
                  <Text
                    className={classnames(
                      styles.gameTabGap,
                      selectedId === game.id && styles.gameTabGapActive
                    )}
                  >
                    差{game.playerGap}人
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {selectedGame && (
          <>
            <View className={styles.detailCard}>
              <View className={styles.detailHeader}>
                <Text className={styles.detailName}>{selectedGame.scriptName}</Text>
                <View className={styles.typeTag}>
                  <Text className={styles.typeTagText}>{selectedGame.scriptType}</Text>
                </View>
              </View>
              <View className={styles.detailInfo}>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>时长</Text>
                  <Text className={styles.detailValue}>{selectedGame.duration}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>新手</Text>
                  <Text className={styles.detailValue}>
                    {selectedGame.isNewbieFriendly ? '友好' : '不建议'}
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>人数</Text>
                  <Text className={styles.detailValue}>
                    已有{selectedGame.currentPlayers}/{selectedGame.totalPlayers}人
                  </Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>价格</Text>
                  <Text className={styles.detailPrice}>
                    ¥{selectedGame.carpoolPrice}/人
                  </Text>
                </View>
              </View>
              {selectedGame.notes && (
                <View className={styles.notesBox}>
                  <Text className={styles.notesLabel}>注意事项</Text>
                  <Text className={styles.notesText}>{selectedGame.notes}</Text>
                </View>
              )}
            </View>

            <View className={styles.enrollForm}>
              <Text className={styles.formTitle}>我要报名</Text>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>昵称</Text>
                <Input
                  className={styles.fieldInput}
                  placeholder="请输入昵称"
                  value={enrollForm.nickname}
                  onInput={(e) =>
                    setEnrollForm((prev) => ({ ...prev, nickname: e.detail.value }))
                  }
                />
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>电话</Text>
                <Input
                  className={styles.fieldInput}
                  type="number"
                  placeholder="请输入电话号码"
                  value={enrollForm.phone}
                  onInput={(e) =>
                    setEnrollForm((prev) => ({ ...prev, phone: e.detail.value }))
                  }
                />
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>距离</Text>
                <View className={styles.distanceWrap}>
                  <Input
                    className={styles.distanceInput}
                    type="digit"
                    placeholder="如 3"
                    value={enrollForm.distance}
                    onInput={(e) =>
                      setEnrollForm((prev) => ({ ...prev, distance: e.detail.value }))
                    }
                  />
                  <Text className={styles.distanceSuffix}>km</Text>
                </View>
              </View>
              <View className={styles.switchRow}>
                <Text className={styles.fieldLabel}>能否反串</Text>
                <Switch
                  checked={enrollForm.canCrossGender}
                  color="#D94B4B"
                  onChange={(e) =>
                    setEnrollForm((prev) => ({ ...prev, canCrossGender: e.detail.value }))
                  }
                />
              </View>
              <View className={styles.submitBtn} onClick={handleEnroll}>
                <Text className={styles.submitBtnText}>我要报名</Text>
              </View>
            </View>

            <View className={styles.enrollList}>
              <Text className={styles.listTitle}>
                报名列表（{gameEnrollments.length}人）
              </Text>
              {gameEnrollments.length === 0 ? (
                <View className={styles.empty}>
                  <Text className={styles.emptyText}>暂无报名</Text>
                </View>
              ) : (
                gameEnrollments.map((enrollment) => (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    onStatusChange={handleStatusChange}
                    showActions={true}
                  />
                ))
              )}
            </View>
          </>
        )}

        {recruitingGames.length === 0 && (
          <View className={styles.emptyPage}>
            <Text className={styles.emptyPageText}>暂无急招场次</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default EnrollPage;
