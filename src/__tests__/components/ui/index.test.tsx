/**
 * UI Components Integration Tests
 * Tests for premium design system components working together
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

describe('Premium Design System - Integration', () => {
  describe('Card with Button', () => {
    it('should render card with button inside', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Action</Button>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should maintain styling when combined', () => {
      const { container } = render(
        <Card className="card-premium">
          <CardContent>
            <Button variant="liquid">Liquid Button</Button>
          </CardContent>
        </Card>
      );

      const card = container.querySelector('.card-premium');
      const button = screen.getByRole('button');
      
      expect(card).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });

  describe('Multiple Cards', () => {
    it('should render multiple premium cards', () => {
      render(
        <>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });

    it('should maintain consistent styling across cards', () => {
      const { container } = render(
        <>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
        </>
      );

      const cards = container.querySelectorAll('[class*="rounded-xl"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
      cards.forEach(card => {
        expect(card).toHaveClass('rounded-xl');
        expect(card).toHaveClass('border');
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should handle interactions in card with button', async () => {
      const handleClick = jest.fn();
      render(
        <Card>
          <CardContent>
            <Button onClick={handleClick}>Click Me</Button>
          </CardContent>
        </Card>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility when components are combined', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Button aria-label="Submit form">Submit</Button>
          </CardContent>
        </Card>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });
});


