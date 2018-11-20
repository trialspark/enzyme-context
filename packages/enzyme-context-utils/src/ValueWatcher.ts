type Listener<V> = (value: V) => void;

/**
 * A class that keeps track of a single value and notifies listeners when that value changes.
 */
export class ValueWatcher<V> {
  private listeners: Listener<V>[] = [];

  value: V | null = null;

  /**
   * Registers a listener to be notified of value changes
   *
   * @param listener a function with accepts the new value as its only arg
   */
  listen(listener: Listener<V>): void {
    this.listeners.push(listener);
  }

  /**
   * Change the value. This will cause listeners to be notified.
   *
   * @param value
   */
  set(value: V): void {
    this.value = value;
    this.listeners.forEach(listener => listener(value));
  }

  /**
   * Removes all listeners
   */
  stop(): void {
    this.listeners = [];
  }
}
