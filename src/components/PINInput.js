import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Surface } from 'react-native-paper';
import { theme } from '../utils/theme';

export default function PINInput({ length = 4, value = '', onChange, onComplete, disabled = false }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus on mount
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (text) => {
    // Only allow digits
    const digitsOnly = text.replace(/[^0-9]/g, '');
    // Limit to specified length
    const limited = digitsOnly.slice(0, length);
    onChange(limited);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length }).map((_, index) => (
          <Surface
            key={index}
            style={[
              styles.dot,
              value.length > index && styles.dotFilled,
            ]}
          >
            {value.length > index && (
              <View style={styles.dotInner} />
            )}
          </Surface>
        ))}
      </View>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        secureTextEntry={false}
        autoFocus={!disabled}
        editable={!disabled}
        caretHidden={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  dot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
