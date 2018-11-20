type Listener<V> = (value: V) => void;

export class ValueWatcher<V> {
  private listeners: Listener<V>[] = [];

  value: V | null = null;

  listen(listener: Listener<V>): void {
    this.listeners.push(listener);
  }

  set(value: V): void {
    this.value = value;
    this.listeners.forEach(listener => listener(value));
  }

  stop(): void {
    this.listeners = [];
  }
}
