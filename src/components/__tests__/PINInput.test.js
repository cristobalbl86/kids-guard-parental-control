import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PINInput from '../PINInput';

describe('PINInput Component', () => {
  let mockOnChange;
  let mockOnComplete;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange = jest.fn();
    mockOnComplete = jest.fn();
  });

  it('should render PINInput component', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    // Component should render with TextInput
    const textInput = getByDisplayValue('');
    expect(textInput).toBeTruthy();
  });

  it('should call onChange when text input changes', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, '12');

    expect(mockOnChange).toHaveBeenCalledWith('12');
  });

  it('should call onComplete when PIN reaches specified length', () => {
    const { rerender } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    rerender(
      <PINInput length={4} value="1234" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    expect(mockOnComplete).toHaveBeenCalledWith('1234');
  });

  it('should filter out non-numeric characters', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, '12ab34');

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('should limit input to specified length', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, '123456789');

    expect(mockOnChange).toHaveBeenCalledWith('1234');
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} disabled={true} />
    );

    const textInput = getByDisplayValue('');
    expect(textInput.props.editable).toBe(false);
  });

  it('should be enabled when disabled prop is false', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} disabled={false} />
    );

    const textInput = getByDisplayValue('');
    expect(textInput.props.editable).toBe(true);
  });

  it('should display value correctly', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="12" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('12');
    expect(textInput.props.value).toBe('12');
  });

  it('should handle empty value', () => {
    const { getByDisplayValue } = render(
      <PINInput length={4} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    expect(textInput.props.value).toBe('');
  });

  it('should use default length of 4 if not specified', () => {
    const { getByDisplayValue } = render(
      <PINInput value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    expect(textInput.props.maxLength).toBe(4);
  });

  it('should handle custom PIN lengths', () => {
    const { getByDisplayValue } = render(
      <PINInput length={6} value="" onChange={mockOnChange} onComplete={mockOnComplete} />
    );

    const textInput = getByDisplayValue('');
    expect(textInput.props.maxLength).toBe(6);
  });
});
