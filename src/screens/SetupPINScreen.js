import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Surface, HelperText } from 'react-native-paper';
import { theme } from '../utils/theme';
import { savePIN, completeFirstLaunch } from '../utils/storage';
import PINInput from '../components/PINInput';

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
          setError('Failed to save PIN. Please try again.');
          setLoading(false);
        }
      } else {
        // PINs don't match
        setError('PINs do not match. Please try again.');
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
          {step === 1 ? 'Set Your PIN' : 'Confirm Your PIN'}
        </Text>

        <Text variant="bodyMedium" style={styles.instruction}>
          {step === 1
            ? 'Create a 4-digit PIN to protect parent settings'
            : 'Re-enter your PIN to confirm'}
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
            Start Over
          </Button>
        )}

        <View style={styles.tips}>
          <Text variant="bodySmall" style={styles.tipsTitle}>
            PIN Tips:
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Choose a PIN that's easy for you to remember
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Don't use obvious combinations like 1234 or 0000
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Keep your PIN secure and don't share it
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
