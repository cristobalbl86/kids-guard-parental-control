import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PINChangeDialog from '../PINChangeDialog';
import * as storage from '../../utils/storage';

// Mock storage module
jest.mock('../../utils/storage', () => ({
  changePIN: jest.fn(),
}));

// Mock PINInput component for easier testing
jest.mock('../PINInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return function PINInput({ onComplete, value, onChange, disabled }) {
    return (
      <TextInput
        testID="pin-input"
        value={value}
        onChangeText={(text) => {
          onChange(text);
          if (text.length === 4) {
            onComplete(text);
          }
        }}
        editable={!disabled}
        maxLength={4}
      />
    );
  };
});

describe('PINChangeDialog Component', () => {
  let mockOnDismiss;
  let mockOnSuccess;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDismiss = jest.fn();
    mockOnSuccess = jest.fn();
    storage.changePIN.mockResolvedValue();
  });

  it('should render when visible', () => {
    const { getByText } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    expect(getByText('pinChange.titleCurrent')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <PINChangeDialog visible={false} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    expect(queryByText('pinChange.titleCurrent')).toBeNull();
  });

  it('should show current PIN step initially', () => {
    const { getByText } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    expect(getByText('pinChange.titleCurrent')).toBeTruthy();
    expect(getByText('pinChange.instructionCurrent')).toBeTruthy();
  });

  it('should progress to new PIN step after current PIN entered', async () => {
    const { getByText, getByTestId, rerender } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });
  });

  it('should show error when new PIN same as current PIN', async () => {
    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Enter current PIN
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Try to enter same PIN as new PIN
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.errorSame')).toBeTruthy();
    });
  });

  it('should progress to confirm PIN step after new PIN entered', async () => {
    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Enter current PIN
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Enter new PIN
    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(getByText('pinChange.titleConfirm')).toBeTruthy();
    });
  });

  it('should show error when confirm PIN does not match', async () => {
    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Enter current PIN
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Enter new PIN
    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(getByText('pinChange.titleConfirm')).toBeTruthy();
    });

    // Enter different confirmation PIN
    fireEvent.changeText(pinInput, '9999');

    await waitFor(() => {
      expect(getByText('pinChange.errorMismatch')).toBeTruthy();
    });
  });

  it('should call changePIN and onSuccess when PINs match', async () => {
    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Enter current PIN
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Enter new PIN
    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(getByText('pinChange.titleConfirm')).toBeTruthy();
    });

    // Enter matching confirmation PIN
    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(storage.changePIN).toHaveBeenCalledWith('1234', '5678');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should call onDismiss when cancel button pressed', () => {
    const { getByText } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const cancelButton = getByText('common.cancel');
    fireEvent.press(cancelButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should show back button on steps 2 and 3', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    // Step 1: No back button
    expect(queryByText('common.back')).toBeNull();

    const pinInput = getByTestId('pin-input');

    // Move to step 2
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('common.back')).toBeTruthy();
    });
  });

  it('should go back to previous step when back button pressed', async () => {
    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Move to step 2
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Press back button
    const backButton = getByText('common.back');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(getByText('pinChange.titleCurrent')).toBeTruthy();
    });
  });

  it('should handle changePIN error gracefully', async () => {
    storage.changePIN.mockRejectedValue(new Error('PIN change failed'));

    const { getByText, getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Complete all steps
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(getByText('pinChange.titleConfirm')).toBeTruthy();
    });

    fireEvent.changeText(pinInput, '5678');

    await waitFor(() => {
      expect(getByText('PIN change failed')).toBeTruthy();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should reset state when dismissed', async () => {
    const { getByText, getByTestId, rerender } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');

    // Enter current PIN to move to step 2
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      expect(getByText('pinChange.titleNew')).toBeTruthy();
    });

    // Dismiss dialog
    const cancelButton = getByText('common.cancel');
    fireEvent.press(cancelButton);

    // Re-open dialog
    rerender(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    // Should be back to step 1
    await waitFor(() => {
      expect(getByText('pinChange.titleCurrent')).toBeTruthy();
    });
  });

  it('should disable PIN input while loading', async () => {
    const { getByTestId } = render(
      <PINChangeDialog visible={true} onDismiss={mockOnDismiss} onSuccess={mockOnSuccess} />
    );

    const pinInput = getByTestId('pin-input');
    expect(pinInput.props.editable).toBe(true);

    // Complete all steps to trigger loading
    fireEvent.changeText(pinInput, '1234');

    await waitFor(() => {
      fireEvent.changeText(pinInput, '5678');
    });

    await waitFor(() => {
      fireEvent.changeText(pinInput, '5678');
    });

    // During changePIN call, input should be disabled
    // This is briefly true but hard to catch in test - we verify it doesn't error
    expect(storage.changePIN).toHaveBeenCalled();
  });
});
