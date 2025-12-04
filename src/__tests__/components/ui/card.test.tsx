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
    it('should render card with default classes', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
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
    it('should have basic styling classes', () => {
      render(<Card>Glass Card</Card>);
      const card = screen.getByText('Glass Card');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have shadow classes', () => {
      render(<Card>Shadow Card</Card>);
      const card = screen.getByText('Shadow Card');
      expect(card).toHaveClass('shadow-sm');
      expect(card).toHaveClass('hover:shadow-md');
    });

    it('should have transition classes', () => {
      render(<Card>Transition Card</Card>);
      const card = screen.getByText('Transition Card');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-200');
    });

    it('should have border classes', () => {
      render(<Card>Border Card</Card>);
      const card = screen.getByText('Border Card');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-gray-200');
      expect(card).toHaveClass('hover:border-gray-300');
    });

    it('should support card-premium class when explicitly provided', () => {
      render(<Card className="card-premium">Premium Card</Card>);
      const card = screen.getByText('Premium Card');
      expect(card).toHaveClass('card-premium');
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


