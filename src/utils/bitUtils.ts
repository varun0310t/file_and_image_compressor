/**
 * Utility class for bit-level operations
 */
export class BitUtils {
  /**
   * Converts a string of '0' and '1' characters to a byte array
   */
  static binaryStringToBytes(binary: string): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < binary.length; i += 8) {
      const chunk = binary.substr(i, 8).padEnd(8, '0');
      result.push(parseInt(chunk, 2));
    }
    
    return result;
  }
  
  /**
   * Converts a byte array to a string of '0' and '1' characters
   */
  static bytesToBinaryString(bytes: number[] | Uint8Array, totalBits?: number): string {
    let result = "";
    
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      const bits = byte.toString(2).padStart(8, '0');
      
      // For the last byte, we might not need all 8 bits
      if (totalBits !== undefined && i === bytes.length - 1) {
        const remainingBits = totalBits % 8;
        if (remainingBits > 0) {
          result += bits.substring(0, remainingBits);
        } else {
          result += bits;
        }
      } else {
        result += bits;
      }
    }
    
    return result;
  }
  
  /**
   * Creates a BitWriter for efficiently writing individual bits to a byte array
   */
  static createBitWriter(): BitWriter {
    return new BitWriter();
  }
  
  /**
   * Creates a BitReader for efficiently reading individual bits from a byte array
   */
  static createBitReader(data: Buffer | Uint8Array): BitReader {
    return new BitReader(data);
  }
  
  /**
   * Validates and repairs any inconsistencies in compressed data format
   */
  static validateCompressedData(data: Buffer): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    
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

/**
 * Class for writing bits efficiently
 */
export class BitWriter {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitPosition = 0;
  
  /**
   * Write a single bit
   */
  writeBit(bit: number): void {
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
  writeBits(bits: string): void {
    for (let i = 0; i < bits.length; i++) {
      this.writeBit(parseInt(bits[i], 10));
    }
  }
  
  /**
   * Finish writing, padding the last byte with zeros if needed
   */
  finish(): { bytes: number[], padding: number } {
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
  getBytes(): number[] {
    return [...this.bytes];
  }
  
  /**
   * Get total bits written
   */
  getBitCount(): number {
    return this.bytes.length * 8 + this.bitPosition;
  }
}

/**
 * Class for reading bits efficiently
 */
export class BitReader {
  private data: Buffer | Uint8Array;
  private byteIndex = 0;
  private bitIndex = 0;
  private totalBytes: number;

  constructor(data: Buffer | Uint8Array) {
    this.data = data;
    this.totalBytes = data.length;
  }
  
  /**
   * Read a single bit
   */
  readBit(): number {
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
  readBits(count: number): string {
    let result = "";
    for (let i = 0; i < count; i++) {
      result += this.readBit();
    }
    return result;
  }
  
  /**
   * Check if there are more bits to read
   */
  hasMoreBits(): boolean {
    return this.byteIndex < this.totalBytes;
  }
  
  /**
   * Get current position in bits
   */
  getPosition(): number {
    return this.byteIndex * 8 + this.bitIndex;
  }
  
  /**
   * Get total bits available
   */
  getTotalBits(): number {
    return this.totalBytes * 8;
  }
  
  /**
   * Reset reader to beginning
   */
  reset(): void {
    this.byteIndex = 0;
    this.bitIndex = 0;
  }
  
  /**
   * Skip ahead by specified number of bits
   */
  skip(bits: number): void {
    const totalBitPosition = this.byteIndex * 8 + this.bitIndex + bits;
    this.byteIndex = Math.floor(totalBitPosition / 8);
    this.bitIndex = totalBitPosition % 8;
    
    if (this.byteIndex >= this.totalBytes) {
      throw new Error("Skip operation went beyond end of data");
    }
  }
}
