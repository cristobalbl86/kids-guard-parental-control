import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Surface, HelperText } from 'react-native-paper';
import { theme } from '../utils/theme';
import { verifyPIN } from '../utils/storage';
import PINInput from '../components/PINInput';
import { t } from '../utils/i18n';

export default function PINEntryScreen({ navigation, route }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { nextScreen } = route.params || {};

  const handlePinComplete = async (enteredPin) => {
    setLoading(true);
    setError('');

    try {
      const isValid = await verifyPIN(enteredPin);

      if (isValid) {
        // PIN is correct - navigate to the next screen or go back
        if (nextScreen) {
          navigation.replace(nextScreen);
        } else {
          navigation.goBack();
        }
      } else {
        // PIN is incorrect
        setError(t('pinEntry.errorIncorrect'));
        setPin('');
        setLoading(false);
      }
    } catch (error) {
      setError(error.message || t('pinEntry.errorGeneric'));
      setPin('');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('pinEntry.title')}
        </Text>

        <Text variant="bodyMedium" style={styles.instruction}>
          {t('pinEntry.instruction')}
        </Text>

        <View style={styles.pinContainer}>
          <PINInput
            length={4}
            onComplete={handlePinComplete}
            value={pin}
            onChange={setPin}
            disabled={loading}
          />
        </View>

        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>

        <Button
          mode="text"
          onPress={handleCancel}
          style={styles.cancelButton}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>

        <View style={styles.helpContainer}>
          <Text variant="bodySmall" style={styles.helpText}>
            {t('pinEntry.helpText')}
          </Text>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: theme.colors.surface,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  instruction: {
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 40,
    lineHeight: 22,
  },
  pinContainer: {
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 20,
  },
  helpContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  helpText: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.6,
    lineHeight: 18,
  },
});
