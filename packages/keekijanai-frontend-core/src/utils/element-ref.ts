interface Ref<E> {
  current: E | null;
}

export class ElementRef<E> {
  public ref: Ref<E>;

  public constructor(private applyImpl: (current: E) => Promise<void> | void) {
    this.ref = {
      current: null,
    };
  }

  public apply() {
    const current = this.ref.current;
    if (current !== null) {
      this.applyImpl(current);
    }
  }
}
