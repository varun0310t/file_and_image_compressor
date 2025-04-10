"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuffmanNode = void 0;
class HuffmanNode {
    constructor(frequency, symbol, left = null, right = null) {
        this.frequency = frequency;
        this.symbol = symbol;
        this.left = left;
        this.right = right;
    }
    isLeaf() {
        return this.left === null && this.right === null;
    }
}
exports.HuffmanNode = HuffmanNode;
