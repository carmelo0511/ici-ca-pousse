import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Chatbot from '../../components/Chatbot/Chatbot';
import useChatGPT from '../../hooks/useChatGPT';

jest.mock('../../hooks/useChatGPT');

describe('Chatbot component', () => {
  it('sends message with workout summary and context', async () => {
    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    const workouts = [
      {
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [{ reps: 5, weight: 100 }] }],
        duration: 30,
      },
    ];

    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    render(
      <Chatbot
        user={user}
        workouts={workouts}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Posez n'importe quelle question..."), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByText('Envoyer'));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
      const call = sendMessage.mock.calls[0];
      expect(call[0]).toBe('Hello');
      expect(call[1]).toEqual(expect.stringContaining('Répartition'));
    });
    // On vérifie que le contexte contient bien des infos sur les exercices
    expect(sendMessage.mock.calls[0][1]).toMatch(/Squat/);
  });

  it('uses API key from environment variables', () => {
    const originalKey = process.env.REACT_APP_OPENAI_API_KEY;
    process.env.REACT_APP_OPENAI_API_KEY = 'test-key';

    const sendMessage = jest.fn();
    useChatGPT.mockReturnValue({ messages: [], sendMessage });

    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    render(
      <Chatbot
        user={user}
        workouts={[]}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    expect(useChatGPT).toHaveBeenCalledWith('test-key');

    process.env.REACT_APP_OPENAI_API_KEY = originalKey;
  });
});
