"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuffmanTree = void 0;
const huffmanNode_1 = require("./huffmanNode");
const minHeap_1 = require("../../utils/minHeap");
class HuffmanTree {
    constructor() {
        this.root = null;
        this.codes = new Map();
    }
    buildTree(data) {
        // Count frequency of each byte
        const frequencies = new Map();
        data.forEach(byte => {
            const count = frequencies.get(byte) || 0;
            frequencies.set(byte, count + 1);
        });
        // Create a min heap for the nodes
        const priorityQueue = new minHeap_1.MinHeap((a, b) => a.frequency - b.frequency);
        // Create leaf nodes for each byte and add to the heap
        frequencies.forEach((freq, symbol) => {
            priorityQueue.push(new huffmanNode_1.HuffmanNode(freq, symbol));
        });
        // Special case: If there's only one unique symbol
        if (priorityQueue.size() === 1) {
            const singleNode = priorityQueue.pop();
            this.root = new huffmanNode_1.HuffmanNode(singleNode.frequency, undefined, singleNode, new huffmanNode_1.HuffmanNode(0) // Dummy node to ensure the code generation works
            );
        }
        else {
            // Build Huffman tree by merging nodes from the heap
            while (priorityQueue.size() > 1) {
                // Take the two nodes with lowest frequencies
                const left = priorityQueue.pop();
                const right = priorityQueue.pop();
                // Create parent node with their combined frequency
                const parent = new huffmanNode_1.HuffmanNode(left.frequency + right.frequency, undefined, left, right);
                // Add the new node back to the heap
                priorityQueue.push(parent);
            }
            this.root = priorityQueue.pop() || null;
        }
        // Generate codes for each symbol
        if (this.root) {
            this.generateCodes(this.root, "");
        }
    }
    generateCodes(node, code) {
        if (node.isLeaf() && node.symbol !== undefined) {
            this.codes.set(node.symbol, code || "0"); // For single symbol case
            return;
        }
        if (node.left) {
            this.generateCodes(node.left, code + "0");
        }
        if (node.right) {
            this.generateCodes(node.right, code + "1");
        }
    }
}
exports.HuffmanTree = HuffmanTree;
