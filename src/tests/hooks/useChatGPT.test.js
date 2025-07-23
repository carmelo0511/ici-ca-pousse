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

  it('uses Authorization header with provided API key', async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ choices: [] }) });

    const { result } = renderHook(() => useChatGPT('my-key'));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-key'
        })
      })
    );
  });
});
