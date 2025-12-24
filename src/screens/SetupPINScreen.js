import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Surface, HelperText } from 'react-native-paper';
import { theme } from '../utils/theme';
import { savePIN, completeFirstLaunch } from '../utils/storage';
import PINInput from '../components/PINInput';
import { t } from '../utils/i18n';

export default function SetupPINScreen({ navigation, onSetupComplete }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = enter PIN, 2 = confirm PIN
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinComplete = async (enteredPin) => {
    if (step === 1) {
      // First PIN entry
      if (enteredPin.length === 4) {
        setPin(enteredPin);
        setStep(2);
        setError('');
      }
    } else {
      // Confirmation step
      if (enteredPin === pin) {
        // PINs match - save and complete setup
        setLoading(true);
        try {
          await savePIN(pin);
          await completeFirstLaunch();

          // Call the setup complete callback
          if (onSetupComplete) {
            onSetupComplete();
          }
        } catch (error) {
          setError(t('setupPIN.errorSave'));
          setLoading(false);
        }
      } else {
        // PINs don't match
        setError(t('setupPIN.errorMismatch'));
        setConfirmPin('');
        setTimeout(() => {
          setStep(1);
          setPin('');
          setError('');
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    setStep(1);
    setPin('');
    setConfirmPin('');
    setError('');
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {step === 1 ? t('setupPIN.titleCreate') : t('setupPIN.titleConfirm')}
        </Text>

        <Text variant="bodyMedium" style={styles.instruction}>
          {step === 1
            ? t('setupPIN.instructionCreate')
            : t('setupPIN.instructionConfirm')}
        </Text>

        <View style={styles.pinContainer}>
          <PINInput
            length={4}
            onComplete={handlePinComplete}
            value={step === 1 ? pin : confirmPin}
            onChange={step === 1 ? setPin : setConfirmPin}
            disabled={loading}
          />
        </View>

        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>

        {step === 2 && !error && (
          <Button
            mode="text"
            onPress={handleReset}
            style={styles.resetButton}
            disabled={loading}
          >
            {t('setupPIN.startOver')}
          </Button>
        )}

        <View style={styles.tips}>
          <Text variant="bodySmall" style={styles.tipsTitle}>
            {t('setupPIN.tipsTitle')}
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • {t('setupPIN.tip1')}
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • {t('setupPIN.tip2')}
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • {t('setupPIN.tip3')}
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
  resetButton: {
    marginTop: 10,
  },
  tips: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  tipsTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tipText: {
    color: theme.colors.text,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 4,
  },
});
