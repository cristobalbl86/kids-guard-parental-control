import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text, HelperText } from 'react-native-paper';
import { theme } from '../utils/theme';
import { changePIN } from '../utils/storage';
import PINInput from './PINInput';

export default function PINChangeDialog({ visible, onDismiss, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = current PIN, 2 = new PIN, 3 = confirm new PIN
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setStep(1);
    setCurrentPIN('');
    setNewPIN('');
    setConfirmPIN('');
    setError('');
    setLoading(false);
  };

  const handleDismiss = () => {
    handleReset();
    onDismiss();
  };

  const handlePINComplete = async (enteredPIN) => {
    setError('');

    if (step === 1) {
      // Current PIN entered
      setCurrentPIN(enteredPIN);
      setStep(2);
    } else if (step === 2) {
      // New PIN entered
      if (enteredPIN === currentPIN) {
        setError('New PIN must be different from current PIN');
        setNewPIN('');
        return;
      }
      setNewPIN(enteredPIN);
      setStep(3);
    } else if (step === 3) {
      // Confirm new PIN
      if (enteredPIN !== newPIN) {
        setError('PINs do not match');
        setConfirmPIN('');
        setTimeout(() => {
          setStep(2);
          setNewPIN('');
          setError('');
        }, 2000);
        return;
      }

      // All steps complete - change PIN
      setLoading(true);
      try {
        await changePIN(currentPIN, newPIN);
        onSuccess();
        handleReset();
      } catch (error) {
        setError(error.message || 'Failed to change PIN');
        setLoading(false);
        setTimeout(() => {
          handleReset();
        }, 2000);
      }
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1:
        return 'Enter Current PIN';
      case 2:
        return 'Enter New PIN';
      case 3:
        return 'Confirm New PIN';
      default:
        return '';
    }
  };

  const getInstruction = () => {
    switch (step) {
      case 1:
        return 'Enter your current PIN to continue';
      case 2:
        return 'Enter a new 4-digit PIN';
      case 3:
        return 'Re-enter your new PIN to confirm';
      default:
        return '';
    }
  };

  const getCurrentValue = () => {
    switch (step) {
      case 1:
        return currentPIN;
      case 2:
        return newPIN;
      case 3:
        return confirmPIN;
      default:
        return '';
    }
  };

  const getCurrentOnChange = () => {
    switch (step) {
      case 1:
        return setCurrentPIN;
      case 2:
        return setNewPIN;
      case 3:
        return setConfirmPIN;
      default:
        return () => {};
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} dismissable={!loading}>
        <Dialog.Title>{getTitle()}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.instruction}>
            {getInstruction()}
          </Text>

          <View style={styles.pinContainer}>
            <PINInput
              length={4}
              onComplete={handlePINComplete}
              value={getCurrentValue()}
              onChange={getCurrentOnChange()}
              disabled={loading}
            />
          </View>

          <HelperText type="error" visible={!!error} style={styles.error}>
            {error}
          </HelperText>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss} disabled={loading}>
            Cancel
          </Button>
          {step > 1 && (
            <Button
              onPress={() => {
                setStep(step - 1);
                setError('');
              }}
              disabled={loading}
            >
              Back
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  instruction: {
    textAlign: 'center',
    marginBottom: 30,
    color: theme.colors.text,
  },
  pinContainer: {
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.disabled,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
});
