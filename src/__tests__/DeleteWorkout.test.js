import { save, load } from '../utils/storage';

describe('workout deletion flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('removes a workout from storage', () => {
    const key = 'iciCaPousse_workouts_1';
    const workouts = [
      { id: 1, date: '2024-01-01', exercises: [] },
      { id: 2, date: '2024-01-02', exercises: [] }
    ];
    localStorage.setItem(key, JSON.stringify(workouts));

    const remaining = workouts.filter(w => w.id !== 1);
    save(key, remaining);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(remaining)
    );

    const loaded = load(key, []);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(loaded).toEqual(remaining);
  });
});
