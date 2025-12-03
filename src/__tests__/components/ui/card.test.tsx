/**
 * Card Component Tests
 * Tests for premium card component with glass effects
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Component - Premium Design', () => {
  describe('Rendering', () => {
    it('should render card with premium classes', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('card-premium');
      expect(card).toHaveClass('shadow-depth-2');
      expect(card).toHaveClass('border-ultra-minimal');
    });

    it('should render card with all sub-components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Custom</Card>);
      const card = screen.getByText('Custom');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('Premium Design Classes', () => {
    it('should have glass effect classes', () => {
      render(<Card>Glass Card</Card>);
      const card = screen.getByText('Glass Card');
      expect(card).toHaveClass('bg-white/90');
      expect(card).toHaveClass('backdrop-blur-sm');
    });

    it('should have shadow depth classes', () => {
      render(<Card>Shadow Card</Card>);
      const card = screen.getByText('Shadow Card');
      expect(card).toHaveClass('shadow-depth-2');
      expect(card).toHaveClass('hover:shadow-depth-3');
    });

    it('should have transition classes', () => {
      render(<Card>Transition Card</Card>);
      const card = screen.getByText('Transition Card');
      expect(card).toHaveClass('transition-smooth');
    });

    it('should have border classes', () => {
      render(<Card>Border Card</Card>);
      const card = screen.getByText('Border Card');
      expect(card).toHaveClass('border-ultra-minimal');
      expect(card).toHaveClass('hover:border-subtle');
    });

    it('should have focus ring for accessibility', () => {
      render(<Card tabIndex={0}>Focusable Card</Card>);
      const card = screen.getByText('Focusable Card');
      expect(card).toHaveClass('focus-ring-glow');
    });
  });

  describe('Sub-components', () => {
    it('should render CardHeader with correct classes', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header');
      expect(header).toHaveClass('p-6');
      expect(header).toHaveClass('pb-4');
    });

    it('should render CardTitle with correct typography', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
    });

    it('should render CardDescription with muted text', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should render CardContent with correct padding', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      const content = screen.getByText('Content');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('should render CardFooter with correct layout', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
    });
  });
});


