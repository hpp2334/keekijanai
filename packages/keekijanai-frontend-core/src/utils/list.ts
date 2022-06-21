import { Iterator } from "./iterator";

export class List<T> {
  public first: ListNode<T> | null = null;
  public last: ListNode<T> | null = null;

  public append(value: T) {
    const node = new ListNode(this, value);

    if (this.first === null) {
      node.markIsRoot(true);
      this.first = this.last = node;
    } else {
      this.last?.insertAfter(node);
    }
  }
  public appendList(rList: List<T>) {
    let it = rList.first;
    while (it) {
      this.append(it.value);
      it = it.next;
    }
  }
}

export class ListNode<T> {
  private _isRootNode = false;

  public next: ListNode<T> | null = null;
  public prev: ListNode<T> | null = null;

  public constructor(private _list: List<T>, public value: T) {}

  public cloneSingle() {
    const cloned = new ListNode(this._list, this.value);
    cloned.markIsRoot(false);
    cloned.prev = cloned.next = null;
    return cloned;
  }

  public markIsRoot(isRootNode: boolean) {
    this._isRootNode = isRootNode;
  }

  public insertAfter(node: ListNode<T>) {
    const currentNextNode = this.next;
    if (currentNextNode) {
      currentNextNode.prev = node;
      node.next = currentNextNode;
    }
    node.prev = this;
    this.next = node;

    if (this._list.last === this) {
      this._list.last = node;
    }
  }
  public insertAfterByValue(value: T) {
    const node = new ListNode(this._list, value);
    this.insertAfter(node);
  }

  public removeFromList() {
    const currentPrevNode = this.prev;
    const currentNextNode = this.next;
    if (currentPrevNode) {
      currentPrevNode.next = currentNextNode;
    }
    if (currentNextNode) {
      currentNextNode.prev = currentPrevNode;
    }
    if (this._isRootNode) {
      this._list.first = currentPrevNode;
    }
    this.next = this.prev = null;
  }
}

export function toList<T>(iterator: Iterator<T>) {
  const list = new List<T>();
  let it: Iterator<T> | null = iterator;
  while (it) {
    list.append(it.value());
    it = it.next();
  }
  return list;
}

export function makeListIterator<T>(listNode: ListNode<T> | null) {
  if (listNode === null) {
    return null;
  }

  const iterator: Iterator<T> = {
    next: () => {
      return makeListIterator(listNode.next);
    },
    value: () => listNode.value,
    batchInsertAfter: (iter) => {
      const rList = toList(iter);

      let it: ListNode<T> | null = rList.first;
      while (it) {
        const cloned = it.cloneSingle();
        listNode.insertAfter(cloned);
        it = it.next;
      }
    },
    insertAfter: (value) => {
      listNode.insertAfterByValue(value);
    },
    remove: () => {
      listNode.removeFromList();
    },
  };
  return iterator;
}
