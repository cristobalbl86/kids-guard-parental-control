import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Text, Card, Switch, IconButton } from 'react-native-paper';
import { theme, statusColors } from '../utils/theme';
import { getAllSettings, changePIN } from '../utils/storage';
import { updateVolumeSettings, getVolume } from '../utils/volumeControl';
import PINChangeDialog from '../components/PINChangeDialog';
import { t } from '../utils/i18n';
import { showInterstitialIfEligible } from '../utils/admobControl';

export default function ParentSettingsScreen({ navigation }) {
  const [volumeValue, setVolumeValue] = useState(50);
  const [volumeLocked, setVolumeLocked] = useState(false);
  const STEP_VALUE = 25;

  const snapToStep = (value) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return Math.round(clamped / STEP_VALUE) * STEP_VALUE;
  };
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [volumeConfigured, setVolumeConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Show ad when screen comes into focus
    const unsubscribe = navigation.addListener('focus', async () => {
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
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert(t('alerts.error'), 'Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
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
