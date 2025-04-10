"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuffmanCompression = void 0;
const huffmanTree_1 = require("./huffmanTree");
const bitUtils_1 = require("../../utils/bitUtils");
class HuffmanCompression {
    constructor() {
        this.tree = new huffmanTree_1.HuffmanTree();
        this.originalSize = 0;
        this.compressedSize = 0;
        this.compressionLevel = 9; // Default maximum compression
    }
    compress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.originalSize = data.length;
            if (data.length === 0) {
                return Buffer.from([0]); // Empty file case
            }
            // Build Huffman tree
            this.tree.buildTree(data);
            // Prepare header buffer parts
            const headerParts = [];
            // Magic bytes "HUFF" to identify our format
            headerParts.push(Buffer.from([0x48, 0x55, 0x46, 0x46])); // "HUFF"
            // Original file size (8 bytes for files > 4GB)
            const sizeBuffer = Buffer.alloc(8);
            sizeBuffer.writeBigUInt64BE(BigInt(data.length), 0);
            headerParts.push(sizeBuffer);
            // Get the codes from the Huffman tree
            const codes = this.tree.codes;
            // Number of unique symbols (2 bytes)
            const symbolCountBuffer = Buffer.alloc(2);
            symbolCountBuffer.writeUInt16BE(codes.size, 0);
            headerParts.push(symbolCountBuffer);
            // Symbol table - first collect all entries
            const symbolTableBuffers = [];
            codes.forEach((code, symbol) => {
                // Symbol (1 byte)
                const symbolBuf = Buffer.from([symbol]);
                // Code length (1 byte)
                const codeLengthBuf = Buffer.from([code.length]);
                // Code bits packed into bytes
                const bitWriter = bitUtils_1.BitUtils.createBitWriter();
                for (const bit of code) {
                    bitWriter.writeBit(parseInt(bit, 10));
                }
                const { bytes, padding } = bitWriter.finish();
                // Number of code bytes (1 byte)
                const codeBytesBuf = Buffer.from([bytes.length]);
                // Combine parts for this symbol
                symbolTableBuffers.push(Buffer.concat([
                    symbolBuf,
                    codeLengthBuf,
                    codeBytesBuf,
                    Buffer.from(bytes),
                ]));
            });
            // Combine all symbol entries
            const symbolTableBuffer = Buffer.concat(symbolTableBuffers);
            headerParts.push(symbolTableBuffer);
            // Compress the data
            const bitWriter = bitUtils_1.BitUtils.createBitWriter();
            // Process each byte of the original data
            for (let i = 0; i < data.length; i++) {
                const byte = data[i];
                const code = codes.get(byte);
                if (!code) {
                    throw new Error(`No code found for byte: ${byte}`);
                }
                // Write each bit of the code
                for (const bit of code) {
                    bitWriter.writeBit(parseInt(bit, 10));
                }
            }
            // Finish the bit writer to get final bytes and padding
            const { bytes, padding } = bitWriter.finish();
            // Padding info (1 byte - number of valid bits in last byte)
            const paddingBuf = Buffer.from([padding === 0 ? 0 : 8 - padding]);
            headerParts.push(paddingBuf);
            // Compressed data
            const compressedDataBuffer = Buffer.from(bytes);
            // Combine all parts into final buffer
            const result = Buffer.concat([...headerParts, compressedDataBuffer]);
            this.compressedSize = result.length;
            console.log("DEBUG: Original size:", data.length, "bytes");
            console.log("DEBUG: Compressed to", result.length, "bytes");
            console.log("DEBUG: Header size:", result.length - compressedDataBuffer.length, "bytes");
            console.log("DEBUG: Unique symbols:", codes.size);
            return Promise.resolve(result);
        });
    }
    decompress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.length === 0) {
                return Buffer.from([]);
            }
            if (data.length === 1 && data[0] === 0) {
                return Buffer.from([]); // Empty file case
            }
            let offset = 0;
            // Check for magic bytes "HUFF"
            if (data.length < 4 ||
                data[0] !== 0x48 || // 'H'
                data[1] !== 0x55 || // 'U'
                data[2] !== 0x46 || // 'F'
                data[3] !== 0x46) {
                // 'F'
                throw new Error("Invalid compressed file format - missing magic bytes");
            }
            offset += 4;
            // Read original file size (8 bytes)
            if (data.length < offset + 8) {
                throw new Error("Invalid compressed file format - truncated header");
            }
            const originalSize = Number(data.readBigUInt64BE(offset));
            offset += 8;
            console.log("DEBUG: Original size from header:", originalSize, "bytes");
            // Read number of unique symbols (2 bytes)
            if (data.length < offset + 2) {
                throw new Error("Invalid compressed file format - truncated symbol count");
            }
            const uniqueSymbols = data.readUInt16BE(offset);
            offset += 2;
            console.log("DEBUG: Unique symbols from header:", uniqueSymbols);
            // Rebuild the Huffman codes map for decoding
            const codeToSymbol = new Map();
            for (let i = 0; i < uniqueSymbols; i++) {
                // Read symbol (1 byte)
                if (offset >= data.length) {
                    throw new Error(`Invalid compressed file format - truncated at symbol ${i}`);
                }
                const symbol = data[offset++];
                // Read code length (1 byte)
                if (offset >= data.length) {
                    throw new Error(`Invalid compressed file format - truncated at code length for symbol ${symbol}`);
                }
                const codeLength = data[offset++];
                // Read number of code bytes (1 byte)
                if (offset >= data.length) {
                    throw new Error(`Invalid compressed file format - truncated at code bytes count for symbol ${symbol}`);
                }
                const codeBytes = data[offset++];
                // Read code bytes
                if (offset + codeBytes > data.length) {
                    throw new Error(`Invalid compressed file format - truncated at code data for symbol ${symbol}`);
                }
                // Extract code bits
                let code = "";
                const bitReader = bitUtils_1.BitUtils.createBitReader(data.slice(offset, offset + codeBytes));
                try {
                    for (let j = 0; j < codeLength; j++) {
                        code += bitReader.readBit();
                    }
                }
                catch (error) {
                    if (error instanceof Error) {
                        throw new Error(`Error reading code bits for symbol ${symbol}: ${error.message}`);
                    }
                    else {
                        throw new Error(`Error reading code bits for symbol ${symbol}`);
                    }
                }
                offset += codeBytes;
                // Store the code->symbol mapping for decoding
                codeToSymbol.set(code, symbol);
                console.log(`DEBUG: Symbol ${symbol} = Code "${code}" (${codeLength} bits)`);
            }
            // Read padding info (1 byte)
            if (offset >= data.length) {
                throw new Error("Invalid compressed file format - truncated at padding info");
            }
            const validBitsInLastByte = data[offset++];
            console.log("DEBUG: Valid bits in last byte:", validBitsInLastByte);
            // Everything starting from here is compressed data
            const compressedData = data.slice(offset);
            console.log("DEBUG: Compressed data size:", compressedData.length, "bytes");
            // Prepare result buffer
            const result = Buffer.alloc(originalSize);
            let resultIndex = 0;
            // Setup bit reader for compressed data
            const bitReader = bitUtils_1.BitUtils.createBitReader(compressedData);
            let currentCode = "";
            // Track decompression progress
            let bitsProcessed = 0;
            const totalBits = compressedData.length * 8 -
                (validBitsInLastByte === 0 ? 0 : 8 - validBitsInLastByte);
            console.log(`DEBUG: Processing ${totalBits} bits from compressed data`);
            try {
                // Process all bits in the compressed data
                while (bitsProcessed < totalBits && resultIndex < originalSize) {
                    const bit = bitReader.readBit();
                    currentCode += bit;
                    bitsProcessed++;
                    // Check if we have a valid code
                    if (codeToSymbol.has(currentCode)) {
                        const symbol = codeToSymbol.get(currentCode);
                        if (resultIndex < originalSize) {
                            result[resultIndex++] = symbol;
                            currentCode = "";
                        }
                        else {
                            throw new Error(`Decompression overrun - trying to write beyond buffer size ${originalSize}`);
                        }
                    }
                    // Safety check for very long codes
                    if (currentCode.length > 100) {
                        throw new Error(`Potential decoding error - code length exceeds 100 bits: ${currentCode}`);
                    }
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error during bit reading: ${error.message}\nDecoded ${resultIndex} of ${originalSize} bytes`);
                }
                else {
                    throw new Error(`Error during bit reading\nDecoded ${resultIndex} of ${originalSize} bytes`);
                }
            }
            console.log(`DEBUG: Decompressed ${resultIndex} of ${originalSize} bytes`);
            if (resultIndex !== originalSize) {
                throw new Error(`Decompression incomplete: decoded ${resultIndex} of ${originalSize} bytes`);
            }
            return Promise.resolve(result);
        });
    }
    getCompressionRatio() {
        if (this.originalSize === 0)
            return 1;
        return this.originalSize / Math.max(1, this.compressedSize);
    }
    getCompressionType() {
        return "Huffman";
    }
    setCompressionLevel(level) {
        if (level < 1 || level > 9) {
            throw new Error("Compression level must be between 1 and 9");
        }
        this.compressionLevel = level;
    }
    getMetadata() {
        var _a;
        return {
            originalSize: this.originalSize,
            compressedSize: this.compressedSize,
            compressionLevel: this.compressionLevel,
            uniqueSymbols: ((_a = this.tree.codes) === null || _a === void 0 ? void 0 : _a.size) || 0,
            algorithm: "Huffman coding",
        };
    }
}
exports.HuffmanCompression = HuffmanCompression;
