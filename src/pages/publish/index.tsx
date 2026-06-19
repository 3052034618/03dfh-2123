import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView, Picker, Switch, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useGameStore } from '@/store/useGameStore';
import UrgentCard from '@/components/UrgentCard';
import type { GenderPref, ScriptType, UrgentGame } from '@/types/game';
import styles from './index.module.scss';

const SESSION_TIMES = ['10:00', '13:00', '14:00', '16:00', '19:00', '19:30', '20:00'];
const SCRIPT_TYPES: ScriptType[] = ['推理', '恐怖', '情感', '欢乐', '阵营', '机制'];
const GENDER_PREFS: GenderPref[] = ['男', '女', '不限'];
const PUBLISHER_KEY = 'lz_publisher_name';

interface FormState {
  sessionTime: string;
  scriptName: string;
  publisherName: string;
  scriptType: ScriptType;
  playerGap: string;
  currentPlayers: string;
  genderPreference: GenderPref;
  rolePreference: string;
  carpoolPrice: string;
  latestArrival: string;
  duration: string;
  isNewbieFriendly: boolean;
  notes: string;
}

function getInitialForm(): FormState {
  let savedPublisher = '';
  try {
    savedPublisher = (Taro.getStorageSync(PUBLISHER_KEY) as string) || '';
  } catch {
    savedPublisher = '';
  }
  return {
    sessionTime: '',
    scriptName: '',
    publisherName: savedPublisher,
    scriptType: '推理',
    playerGap: '',
    currentPlayers: '',
    genderPreference: '不限',
    rolePreference: '',
    carpoolPrice: '',
    latestArrival: '',
    duration: '',
    isNewbieFriendly: false,
    notes: '',
  };
}

