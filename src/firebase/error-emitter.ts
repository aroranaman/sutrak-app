// A simple, generic event emitter.
// We can't use Node's EventEmitter because this needs to run in the browser.
type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(
      (l) => l !== listener
    );
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => listener(data));
  }
}

// Use a global symbol to ensure a single instance of the emitter,
// especially in Next.js environments where modules can be re-evaluated.
const EMITTER_SYMBOL = Symbol.for('firebase.error.emitter');

// Define the events and their payload types
type ErrorEvents = {
  'permission-error': Error;
};

function getErrorEmitter(): EventEmitter<ErrorEvents> {
  const globalWithEmitter = global as typeof global & {
    [EMITTER_SYMBOL]?: EventEmitter<ErrorEvents>;
  };

  if (!globalWithEmitter[EMITTER_SYMBOL]) {
    globalWithEmitter[EMITTER_SYMBOL] = new EventEmitter<ErrorEvents>();
  }
  return globalWithEmitter[EMITTER_SYMBOL];
}

export const errorEmitter = getErrorEmitter();
