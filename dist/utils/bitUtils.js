"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitReader = exports.BitWriter = exports.BitUtils = void 0;
/**
 * Utility class for bit-level operations
 */
class BitUtils {
    /**
     * Converts a string of '0' and '1' characters to a byte array
     */
    static binaryStringToBytes(binary) {
        const result = [];
        for (let i = 0; i < binary.length; i += 8) {
            const chunk = binary.substr(i, 8).padEnd(8, '0');
            result.push(parseInt(chunk, 2));
        }
        return result;
    }
    /**
     * Converts a byte array to a string of '0' and '1' characters
     */
    static bytesToBinaryString(bytes, totalBits) {
        let result = "";
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            const bits = byte.toString(2).padStart(8, '0');
            // For the last byte, we might not need all 8 bits
            if (totalBits !== undefined && i === bytes.length - 1) {
                const remainingBits = totalBits % 8;
                if (remainingBits > 0) {
                    result += bits.substring(0, remainingBits);
                }
                else {
                    result += bits;
                }
            }
            else {
                result += bits;
            }
        }
        return result;
    }
    /**
     * Creates a BitWriter for efficiently writing individual bits to a byte array
     */
    static createBitWriter() {
        return new BitWriter();
    }
    /**
     * Creates a BitReader for efficiently reading individual bits from a byte array
     */
    static createBitReader(data) {
        return new BitReader(data);
    }
    /**
     * Validates and repairs any inconsistencies in compressed data format
     */
    static validateCompressedData(data) {
        const errors = [];
        // Minimum header size check
        if (data.length < 16) {
            errors.push("Data too small to contain valid header");
            return { isValid: false, errors };
        }
        // Magic header check
        if (data[0] !== 0x48 || data[1] !== 0x55 || data[2] !== 0x46 || data[3] !== 0x46) {
            errors.push("Missing or invalid magic bytes");
            return { isValid: false, errors };
        }
        // Basic checks passed
        return { isValid: errors.length === 0, errors };
    }
}
exports.BitUtils = BitUtils;
/**
 * Class for writing bits efficiently
 */
class BitWriter {
    constructor() {
        this.bytes = [];
        this.currentByte = 0;
        this.bitPosition = 0;
    }
    /**
     * Write a single bit
     */
    writeBit(bit) {
        // Add bit to current byte
        this.currentByte = (this.currentByte << 1) | (bit & 1);
        this.bitPosition++;
        // If byte is complete, add to bytes array
        if (this.bitPosition === 8) {
            this.bytes.push(this.currentByte);
            this.currentByte = 0;
            this.bitPosition = 0;
        }
    }
    /**
     * Write multiple bits from a binary string
     */
    writeBits(bits) {
        for (let i = 0; i < bits.length; i++) {
            this.writeBit(parseInt(bits[i], 10));
        }
    }
    /**
     * Finish writing, padding the last byte with zeros if needed
     */
    finish() {
        const padding = this.bitPosition > 0 ? 8 - this.bitPosition : 0;
        // If there are bits in the current byte, pad and add it
        if (this.bitPosition > 0) {
            this.currentByte = this.currentByte << padding;
            this.bytes.push(this.currentByte);
        }
        return {
            bytes: this.bytes,
            padding: padding
        };
    }
    /**
     * Get the current bytes without finishing
     */
    getBytes() {
        return [...this.bytes];
    }
    /**
     * Get total bits written
     */
    getBitCount() {
        return this.bytes.length * 8 + this.bitPosition;
    }
}
exports.BitWriter = BitWriter;
/**
 * Class for reading bits efficiently
 */
class BitReader {
    constructor(data) {
        this.byteIndex = 0;
        this.bitIndex = 0;
        this.data = data;
        this.totalBytes = data.length;
    }
    /**
     * Read a single bit
     */
    readBit() {
        if (this.byteIndex >= this.totalBytes) {
            throw new Error(`End of data reached (byte ${this.byteIndex + 1} of ${this.totalBytes})`);
        }
        const byte = this.data[this.byteIndex];
        // Extract bit at current position (from MSB to LSB)
        const bit = (byte >> (7 - this.bitIndex)) & 1;
        // Move to next bit position
        this.bitIndex++;
        if (this.bitIndex === 8) {
            this.byteIndex++;
            this.bitIndex = 0;
        }
        return bit;
    }
    /**
     * Read multiple bits and return as a binary string
     */
    readBits(count) {
        let result = "";
        for (let i = 0; i < count; i++) {
            result += this.readBit();
        }
        return result;
    }
    /**
     * Check if there are more bits to read
     */
    hasMoreBits() {
        return this.byteIndex < this.totalBytes;
    }
    /**
     * Get current position in bits
     */
    getPosition() {
        return this.byteIndex * 8 + this.bitIndex;
    }
    /**
     * Get total bits available
     */
    getTotalBits() {
        return this.totalBytes * 8;
    }
    /**
     * Reset reader to beginning
     */
    reset() {
        this.byteIndex = 0;
        this.bitIndex = 0;
    }
    /**
     * Skip ahead by specified number of bits
     */
    skip(bits) {
        const totalBitPosition = this.byteIndex * 8 + this.bitIndex + bits;
        this.byteIndex = Math.floor(totalBitPosition / 8);
        this.bitIndex = totalBitPosition % 8;
        if (this.byteIndex >= this.totalBytes) {
            throw new Error("Skip operation went beyond end of data");
        }
    }
}
exports.BitReader = BitReader;
