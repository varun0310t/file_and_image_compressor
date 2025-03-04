export class HuffmanNode {
  frequency: number;
  symbol?: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;

  constructor(frequency: number, symbol?: number, left: HuffmanNode | null = null, right: HuffmanNode | null = null) {
    this.frequency = frequency;
    this.symbol = symbol;
    this.left = left;
    this.right = right;
  }

  isLeaf(): boolean {
    return this.left === null && this.right === null;
  }
}
