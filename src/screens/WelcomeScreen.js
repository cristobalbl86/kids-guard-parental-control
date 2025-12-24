import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { theme } from '../utils/theme';
import { t } from '../utils/i18n';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Surface style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          {t('welcome.title')}
        </Text>

        <Text variant="bodyLarge" style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>

        <View style={styles.questionContainer}>
          <Text variant="headlineMedium" style={styles.question}>
            {t('welcome.question')}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ParentVerification')}
              style={styles.yesButton}
              labelStyle={styles.buttonLabel}
            >
              {t('common.yes')}
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                // Child selected - show message
                alert(t('welcome.childAlert'));
              }}
              style={styles.noButton}
              labelStyle={styles.buttonLabel}
            >
              {t('common.no')}
            </Button>
          </View>
        </View>

        <Text variant="bodySmall" style={styles.footer}>
          {t('welcome.footer')}
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
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 40,
    opacity: 0.7,
  },
  questionContainer: {
    marginVertical: 20,
  },
  question: {
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 30,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 15,
  },
  yesButton: {
    paddingVertical: 8,
  },
  noButton: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: 30,
    opacity: 0.6,
  },
});
