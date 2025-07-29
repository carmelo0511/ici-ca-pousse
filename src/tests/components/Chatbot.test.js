import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Chatbot from '../../components/Chatbot/Chatbot';
import useChatGPT from '../../hooks/useChatGPT';

jest.mock('../../hooks/useChatGPT');

describe('Chatbot component', () => {
  const mockChatGPT = {
    messages: [],
    sendMessage: jest.fn(),
    isLoading: false,
    clearCache: jest.fn(),
    getCacheStats: jest.fn(),
    cacheStats: {
      size: 0,
      maxSize: 100,
      averageAccesses: 0
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useChatGPT.mockReturnValue(mockChatGPT);
  });

  it('sends message with workout summary and context', async () => {
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
      expect(mockChatGPT.sendMessage).toHaveBeenCalled();
    });
    
    const call = mockChatGPT.sendMessage.mock.calls[0];
    expect(call[0]).toBe('Hello');
    expect(call[1]).toEqual(expect.stringContaining('Répartition'));
    // On vérifie que le contexte contient bien des infos sur les exercices
    expect(mockChatGPT.sendMessage.mock.calls[0][1]).toMatch(/Squat/);
  });

  it('uses API key from environment variables', () => {
    const originalKey = process.env.REACT_APP_OPENAI_API_KEY;
    process.env.REACT_APP_OPENAI_API_KEY = 'test-key';

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

  it('displays welcome message for new user', () => {
    const user = { displayName: 'John' };
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

    expect(setMessages).toHaveBeenCalledWith([
      { role: 'assistant', content: 'Bonjour John, je suis Coach Lex IA. Je peux t\'aider avec tes séances de sport, la nutrition et le bien-être. Prêt pour une nouvelle séance ?' }
    ]);
  });

  it('displays welcome message for user without display name', () => {
    const user = {};
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

    expect(setMessages).toHaveBeenCalledWith([
      { role: 'assistant', content: 'Bonjour,je suis Coach Lex IA. Je peux t\'aider avec tes séances de sport, la nutrition et le bien-être. Prêt pour une nouvelle séance ?' }
    ]);
  });

  it('does not show welcome message if messages already exist', () => {
    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    // Mock existing messages
    mockChatGPT.messages = [{ role: 'user', content: 'Previous message' }];

    render(
      <Chatbot
        user={user}
        workouts={[]}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    expect(setMessages).not.toHaveBeenCalled();
  });

  it('handles empty input', async () => {
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

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText('Envoyer'));

    expect(mockChatGPT.sendMessage).not.toHaveBeenCalled();
  });

  it('handles whitespace-only input', async () => {
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

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Envoyer'));

    expect(mockChatGPT.sendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
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

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText('Envoyer'));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('handles Enter key press', async () => {
    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    // Mock the sendMessage to resolve immediately
    mockChatGPT.sendMessage.mockResolvedValue(undefined);

    render(
      <Chatbot
        user={user}
        workouts={[]}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Wait for the function to be called
    await waitFor(() => {
      expect(mockChatGPT.sendMessage).toHaveBeenCalled();
    });

    // Check the arguments
    const calls = mockChatGPT.sendMessage.mock.calls;
    expect(calls[0][0]).toBe('Test message');
    expect(calls[0][1]).toContain('assistant personnel sportif');
  });

  it('handles workouts with no exercises', async () => {
    const workouts = [
      { date: '2024-01-01', exercises: [] }
    ];

    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    // Mock the sendMessage to resolve immediately
    mockChatGPT.sendMessage.mockResolvedValue(undefined);

    render(
      <Chatbot
        user={user}
        workouts={workouts}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Envoyer'));

    // Wait for the function to be called
    await waitFor(() => {
      expect(mockChatGPT.sendMessage).toHaveBeenCalled();
    });

    // Check the arguments
    const calls = mockChatGPT.sendMessage.mock.calls;
    expect(calls[0][0]).toBe('Test');
    expect(calls[0][1]).toContain('0 exercices');
  });

  it('handles workouts with missing exercise properties', async () => {
    const workouts = [
      {
        date: '2024-01-01',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }] },
          { name: 'Bench', sets: null }
        ]
      }
    ];

    const user = { displayName: 'Test' };
    const setMessages = jest.fn();
    const setExercisesFromWorkout = jest.fn();
    const setShowAddExercise = jest.fn();

    // Mock the sendMessage to resolve immediately
    mockChatGPT.sendMessage.mockResolvedValue(undefined);

    render(
      <Chatbot
        user={user}
        workouts={workouts}
        setMessages={setMessages}
        setExercisesFromWorkout={setExercisesFromWorkout}
        setShowAddExercise={setShowAddExercise}
      />
    );

    const input = screen.getByPlaceholderText("Posez n'importe quelle question...");
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Envoyer'));

    // Wait for the function to be called
    await waitFor(() => {
      expect(mockChatGPT.sendMessage).toHaveBeenCalled();
    });

    // Check the arguments
    const calls = mockChatGPT.sendMessage.mock.calls;
    expect(calls[0][0]).toBe('Test');
    expect(calls[0][1]).toContain('Squat');
  });
});
