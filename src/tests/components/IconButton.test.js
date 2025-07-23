import { render, fireEvent, screen } from '@testing-library/react';
import { Flame } from 'lucide-react';
import IconButton from '../../components/IconButton';

describe('IconButton', () => {
  it('renders icon and handles click', () => {
    const handleClick = jest.fn();
    render(<IconButton icon={Flame} onClick={handleClick} title="flame" />);
    const btn = screen.getByTitle('flame');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line testing-library/no-node-access
    expect(btn.querySelector('svg')).toBeTruthy();
  });
});
