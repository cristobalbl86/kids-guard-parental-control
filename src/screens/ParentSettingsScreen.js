import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Text, Card, Switch, IconButton, ProgressBar } from 'react-native-paper';
import { theme, statusColors } from '../utils/theme';
import { getAllSettings, changePIN } from '../utils/storage';
import { updateVolumeSettings, getVolume } from '../utils/volumeControl';
import {
  updateScreenTimeSettings,
  getDailyUsageSeconds,
  isScreenTimeMonitoring,
  checkOverlayPermission,
  requestOverlayPermission,
  formatSeconds,
  formatMinutes,
} from '../utils/screenTimeControl';
import PINChangeDialog from '../components/PINChangeDialog';
import { t } from '../utils/i18n';
import { showInterstitialIfEligible } from '../utils/admobControl';

export default function ParentSettingsScreen({ navigation }) {
  const [volumeValue, setVolumeValue] = useState(50);
  const [volumeLocked, setVolumeLocked] = useState(false);
  const [screenTimeLimitMinutes, setScreenTimeLimitMinutes] = useState(120);
  const [screenTimeLocked, setScreenTimeLocked] = useState(false);
  const [dailyUsageSeconds, setDailyUsageSeconds] = useState(0);
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);

  const STEP_VALUE = 25;
  const SCREEN_TIME_STEP = 15; // 15 minutes

  const snapToStep = (value) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return Math.round(clamped / STEP_VALUE) * STEP_VALUE;
  };

  const snapToScreenTimeStep = (value) => {
    const clamped = Math.max(15, Math.min(480, value));
    return Math.round(clamped / SCREEN_TIME_STEP) * SCREEN_TIME_STEP;
  };

  const [showPINDialog, setShowPINDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [volumeConfigured, setVolumeConfigured] = useState(false);
  const [screenTimeConfigured, setScreenTimeConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Show ad when screen comes into focus
    const unsubscribe = navigation.addListener('focus', async () => {
      // Reload screen time usage
      await loadScreenTimeData();
      // Show ad if eligible (6-hour check happens inside)
      await showInterstitialIfEligible();
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const settings = await getAllSettings();
      console.log('[loadSettings] Loaded settings:', JSON.stringify(settings));

      // Load volume settings
      const hasPersistedVolume = !settings.volume?.isDefault;
      setVolumeConfigured(hasPersistedVolume);

      if (hasPersistedVolume) {
        if (!settings.volume.locked) {
          const currentVolume = await getVolume();
          console.log('[loadSettings] Volume unlocked, got current:', currentVolume);
          setVolumeValue(snapToStep(currentVolume));
        } else {
          console.log('[loadSettings] Volume locked, using stored:', settings.volume.volume);
          setVolumeValue(snapToStep(settings.volume.volume));
        }
        setVolumeLocked(settings.volume.locked);
      } else {
        console.log('[loadSettings] No stored volume settings - showing placeholders');
        setVolumeValue(50);
        setVolumeLocked(false);
      }

      // Load screen time settings
      const hasPersistedScreenTime = !settings.screenTime?.isDefault;
      setScreenTimeConfigured(hasPersistedScreenTime);

      if (hasPersistedScreenTime) {
        setScreenTimeLimitMinutes(snapToScreenTimeStep(settings.screenTime.limitMinutes));

        // Sync lock state with native enforcement
        // (overlay PIN unlock sets native enforcing=false but doesn't update AsyncStorage)
        let isLocked = settings.screenTime.locked;
        if (isLocked) {
          const nativeEnforcing = await isScreenTimeMonitoring();
          if (!nativeEnforcing) {
            // Native enforcement was stopped (e.g., by PIN unlock on overlay)
            isLocked = false;
            // Sync AsyncStorage
            const { saveScreenTimeSettings } = require('../utils/storage');
            await saveScreenTimeSettings({ limitMinutes: settings.screenTime.limitMinutes, locked: false });
          }
        }
        setScreenTimeLocked(isLocked);
      } else {
        setScreenTimeLimitMinutes(120);
        setScreenTimeLocked(false);
      }

      // Load screen time data
      await loadScreenTimeData();
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert(t('alerts.error'), 'Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadScreenTimeData = async () => {
    try {
      const overlayGranted = await checkOverlayPermission();
      setHasOverlayPerm(overlayGranted);

      // Get elapsed timer seconds
      const elapsed = await getDailyUsageSeconds();
      setDailyUsageSeconds(elapsed);
    } catch (error) {
      console.error('Error loading screen time data:', error);
    }
  };

  const handleVolumeChange = (value) => {
    setVolumeValue(snapToStep(value));
  };

  const handleVolumeLockToggle = async () => {
    const newLocked = !volumeLocked;
    setVolumeLocked(newLocked);

    // Save immediately
    setSaving(true);

    // If unlocking, load current system volume
    if (!newLocked) {
      const currentVolume = await getVolume();
      setVolumeValue(snapToStep(currentVolume));
    }

    const snappedVolume = snapToStep(volumeValue);
    setVolumeValue(snappedVolume);
    const success = await updateVolumeSettings(snappedVolume, newLocked);
    setSaving(false);

    if (success) {
      setVolumeConfigured(true);
      Alert.alert(
        t('alerts.success'),
        newLocked
          ? t('parentSettings.successVolumeLocked', { value: volumeValue })
          : t('parentSettings.successVolumeUnlocked')
      );
    } else {
      Alert.alert(t('alerts.error'), t('parentSettings.errorUpdate', { setting: t('common.volume') }));
      setVolumeLocked(!newLocked); // Revert on failure
    }
  };

  const handleVolumeSave = async () => {
    setSaving(true);

    // Import setVolume dynamically
    const { setVolume } = require('../utils/volumeControl');
    const snappedVolume = snapToStep(volumeValue);
    setVolumeValue(snappedVolume);

    // First, actually set the device volume
    await setVolume(snappedVolume);

    // Then save settings and update monitoring
    const success = await updateVolumeSettings(snappedVolume, volumeLocked);
    setSaving(false);

    if (success) {
      setVolumeConfigured(true);
      Alert.alert(t('alerts.success'), t('parentSettings.successVolumeSet', { value: volumeValue }));
    } else {
      Alert.alert(t('alerts.error'), t('parentSettings.errorSave', { setting: t('common.volume') }));
    }
  };

  const handleScreenTimeLimitChange = (delta) => {
    const newLimit = snapToScreenTimeStep(screenTimeLimitMinutes + delta);
    setScreenTimeLimitMinutes(newLimit);
  };

  const handleScreenTimeLockToggle = async () => {
    const newLocked = !screenTimeLocked;

    // If locking, check overlay permission first
    if (newLocked) {
      const hasOverlayPermission = await checkOverlayPermission();
      if (!hasOverlayPermission) {
        Alert.alert(
          'Permission Required',
          'Screen Time Limits requires "Display over other apps" permission to show the lock screen. Grant permission in Settings?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                await requestOverlayPermission();
              },
            },
          ]
        );
        return;
      }
    }

    await proceedWithScreenTimeLock(newLocked);
  };

  const proceedWithScreenTimeLock = async (newLocked) => {
    setScreenTimeLocked(newLocked);
    setSaving(true);

    const success = await updateScreenTimeSettings(screenTimeLimitMinutes, newLocked);
    setSaving(false);

    if (success) {
      setScreenTimeConfigured(true);
      // Reload usage data
      await loadScreenTimeData();
      Alert.alert(
        t('alerts.success'),
        newLocked
          ? `Timer started: ${formatMinutes(screenTimeLimitMinutes)} from now`
          : 'Screen time timer stopped'
      );
    } else {
      Alert.alert(t('alerts.error'), 'Failed to update screen time settings');
      setScreenTimeLocked(!newLocked); // Revert on failure
    }
  };

  const handleScreenTimeSave = async () => {
    setSaving(true);

    const success = await updateScreenTimeSettings(screenTimeLimitMinutes, screenTimeLocked);
    setSaving(false);

    if (success) {
      setScreenTimeConfigured(true);
      await loadScreenTimeData();
      Alert.alert(
        t('alerts.success'),
        screenTimeLocked
          ? `Timer reset: ${formatMinutes(screenTimeLimitMinutes)} starting now`
          : `Screen time limit set to ${formatMinutes(screenTimeLimitMinutes)}`
      );
    } else {
      Alert.alert(t('alerts.error'), 'Failed to save screen time settings');
    }
  };

  const handleChangePIN = () => {
    setShowPINDialog(true);
  };

  const handlePINChanged = () => {
    setShowPINDialog(false);
    Alert.alert(t('alerts.success'), t('pinChange.successMessage'));
  };

  const renderControlCard = (
    title,
    icon,
    value,
    locked,
    onValueChange,
    onLockToggle,
    onSave,
    isConfigured
  ) => {
    const statusStyle = locked ? statusColors.locked : statusColors.unlocked;

    return (
      <Card style={[styles.card, { borderLeftColor: statusStyle.border }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <IconButton icon={icon} size={28} iconColor={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                {title}
              </Text>
            </View>

            <View style={styles.lockSwitch}>
              <Text variant="bodyMedium" style={styles.lockLabel}>
                {locked ? t('common.locked') : t('common.unlocked')}
              </Text>
              <Switch
                value={locked}
                onValueChange={onLockToggle}
                color={statusStyle.icon}
                disabled={saving}
              />
            </View>
          </View>

          <View style={styles.controlContainer}>
            <View style={styles.inputRow}>
              <IconButton
                icon="minus"
                size={24}
                iconColor={theme.colors.primary}
                style={styles.incrementButton}
                onPress={() => {
                  const newValue = Math.max(0, value - STEP_VALUE);
                  onValueChange(newValue);
                }}
                disabled={saving || value <= 0}
              />

              <View style={styles.inputWrapper}>
                <Text style={styles.input}>{String(value)}</Text>
                <Text style={styles.percentSymbol}>%</Text>
              </View>

              <IconButton
                icon="plus"
                size={24}
                iconColor={theme.colors.primary}
                style={styles.incrementButton}
                onPress={() => {
                  const newValue = Math.min(100, value + STEP_VALUE);
                  onValueChange(newValue);
                }}
                disabled={saving || value >= 100}
              />
            </View>

            <View style={styles.rangeLabels}>
              <Text variant="bodySmall" style={styles.rangeLabel}>
                {t('parentSettings.minLabel')}
              </Text>
              <Text variant="bodySmall" style={styles.rangeLabel}>
                {t('parentSettings.maxLabel')}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={onSave}
            style={styles.saveButton}
            disabled={saving}
            loading={saving}
          >
            {t('parentSettings.applyButton', { setting: title })}
          </Button>

          {locked && (
            <View style={styles.lockedNotice}>
              <IconButton icon="information" size={16} iconColor={statusStyle.icon} />
              <Text variant="bodySmall" style={styles.lockedNoticeText}>
                {t('parentSettings.lockedNotice')}
              </Text>
            </View>
          )}

          {!isConfigured && (
            <Text variant="bodySmall" style={styles.placeholderNotice}>
              {t('parentSettings.placeholderNotice')}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderScreenTimeCard = () => {
    const statusStyle = screenTimeLocked ? statusColors.locked : statusColors.unlocked;
    const usagePercent = dailyUsageSeconds / (screenTimeLimitMinutes * 60);

    return (
      <Card style={[styles.card, { borderLeftColor: statusStyle.border }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <IconButton icon="clock-outline" size={28} iconColor={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Screen Time Limit
              </Text>
            </View>

            <View style={styles.lockSwitch}>
              <Text variant="bodyMedium" style={styles.lockLabel}>
                {screenTimeLocked ? t('common.locked') : t('common.unlocked')}
              </Text>
              <Switch
                value={screenTimeLocked}
                onValueChange={handleScreenTimeLockToggle}
                color={statusStyle.icon}
                disabled={saving}
              />
            </View>
          </View>

          {/* Timer Display */}
          {screenTimeLocked && (
            <View style={styles.usageContainer}>
              {(() => {
                const limitSeconds = screenTimeLimitMinutes * 60;
                const remainingSeconds = Math.max(0, limitSeconds - dailyUsageSeconds);
                const isExpired = remainingSeconds <= 0;
                return (
                  <>
                    <Text variant="bodyMedium" style={[styles.usageText, isExpired && { color: '#e74c3c' }]}>
                      {isExpired ? 'Time expired' : `Remaining: ${formatSeconds(remainingSeconds)}`}
                    </Text>
                    <ProgressBar
                      progress={Math.min(usagePercent, 1)}
                      color={usagePercent >= 1 ? '#e74c3c' : '#3498db'}
                      style={styles.progressBar}
                    />
                  </>
                );
              })()}
            </View>
          )}

          {/* Limit Adjustment */}
          <View style={styles.controlContainer}>
            <View style={styles.inputRow}>
              <IconButton
                icon="minus"
                size={24}
                iconColor={theme.colors.primary}
                style={styles.incrementButton}
                onPress={() => handleScreenTimeLimitChange(-SCREEN_TIME_STEP)}
                disabled={saving || screenTimeLimitMinutes <= 15}
              />

              <View style={styles.inputWrapper}>
                <Text style={styles.input}>{formatMinutes(screenTimeLimitMinutes)}</Text>
              </View>

              <IconButton
                icon="plus"
                size={24}
                iconColor={theme.colors.primary}
                style={styles.incrementButton}
                onPress={() => handleScreenTimeLimitChange(SCREEN_TIME_STEP)}
                disabled={saving || screenTimeLimitMinutes >= 480}
              />
            </View>

            <View style={styles.rangeLabels}>
              <Text variant="bodySmall" style={styles.rangeLabel}>
                15 min
              </Text>
              <Text variant="bodySmall" style={styles.rangeLabel}>
                8h (480 min)
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleScreenTimeSave}
            style={styles.saveButton}
            disabled={saving}
            loading={saving}
          >
            Apply / Reset Screen Time
          </Button>

          {screenTimeLocked && (
            <View style={styles.lockedNotice}>
              <IconButton icon="information" size={16} iconColor={statusStyle.icon} />
              <Text variant="bodySmall" style={styles.lockedNoticeText}>
                Device will lock when timer runs out. Press "Apply / Reset" to start a new cycle.
              </Text>
            </View>
          )}

          {!hasOverlayPerm && (
            <View style={[styles.permissionNotice, { marginTop: 12 }]}>
              <IconButton icon="alert" size={16} iconColor="#e74c3c" />
              <Text variant="bodySmall" style={styles.permissionNoticeText}>
                "Display over other apps" permission required.
              </Text>
              <Button
                mode="outlined"
                onPress={() => requestOverlayPermission()}
                style={styles.permissionButton}
                compact
              >
                Grant
              </Button>
            </View>
          )}

          {!screenTimeConfigured && (
            <Text variant="bodySmall" style={styles.placeholderNotice}>
              {t('parentSettings.placeholderNotice')}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoadingSettings) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {t('parentSettings.headerTitle')}
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {t('parentSettings.headerSubtitle')}
          </Text>
        </View>

        {renderControlCard(
          t('common.volume'),
          'volume-high',
          volumeValue,
          volumeLocked,
          handleVolumeChange,
          handleVolumeLockToggle,
          handleVolumeSave,
          volumeConfigured
        )}

        {renderScreenTimeCard()}

        <Card style={styles.pinCard}>
          <Card.Content>
            <View style={styles.pinHeader}>
              <IconButton icon="lock-reset" size={24} iconColor={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.pinTitle}>
                {t('parentSettings.securityTitle')}
              </Text>
            </View>

            <Button
              mode="outlined"
              onPress={handleChangePIN}
              icon="key-change"
              style={styles.changePinButton}
            >
              {t('parentSettings.changePinButton')}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.warningCard}>
          <Card.Content>
            <View style={styles.warningHeader}>
              <IconButton icon="alert" size={24} iconColor={theme.colors.warning} />
              <Text variant="titleMedium" style={styles.warningTitle}>
                {t('parentSettings.warningTitle')}
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.warningText}>
              • {t('parentSettings.warning1')}
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • {t('parentSettings.warning2')}
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • {t('parentSettings.warning3')}
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • {t('parentSettings.warning4')}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {showPINDialog && (
        <PINChangeDialog
          visible={showPINDialog}
          onDismiss={() => setShowPINDialog(false)}
          onSuccess={handlePINChanged}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginLeft: 8,
    color: theme.colors.text,
  },
  lockSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockLabel: {
    marginRight: 8,
    color: theme.colors.text,
  },
  controlContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  incrementButton: {
    margin: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  percentSymbol: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  rangeLabel: {
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginTop: 8,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  lockedNoticeText: {
    flex: 1,
    color: theme.colors.textSecondary,
  },
  placeholderNotice: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    color: '#92400e',
    fontStyle: 'italic',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageText: {
    color: theme.colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  permissionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  permissionNoticeText: {
    flex: 1,
    color: '#7f1d1d',
  },
  permissionButton: {
    marginLeft: 8,
  },
  pinCard: {
    marginBottom: 16,
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinTitle: {
    marginLeft: 8,
    color: theme.colors.text,
  },
  changePinButton: {
    marginTop: 8,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#fef2f2',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    marginLeft: 8,
    color: theme.colors.warning,
  },
  warningText: {
    color: '#7f1d1d',
    marginBottom: 8,
    lineHeight: 20,
  },
});
