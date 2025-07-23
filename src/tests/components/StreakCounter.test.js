import { render, act, screen } from '@testing-library/react';
import StreakCounter, {
  getStreakMessage,
} from '../../components/StreakCounter';

describe('StreakCounter', () => {
  it('returns correct streak messages', () => {
    expect(getStreakMessage(0)).toBe('');
    expect(getStreakMessage(3)).toBe('🔥 CONTINUE !');
    expect(getStreakMessage(7)).toBe('🔥 EN FEU !');
    expect(getStreakMessage(30)).toBe('🔥 INCROYABLE !');
    expect(getStreakMessage(100)).toBe('🔥 LÉGENDAIRE !');
  });

  it('animates streak increase', () => {
    jest.useFakeTimers();
    const { rerender } = render(<StreakCounter streak={1} />);
    rerender(<StreakCounter streak={3} />);
    act(() => {
      jest.advanceTimersByTime(120);
    });
    expect(screen.getByText(/3/)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
