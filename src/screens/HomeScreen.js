import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import { theme, statusColors } from '../utils/theme';
import { getAllSettings } from '../utils/storage';
import { initializeVolumeControl, isVolumeMonitoring } from '../utils/volumeControl';
import { initializeBrightnessControl, isBrightnessMonitoring } from '../utils/brightnessControl';

export default function HomeScreen({ navigation }) {
  const [settings, setSettings] = useState({
    volume: { volume: 50, locked: false },
    brightness: { brightness: 50, locked: false },
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
    initializeControls();
  }, []);

  const initializeControls = async () => {
    await initializeVolumeControl();
    await initializeBrightnessControl();
  };

  const loadSettings = async () => {
    try {
      const allSettings = await getAllSettings();
      setSettings(allSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleOpenSettings = () => {
    navigation.navigate('PINEntry', {
      nextScreen: 'ParentSettings',
    });
  };

  const renderStatusCard = (title, icon, isLocked, value, unit) => {
    const statusStyle = isLocked ? statusColors.locked : statusColors.unlocked;

    return (
      <Card style={[styles.card, { borderLeftColor: statusStyle.border }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <IconButton
                icon={icon}
                size={28}
                iconColor={statusStyle.icon}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                {title}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
              <IconButton
                icon={isLocked ? 'lock' : 'lock-open'}
                size={16}
                iconColor={statusStyle.icon}
              />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {isLocked ? 'Locked' : 'Unlocked'}
              </Text>
            </View>
          </View>

          <View style={styles.valueContainer}>
            <Text variant="displaySmall" style={styles.value}>
              {value}
            </Text>
            <Text variant="titleMedium" style={styles.unit}>
              {unit}
            </Text>
          </View>

          {isLocked && (
            <Text variant="bodySmall" style={styles.lockedMessage}>
              This setting is controlled by a parent
            </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Device Settings Status
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Pull down to refresh
          </Text>
        </View>

        {renderStatusCard(
          'Volume',
          'volume-high',
          settings.volume.locked,
          settings.volume.volume,
          '%'
        )}

        {renderStatusCard(
          'Brightness',
          'brightness-6',
          settings.brightness.locked,
          settings.brightness.brightness,
          '%'
        )}

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <IconButton icon="information" size={24} iconColor={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.infoTitle}>
                About This App
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.infoText}>
              This app helps parents manage device settings. When a setting is locked,
              only a parent with the PIN can change it.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleOpenSettings}
          style={styles.settingsButton}
          icon="cog"
        >
          Parent Settings
        </Button>
      </View>
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
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardTitle: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    gap: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  value: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  unit: {
    color: theme.colors.text,
    opacity: 0.6,
  },
  lockedMessage: {
    marginTop: 10,
    color: theme.colors.text,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  infoCard: {
    marginTop: 10,
    backgroundColor: '#E3F2FD',
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  infoTitle: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoText: {
    color: theme.colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled,
    elevation: 8,
  },
  settingsButton: {
    paddingVertical: 8,
  },
});
