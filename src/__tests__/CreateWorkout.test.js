import { save, load } from '../utils/storage';

describe('workout creation flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('saves new workout for logged-in user and retrieves it', () => {
    const key = 'iciCaPousse_workouts_1';
    const workout = { id: 1, date: '2024-01-01', exercises: [] };

    save(key, [workout]);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify([workout])
    );

    const loaded = load(key, []);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(loaded).toEqual([workout]);
  });
});
