import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card element', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default styles', () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-white');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref test</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('renders header with content', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies correct padding classes', () => {
      const { container } = render(
        <Card>
          <CardHeader>Test</CardHeader>
        </Card>
      );
      const header = container.querySelector('.p-6');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Title');
    });

    it('applies title styles', () => {
      const { container } = render(
        <Card>
          <CardTitle>Test</CardTitle>
        </Card>
      );
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-xl', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(
        <Card>
          <CardDescription>Description text</CardDescription>
        </Card>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('applies muted text styles', () => {
      const { container } = render(
        <Card>
          <CardDescription>Test</CardDescription>
        </Card>
      );
      const desc = container.querySelector('p');
      expect(desc).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(
        <Card>
          <CardContent>Content here</CardContent>
        </Card>
      );
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders footer content', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('Card Composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      );
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('handles nested interactive elements', () => {
      render(
        <Card>
          <CardContent>
            <button>Nested Button</button>
          </CardContent>
        </Card>
      );
      expect(screen.getByRole('button', { name: /nested button/i })).toBeInTheDocument();
    });
  });
});



