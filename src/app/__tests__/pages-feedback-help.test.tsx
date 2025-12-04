import { render, screen } from '@testing-library/react';
import FeedbackPage from '../feedback/page';
import HelpPage from '../help/page';
import SalesSkillsPage from '../sales-skills/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock components that might cause parsing issues
jest.mock('@/components/ProspectResearch', () => ({
  __esModule: true,
  default: () => <div>ProspectResearch</div>,
}));

jest.mock('@/components/EmailTemplateGenerator', () => ({
  __esModule: true,
  default: () => <div>EmailTemplateGenerator</div>,
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockUseAuth = useAuth as jest.Mock;

describe('Feedback Page', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it('renders feedback form', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
    expect(screen.getByLabelText(/Feedback Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('has submit button', () => {
    render(<FeedbackPage />);
    expect(screen.getByRole('button', { name: /Submit Feedback/i })).toBeInTheDocument();
  });
});

describe('Help Page', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it('renders help content', () => {
    render(<HelpPage />);
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('has help sections', () => {
    render(<HelpPage />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Sales Training')).toBeInTheDocument();
  });

  it('has FAQ items', () => {
    render(<HelpPage />);
    expect(screen.getByText(/How do I start practicing/i)).toBeInTheDocument();
  });
});

describe('Sales Skills Page', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it('renders sales skills content', () => {
    render(<SalesSkillsPage />);
    expect(screen.getByText('Sales Skills Training')).toBeInTheDocument();
  });

  it('has outbound and inbound tabs', () => {
    render(<SalesSkillsPage />);
    expect(screen.getByText('Outbound Sales')).toBeInTheDocument();
    expect(screen.getByText('Inbound Sales')).toBeInTheDocument();
  });

  it('displays skill modules', () => {
    render(<SalesSkillsPage />);
    // Outbound modules are visible by default
    expect(screen.getByText('Cold Outreach Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Cold Calling Mastery')).toBeInTheDocument();
    // Inbound modules are in a different tab
    expect(screen.getByText('Inbound Sales')).toBeInTheDocument();
  });
});

