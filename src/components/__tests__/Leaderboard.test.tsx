import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '@/components/Leaderboard';

global.fetch = jest.fn();

describe('Leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render leaderboard', async () => {
    const mockLeaderboard = [
      {
        userId: 'user_1',
        username: 'user1',
        roleAtCursor: 'Sales Rep',
        totalSessions: 10,
        averageRating: 4.5,
        totalRatings: 8,
        winRate: 75.0,
        totalScore: 450.0,
        rank: 1,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ leaderboard: mockLeaderboard }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });
  });

  it('should display leaderboard entries', async () => {
    const mockLeaderboard = [
      {
        userId: 'user_1',
        username: 'user1',
        roleAtCursor: 'Sales Rep',
        totalSessions: 10,
        averageRating: 4.5,
        totalRatings: 8,
        winRate: 75.0,
        totalScore: 450.0,
        rank: 1,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ leaderboard: mockLeaderboard }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
  });

  it('should show empty state when no data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ leaderboard: [] }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText(/no leaderboard data/i)).toBeInTheDocument();
    });
  });
});

