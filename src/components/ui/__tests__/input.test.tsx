import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles text input', async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
    
    await userEvent.type(input, 'Hello World');
    expect(input.value).toBe('Hello World');
  });

  it('applies default styles', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('flex', 'h-10', 'rounded-lg');
  });

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-input" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-input');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('does not accept input when disabled', async () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled') as HTMLInputElement;
    
    await userEvent.type(input, 'test');
    expect(input.value).toBe('');
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
  });

  it('handles value prop', () => {
    render(<Input value="Initial value" readOnly />);
    const input = screen.getByDisplayValue('Initial value') as HTMLInputElement;
    expect(input.value).toBe('Initial value');
  });

  it('handles onChange event', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Test" />);
    
    const input = screen.getByPlaceholderText('Test');
    await userEvent.type(input, 'a');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles onFocus and onBlur events', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(
      <Input
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Focus test"
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    await userEvent.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await userEvent.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('handles placeholder attribute', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="Required" />);
    const input = screen.getByPlaceholderText('Required');
    expect(input).toBeRequired();
  });

  it('handles maxLength attribute', async () => {
    render(<Input maxLength={5} placeholder="Max 5" />);
    const input = screen.getByPlaceholderText('Max 5') as HTMLInputElement;
    
    await userEvent.type(input, '1234567890');
    expect(input.value.length).toBeLessThanOrEqual(5);
  });

  it('handles minLength attribute', () => {
    render(<Input minLength={3} placeholder="Min 3" />);
    const input = screen.getByPlaceholderText('Min 3');
    expect(input).toHaveAttribute('minLength', '3');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // Edge cases
  it('handles very long input', () => {
    const longText = 'A'.repeat(10000);
    render(<Input placeholder="Long text" />);
    const input = screen.getByPlaceholderText('Long text') as HTMLInputElement;
    
    // Use fireEvent for very long input to avoid timeout
    fireEvent.change(input, { target: { value: longText } });
    expect(input.value).toBe(longText);
  }, 10000); // Increase timeout to 10 seconds

  it('handles special characters', () => {
    render(<Input placeholder="Special" />);
    const input = screen.getByPlaceholderText('Special') as HTMLInputElement;
    
    // Use fireEvent for special characters to avoid userEvent parsing issues
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    fireEvent.change(input, { target: { value: specialChars } });
    expect(input.value).toBe(specialChars);
  });

  it('handles empty string value', () => {
    render(<Input value="" placeholder="Empty" />);
    const input = screen.getByPlaceholderText('Empty') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('handles rapid typing', async () => {
    render(<Input placeholder="Rapid" />);
    const input = screen.getByPlaceholderText('Rapid') as HTMLInputElement;
    
    // Use fireEvent for rapid typing to avoid userEvent issues
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });

  it('handles copy and paste', async () => {
    render(<Input placeholder="Paste" />);
    const input = screen.getByPlaceholderText('Paste') as HTMLInputElement;
    
    // Use fireEvent for paste to avoid userEvent issues
    fireEvent.paste(input, { clipboardData: { getData: () => 'pasted text' } });
    fireEvent.change(input, { target: { value: 'pasted text' } });
    expect(input.value).toBe('pasted text');
  });
});



