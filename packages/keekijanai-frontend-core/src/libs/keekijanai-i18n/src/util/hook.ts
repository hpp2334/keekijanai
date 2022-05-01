type EventName = string;

interface HookEvent<T> {
  name: EventName | null;
  payload: T;
}

type EventHandler<T> = (ev: HookEvent<T>) => void;

export class EventHookManager<T> {
  private hooks: Set<EventHandler<T>> = new Set();

  public add(handler: EventHandler<T>) {
    this.hooks.add(handler);
    return () => this.remove(handler);
  }

  public remove(handler: EventHandler<T>) {
    this.hooks.delete(handler);
  }

  public clear() {
    this.hooks.clear();
  }

  public notify(evt: HookEvent<T>) {
    for (const handler of this.hooks) {
      handler(evt);
    }
  }
}