function PublishPage() {
  const [form, setForm] = useState<FormState>(getInitialForm);
  const [showForm, setShowForm] = useState(false);
  const { games, addGame, initStore } = useGameStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  const updateForm = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.sessionTime || !form.scriptName) {
      Taro.showToast({ title: '请填写场次和剧本名', icon: 'none' });
      return;
    }
    if (!form.publisherName) {
      Taro.showToast({ title: '请填写前台本名', icon: 'none' });
      return;
    }
    try {
      Taro.setStorageSync(PUBLISHER_KEY, form.publisherName);
    } catch (err) {
      console.error('[PublishPage] save publisher error', err);
    }
    const playerGap = Number(form.playerGap) || 1;
    const currentPlayers = Number(form.currentPlayers) || 0;
    const newGame: UrgentGame = {
      id: `g${Date.now()}`,
      scriptName: form.scriptName,
      publisherName: form.publisherName,
      sessionTime: form.sessionTime,
      playerGap,
      genderPreference: form.genderPreference,
      rolePreference: form.rolePreference,
      carpoolPrice: Number(form.carpoolPrice) || 0,
      latestArrival: form.latestArrival || form.sessionTime,
      scriptType: form.scriptType,
      duration: form.duration,
      isNewbieFriendly: form.isNewbieFriendly,
      currentPlayers,
      totalPlayers: currentPlayers + playerGap,
      notes: form.notes,
      status: 'recruiting',
      createdAt: new Date().toISOString(),
    };
    addGame(newGame);
    setForm((prev) => ({ ...getInitialForm(), publisherName: prev.publisherName }));
    setShowForm(false);
    console.info('[PublishPage] game created:', newGame.id);
    Taro.showToast({ title: '急招发布成功！', icon: 'success' });
  };

  const todayStr = dayjs().format('YYYY年MM月DD日');

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.header}>
          <Text className={styles.headerTitle}>临招急发</Text>
          <Text className={styles.headerDate}>{todayStr}</Text>
        </View>

        <View className={styles.actionBar}>
          <View
            className={classnames(styles.publishBtn, showForm && styles.publishBtnActive)}
            onClick={() => setShowForm(!showForm)}
          >
            <Text className={styles.publishBtnText}>
              {showForm ? '收起表单' : '+ 发布急招'}
            </Text>
          </View>
        </View>

        {showForm && (
          <View className={styles.formCard}>
            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>选择场次</Text>
              <ScrollView scrollX className={styles.timeScroll}>
                <View className={styles.timeList}>
                  {SESSION_TIMES.map((time) => (
                    <View
                      key={time}
                      className={classnames(
                        styles.timeItem,
                        form.sessionTime === time && styles.timeItemActive
                      )}
                      onClick={() => updateForm('sessionTime', time)}
                    >
                      <Text
                        className={classnames(
                          styles.timeItemText,
                          form.sessionTime === time && styles.timeItemTextActive
                        )}
                      >
                        {time}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>前台本名</Text>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>您的本名</Text>
                <Input
                  className={styles.fieldInput}
                  placeholder="如：小敏"
                  value={form.publisherName}
                  onInput={(e) => updateForm('publisherName', e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>剧本信息</Text>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>剧本名</Text>
                <Input
                  className={styles.fieldInput}
                  placeholder="请输入剧本名称"
                  value={form.scriptName}
                  onInput={(e) => updateForm('scriptName', e.detail.value)}
                />
              </View>
              <View className={styles.tagGroup}>
                {SCRIPT_TYPES.map((type) => (
                  <View
                    key={type}
                    className={classnames(
                      styles.tagItem,
                      form.scriptType === type && styles.tagItemActive
                    )}
                    onClick={() => updateForm('scriptType', type)}
                  >
                    <Text
                      className={classnames(
                        styles.tagItemText,
                        form.scriptType === type && styles.tagItemTextActive
                      )}
                    >
                      {type}
                    </Text>
                  </View>
                ))}
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>时长</Text>
                <Input
                  className={styles.fieldInput}
                  placeholder="如 4小时"
                  value={form.duration}
                  onInput={(e) => updateForm('duration', e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>人数与偏好</Text>
              <View className={styles.formRow}>
                <View className={styles.formFieldHalf}>
                  <Text className={styles.fieldLabel}>人数缺口</Text>
                  <Input
                    className={styles.fieldInput}
                    type="number"
                    placeholder="还差几人"
                    value={form.playerGap}
                    onInput={(e) => updateForm('playerGap', e.detail.value)}
                  />
                </View>
                <View className={styles.formFieldHalf}>
                  <Text className={styles.fieldLabel}>已有玩家</Text>
                  <Input
                    className={styles.fieldInput}
                    type="number"
                    placeholder="已到几人"
                    value={form.currentPlayers}
                    onInput={(e) => updateForm('currentPlayers', e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.tagGroup}>
                {GENDER_PREFS.map((pref) => (
                  <View
                    key={pref}
                    className={classnames(
                      styles.tagItem,
                      form.genderPreference === pref && styles.tagItemActive
                    )}
                    onClick={() => updateForm('genderPreference', pref)}
                  >
                    <Text
                      className={classnames(
                        styles.tagItemText,
                        form.genderPreference === pref && styles.tagItemTextActive
                      )}
                    >
                      {pref}
                    </Text>
                  </View>
                ))}
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>角色偏好</Text>
                <Input
                  className={styles.fieldInput}
                  placeholder="如 有情感本经验优先"
                  value={form.rolePreference}
                  onInput={(e) => updateForm('rolePreference', e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>价格与时间</Text>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>拼车价格</Text>
                <View className={styles.priceInputWrap}>
                  <Text className={styles.pricePrefix}>¥</Text>
                  <Input
                    className={styles.priceInput}
                    type="digit"
                    placeholder="0"
                    value={form.carpoolPrice}
                    onInput={(e) => updateForm('carpoolPrice', e.detail.value)}
                  />
                  <Text className={styles.priceSuffix}>/人</Text>
                </View>
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>最晚到店</Text>
                <Picker
                  mode="time"
                  value={form.latestArrival || '12:00'}
                  onChange={(e) => updateForm('latestArrival', e.detail.value)}
                >
                  <View className={styles.pickerTrigger}>
                    <Text
                      className={classnames(
                        styles.pickerValue,
                        !form.latestArrival && styles.pickerPlaceholder
                      )}
                    >
                      {form.latestArrival || '请选择时间'}
                    </Text>
                  </View>
                </Picker>
              </View>
            </View>

            <View className={styles.formSection}>
              <View className={styles.switchRow}>
                <Text className={styles.fieldLabel}>新手友好</Text>
                <Switch
                  checked={form.isNewbieFriendly}
                  color="#D94B4B"
                  onChange={(e) => updateForm('isNewbieFriendly', e.detail.value)}
                />
              </View>
              <View className={styles.formField}>
                <Text className={styles.fieldLabel}>注意事项</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="如：请提前15分钟到店"
                  value={form.notes}
                  onInput={(e) => updateForm('notes', e.detail.value)}
                  maxlength={200}
                />
              </View>
            </View>

            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text className={styles.submitBtnText}>发布急招</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionHeader}>今日急招</Text>
          {games.length === 0 ? (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无急招信息</Text>
            </View>
          ) : (
            games.map((game) => <UrgentCard key={game.id} game={game} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default PublishPage;
