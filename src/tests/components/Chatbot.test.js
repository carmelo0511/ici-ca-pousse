import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Chatbot from '../../components/Chatbot/Chatbot';
import useChatGPT from '../../hooks/useChatGPT';

jest.mock('../../hooks/useChatGPT');

describe('Chatbot component', () => {
  it('sends message with workout summary in advice mode', async () => {
    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    const workouts = [
      { date: '2024-01-01', exercises: [{}, {}], duration: 30 }
    ];

    render(<Chatbot workouts={workouts} />);

    fireEvent.change(screen.getByPlaceholderText('Votre message...'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Envoyer'));

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'Hello',
        expect.stringContaining('Répartition')
      )
    );
    expect(sendMessage).toHaveBeenCalledWith(
      'Hello',
      expect.stringContaining('Poids')
    );
    expect(sendMessage).toHaveBeenCalledWith(
      'Hello',
      expect.stringContaining('2024-01-01')
    );
  });

  it('sends message with coach context in free mode', async () => {
    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    render(<Chatbot workouts={[]} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'free' } });
    fireEvent.change(screen.getByPlaceholderText('Votre message...'), { target: { value: 'Yo' } });
    fireEvent.click(screen.getByText('Envoyer'));

    expect(sendMessage).toHaveBeenCalledWith(
      'Yo',
      expect.stringContaining('coach sportif')
    );
    await waitFor(() => expect(screen.getByPlaceholderText('Votre message...').value).toBe(''));
  });

  it('uses API key from environment variables', () => {
    const originalKey = process.env.REACT_APP_OPENAI_API_KEY;
    process.env.REACT_APP_OPENAI_API_KEY = 'test-key';

    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    render(<Chatbot workouts={[]} />);

    expect(useChatGPT).toHaveBeenCalledWith('test-key');

    process.env.REACT_APP_OPENAI_API_KEY = originalKey;
  });
});
