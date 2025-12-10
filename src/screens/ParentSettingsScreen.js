import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Text, Card, Switch, IconButton, Divider } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { theme, statusColors } from '../utils/theme';
import { getAllSettings, changePIN } from '../utils/storage';
import { updateVolumeSettings, getVolume } from '../utils/volumeControl';
import { updateBrightnessSettings, getBrightness, checkWriteSettingsPermission, requestWriteSettingsPermission } from '../utils/brightnessControl';
import PINChangeDialog from '../components/PINChangeDialog';

export default function ParentSettingsScreen({ navigation }) {
  const [volumeValue, setVolumeValue] = useState(50);
  const [volumeLocked, setVolumeLocked] = useState(false);
  const [brightnessValue, setBrightnessValue] = useState(50);
  const [brightnessLocked, setBrightnessLocked] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBrightnessPermission();
  }, []);

  const checkBrightnessPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await checkWriteSettingsPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'To control system brightness, this app needs permission to modify system settings. Please grant this permission in the next screen.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                await requestWriteSettingsPermission();
              },
            },
          ]
        );
      }
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await getAllSettings();
      
      // If unlocked, load current system values
      if (!settings.volume.locked) {
        const currentVolume = await getVolume();
        setVolumeValue(currentVolume);
      } else {
        setVolumeValue(settings.volume.volume);
      }
      setVolumeLocked(settings.volume.locked);
      
      if (!settings.brightness.locked) {
        const currentBrightness = await getBrightness();
        setBrightnessValue(currentBrightness);
      } else {
        setBrightnessValue(settings.brightness.brightness);
      }
      setBrightnessLocked(settings.brightness.locked);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
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
      Alert.alert(
        'Success',
        newLocked
          ? `Volume locked at ${volumeValue}%`
          : 'Volume unlocked - child can adjust freely'
      );
    } else {
      Alert.alert('Error', 'Failed to update volume settings');
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
      Alert.alert('Success', `Volume set to ${volumeValue}%`);
    } else {
      Alert.alert('Error', 'Failed to save volume setting');
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
      Alert.alert(
        'Success',
        newLocked
          ? `Brightness locked at ${brightnessValue}%`
          : 'Brightness unlocked - child can adjust freely'
      );
    } else {
      Alert.alert('Error', 'Failed to update brightness settings');
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
      Alert.alert('Success', `Brightness set to ${brightnessValue}%`);
    } else {
      Alert.alert('Error', 'Failed to save brightness setting');
    }
  };

  const handleChangePIN = () => {
    setShowPINDialog(true);
  };

  const handlePINChanged = () => {
    setShowPINDialog(false);
    Alert.alert('Success', 'PIN changed successfully');
  };

  const renderControlCard = (
    title,
    icon,
    value,
    locked,
    onValueChange,
    onLockToggle,
    onSave
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
                {locked ? 'Locked' : 'Unlocked'}
              </Text>
              <Switch
                value={locked}
                onValueChange={onLockToggle}
                color={statusStyle.icon}
                disabled={saving}
              />
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text variant="displayMedium" style={styles.valueDisplay}>
              {value}%
            </Text>

            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={value}
                onValueChange={onValueChange}
                onSlidingComplete={onValueChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.disabled}
                thumbTintColor={theme.colors.primary}
                disabled={saving}
              />
            </View>

            <View style={styles.sliderLabels}>
              <Text variant="bodySmall" style={styles.sliderLabel}>
                0%
              </Text>
              <Text variant="bodySmall" style={styles.sliderLabel}>
                100%
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
            Apply {title}
          </Button>

          {locked && (
            <View style={styles.lockedNotice}>
              <IconButton icon="information" size={16} iconColor={statusStyle.icon} />
              <Text variant="bodySmall" style={styles.lockedNoticeText}>
                This setting is locked. Children cannot change it.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Parental Controls
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Manage device settings for your child
          </Text>
        </View>

        {renderControlCard(
          'Volume',
          'volume-high',
          volumeValue,
          volumeLocked,
          handleVolumeChange,
          handleVolumeLockToggle,
          handleVolumeSave
        )}

        {renderControlCard(
          'Brightness',
          'brightness-6',
          brightnessValue,
          brightnessLocked,
          handleBrightnessChange,
          handleBrightnessLockToggle,
          handleBrightnessSave
        )}

        <Card style={styles.pinCard}>
          <Card.Content>
            <View style={styles.pinHeader}>
              <IconButton icon="lock-reset" size={24} iconColor={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.pinTitle}>
                Security
              </Text>
            </View>

            <Button
              mode="outlined"
              onPress={handleChangePIN}
              icon="key-change"
              style={styles.changePinButton}
            >
              Change PIN
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.warningCard}>
          <Card.Content>
            <View style={styles.warningHeader}>
              <IconButton icon="alert" size={24} iconColor={theme.colors.warning} />
              <Text variant="titleMedium" style={styles.warningTitle}>
                Important Notes
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.warningText}>
              • Locked settings will be enforced while the app runs
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • Children may still change settings through device controls
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • The app will attempt to restore your settings when changes are detected
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              • For best results, keep the app running in the background
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
  sliderContainer: {
    marginVertical: 20,
  },
  valueDisplay: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sliderWrapper: {
    width: '100%',
    paddingHorizontal: Platform.OS === 'ios' ? 0 : 5,
    marginVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
    minHeight: 40,
    opacity: 1,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
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
