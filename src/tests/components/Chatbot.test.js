import { render, fireEvent, act, waitFor } from '@testing-library/react';
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

    const { getByPlaceholderText, getByText, getByRole } = render(
      <Chatbot workouts={workouts} />
    );

    await act(async () => {
      fireEvent.change(getByPlaceholderText('Votre message...'), { target: { value: 'Hello' } });
      fireEvent.click(getByText('Envoyer'));
    });

    expect(sendMessage).toHaveBeenCalledWith(
      'Hello',
      expect.stringContaining('Données récentes')
    );
  });

  it('sends message without context in free mode', async () => {
    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    const { getByPlaceholderText, getByText, getByRole } = render(
      <Chatbot workouts={[]} />
    );

    await act(async () => {
      fireEvent.change(getByRole('combobox'), { target: { value: 'free' } });
      fireEvent.change(getByPlaceholderText('Votre message...'), { target: { value: 'Yo' } });
      fireEvent.click(getByText('Envoyer'));
    });

    expect(sendMessage).toHaveBeenCalledWith('Yo', null);
    await waitFor(() => expect(getByPlaceholderText('Votre message...').value).toBe(''));
  });
});
