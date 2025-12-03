/**
 * Button Component Tests
 * Tests for premium button component with liquid effects
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button Component - Premium Design', () => {
  describe('Rendering', () => {
    it('should render button with default variant', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn-premium');
    });

    it('should render button with liquid variant', () => {
      render(<Button variant="liquid">Liquid Button</Button>);
      const button = screen.getByRole('button', { name: /liquid button/i });
      expect(button).toHaveClass('btn-liquid-interactive');
    });

    it('should render button with outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button', { name: /outline button/i });
      expect(button).toHaveClass('glass-ultra');
    });

    it('should render button with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should have focus ring for accessibility', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-ring-glow');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should support keyboard navigation', async () => {
      render(<Button>Keyboard</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      await userEvent.keyboard('{Enter}');
      // Button should be focusable and keyboard accessible
      expect(button).toBeInTheDocument();
    });
  });

  describe('Premium Design Classes', () => {
    it('should have premium transition classes', () => {
      render(<Button>Premium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-300');
    });

    it('should have overflow hidden for liquid effects', () => {
      render(<Button variant="liquid">Liquid</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('overflow-hidden');
    });
  });
});


