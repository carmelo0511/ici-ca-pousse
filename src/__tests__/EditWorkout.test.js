import { save, load } from '../utils/storage';

describe('workout editing flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('edits an existing workout and stores the update', () => {
    const key = 'iciCaPousse_workouts_1';
    const workout = { id: 1, date: '2024-01-01', exercises: [], duration: 30 };
    localStorage.setItem(key, JSON.stringify([workout]));

    const updated = { ...workout, duration: 45 };
    save(key, [updated]);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify([updated])
    );

    const loaded = load(key, []);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(loaded).toEqual([updated]);
  });
});
