/**
 * MinHeap implementation specialized for Huffman node priority queue
 */
export class MinHeap<T> {
  private heap: T[] = [];
  private compareFunction: (a: T, b: T) => number;

  constructor(compareFunction: (a: T, b: T) => number) {
    this.compareFunction = compareFunction;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  push(value: T): void {
    // Add the element to the end of the heap
    this.heap.push(value);
    // Fix the heap property by sifting up
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const root = this.heap[0];
    const lastElement = this.heap.pop()!;

    if (this.heap.length > 0) {
      // Move the last element to the root
      this.heap[0] = lastElement;
      // Fix the heap property by sifting down
      this.siftDown(0);
    }

    return root;
  }

  private siftUp(index: number): void {
    // Get the element that needs to be sifted up
    const element = this.heap[index];

    while (index > 0) {
      // Compute the parent index
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      // If the parent is less than or equal to the element, we're done
      if (this.compareFunction(parent, element) <= 0) {
        break;
      }

      // Otherwise, swap the parent with the element
      this.heap[parentIndex] = element;
      this.heap[index] = parent;
      index = parentIndex;
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      // Compute the indices of the children
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;

      let leftChild: T | undefined;
      let leftChildCompare = 0;
      let rightChild: T | undefined;
      let rightChildCompare = 0;
      
      // Determine if we should move to the left child
      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        leftChildCompare = this.compareFunction(element, leftChild);
      }

      // Determine if we should move to the right child
      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        rightChildCompare = this.compareFunction(element, rightChild);
      }

      // If the element is smaller than both children, we're done
      if (leftChildCompare <= 0 && rightChildCompare <= 0) {
        break;
      }

      // Otherwise, swap with the smaller child
      let swapIndex: number;
      if (rightChildIndex >= length || 
          this.compareFunction(leftChild!, rightChild!) <= 0) {
        swapIndex = leftChildIndex;
      } else {
        swapIndex = rightChildIndex;
      }

      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
