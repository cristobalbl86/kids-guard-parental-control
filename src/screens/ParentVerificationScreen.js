import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Button, Text, Surface, HelperText } from 'react-native-paper';
import { theme } from '../utils/theme';
import { t } from '../utils/i18n';

export default function ParentVerificationScreen({ navigation }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    console.log('[ParentVerification] Screen mounted');
    generateProblem();
  }, []);

  const generateProblem = () => {
    // Generate a simple arithmetic problem
    const n1 = Math.floor(Math.random() * 20) + 5; // 5-24
    const n2 = Math.floor(Math.random() * 20) + 5; // 5-24
    setNum1(n1);
    setNum2(n2);
    setAnswer('');
    setError('');
  };

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    const userAnswer = parseInt(answer);

    if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
      setAttempts(attempts + 1);
      setError(t('parentVerification.errorIncorrect'));

      if (attempts >= 2) {
        // After 3 failed attempts, generate a new problem
        setTimeout(() => {
          generateProblem();
          setAttempts(0);
        }, 1500);
      }
      return;
    }

    // Correct answer - proceed to PIN setup
    navigation.navigate('SetupPIN');
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('parentVerification.title')}
        </Text>

        <Text variant="bodyMedium" style={styles.instruction}>
          {t('parentVerification.instruction')}
        </Text>

        <View style={styles.problemContainer}>
          <Text variant="displaySmall" style={styles.problem}>
            {t('parentVerification.mathProblem', { num1, num2 })}
          </Text>
        </View>

        <RNTextInput
          placeholder={t('parentVerification.answerLabel')}
          value={answer}
          onChangeText={(text) => {
            console.log('[ParentVerification] onChangeText:', text);
            setAnswer(text);
          }}
          onFocus={() => console.log('[ParentVerification] TextInput onFocus')}
          onBlur={() => console.log('[ParentVerification] TextInput onBlur')}
          onPressIn={() => console.log('[ParentVerification] TextInput onPressIn')}
          onPressOut={() => console.log('[ParentVerification] TextInput onPressOut')}
          keyboardType="number-pad"
          style={[styles.input, error && styles.inputError]}
          maxLength={3}
          placeholderTextColor={theme.colors.placeholder || '#999'}
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleVerify}
          style={styles.button}
          disabled={!answer}
        >
          {t('common.verify')}
        </Button>

        <Button
          mode="text"
          onPress={generateProblem}
          style={styles.newProblemButton}
        >
          {t('parentVerification.newProblemButton')}
        </Button>

        <Text variant="bodySmall" style={styles.note}>
          {t('parentVerification.note')}
        </Text>
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
    marginBottom: 20,
    fontWeight: 'bold',
  },
  instruction: {
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 30,
    lineHeight: 22,
  },
  problemContainer: {
    backgroundColor: theme.colors.background,
    padding: 30,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  problem: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: theme.colors.outline || '#ccc',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    textAlign: 'center',
  },
  inputError: {
    borderColor: theme.colors.error || '#d32f2f',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  newProblemButton: {
    marginTop: 10,
  },
  note: {
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: 20,
    opacity: 0.6,
    lineHeight: 18,
  },
});
