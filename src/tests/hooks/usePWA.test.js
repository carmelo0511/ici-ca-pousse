import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../../hooks/usePWA';

describe('usePWA', () => {
  let mockMatchMedia;
  let mockAddEventListener;
  let mockRemoveEventListener;

  beforeEach(() => {
    mockMatchMedia = jest.fn();
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    Object.defineProperty(window, 'addEventListener', {
      writable: true,
      value: mockAddEventListener,
    });

    Object.defineProperty(window, 'removeEventListener', {
      writable: true,
      value: mockRemoveEventListener,
    });

    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: undefined,
    });

    mockMatchMedia.mockReturnValue({ matches: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(typeof result.current.installApp).toBe('function');
  });

  test('should set up event listeners on mount', () => {
    renderHook(() => usePWA());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });

  test('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWA());
    
    const mockEvent = {
      preventDefault: jest.fn(),
    };

    // Get the event handler that was registered
    const beforeInstallPromptHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'beforeinstallprompt'
    )[1];

    act(() => {
      beforeInstallPromptHandler(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(true);
  });

  test('should handle appinstalled event', () => {
    const { result } = renderHook(() => usePWA());

    // Get the event handler that was registered
    const appInstalledHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'appinstalled'
    )[1];

    act(() => {
      appInstalledHandler();
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should detect if already installed via standalone mode', () => {
    mockMatchMedia.mockReturnValue({ matches: true });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should detect iOS device and standalone mode', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should detect iOS device with matchMedia standalone', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    });
    mockMatchMedia.mockImplementation((query) => {
      if (query === '(display-mode: standalone)') {
        return { matches: true };
      }
      return { matches: false };
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should handle install app with accepted outcome', async () => {
    const { result } = renderHook(() => usePWA());

    const mockDeferredPrompt = {
      preventDefault: jest.fn(),
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'beforeinstallprompt'
    )[1];

    act(() => {
      beforeInstallPromptHandler(mockDeferredPrompt);
    });

    await act(async () => {
      await result.current.installApp();
    });

    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should handle install app with dismissed outcome', async () => {
    const { result } = renderHook(() => usePWA());

    const mockDeferredPrompt = {
      preventDefault: jest.fn(),
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    };

    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'beforeinstallprompt'
    )[1];

    act(() => {
      beforeInstallPromptHandler(mockDeferredPrompt);
    });

    await act(async () => {
      await result.current.installApp();
    });

    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstallable).toBe(true); // Should remain installable
  });

  test('should not install app when no deferred prompt', async () => {
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      await result.current.installApp();
    });

    // Should not throw or change state
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstallable).toBe(false);
  });

  test('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWA());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });

  test('should handle iOS detection correctly', () => {
    // Test iPhone
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    let { result } = renderHook(() => usePWA());
    // iOS detected but not in standalone mode
    expect(result.current.isInstalled).toBe(false);

    // Test iPad
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    });

    result = renderHook(() => usePWA()).result;
    expect(result.current.isInstalled).toBe(false);

    // Test non-iOS
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    result = renderHook(() => usePWA()).result;
    expect(result.current.isInstalled).toBe(false);
  });
});