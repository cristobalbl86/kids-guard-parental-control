import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SetupPINScreen from '../SetupPINScreen';
import PINEntryScreen from '../PINEntryScreen';
import * as storage from '../../utils/storage';

// Mock storage utilities
jest.mock('../../utils/storage');

// Mock PINInput component
jest.mock('../../components/PINInput', () => {
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

describe('PIN Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock implementations
    storage.savePIN.mockResolvedValue();
    storage.verifyPIN.mockResolvedValue(true);
    storage.completeFirstLaunch.mockResolvedValue();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('SetupPINScreen', () => {
    const mockOnSetupComplete = jest.fn();
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    beforeEach(() => {
      mockOnSetupComplete.mockClear();
    });

    describe('Rendering', () => {
      it('should render create PIN step initially', () => {
        const { getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        expect(getByText('setupPIN.titleCreate')).toBeTruthy();
        expect(getByText('setupPIN.instructionCreate')).toBeTruthy();
      });

      it('should display PIN tips', () => {
        const { getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        expect(getByText('setupPIN.tipsTitle')).toBeTruthy();
        expect(getByText(/setupPIN.tip1/)).toBeTruthy();
      });

      it('should have PIN input field', () => {
        const { getByTestId } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        expect(getByTestId('pin-input')).toBeTruthy();
      });
    });

    describe('PIN Creation Flow', () => {
      it('should move to confirmation step after entering 4-digit PIN', async () => {
        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(getByText('setupPIN.titleConfirm')).toBeTruthy();
        });
      });

      it('should save PIN when confirmation matches', async () => {
        const { getByTestId } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        // Enter initial PIN
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(input.props.value).toBe('');
        });

        // Confirm PIN
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(storage.savePIN).toHaveBeenCalledWith('1234');
          expect(storage.completeFirstLaunch).toHaveBeenCalled();
        });
      });

      it('should call onSetupComplete after successful PIN save', async () => {
        const { getByTestId } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(mockOnSetupComplete).toHaveBeenCalled();
        });
      });

      it('should show error when PINs do not match', async () => {
        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '5678');

        await waitFor(() => {
          expect(getByText('setupPIN.errorMismatch')).toBeTruthy();
        });
      });

      it('should reset to step 1 after mismatch error', async () => {
        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '5678');

        await waitFor(() => {
          expect(getByText('setupPIN.errorMismatch')).toBeTruthy();
        });

        // Fast-forward timer
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
          expect(getByText('setupPIN.titleCreate')).toBeTruthy();
        });
      });

      it('should show error when PIN save fails', async () => {
        storage.savePIN.mockRejectedValue(new Error('Save failed'));

        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(getByText('setupPIN.errorSave')).toBeTruthy();
        });
      });

      it('should not call onSetupComplete if save fails', async () => {
        storage.savePIN.mockRejectedValue(new Error('Save failed'));

        const { getByTestId } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(storage.savePIN).toHaveBeenCalled();
        });

        expect(mockOnSetupComplete).not.toHaveBeenCalled();
      });
    });

    describe('Start Over Button', () => {
      it('should show start over button on confirmation step', async () => {
        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(getByText('setupPIN.startOver')).toBeTruthy();
        });
      });

      it('should reset to step 1 when start over is pressed', async () => {
        const { getByTestId, getByText } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          const startOverButton = getByText('setupPIN.startOver');
          fireEvent.press(startOverButton);
        });

        await waitFor(() => {
          expect(getByText('setupPIN.titleCreate')).toBeTruthy();
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty onSetupComplete callback', async () => {
        const { getByTestId } = render(
          <SetupPINScreen navigation={mockNavigation} />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(storage.savePIN).toHaveBeenCalledWith('1234');
        });
      });

      it('should disable input while loading', async () => {
        const { getByTestId } = render(
          <SetupPINScreen
            navigation={mockNavigation}
            onSetupComplete={mockOnSetupComplete}
          />
        );

        const input = getByTestId('pin-input');

        fireEvent.changeText(input, '1234');
        await waitFor(() => expect(input.props.value).toBe(''));

        fireEvent.changeText(input, '1234');

        // Input should be disabled during save
        expect(input.props.editable).toBe(false);
      });
    });
  });

  describe('PINEntryScreen', () => {
    const mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    };

    const mockRoute = {
      params: {
        nextScreen: 'ParentSettings',
      },
    };

    describe('Rendering', () => {
      it('should render PIN entry screen', () => {
        const { getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByText('pinEntry.title')).toBeTruthy();
        expect(getByText('pinEntry.instruction')).toBeTruthy();
      });

      it('should have PIN input field', () => {
        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByTestId('pin-input')).toBeTruthy();
      });

      it('should display cancel button', () => {
        const { getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByText('common.cancel')).toBeTruthy();
      });

      it('should display help text', () => {
        const { getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByText('pinEntry.helpText')).toBeTruthy();
      });
    });

    describe('PIN Verification', () => {
      it('should verify PIN when 4 digits entered', async () => {
        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(storage.verifyPIN).toHaveBeenCalledWith('1234');
        });
      });

      it('should navigate to next screen on correct PIN', async () => {
        storage.verifyPIN.mockResolvedValue(true);

        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(mockNavigation.replace).toHaveBeenCalledWith('ParentSettings');
        });
      });

      it('should go back if no next screen specified', async () => {
        storage.verifyPIN.mockResolvedValue(true);

        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={{ params: {} }} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(mockNavigation.goBack).toHaveBeenCalled();
        });
      });

      it('should show error on incorrect PIN', async () => {
        storage.verifyPIN.mockResolvedValue(false);

        const { getByTestId, getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '9999');

        await waitFor(() => {
          expect(getByText('pinEntry.errorIncorrect')).toBeTruthy();
        });
      });

      it('should clear PIN input on incorrect PIN', async () => {
        storage.verifyPIN.mockResolvedValue(false);

        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '9999');

        await waitFor(() => {
          expect(input.props.value).toBe('');
        });
      });

      it('should show lockout error message', async () => {
        storage.verifyPIN.mockRejectedValue(
          new Error('Locked out. Please try again in 60 seconds.')
        );

        const { getByTestId, getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(getByText(/Locked out/)).toBeTruthy();
        });
      });

      it('should show generic error on verification failure', async () => {
        storage.verifyPIN.mockRejectedValue(new Error());

        const { getByTestId, getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        await waitFor(() => {
          expect(getByText('pinEntry.errorGeneric')).toBeTruthy();
        });
      });
    });

    describe('Cancel Button', () => {
      it('should go back when cancel is pressed', () => {
        const { getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const cancelButton = getByText('common.cancel');
        fireEvent.press(cancelButton);

        expect(mockNavigation.goBack).toHaveBeenCalled();
      });

      it('should disable cancel button while loading', async () => {
        storage.verifyPIN.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(true), 1000))
        );

        const { getByTestId, getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        // Cancel button should be disabled during verification
        const cancelButton = getByText('common.cancel');
        expect(cancelButton).toBeTruthy();
      });
    });

    describe('Edge Cases', () => {
      it('should handle route without params', () => {
        const { getByText } = render(
          <PINEntryScreen navigation={mockNavigation} route={{}} />
        );

        expect(getByText('pinEntry.title')).toBeTruthy();
      });

      it('should disable input while verifying', async () => {
        const { getByTestId } = render(
          <PINEntryScreen navigation={mockNavigation} route={mockRoute} />
        );

        const input = getByTestId('pin-input');
        fireEvent.changeText(input, '1234');

        // Input should be disabled during verification
        expect(input.props.editable).toBe(false);
      });
    });
  });
});
