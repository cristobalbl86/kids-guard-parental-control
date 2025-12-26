import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  let mockNavigation;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    };

    // Mock global alert
    global.alert = jest.fn();
  });

  it('should render correctly', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    expect(getByText('welcome.title')).toBeTruthy();
    expect(getByText('welcome.subtitle')).toBeTruthy();
    expect(getByText('welcome.question')).toBeTruthy();
  });

  it('should display Yes and No buttons', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    expect(getByText('common.yes')).toBeTruthy();
    expect(getByText('common.no')).toBeTruthy();
  });

  it('should navigate to ParentVerification when Yes button pressed', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    const yesButton = getByText('common.yes');
    fireEvent.press(yesButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ParentVerification');
  });

  it('should show alert when No button pressed', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    const noButton = getByText('common.no');
    fireEvent.press(noButton);

    expect(global.alert).toHaveBeenCalledWith('welcome.childAlert');
  });

  it('should display footer text', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    expect(getByText('welcome.footer')).toBeTruthy();
  });
});
