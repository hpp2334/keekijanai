export interface Iterator<T> {
  next(): Iterator<T> | null;
  value(): T;
  batchInsertAfter(values: Iterator<T>): void;
  insertAfter(value: T): void;
  remove(): void;
}

export function toArray<T>(iterator: Iterator<T>) {
  const arr = [];
  let it: Iterator<T> | null = iterator;
  while (it) {
    arr.push(it.value());
    it = it.next();
  }
  return arr;
}

export function makeArrayIterator<T>(array: T[], _index?: number) {
  const index = _index ?? 0;
  if (index < 0 || index > array.length) {
    return null;
  }
  const iterator: Iterator<T> = {
    next: () => {
      return makeArrayIterator(array, index + 1);
    },
    value: () => array[index],
    batchInsertAfter: (iter) => {
      const arr = toArray(iter);

      array.splice(index + 1, 0, ...arr);
    },
    insertAfter: (value) => {
      array.splice(index + 1, 0, value);
    },
    remove: () => {
      array.splice(index, 1);
    },
  };
  return iterator;
}

export function makeArrayReverseIterator<T>(array: T[], _index?: number) {
  const index = _index ?? array.length - 1;
  if (index < 0 || index > array.length) {
    return null;
  }
  const iterator: Iterator<T> = {
    next: () => {
      return makeArrayIterator(array, index - 1);
    },
    value: () => array[index],
    batchInsertAfter: (iter) => {
      const arr = toArray(iter);

      array.splice(index, 0, ...arr);
    },
    insertAfter: (value) => {
      array.splice(index, 0, value);
    },
    remove: () => {
      array.splice(index, 1);
    },
  };
  return iterator;
}
