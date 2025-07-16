import { renderHook, act } from '@testing-library/react';
import { useWorkouts } from '../hooks/useWorkouts';
import * as firestore from 'firebase/firestore';

jest.mock('firebase/firestore');

const fakeUser = { uid: 'test-user' };
const fakeWorkout = { id: 1, date: '2024-01-01', exercises: [], userId: 'test-user' };

describe('useWorkouts (Firestore)', () => {
  beforeEach(() => {
    firestore.onSnapshot.mockImplementation((q, cb) => {
      cb({ docs: [{ id: '1', data: () => fakeWorkout }] });
      return jest.fn();
    });
    firestore.addDoc.mockResolvedValue({ id: '1' });
    firestore.updateDoc.mockResolvedValue();
    firestore.deleteDoc.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('charge les workouts depuis Firestore', async () => {
    const { result } = renderHook(() => useWorkouts(fakeUser));
    expect(result.current.workouts).toEqual([{ id: '1', ...fakeWorkout }]);
  });

  it('ajoute un workout dans Firestore', async () => {
    const { result } = renderHook(() => useWorkouts(fakeUser));
    await act(async () => {
      await result.current.addWorkout(fakeWorkout);
    });
    expect(firestore.addDoc).toHaveBeenCalled();
  });

  it('met à jour un workout dans Firestore', async () => {
    const { result } = renderHook(() => useWorkouts(fakeUser));
    await act(async () => {
      await result.current.updateWorkout('1', { ...fakeWorkout, date: '2024-01-02' });
    });
    expect(firestore.updateDoc).toHaveBeenCalled();
  });

  it('supprime un workout dans Firestore', async () => {
    const { result } = renderHook(() => useWorkouts(fakeUser));
    await act(async () => {
      await result.current.deleteWorkout('1');
    });
    expect(firestore.deleteDoc).toHaveBeenCalled();
  });
}); 