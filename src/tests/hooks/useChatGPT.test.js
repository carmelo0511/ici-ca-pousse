import { renderHook, act } from '@testing-library/react';
import useChatGPT from '../../hooks/useChatGPT';

describe('useChatGPT', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('adds error message when API key is missing', async () => {
    const { result } = renderHook(() => useChatGPT(null));

    await act(async () => {
      await result.current.sendMessage('Salut');
    });

    expect(result.current.messages).toEqual([
      { role: 'user', content: 'Salut' },
      { role: 'assistant', content: 'Clé API manquante' }
    ]);
  });

  it('appends assistant response from API', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ choices: [{ message: { role: 'assistant', content: 'Bonjour' } }] })
    });

    const { result } = renderHook(() => useChatGPT('key'));

    await act(async () => {
      await result.current.sendMessage('Salut');
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.messages).toEqual([
      { role: 'user', content: 'Salut' },
      { role: 'assistant', content: 'Bonjour' }
    ]);
  });
});
