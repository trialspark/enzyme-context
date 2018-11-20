import { ValueWatcher } from './ValueWatcher';

describe('ValueWatcher', () => {
  let watcher: ValueWatcher<{ name: string; age: number }>;

  beforeEach(() => {
    watcher = new ValueWatcher();
  });

  it('exists', () => {
    expect(watcher).toEqual(expect.any(ValueWatcher));
    expect(watcher.value).toBeNull();
  });

  it('notifies listeners when a value is set', () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();

    watcher.listen(listenerA);
    watcher.listen(listenerB);
    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).not.toHaveBeenCalled();

    const value = { name: 'TrialSpark', age: 6 };
    watcher.set(value);
    expect(watcher.value).toBe(value);
    expect(listenerA).toHaveBeenCalledWith(value);
    expect(listenerB).toHaveBeenCalledWith(value);
  });

  it('can stop listening', () => {
    const listener = jest.fn();

    watcher.listen(listener);
    watcher.stop();
    watcher.set({ name: 'TS', age: 3 });
    expect(listener).not.toHaveBeenCalled();
  });
});
