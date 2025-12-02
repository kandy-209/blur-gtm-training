/**
 * Tests for GlobalVoiceAssistant component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalVoiceAssistant from '../GlobalVoiceAssistant';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Store original createElement
const originalCreateElement = document.createElement.bind(document);
const originalQuerySelector = document.querySelector.bind(document);

beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Mock querySelector to return null (no existing script)
  global.document.querySelector = jest.fn(() => null);
  
  // Mock customElements
  global.customElements = {
    get: jest.fn(() => undefined),
    define: jest.fn(),
  } as any;
  
  // Mock createElement for script tags
  global.document.createElement = jest.fn((tagName: string) => {
    if (tagName === 'script') {
      const script = originalCreateElement('script') as HTMLScriptElement;
      Object.assign(script, {
        src: '',
        async: false,
        type: '',
        onload: null as any,
        onerror: null as any,
      });
      
      // Simulate script load
      setTimeout(() => {
        if (script.onload) {
          script.onload();
        }
      }, 10);
      
      return script;
    }
    return originalCreateElement(tagName);
  });
});

afterEach(() => {
  // Restore original functions
  global.document.createElement = originalCreateElement;
  global.document.querySelector = originalQuerySelector;
});

describe('GlobalVoiceAssistant', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('should render floating button when closed', () => {
    render(<GlobalVoiceAssistant />);
    
    const button = screen.getByRole('button', { name: /open ai training assistant/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('rounded-2xl');
  });

  it('should open widget when button is clicked', async () => {
    render(<GlobalVoiceAssistant />);
    
    const button = screen.getByRole('button', { name: /open ai training assistant/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close voice assistant/i })).toBeInTheDocument();
    });
  });

  it('should close widget when close button is clicked', async () => {
    render(<GlobalVoiceAssistant />);
    
    // Open widget
    const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
    fireEvent.click(openButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close voice assistant/i })).toBeInTheDocument();
    });
    
    // Close widget
    const closeButton = screen.getByRole('button', { name: /close voice assistant/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open ai training assistant/i })).toBeInTheDocument();
    });
  });

  describe('Context-aware titles', () => {
    it('should show correct title for roleplay page', () => {
      mockUsePathname.mockReturnValue('/roleplay/scenario-123');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Voice Role-Play Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Powerful AI for voice role-play practice/i)).toBeInTheDocument();
    });

    it('should show correct title for scenarios page', () => {
      mockUsePathname.mockReturnValue('/scenarios');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Training Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/AI-powered training/i)).toBeInTheDocument();
    });

    it('should show correct title for analytics page', () => {
      mockUsePathname.mockReturnValue('/analytics');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Analytics Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/AI assistant/i)).toBeInTheDocument();
    });

    it('should show correct title for leaderboard page', () => {
      mockUsePathname.mockReturnValue('/leaderboard');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Training Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/role-play practice & Q&A/i)).toBeInTheDocument();
    });

    it('should show correct title for live page', () => {
      mockUsePathname.mockReturnValue('/live');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Voice Role-Play Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Powerful AI for live voice role-play/i)).toBeInTheDocument();
    });

    it('should show correct title for features page', () => {
      mockUsePathname.mockReturnValue('/features');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Features Learning Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/AI-powered learning/i)).toBeInTheDocument();
    });

    it('should show correct title for enterprise page', () => {
      mockUsePathname.mockReturnValue('/enterprise');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Enterprise Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/AI assistant/i)).toBeInTheDocument();
    });

    it('should show correct title for chat page', () => {
      mockUsePathname.mockReturnValue('/chat');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Training Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Powerful AI assistant/i)).toBeInTheDocument();
    });

    it('should show default title for home page', () => {
      mockUsePathname.mockReturnValue('/');
      render(<GlobalVoiceAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
      fireEvent.click(openButton);
      
      expect(screen.getByText(/AI Cursor Training Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Powerful AI assistant for Cursor training/i)).toBeInTheDocument();
    });
  });

  it('should load ElevenLabs script when component mounts', async () => {
    render(<GlobalVoiceAssistant />);
    
    await waitFor(() => {
      // Script should be created
      expect(global.document.createElement).toHaveBeenCalledWith('script');
    });
  });

  it('should not reload script if already loaded', () => {
    // Mock existing script
    global.document.querySelector = jest.fn(() => ({
      src: 'https://unpkg.com/@elevenlabs/convai-widget-embed',
    }));
    
    const createElementSpy = jest.spyOn(document, 'createElement');
    render(<GlobalVoiceAssistant />);
    
    // Should not create new script since one already exists
    expect(createElementSpy).not.toHaveBeenCalledWith('script');
    createElementSpy.mockRestore();
  });

  it('should handle script load error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock script that fails to load
    global.document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'script') {
        const script = originalCreateElement('script') as HTMLScriptElement;
        Object.assign(script, {
          src: '',
          async: false,
          type: '',
          onload: null as any,
          onerror: null as any,
        });
        
        setTimeout(() => {
          if (script.onerror) {
            script.onerror();
          }
        }, 10);
        
        return script;
      }
      return originalCreateElement(tagName);
    });
    
    render(<GlobalVoiceAssistant />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    consoleErrorSpy.mockRestore();
  });

  it('should render widget container when open', async () => {
    render(<GlobalVoiceAssistant />);
    
    const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
    fireEvent.click(openButton);
    
    await waitFor(() => {
      // Check for the widget container - look for specific title text
      const card = screen.getByText(/AI Cursor Training Assistant/i);
      expect(card).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<GlobalVoiceAssistant />);
    
    const button = screen.getByRole('button', { name: /open ai training assistant/i });
    expect(button).toHaveAttribute('aria-label', 'Open AI Training Assistant');
    expect(button).toHaveAttribute('title', 'AI Training Assistant - Role-play practice & ask questions');
  });

  it('should render floating widget when open', async () => {
    render(<GlobalVoiceAssistant />);
    
    const openButton = screen.getByRole('button', { name: /open ai training assistant/i });
    fireEvent.click(openButton);
    
    await waitFor(() => {
      // Check that the floating widget card is rendered - look for specific title
      const card = screen.getByText(/AI Cursor Training Assistant/i);
      expect(card).toBeInTheDocument();
    });
  });
});

