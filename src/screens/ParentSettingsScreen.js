import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TextInput, ActivityIndicator } from 'react-native';
import { Button, Text, Card, Switch, IconButton, Divider } from 'react-native-paper';
import { theme, statusColors } from '../utils/theme';
import { getAllSettings, changePIN } from '../utils/storage';
import { updateVolumeSettings, getVolume } from '../utils/volumeControl';
import { updateBrightnessSettings, getBrightness, checkWriteSettingsPermission, requestWriteSettingsPermission } from '../utils/brightnessControl';
import PINChangeDialog from '../components/PINChangeDialog';
import { t } from '../utils/i18n';

export default function ParentSettingsScreen({ navigation }) {
  const [volumeValue, setVolumeValue] = useState(50);
  const [volumeLocked, setVolumeLocked] = useState(false);
  const [brightnessValue, setBrightnessValue] = useState(50);
  const [brightnessLocked, setBrightnessLocked] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [volumeConfigured, setVolumeConfigured] = useState(false);
  const [brightnessConfigured, setBrightnessConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Check permission when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkAndReapplyBrightness();
    });

    return unsubscribe;
  }, [brightnessValue, brightnessLocked]);

  const checkAndReapplyBrightness = async () => {
    if (Platform.OS === 'android' && brightnessLocked) {
      const hasPermission = await checkWriteSettingsPermission();
      if (hasPermission) {
        // Permission is granted, re-apply brightness to ensure system brightness is set
        const { setBrightness } = require('../utils/brightnessControl');
        await setBrightness(brightnessValue);
        console.log('Reapplied brightness after permission check');
      }
    }
  };

  const checkBrightnessPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await checkWriteSettingsPermission();
      if (!hasPermission) {
        Alert.alert(
          t('parentSettings.permissionTitle'),
          t('parentSettings.permissionMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('parentSettings.permissionButton'),
              onPress: async () => {
                await requestWriteSettingsPermission();
                // After opening settings, wait and check if permission was granted
                setTimeout(async () => {
                  const permissionGranted = await checkWriteSettingsPermission();
                  if (permissionGranted && brightnessLocked) {
                    // Re-apply brightness if it was locked
                    const { setBrightness } = require('../utils/brightnessControl');
                    await setBrightness(brightnessValue);
                    Alert.alert(t('alerts.success'), t('parentSettings.permissionSuccess'));
                  }
                }, 2000);
              },
            },
          ]
        );
      }
    }
  };

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
          setVolumeValue(currentVolume);
        } else {
          console.log('[loadSettings] Volume locked, using stored:', settings.volume.volume);
          setVolumeValue(settings.volume.volume);
        }
        setVolumeLocked(settings.volume.locked);
      } else {
        console.log('[loadSettings] No stored volume settings - showing placeholders');
        setVolumeValue(50);
        setVolumeLocked(false);
      }

      const hasPersistedBrightness = !settings.brightness?.isDefault;
      setBrightnessConfigured(hasPersistedBrightness);

      if (hasPersistedBrightness) {
        if (!settings.brightness.locked) {
          console.log('[loadSettings] Brightness unlocked, calling getBrightness()...');
          const currentBrightness = await getBrightness();
          console.log('[loadSettings] Got current brightness:', currentBrightness);
          setBrightnessValue(currentBrightness);
        } else {
          console.log('[loadSettings] Brightness locked, using stored:', settings.brightness.brightness);
          setBrightnessValue(settings.brightness.brightness);
        }
        setBrightnessLocked(settings.brightness.locked);
      } else {
        console.log('[loadSettings] No stored brightness settings - showing placeholders');
        setBrightnessValue(50);
        setBrightnessLocked(false);
      }

      // After loading settings, check and request permission if brightness is locked
      if (hasPersistedBrightness && settings.brightness.locked) {
        checkBrightnessPermission();

        // If permission already exists, reapply brightness to fix any mismatch
        const hasPermission = await checkWriteSettingsPermission();
        if (hasPermission) {
          const { setBrightness } = require('../utils/brightnessControl');
          await setBrightness(settings.brightness.brightness);
          console.log('Reapplied brightness on load');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert(t('alerts.error'), 'Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleVolumeChange = (value) => {
    setVolumeValue(Math.round(value));
  };

  const handleVolumeLockToggle = async () => {
    const newLocked = !volumeLocked;
    setVolumeLocked(newLocked);

    // Save immediately
    setSaving(true);
    
    // If unlocking, load current system volume
    if (!newLocked) {
      const currentVolume = await getVolume();
      setVolumeValue(currentVolume);
    }
    
    const success = await updateVolumeSettings(volumeValue, newLocked);
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

    // First, actually set the device volume
    await setVolume(volumeValue);

    // Then save settings and update monitoring
    const success = await updateVolumeSettings(volumeValue, volumeLocked);
    setSaving(false);

    if (success) {
      setVolumeConfigured(true);
      Alert.alert(t('alerts.success'), t('parentSettings.successVolumeSet', { value: volumeValue }));
    } else {
      Alert.alert(t('alerts.error'), t('parentSettings.errorSave', { setting: t('common.volume') }));
    }
  };

  const handleBrightnessChange = (value) => {
    setBrightnessValue(Math.round(value));
  };

  const handleBrightnessLockToggle = async () => {
    const newLocked = !brightnessLocked;
    setBrightnessLocked(newLocked);

    // Save immediately
    setSaving(true);
    
    // If unlocking, load current system brightness
    if (!newLocked) {
      const currentBrightness = await getBrightness();
      setBrightnessValue(currentBrightness);
    }
    
    const success = await updateBrightnessSettings(brightnessValue, newLocked);
    setSaving(false);

    if (success) {
      setBrightnessConfigured(true);
      Alert.alert(
        t('alerts.success'),
        newLocked
          ? t('parentSettings.successBrightnessLocked', { value: brightnessValue })
          : t('parentSettings.successBrightnessUnlocked')
      );
    } else {
      Alert.alert(t('alerts.error'), t('parentSettings.errorUpdate', { setting: t('common.brightness') }));
      setBrightnessLocked(!newLocked); // Revert on failure
    }
  };

  const handleBrightnessSave = async () => {
    setSaving(true);

    // Import setBrightness dynamically
    const { setBrightness } = require('../utils/brightnessControl');

    // First, actually set the device brightness
    await setBrightness(brightnessValue);

    // Then save settings and update monitoring
    const success = await updateBrightnessSettings(brightnessValue, brightnessLocked);
    setSaving(false);

    if (success) {
      setBrightnessConfigured(true);
      Alert.alert(t('alerts.success'), t('parentSettings.successBrightnessSet', { value: brightnessValue }));
    } else {
      Alert.alert(t('alerts.error'), t('parentSettings.errorSave', { setting: t('common.brightness') }));
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
                  const newValue = Math.max(0, value - 1);
                  onValueChange(newValue);
                }}
                disabled={saving || value <= 0}
              />
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  onChangeText={(text) => {
                    const numValue = parseInt(text) || 0;
                    const clampedValue = Math.min(100, Math.max(0, numValue));
                    onValueChange(clampedValue);
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  editable={!saving}
                  selectTextOnFocus
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
              
              <IconButton
                icon="plus"
                size={24}
                iconColor={theme.colors.primary}
                style={styles.incrementButton}
                onPress={() => {
                  const newValue = Math.min(100, value + 1);
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

        {renderControlCard(
          t('common.brightness'),
          'brightness-6',
          brightnessValue,
          brightnessLocked,
          handleBrightnessChange,
          handleBrightnessLockToggle,
          handleBrightnessSave,
          brightnessConfigured
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
    marginTop: 12,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: theme.colors.text,
    opacity: 0.6,
    marginTop: 5,
  },
  card: {
    marginBottom: 20,
    borderLeftWidth: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  lockSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
  },
  lockLabel: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  controlContainer: {
    marginVertical: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  incrementButton: {
    margin: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    minWidth: 100,
  },
  input: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    paddingVertical: 8,
    minWidth: 60,
  },
  percentSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 5,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  rangeLabel: {
    color: theme.colors.text,
    opacity: 0.6,
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 6,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: statusColors.locked.background,
    borderRadius: 8,
    gap: 5,
  },
  lockedNoticeText: {
    flex: 1,
    color: statusColors.locked.text,
    lineHeight: 18,
  },
  placeholderNotice: {
    marginTop: 12,
    color: theme.colors.text,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  pinCard: {
    marginBottom: 20,
    elevation: 3,
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 5,
  },
  pinTitle: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  changePinButton: {
    paddingVertical: 6,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    elevation: 2,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  warningTitle: {
    fontWeight: '600',
    color: theme.colors.warning,
  },
  warningText: {
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
});
