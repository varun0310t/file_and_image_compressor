export class HuffmanNode {
  character: string;
  Frequency: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  constructor(char: string = "", freq: number = 0) {
    this.Frequency = freq;
    this.character = char;
    this.left = null;
    this.right = null;
  }
  CompareTo(otherNode: HuffmanNode): number {
    return this.Frequency - otherNode.Frequency;
  }
  isLeaf(): boolean {
    return this.left == null && this.right == null;
  }
}
