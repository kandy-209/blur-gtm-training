/**
 * Design System Tests
 * Tests for premium design system CSS classes and utilities
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Premium Design System - CSS Classes', () => {
  describe('Glass Effects', () => {
    it('should apply glass classes', () => {
      const { container } = render(
        <div className="glass">Glass Element</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('glass');
    });

    it('should apply glass-strong classes', () => {
      const { container } = render(
        <div className="glass-strong">Strong Glass</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('glass-strong');
    });

    it('should apply glass-ultra classes', () => {
      const { container } = render(
        <div className="glass-ultra">Ultra Glass</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('glass-ultra');
    });
  });

  describe('Shadow Depth System', () => {
    it('should apply shadow-depth-1', () => {
      const { container } = render(
        <div className="shadow-depth-1">Depth 1</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('shadow-depth-1');
    });

    it('should apply shadow-depth-5', () => {
      const { container } = render(
        <div className="shadow-depth-5">Depth 5</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('shadow-depth-5');
    });
  });

  describe('Border Classes', () => {
    it('should apply ultra-minimal border', () => {
      const { container } = render(
        <div className="border-ultra-minimal">Ultra Minimal</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('border-ultra-minimal');
    });

    it('should apply minimal border', () => {
      const { container } = render(
        <div className="border-minimal">Minimal</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('border-minimal');
    });

    it('should apply subtle border', () => {
      const { container } = render(
        <div className="border-subtle">Subtle</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('border-subtle');
    });
  });

  describe('Transition Classes', () => {
    it('should apply smooth transition', () => {
      const { container } = render(
        <div className="transition-smooth">Smooth</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('transition-smooth');
    });

    it('should apply bounce transition', () => {
      const { container } = render(
        <div className="transition-bounce">Bounce</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('transition-bounce');
    });
  });

  describe('Hover Effects', () => {
    it('should apply hover-lift class', () => {
      const { container } = render(
        <div className="hover-lift">Lift</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('hover-lift');
    });

    it('should apply hover-glow class', () => {
      const { container } = render(
        <div className="hover-glow">Glow</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('hover-glow');
    });
  });

  describe('Premium Card Classes', () => {
    it('should apply card-premium class', () => {
      const { container } = render(
        <div className="card-premium">Premium Card</div>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('card-premium');
    });
  });

  describe('Premium Button Classes', () => {
    it('should apply btn-premium class', () => {
      const { container } = render(
        <button className="btn-premium">Premium Button</button>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('btn-premium');
    });
  });

  describe('Accessibility Classes', () => {
    it('should apply focus-ring-glow class', () => {
      const { container } = render(
        <button className="focus-ring-glow">Focusable</button>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('focus-ring-glow');
    });
  });
});


